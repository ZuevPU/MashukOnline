import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getViewer } from "./auth";
import { getDb, schema } from "./db/client";

/**
 * Доступ к авторской сборке программы.
 *
 * Сборку видят участники и команда программы (вход на портал) и гости,
 * которые ввели пароль программы. Гостю ставится cookie с подписью от хеша
 * пароля: сменили пароль в админке — прежние входы гостей перестают действовать.
 * Без доступа сервер не отдаёт ни страниц, ни файлов сборки.
 */

export function gateCookieName(slug: string): string {
  return `pgate_${slug.replace(/[^a-z0-9-]/gi, "")}`;
}

function sign(slug: string, passwordHash: string): string {
  const secret = process.env.AUTH_SECRET || "mashuk-program-gate";
  return createHmac("sha256", secret).update(`${slug}:${passwordHash}`).digest("base64url");
}

export async function programPasswordHash(slug: string): Promise<string | null> {
  const db = getDb();
  if (!db) return null;
  const [row] = await db
    .select({ hash: schema.programs.accessPasswordHash })
    .from(schema.programs)
    .where(eq(schema.programs.slug, slug));
  return row?.hash ?? null;
}

export function gateToken(slug: string, passwordHash: string): string {
  return sign(slug, passwordHash);
}

/** Есть ли у текущего посетителя доступ к сборке программы. */
export async function canViewBuild(slug: string): Promise<boolean> {
  if (await getViewer(slug)) return true;
  const hash = await programPasswordHash(slug);
  if (!hash) return false;
  const store = await cookies();
  const given = store.get(gateCookieName(slug))?.value ?? "";
  const expected = sign(slug, hash);
  return given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}
