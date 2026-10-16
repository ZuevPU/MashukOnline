import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CONSENT_DIR = path.join(process.cwd(), "src", "lib", "forms", "consent");

const FILES: Record<string, { name: string; file: string; type: string }> = {
  "apply-doc": {
    name: "Soglasie_Obrazovanie_na_vysote.docx",
    file: "consent-source.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  "muni-pdf": {
    name: "Soglasie_uchastnika.pdf",
    file: "municipal-consent.pdf",
    type: "application/pdf",
  },
};

/** Отдаёт шаблон согласия: ?kind=apply-doc | ?kind=muni-pdf. */
export async function GET(request: Request) {
  const kind = new URL(request.url).searchParams.get("kind") ?? "";
  const entry = FILES[kind];
  if (!entry) return NextResponse.json({ error: "Неизвестный шаблон" }, { status: 404 });
  try {
    const bytes = await readFile(path.join(CONSENT_DIR, entry.file));
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "content-type": entry.type,
        "content-disposition": `attachment; filename="${entry.name}"`,
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Шаблон не найден" }, { status: 404 });
  }
}
