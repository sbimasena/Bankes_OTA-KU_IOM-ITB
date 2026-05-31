import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const nextAuthUrl = process.env.NEXTAUTH_URL!;
  const keycloakIssuer = process.env.KEYCLOAK_ISSUER!;

  const from = req.nextUrl.searchParams.get("from");
  const otaUrl = process.env.NEXT_PUBLIC_OTA_URL;
  const postLogoutRedirect =
    from === "ota" && otaUrl ? `${otaUrl}/auth/login` : `${nextAuthUrl}/login`;

  if (token?.idToken) {
    const redirectUri = encodeURIComponent(postLogoutRedirect);
    const logoutUrl = `${keycloakIssuer}/protocol/openid-connect/logout?id_token_hint=${token.idToken}&post_logout_redirect_uri=${redirectUri}`;
    return NextResponse.json({ logoutUrl });
  }

  return NextResponse.json({ logoutUrl: postLogoutRedirect });
}
