import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import { blobStore } from "../src/lib/blob-store";
import { contentTypeForExt } from "../src/lib/forms/files";

/**
 * Разовый перенос заявок из старой базы форм (FastAPI) в новую схему портала.
 *
 * Использование:
 *   LEGACY_DATABASE_URL=postgres://…  DATABASE_URL=postgres://…  pnpm migrate:legacy
 * Опции:
 *   --source=<url>     строка подключения к старой базе (иначе LEGACY_DATABASE_URL)
 *   --target=<url>     строка подключения к новой базе (иначе DATABASE_URL)
 *   --uploads=<dir>    каталог старых загруженных файлов (иначе LEGACY_UPLOAD_DIR)
 *   --program=<slug>   привязать все заявки к программе с этим slug
 *   --dry-run          только показать, что будет перенесено
 *
 * Повторный запуск безопасен: заявки, у которых в payload_raw есть _legacy_id,
 * пропускаются. Файлы копируются в хранилище под ключом applications/<имя>.
 */

const TABLES = ["seminar_applications", "participant_details", "municipal_applications"] as const;
type TableName = (typeof TABLES)[number];

const FILE_COLUMNS: Record<TableName, string[]> = {
  seminar_applications: ["portfolio_path", "consent_path"],
  participant_details: ["passport_scan_path"],
  municipal_applications: ["consent_path"],
};

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((value) => value.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

const DRY_RUN = process.argv.includes("--dry-run");

async function columns(sql: postgres.Sql, table: string): Promise<string[]> {
  const rows = await sql<{ column_name: string }[]>`
    select column_name from information_schema.columns
    where table_schema = current_schema() and table_name = ${table}
    order by ordinal_position
  `;
  return rows.map((row) => row.column_name);
}

async function importFile(
  uploadsDir: string | undefined,
  stored: unknown,
): Promise<{ key: string | null; copied: boolean }> {
  if (!stored) return { key: null, copied: false };
  if (!uploadsDir) return { key: null, copied: false };
  const name = path.basename(String(stored));
  if (!name || name === "." || name === "..") return { key: null, copied: false };
  try {
    const bytes = new Uint8Array(await readFile(path.join(uploadsDir, name)));
    const key = `applications/${name}`;
    if (!DRY_RUN) {
      await blobStore().put(key, bytes, contentTypeForExt(path.extname(name).toLowerCase()));
    }
    return { key, copied: true };
  } catch {
    return { key: null, copied: false };
  }
}

async function migrateTable(
  src: postgres.Sql,
  tgt: postgres.Sql,
  table: TableName,
  opts: { uploadsDir?: string; programId: number | null },
): Promise<{ inserted: number; skipped: number; files: number; missingFiles: number }> {
  const srcCols = await columns(src, table);
  const tgtCols = new Set(await columns(tgt, table));
  const migratable = srcCols.filter((col) => tgtCols.has(col) && col !== "id" && col !== "program_id");

  const existing = new Set(
    (
      await tgt<{ lid: string | null }[]>`
        select payload_raw->>'_legacy_id' as lid from ${tgt(table)}
        where payload_raw ? '_legacy_id'
      `
    )
      .map((row) => row.lid)
      .filter((value): value is string => Boolean(value)),
  );

  const rows = await src<Record<string, unknown>[]>`
    select id, ${src(migratable)} from ${src(table)} order by id
  `;

  let inserted = 0;
  let skipped = 0;
  let files = 0;
  let missingFiles = 0;

  for (const row of rows) {
    const legacyId = String(row.id ?? "");
    if (legacyId && existing.has(legacyId)) {
      skipped += 1;
      continue;
    }

    const record: Record<string, unknown> = {};
    for (const col of migratable) record[col] = row[col] ?? null;

    // Файлы: переносим из старого каталога в общее хранилище.
    for (const col of FILE_COLUMNS[table]) {
      if (!(col in record)) continue;
      const original = record[col];
      if (!original) continue;
      const result = await importFile(opts.uploadsDir, original);
      if (result.copied) files += 1;
      else missingFiles += 1;
      record[col] = result.key;
    }

    if (opts.programId !== null) record.program_id = opts.programId;

    const payload =
      row.payload_raw && typeof row.payload_raw === "object"
        ? { ...(row.payload_raw as Record<string, unknown>) }
        : {};
    payload._legacy_id = legacyId;
    payload._legacy_source = "forms";
    record.payload_raw = payload;

    if (!DRY_RUN) {
      await tgt`insert into ${tgt(table)} ${tgt(record)}`;
    }
    inserted += 1;
  }

  return { inserted, skipped, files, missingFiles };
}

async function main() {
  const sourceUrl = arg("source") ?? process.env.LEGACY_DATABASE_URL;
  const targetUrl = arg("target") ?? process.env.DATABASE_URL;
  const uploadsDir = arg("uploads") ?? process.env.LEGACY_UPLOAD_DIR;
  const programSlug = arg("program");

  if (!sourceUrl) throw new Error("Не задана старая база: --source или LEGACY_DATABASE_URL");
  if (!targetUrl) throw new Error("Не задана новая база: --target или DATABASE_URL");

  const src = postgres(sourceUrl, { max: 2, idle_timeout: 5 });
  const tgt = postgres(targetUrl, { max: 2, idle_timeout: 5 });

  let programId: number | null = null;
  if (programSlug) {
    const [program] = await tgt<{ id: number }[]>`
      select id from programs where slug = ${programSlug} limit 1
    `;
    programId = program?.id ?? null;
    if (!program) console.warn(`Программа «${programSlug}» не найдена — заявки будут без привязки.`);
  }

  console.log(`Источник: ${sourceUrl}`);
  console.log(`Цель:     ${targetUrl}`);
  console.log(`Файлы:    ${uploadsDir ?? "(не заданы — пути к файлам не восстановить)"}`);
  if (DRY_RUN) console.log("Режим:    dry-run (запись не выполняется)");

  const total = { inserted: 0, skipped: 0, files: 0, missingFiles: 0 };
  for (const table of TABLES) {
    try {
      const result = await migrateTable(src, tgt, table, { uploadsDir, programId });
      total.inserted += result.inserted;
      total.skipped += result.skipped;
      total.files += result.files;
      total.missingFiles += result.missingFiles;
      console.log(
        `${table}: перенесено ${result.inserted}, пропущено ${result.skipped}, файлов ${result.files}` +
          (result.missingFiles ? `, не найдено файлов ${result.missingFiles}` : ""),
      );
    } catch (error) {
      console.error(`${table}: ошибка — ${(error as Error).message}`);
    }
  }
  console.log(
    `Итого: перенесено ${total.inserted}, пропущено ${total.skipped}, файлов ${total.files}, потеряно ${total.missingFiles}`,
  );

  await src.end({ timeout: 5 });
  await tgt.end({ timeout: 5 });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
