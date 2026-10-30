import { NextResponse } from "next/server";
import { SupportError, createSupportRequest } from "@/lib/support";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Защита от спама: не больше N обращений с одного адреса за окно. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
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

/** Обращение в техподдержку: POST /api/support, JSON { name, email, message, consent }. */
export async function POST(request: Request) {
  if (tooMany(clientIp(request))) {
    return NextResponse.json({ error: "Слишком много обращений. Попробуйте позже." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  // Ловушка для ботов: скрытое поле должно остаться пустым.
  if (String(body.website ?? "").trim()) return NextResponse.json({ ok: true });

  try {
    await createSupportRequest({
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      message: String(body.message ?? ""),
      consent: body.consent === true,
      page: typeof body.page === "string" ? body.page : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SupportError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("support submit failed", error);
    return NextResponse.json({ error: "Не удалось отправить сообщение" }, { status: 500 });
  }
}
