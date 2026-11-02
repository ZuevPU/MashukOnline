import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { FormConfig } from "./types";

/**
 * Пароль на форму заявки: пока не введён, вместо анкеты показывается поле пароля.
 *
 * Пароль задаётся переменной окружения формы (например, MUNI_FORM_PASSWORD).
 * Переменная пустая — форма открыта. После верного пароля браузер получает
 * cookie с подписью от пароля: при смене пароля прежние входы перестают действовать.
 */

type FormId = FormConfig["id"];

const PASSWORD_ENV: Partial<Record<FormId, string>> = {
  muni: "MUNI_FORM_PASSWORD",
};

function formPassword(form: FormId): string {
  const name = PASSWORD_ENV[form];
  return name ? (process.env[name] ?? "").trim() : "";
}

export function gateCookie(form: FormId): string {
  return `form_gate_${form}`;
}

/** Подпись для cookie: зависит от пароля и секрета приложения. */
export function gateToken(form: FormId): string {
  const secret = process.env.AUTH_SECRET || "mashuk-form-gate";
  return createHmac("sha256", secret).update(`${form}:${formPassword(form)}`).digest("base64url");
}

export function isGated(form: FormId): boolean {
  return formPassword(form) !== "";
}

export function passwordMatches(form: FormId, given: string): boolean {
  const expected = Buffer.from(formPassword(form));
  const actual = Buffer.from(given.trim());
  return expected.length > 0 && expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Пустил ли браузер к форме: пароля нет или cookie верная. */
export async function gateOpen(form: FormId): Promise<boolean> {
  if (!isGated(form)) return true;
  const store = await cookies();
  const given = store.get(gateCookie(form))?.value ?? "";
  const expected = gateToken(form);
  return given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}
