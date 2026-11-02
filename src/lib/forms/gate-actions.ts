"use server";

import { cookies } from "next/headers";
import { blockedFor, clientIp, recordFailure, resetAttempts } from "../rate-limit";
import type { Limit } from "../rate-limit";
import { gateCookie, gateToken, isGated, passwordMatches } from "./gate";
import type { FormConfig } from "./types";

const GATE_LIMIT: Limit = { max: 10, windowMinutes: 15, blockMinutes: 15 };

export interface GateState {
  error?: string;
  ok?: boolean;
}

/** Проверка пароля формы. Верный — ставим cookie, страница перерисуется с анкетой. */
export async function unlockFormAction(_prev: GateState, form: FormData): Promise<GateState> {
  const id = String(form.get("form") ?? "") as FormConfig["id"];
  if (!isGated(id)) return { ok: true };

  const key = `form-gate:${id}:ip:${await clientIp()}`;
  const wait = await blockedFor([key]);
  if (wait > 0) return { error: `Слишком много попыток. Попробуйте через ${wait} мин.` };

  if (!passwordMatches(id, String(form.get("password") ?? ""))) {
    await recordFailure([{ key, limit: GATE_LIMIT }]);
    return { error: "Неверный пароль" };
  }

  await resetAttempts([key]);
  const store = await cookies();
  store.set(gateCookie(id), gateToken(id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_COOKIES !== "1",
    path: "/",
    maxAge: 30 * 86_400,
  });
  return { ok: true };
}
