import { env } from "../config/env.config.js";

// Keycloak role → your local JWT `type` field
export function keycloakRoleToType(
  roles: string[]
): "mahasiswa" | "ota" | "admin" | "bankes" | "pengurus" {
  if (roles.includes("admin"))                  return "admin";
  if (roles.includes("mahasiswa"))              return "mahasiswa";
  if (roles.includes("orang-tua-asuh"))         return "ota";
  if (roles.includes("pengurus-bidang-1"))      return "pengurus";
  if (roles.includes("pengurus-bidang-2"))      return "pengurus";
  if (roles.includes("volunteer-pewawancara"))  return "mahasiswa"; // no dedicated type
  return "mahasiswa";
}

// Keycloak role → your local Prisma Role enum
export function keycloakRoleToLocalRole(
  roles: string[]
): "Mahasiswa" | "OrangTuaAsuh" | "Admin" | "Bankes" | "Pengurus_IOM" {
  if (roles.includes("admin"))              return "Admin";
  if (roles.includes("mahasiswa"))          return "Mahasiswa";
  if (roles.includes("orang-tua-asuh"))     return "OrangTuaAsuh";
  if (roles.includes("pengurus-bidang-1"))  return "Pengurus_IOM";
  if (roles.includes("pengurus-bidang-2"))  return "Pengurus_IOM";
  return "Mahasiswa";
}

// Call the SSO API to create a user in Keycloak
export async function registerInSSO({
  email,
  password,
  role,
  firstName,
  lastName,
}: {
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ userId: string; email: string; role: string }> {
  const res = await fetch(`${env.SSO_API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": env.REGISTER_API_KEY,
    },
    body: JSON.stringify({ email, password, role, firstName, lastName }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message ?? `SSO registration failed: ${res.status}`);
    (err as any).status = res.status;
    throw err;
  }

  const json = await res.json();
  return json.data;
}

// Validate a Keycloak access token and return decoded payload
export async function validateKeycloakToken(accessToken: string): Promise<{
  sub: string;
  email: string;
  name?: string;
  preferred_username?: string;
  realm_access?: { roles: string[] };
}> {
  const [, payloadB64] = accessToken.split(".");
  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());

  // Verify issuer
  if (payload.iss !== env.KEYCLOAK_ISSUER_URL) {
    throw new Error("Invalid token issuer");
  }

  // Verify expiry
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  // For production: verify signature using JWKS (recommended)
  // Install: npm install jose
  // import { createRemoteJWKSet, jwtVerify } from "jose";
  // const JWKS = createRemoteJWKSet(new URL(env.KEYCLOAK_JWKS_URI));
  // const { payload } = await jwtVerify(accessToken, JWKS, { issuer: env.KEYCLOAK_ISSUER_URL });

  return payload;
}