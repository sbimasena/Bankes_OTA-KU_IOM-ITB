import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const keycloakIssuer = process.env.KEYCLOAK_ISSUER!;
  const keycloakClientId = process.env.KEYCLOAK_CLIENT_ID!;

  let keycloakLogoutUrl = `${keycloakIssuer}/protocol/openid-connect/logout?client_id=${keycloakClientId}`;
  if (token?.idToken) {
    keycloakLogoutUrl += `&id_token_hint=${token.idToken}`;
  }

  const response = NextResponse.redirect(keycloakLogoutUrl);

  // Clear all NextAuth session cookies so the Bankes session is fully reset
  const cookieOptions = { path: "/" } as const;
  response.cookies.delete({ name: "next-auth.session-token", ...cookieOptions });
  response.cookies.delete({ name: "__Secure-next-auth.session-token", ...cookieOptions });
  response.cookies.delete({ name: "next-auth.callback-url", ...cookieOptions });
  response.cookies.delete({ name: "next-auth.csrf-token", ...cookieOptions });

  return response;
}
