import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

/**
 * Скачивает файлы заявок (портфолио, согласия, сканы паспортов) из старого
 * приложения форм через его админку. Файлы сохраняются под исходными именами,
 * после чего `pnpm migrate:legacy -- --uploads=<каталог>` привязывает их к уже
 * перенесённым заявкам.
 *
 * Переменные:
 *   LEGACY_DATABASE_URL    старая база форм — откуда берутся имена файлов
 *   LEGACY_ADMIN_PASSWORD  пароль старой админки (ADMIN_PASSWORD приложения)
 *   LEGACY_FORMS_URL       адрес старого приложения (по умолчанию — Timeweb Apps)
 * Опции:
 *   --out=<dir>            куда складывать (по умолчанию /app/storage/legacy-uploads)
 *
 * Повторный запуск докачивает только недостающие файлы.
 */

const BASE = (process.env.LEGACY_FORMS_URL || "https://zuevpu-mashuk-forms-e759.twc1.net").replace(/\/+$/, "");

/** Таблица → колонки с файлами и адрес скачивания в старой админке. */
const SOURCES: { table: string; column: string; url: (id: number) => string }[] = [
  { table: "seminar_applications", column: "portfolio_path", url: (id) => `/admin/api/applications/${id}/file/portfolio` },
  { table: "seminar_applications", column: "consent_path", url: (id) => `/admin/api/applications/${id}/file/consent` },
  { table: "participant_details", column: "passport_scan_path", url: (id) => `/admin/api/participants/${id}/file/passport` },
  { table: "municipal_applications", column: "consent_path", url: (id) => `/admin/api/municipal/${id}/file/consent` },
];

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

async function exists(file: string): Promise<boolean> {
  try {
    return (await stat(file)).size > 0;
  } catch {
    return false;
  }
}

async function login(password: string): Promise<string> {
  const response = await fetch(`${BASE}/admin/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) throw new Error(`Вход в старую админку не удался (HTTP ${response.status}) — проверьте пароль`);
  const cookie = (response.headers.get("set-cookie") ?? "").match(/mashuk_admin=[^;]+/)?.[0];
  if (!cookie) throw new Error("Старая админка не выдала cookie входа");
  return cookie;
}

async function main() {
  const dbUrl = process.env.LEGACY_DATABASE_URL;
  const password = process.env.LEGACY_ADMIN_PASSWORD;
  if (!dbUrl || !password) {
    console.error("Задайте LEGACY_DATABASE_URL и LEGACY_ADMIN_PASSWORD");
    process.exitCode = 1;
    return;
  }
  const out = arg("out") ?? "/app/storage/legacy-uploads";
  await mkdir(out, { recursive: true });

  const cookie = await login(password);
  console.log(`Вход в ${BASE}: ок. Каталог: ${out}`);

  const sql = postgres(dbUrl, { max: 2, connect_timeout: 15 });
  const jobs: { name: string; url: string }[] = [];
  try {
    for (const source of SOURCES) {
      const rows = await sql<{ id: number; stored: string }[]>`
        select id, ${sql(source.column)} as stored from ${sql(source.table)}
        where ${sql(source.column)} is not null and ${sql(source.column)} <> ''
      `;
      for (const row of rows) {
        const name = path.basename(String(row.stored));
        if (name && name !== "." && name !== "..") jobs.push({ name, url: source.url(Number(row.id)) });
      }
    }
  } finally {
    await sql.end();
  }

  let saved = 0;
  let skipped = 0;
  const failed: string[] = [];
  let next = 0;

  // Несколько загрузок параллельно — без нагрузки на старое приложение
  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++];
      const target = path.join(out, job.name);
      if (await exists(target)) {
        skipped += 1;
        continue;
      }
      try {
        const response = await fetch(`${BASE}${job.url}`, {
          headers: { Cookie: cookie },
          signal: AbortSignal.timeout(120_000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await writeFile(target, new Uint8Array(await response.arrayBuffer()));
        saved += 1;
        if (saved % 50 === 0) console.log(`…скачано ${saved}`);
      } catch (error) {
        failed.push(`${job.url}: ${error instanceof Error ? error.message : error}`);
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));

  console.log(`Файлов в старой базе: ${jobs.length}. Скачано: ${saved}, уже были: ${skipped}, не удалось: ${failed.length}`);
  for (const line of failed.slice(0, 20)) console.log(`  не скачан ${line}`);
  if (failed.length > 20) console.log(`  …и ещё ${failed.length - 20}`);
  console.log(`Дальше: pnpm migrate:legacy -- --uploads=${out}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
