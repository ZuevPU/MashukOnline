import { NextResponse } from "next/server";
import { loadMember, profileClaims, readAccessToken } from "@/lib/oauth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Userinfo endpoint: профиль владельца access_token (Bearer). */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const payload = readAccessToken(bearer);
  if (!payload) {
    return NextResponse.json(
      { error: "invalid_token" },
      { status: 401, headers: { "www-authenticate": 'Bearer error="invalid_token"' } },
    );
  }
  const member = await loadMember(payload.sub);
  if (!member) return NextResponse.json({ error: "invalid_token" }, { status: 401 });

  return NextResponse.json(
    { sub: member.id, ...profileClaims(member) },
    { headers: { "cache-control": "no-store" } },
  );
}

export const POST = GET;
