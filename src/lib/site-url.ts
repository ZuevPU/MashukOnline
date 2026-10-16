/**
 * Безопасный базовый адрес сайта из PUBLIC_URL.
 *
 * Значение может прийти некорректным (плейсхолдер со скобками, пробелы,
 * без схемы) — тогда берём разумный адрес по умолчанию, чтобы сборка и
 * страницы не падали из-за new URL().
 */

const DEFAULT_SITE_URL = "https://mashuk.online";

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Нормализованный origin (без хвостового слеша) или fallback. */
export function siteUrl(fallback?: string): string {
  const raw = (process.env.PUBLIC_URL ?? "").trim().replace(/\/+$/, "");
  if (isHttpUrl(raw)) {
    try {
      return new URL(raw).origin;
    } catch {
      /* ниже */
    }
  }
  const fb = (fallback ?? "").trim().replace(/\/+$/, "");
  if (isHttpUrl(fb)) return fb;
  return DEFAULT_SITE_URL;
}
