import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authorizeUrl, lmsConfigured } from "@/lib/lms-sso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const STATE_COOKIE = "mashuk_sso_state";

/** Начало входа через LMS: кладём state в cookie и уводим на страницу входа. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  if (!lmsConfigured()) return NextResponse.redirect(new URL("/join", url));

  const next = url.searchParams.get("next") ?? "/cabinet";
  const state = randomBytes(16).toString("base64url");
  const target = authorizeUrl(origin, state);
  if (!target) return NextResponse.redirect(new URL("/join", url));

  const store = await cookies();
  store.set(STATE_COOKIE, `${state}|${next}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_COOKIES !== "1",
    path: "/",
    maxAge: 600,
  });
  return NextResponse.redirect(target);
}
