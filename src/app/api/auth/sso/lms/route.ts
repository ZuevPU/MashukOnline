import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { createSession, homeFor, normalizeContact } from "@/lib/auth";
import { exchangeCode, fetchProfile, lmsConfigured } from "@/lib/lms-sso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "mashuk_sso_state";

/** Обратный адрес OAuth: проверяем state, меняем код на токен, открываем сессию. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const fail = NextResponse.redirect(new URL("/join?error=sso", url));
  if (!lmsConfigured()) return fail;

  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";
  const store = await cookies();
  const saved = store.get(STATE_COOKIE)?.value ?? "";
  store.delete(STATE_COOKIE);

  const [savedState, savedNext = "/cabinet"] = saved.split("|");
  if (!code || !state || !savedState || state !== savedState) return fail;

  const token = await exchangeCode(code, url.origin);
  if (!token) return fail;
  const profile = await fetchProfile(token);
  if (!profile) return fail;

  const contact = normalizeContact(profile.contact);
  if (!contact) return fail;

  const db = getDb();
  if (!db) return fail;

  const [existing] = await db
    .select({ id: schema.members.id })
    .from(schema.members)
    .where(eq(schema.members.contact, contact))
    .limit(1);

  let memberId = existing?.id;
  if (!memberId) {
    memberId = randomUUID();
    await db.insert(schema.members).values({
      id: memberId,
      name: profile.name,
      role: "participant",
      contact,
    });
  }

  await createSession(memberId, request.headers.get("user-agent") ?? undefined);
  const destination =
    savedNext.startsWith("/") && !savedNext.startsWith("//")
      ? savedNext
      : await homeFor(memberId, false);
  return NextResponse.redirect(new URL(destination, url));
}
