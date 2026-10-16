import { createHmac, timingSafeEqual } from "node:crypto";
import { getDb, schema } from "./db/client";
import { eq } from "drizzle-orm";
import { isHttpUrl, siteUrl } from "./site-url";

/**
 * Портал как OAuth 2.0 / OpenID Connect провайдер (единый вход для LMS).
 *
 * LMS подключается сюда как клиент: уходит на /api/oauth/authorize, получает
 * код, меняет его на токен на /api/oauth/token и забирает профиль из
 * /api/oauth/userinfo. Коды и токены — самодостаточные (HMAC-SHA256), поэтому
 * не нужны таблицы БД. Профиль берётся у вошедшего участника портала.
 *
 * Переменные:
 *   OAUTH_ISSUER          базовый адрес портала (по умолчанию PUBLIC_URL)
 *   OAUTH_CLIENT_ID       идентификатор клиента (LMS)
 *   OAUTH_CLIENT_SECRET   секрет клиента (он же подпись по умолчанию)
 *   OAUTH_REDIRECT_URIS   список разрешённых redirect_uri через запятую (необязательно)
 *   OAUTH_SIGNING_SECRET  отдельный секрет подписи (необязательно)
 */

export interface OAuthConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  signingSecret: string;
  redirectUris: string[];
}

export function oauthConfig(): OAuthConfig {
  const issuerRaw = (process.env.OAUTH_ISSUER ?? "").trim();
  const issuer = isHttpUrl(issuerRaw) ? new URL(issuerRaw).origin : siteUrl();
  return {
    issuer,
    clientId: (process.env.OAUTH_CLIENT_ID ?? "").trim(),
    clientSecret: (process.env.OAUTH_CLIENT_SECRET ?? "").trim(),
    signingSecret: (
      (process.env.OAUTH_SIGNING_SECRET ?? "").trim() ||
      (process.env.OAUTH_CLIENT_SECRET ?? "").trim()
    ),
    redirectUris: (process.env.OAUTH_REDIRECT_URIS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  };
}

export function oauthConfigured(): boolean {
  const config = oauthConfig();
  return Boolean(config.clientId && config.clientSecret);
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: Record<string, unknown>, secret: string): string {
  const body = b64url(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verify<T extends Record<string, unknown>>(token: string, secret: string): T | null {
  if (!secret || !token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature ?? "");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
    const exp = Number((payload as { exp?: unknown }).exp ?? 0);
    if (exp && exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isRedirectAllowed(uri: string): boolean {
  const config = oauthConfig();
  let parsed: URL;
  try {
    parsed = new URL(uri);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
    return false;
  }
  if (config.redirectUris.length > 0) return config.redirectUris.includes(uri);
  return /(^|\.)mashuk\.online$/i.test(parsed.hostname);
}

/* --- Коды и токены ------------------------------------------------------- */

interface CodePayload {
  sub: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  nonce?: string;
  exp: number;
}

export function issueCode(data: Omit<CodePayload, "exp">): string {
  return sign({ ...data, exp: Math.floor(Date.now() / 1000) + 300 }, oauthConfig().signingSecret);
}

export function readCode(token: string): CodePayload | null {
  return verify<CodePayload & Record<string, unknown>>(token, oauthConfig().signingSecret);
}

interface TokenPayload {
  sub: string;
  clientId: string;
  scope: string;
  exp: number;
}

export function issueAccessToken(sub: string, clientId: string, scope: string, seconds = 3600): string {
  return sign(
    { sub, clientId, scope, exp: Math.floor(Date.now() / 1000) + seconds },
    oauthConfig().signingSecret,
  );
}

export function readAccessToken(token: string): TokenPayload | null {
  return verify<TokenPayload & Record<string, unknown>>(token, oauthConfig().signingSecret);
}

/** id_token (JWT, HS256) — подписан тем же секретом, что и client_secret. */
export function idToken(
  member: { id: string; name: string; contact: string | null },
  clientId: string,
  nonce?: string,
): string {
  const now = Math.floor(Date.now() / 1000);
  const claims: Record<string, unknown> = {
    iss: oauthConfig().issuer,
    sub: member.id,
    aud: clientId,
    iat: now,
    exp: now + 3600,
    auth_time: now,
    ...profileClaims(member),
  };
  if (nonce) claims.nonce = nonce;
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify(claims));
  const signature = createHmac("sha256", oauthConfig().signingSecret)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

/* --- Профиль участника --------------------------------------------------- */

export function profileClaims(member: { id: string; name: string; contact: string | null }) {
  const name = (member.name ?? "").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  const givenName = parts[0] ?? "";
  const familyName = parts.slice(1).join(" ");
  const contact = (member.contact ?? "").trim();
  const email = contact.includes("@") ? contact : "";
  const phone = contact && !contact.includes("@") ? contact : "";
  return {
    name,
    given_name: givenName,
    family_name: familyName,
    email,
    email_verified: Boolean(email),
    phone_number: phone,
    preferred_username: contact || member.id,
  };
}

export async function loadMember(id: string) {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select({
      id: schema.members.id,
      name: schema.members.name,
      contact: schema.members.contact,
      position: schema.members.position,
    })
    .from(schema.members)
    .where(eq(schema.members.id, id))
    .limit(1);
  return row ?? null;
}

/** Подпись клиента: секрет из query/body или Basic-авторизация. */
export function clientSecretFromRequest(request: Request, form?: URLSearchParams): string {
  const auth = request.headers.get("authorization") ?? "";
  if (auth.toLowerCase().startsWith("basic ")) {
    try {
      const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
      return decoded.slice(decoded.indexOf(":") + 1);
    } catch {
      return "";
    }
  }
  return form?.get("client_secret") ?? "";
}

export function secretMatches(value: string): boolean {
  const expected = oauthConfig().clientSecret;
  if (!expected || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(value));
}
