/**
 * Единый вход с LMS (lms.mashuk.online) по OAuth 2.0 (authorization code).
 *
 * Портал — OAuth-клиент: отправляет участника на страницу входа LMS, получает
 * код и обменивает его на токен, затем забирает профиль (почта/имя) и открывает
 * сессию. Все адреса и ключи задаются переменными окружения, поэтому под
 * конкретный LMS ничего в коде менять не нужно.
 *
 * Переменные:
 *   LMS_OAUTH_AUTHORIZE_URL   адрес авторизации  (…/oauth/authorize)
 *   LMS_OAUTH_TOKEN_URL       адрес токена       (…/oauth/token)
 *   LMS_OAUTH_USERINFO_URL    адрес профиля      (…/oauth/userinfo)
 *   LMS_OAUTH_CLIENT_ID       публичный ключ приложения
 *   LMS_OAUTH_CLIENT_SECRET   секретный ключ приложения
 *   LMS_OAUTH_SCOPE           область доступа (необязательно)
 *   PUBLIC_URL                базовый адрес портала (для redirect_uri)
 */

export function lmsConfigured(): boolean {
  return Boolean(
    (process.env.LMS_OAUTH_AUTHORIZE_URL ?? "").trim() &&
      (process.env.LMS_OAUTH_CLIENT_ID ?? "").trim(),
  );
}

export function redirectUri(origin: string): string {
  const base = ((process.env.PUBLIC_URL ?? "").trim() || origin).replace(/\/+$/, "");
  return `${base}/api/auth/sso/lms/callback`;
}

export function authorizeUrl(origin: string, state: string): string | null {
  const base = (process.env.LMS_OAUTH_AUTHORIZE_URL ?? "").trim();
  if (!base) return null;
  try {
    const url = new URL(base);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", (process.env.LMS_OAUTH_CLIENT_ID ?? "").trim());
    url.searchParams.set("redirect_uri", redirectUri(origin));
    url.searchParams.set("state", state);
    const scope = (process.env.LMS_OAUTH_SCOPE ?? "").trim();
    if (scope) url.searchParams.set("scope", scope);
    return url.toString();
  } catch {
    return null;
  }
}

export interface LmsProfile {
  contact: string;
  name: string;
}

function firstString(source: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

/** Обмен кода авторизации на токен доступа. */
export async function exchangeCode(code: string, origin: string): Promise<string | null> {
  const tokenUrl = (process.env.LMS_OAUTH_TOKEN_URL ?? "").trim();
  if (!tokenUrl) return null;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(origin),
    client_id: (process.env.LMS_OAUTH_CLIENT_ID ?? "").trim(),
    client_secret: (process.env.LMS_OAUTH_CLIENT_SECRET ?? "").trim(),
  });
  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
      body,
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as Record<string, unknown>;
    const token = firstString(data, ["access_token", "token"]);
    return token || null;
  } catch {
    return null;
  }
}

/** Профиль пользователя по токену: почта/имя (имена полей — по возможности разные). */
export async function fetchProfile(token: string): Promise<LmsProfile | null> {
  const infoUrl = (process.env.LMS_OAUTH_USERINFO_URL ?? "").trim();
  if (!infoUrl) return null;
  try {
    const response = await fetch(infoUrl, {
      headers: { authorization: `Bearer ${token}`, accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as Record<string, unknown>;
    const contact = firstString(data, ["email", "contact", "login", "username", "phone"]);
    const name = firstString(data, ["name", "full_name", "fio", "display_name"]) || "Участник";
    if (!contact) return null;
    return { contact, name };
  } catch {
    return null;
  }
}
