"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "./password";
import { gateCookieName, gateToken, programPasswordHash } from "./program-gate";
import { blockedFor, clientIp, recordFailure, resetAttempts } from "./rate-limit";
import type { Limit } from "./rate-limit";
import { buildUrl } from "./short-links";

const GATE_LIMIT: Limit = { max: 10, windowMinutes: 15, blockMinutes: 15 };

export interface ProgramGateState {
  error?: string;
}

/** Только адреса этой программы — никаких внешних перенаправлений. */
function safeNext(slug: string, raw: string): string {
  const home = buildUrl(slug);
  const ok = raw === home || raw.startsWith(`${home}/`) || raw.startsWith(`/programs/${slug}/build/`);
  return ok && !raw.includes("//") ? raw : home;
}

/** Пароль программы открывает её авторскую сборку без регистрации. */
export async function unlockProgramAction(_prev: ProgramGateState, form: FormData): Promise<ProgramGateState> {
  const slug = String(form.get("slug") ?? "");
  const hash = await programPasswordHash(slug);
  if (!hash) return { error: "Вход по паролю для этой программы закрыт" };

  const key = `program-gate:${slug}:ip:${await clientIp()}`;
  const wait = await blockedFor([key]);
  if (wait > 0) return { error: `Слишком много попыток. Попробуйте через ${wait} мин.` };

  if (!(await verifyPassword(String(form.get("password") ?? "").trim(), hash))) {
    await recordFailure([{ key, limit: GATE_LIMIT }]);
    return { error: "Неверный пароль" };
  }

  await resetAttempts([key]);
  const store = await cookies();
  store.set(gateCookieName(slug), gateToken(slug, hash), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_COOKIES !== "1",
    path: "/",
    maxAge: 30 * 86_400,
  });
  redirect(safeNext(slug, String(form.get("next") ?? "")));
}
