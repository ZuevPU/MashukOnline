import { ZipArchive } from "archiver";
import { NextResponse } from "next/server";
import { FORM_META, allApplications, isFormId, parseFilters } from "@/lib/forms/admin";
import { readFormFile } from "@/lib/forms/files";
import { currentAdminUser } from "@/lib/forms/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeName(value: unknown): string {
  const raw = String(value ?? "").replace(/[^\w\sА-Яа-яЁё-]+/g, "").trim().replace(/\s+/g, "_");
  return raw.slice(0, 40) || "zayavka";
}

function unique(name: string, used: Set<string>): string {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  const dot = name.lastIndexOf(".");
  const stem = dot >= 0 ? name.slice(0, dot) : name;
  const ext = dot >= 0 ? name.slice(dot) : "";
  let n = 2;
  let candidate = `${stem}_${n}${ext}`;
  while (used.has(candidate)) {
    n += 1;
    candidate = `${stem}_${n}${ext}`;
  }
  used.add(candidate);
  return candidate;
}

function zipFiles(files: { name: string; data: Uint8Array }[]): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const archive = new ZipArchive({ zlib: { level: 9 } });
    const chunks: Uint8Array[] = [];
    archive.on("data", (chunk: Buffer) => chunks.push(new Uint8Array(chunk)));
    archive.on("warning", (err) => console.warn("zip warning", err));
    archive.on("error", reject);
    archive.on("end", () => {
      const total = chunks.reduce((sum, c) => sum + c.length, 0);
      const out = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        out.set(chunk, offset);
        offset += chunk.length;
      }
      resolve(out);
    });
    for (const file of files) archive.append(Buffer.from(file.data), { name: file.name });
    void archive.finalize();
  });
}

/** ZIP с файлами заявок (согласия/портфолио/сканы) по текущему фильтру. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ form: string }> },
) {
  const { form } = await params;
  if (!isFormId(form)) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!(await currentAdminUser())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const sp = Object.fromEntries(url.searchParams.entries());
  const filters = parseFilters(form, sp);
  const rows = await allApplications(form, filters);
  const meta = FORM_META[form];

  const files: { name: string; data: Uint8Array }[] = [];
  const used = new Set<string>();
  const missing: string[] = [];

  for (const row of rows) {
    const fio = row.fio ?? row.fio_latin ?? row.fio_ru;
    for (const fc of meta.fileColumns) {
      const path = row[fc.column];
      if (!path) continue;
      const bytes = await readFormFile(String(path));
      if (!bytes) {
        missing.push(`${row.id}\t${path}`);
        continue;
      }
      const dot = String(path).lastIndexOf(".");
      const ext = dot >= 0 ? String(path).slice(dot).toLowerCase() : "";
      const base = safeName(fio);
      const name = unique(fc.kind === "consent" ? `${base}${ext}` : `${base}_${fc.kind}${ext}`, used);
      files.push({ name, data: bytes });
    }
  }
  if (missing.length) {
    files.push({
      name: "missing.txt",
      data: new TextEncoder().encode("id\tfile\n" + missing.join("\n") + "\n"),
    });
  }
  if (files.length === 0) {
    files.push({ name: "README.txt", data: new TextEncoder().encode("Файлы не найдены.\n") });
  }

  const zip = await zipFiles(files);
  return new NextResponse(new Uint8Array(zip), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="mashuk_${form}_files.zip"`,
      "cache-control": "no-store",
    },
  });
}
