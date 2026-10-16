import { NextResponse } from "next/server";
import { oauthConfig } from "@/lib/oauth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** OpenID Connect discovery: адреса OAuth-сервера портала. */
export async function GET() {
  const config = oauthConfig();
  return NextResponse.json(
    {
      issuer: config.issuer,
      authorization_endpoint: `${config.issuer}/api/oauth/authorize`,
      token_endpoint: `${config.issuer}/api/oauth/token`,
      userinfo_endpoint: `${config.issuer}/api/oauth/userinfo`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["HS256"],
      scopes_supported: ["openid", "email", "profile", "phone"],
      claims_supported: [
        "sub",
        "name",
        "given_name",
        "family_name",
        "email",
        "email_verified",
        "phone_number",
        "preferred_username",
      ],
      token_endpoint_auth_methods_supported: ["client_secret_post", "client_secret_basic"],
    },
    { headers: { "cache-control": "no-store" } },
  );
}
