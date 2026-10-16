import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { buildApplyConsentDoc } from "@/lib/forms/consent-doc";
import { blankMunicipalConsent, filledMunicipalConsent } from "@/lib/forms/consent-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONSENT_DIR = path.join(process.cwd(), "src", "lib", "forms", "consent");

const BLANKS: Record<string, { name: string; file: string; type: string }> = {
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

function attachment(body: Uint8Array | string, type: string, filename: string): NextResponse {
  const bytes =
    typeof body === "string" ? new TextEncoder().encode(body) : new Uint8Array(body);
  const blob = new Blob([bytes], { type });
  // В заголовке HTTP имя файла должно быть ASCII; настоящее (UTF-8) — в filename*.
  const ascii = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return new NextResponse(blob, {
    headers: {
      "content-type": type,
      "content-disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "cache-control": "no-store",
    },
  });
}

/** Пустой шаблон: ?kind=apply-doc | ?kind=muni-pdf. */
export async function GET(request: Request) {
  const kind = new URL(request.url).searchParams.get("kind") ?? "";
  const entry = BLANKS[kind];
  if (!entry) return NextResponse.json({ error: "Неизвестный шаблон" }, { status: 404 });
  try {
    const bytes = await readFile(path.join(CONSENT_DIR, entry.file));
    return attachment(new Uint8Array(bytes), entry.type, entry.name);
  } catch {
    return NextResponse.json({ error: "Шаблон не найден" }, { status: 404 });
  }
}

/** Документ с данными анкеты: тело — { kind, data }. */
export async function POST(request: Request) {
  let payload: { kind?: string; data?: Record<string, unknown> } = {};
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  const kind = payload.kind ?? "";
  const data = payload.data && typeof payload.data === "object" ? payload.data : {};

  if (kind === "apply-doc") {
    const doc = await buildApplyConsentDoc(data);
    return attachment(doc, "application/msword", "Soglasie_Obrazovanie_na_vysote.doc");
  }
  if (kind === "muni-pdf") {
    const pdf = await filledMunicipalConsent(data);
    const fio = String(data.fio ?? "").replace(/[^\wа-яА-ЯёЁ\s-]+/g, "").trim().slice(0, 40);
    const filename = fio ? `Soglasie_${fio.replace(/\s+/g, "_")}.pdf` : "Soglasie_uchastnika.pdf";
    return attachment(pdf, "application/pdf", filename);
  }
  return NextResponse.json({ error: "Неизвестный тип" }, { status: 400 });
}
