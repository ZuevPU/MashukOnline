import { NextResponse } from "next/server";
import { SubmitError, submitForm, FORM_CONFIGS } from "@/lib/forms/submit";
import type { FormConfig } from "@/lib/forms/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Простая защита от спама: не больше N отправок с одного адреса за окно. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const xff = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  return xff || request.headers.get("x-real-ip") || "unknown";
}

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t > WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

/**
 * Приём заявок: POST /api/forms/apply | /info | /muni | /media.
 * Ожидает multipart/form-data с полем payload (JSON) и файлами по именам полей.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!(id in FORM_CONFIGS)) {
    return NextResponse.json({ error: "Форма не найдена" }, { status: 404 });
  }

  const ip = clientIp(request);
  if (tooMany(ip)) {
    return NextResponse.json(
      { error: "Слишком много отправок. Попробуйте позже." },
      { status: 429 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Некорректная форма" }, { status: 400 });
  }

  // Ловушка для ботов: скрытое поле должно остаться пустым.
  if (String(formData.get("__hp") ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const result = await submitForm(id as FormConfig["id"], formData);
    return NextResponse.json({ ok: true, id: result.id });
  } catch (error) {
    if (error instanceof SubmitError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("form submit failed", error);
    return NextResponse.json({ error: "Не удалось отправить заявку" }, { status: 500 });
  }
}
