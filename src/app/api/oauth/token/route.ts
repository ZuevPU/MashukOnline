import { NextResponse } from "next/server";
import {
  clientSecretFromRequest,
  idToken,
  issueAccessToken,
  loadMember,
  oauthConfig,
  oauthConfigured,
  readCode,
  secretMatches,
} from "@/lib/oauth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function invalid(error: string, status = 400): NextResponse {
  return NextResponse.json({ error }, { status, headers: { "cache-control": "no-store" } });
}

async function readForm(request: Request): Promise<URLSearchParams> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = (await request.json()) as Record<string, unknown>;
    return new URLSearchParams(
      Object.entries(data).map(([key, value]) => [key, String(value)]),
    );
  }
  return new URLSearchParams(await request.text());
}

/** Token endpoint: обмен кода авторизации на access_token (и id_token). */
export async function POST(request: Request) {
  const config = oauthConfig();
  if (!oauthConfigured()) return invalid("oauth_not_configured", 503);

  const form = await readForm(request);
  const grant = form.get("grant_type") ?? "";
  const clientId = form.get("client_id") ?? "";
  const secret = clientSecretFromRequest(request, form);

  if (grant !== "authorization_code") return invalid("unsupported_grant_type");
  if (clientId && clientId !== config.clientId) return invalid("invalid_client", 401);
  if (!secretMatches(secret)) return invalid("invalid_client", 401);

  const code = readCode(form.get("code") ?? "");
  if (!code || code.clientId !== config.clientId) return invalid("invalid_grant");

  const redirectUri = form.get("redirect_uri") ?? "";
  if (redirectUri && redirectUri !== code.redirectUri) return invalid("invalid_grant");

  const member = await loadMember(code.sub);
  if (!member) return invalid("invalid_grant");

  const accessToken = issueAccessToken(member.id, config.clientId, code.scope);
  const body: Record<string, unknown> = {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    scope: code.scope,
  };
  if (code.scope.split(/\s+/).includes("openid")) {
    body.id_token = idToken(member, config.clientId, code.nonce);
  }
  return NextResponse.json(body, { headers: { "cache-control": "no-store" } });
}
