import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const nextAuthUrl = process.env.NEXTAUTH_URL!;
  const keycloakIssuer = process.env.KEYCLOAK_ISSUER!;
  const postLogoutUri = encodeURIComponent(`${nextAuthUrl}/login`);

  if (token?.idToken) {
    const logoutUrl = `${keycloakIssuer}/protocol/openid-connect/logout?id_token_hint=${token.idToken}&post_logout_redirect_uri=${postLogoutUri}`;
    return NextResponse.json({ logoutUrl });
  }

  return NextResponse.json({ logoutUrl: `${nextAuthUrl}/login` });
}
