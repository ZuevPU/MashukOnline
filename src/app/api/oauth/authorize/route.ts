import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import {
  isRedirectAllowed,
  issueCode,
  oauthConfig,
  oauthConfigured,
} from "@/lib/oauth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorRedirect(redirectUri: string, state: string, error: string): NextResponse {
  const target = new URL(redirectUri);
  target.searchParams.set("error", error);
  if (state) target.searchParams.set("state", state);
  return NextResponse.redirect(target);
}

/** Authorization endpoint: требует вход на портал и выдаёт код авторизации. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const clientId = params.get("client_id") ?? "";
  const redirectUri = params.get("redirect_uri") ?? "";
  const state = params.get("state") ?? "";
  const scope = params.get("scope") ?? "openid email profile";
  const nonce = params.get("nonce") ?? undefined;
  const responseType = params.get("response_type") ?? "code";

  const config = oauthConfig();
  if (!oauthConfigured()) {
    return NextResponse.json({ error: "oauth_not_configured" }, { status: 503 });
  }
  if (clientId !== config.clientId) {
    return NextResponse.json({ error: "invalid_client" }, { status: 400 });
  }
  if (!isRedirectAllowed(redirectUri)) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "redirect_uri не разрешён" },
      { status: 400 },
    );
  }
  if (responseType !== "code") {
    return errorRedirect(redirectUri, state, "unsupported_response_type");
  }

  const user = await getSessionUser();
  if (!user) {
    const next = url.pathname + url.search;
    return NextResponse.redirect(new URL(`/join?next=${encodeURIComponent(next)}`, url));
  }

  const code = issueCode({ sub: user.member.id, clientId, redirectUri, scope, nonce });
  const target = new URL(redirectUri);
  target.searchParams.set("code", code);
  if (state) target.searchParams.set("state", state);
  return NextResponse.redirect(target);
}
