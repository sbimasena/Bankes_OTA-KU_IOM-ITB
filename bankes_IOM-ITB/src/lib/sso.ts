/**
 * Helper function untuk berinteraksi dengan SSO API (Keycloak)
 * Digunakan terutama untuk admin approval flow
 */

/**
 * Membuat akun Keycloak baru untuk user yang telah disetujui
 * Dipanggil dari admin approval action
 *
 * @param email - Email user
 * @param password - Password temporary (user akan diminta change setelah login pertama)
 * @param role - Role Keycloak (e.g., "mahasiswa", "pengurus-bidang-1")
 * @param firstName - Nama depan (opsional)
 * @param lastName - Nama belakang (opsional)
 * @returns { userId, email, role } dari SSO API
 */
export async function createSsoAccount({
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
  const ssoApiUrl = process.env.SSO_API_URL;
  const registerApiKey = process.env.REGISTER_API_KEY;

  if (!ssoApiUrl || !registerApiKey) {
    throw new Error(
      "SSO_API_URL or REGISTER_API_KEY environment variables are not set"
    );
  }

  const body: Record<string, string> = { email, password, role };
  if (firstName) body.firstName = firstName;
  if (lastName) body.lastName = lastName;

  const res = await fetch(`${ssoApiUrl}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": registerApiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message ?? `SSO registration failed with status ${res.status}`
    );
  }

  const data = await res.json();
  return data.data || data;
}

/**
 * Membuat temporary password untuk user baru
 * Password yang dihasilkan harus dikomunikasikan ke user melalui email
 */
export function generateTemporaryPassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";

  const all = uppercase + lowercase + numbers + symbols;

  let password = "";
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));

  for (let i = 4; i < length; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length));
  }

  // Shuffle password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Map role lokal ke role Keycloak
 * Digunakan saat admin membuat akun SSO untuk user baru
 */
export function localRoleToKeycloak(localRole: string): string {
  const mapping: { [key: string]: string } = {
    Admin: "admin",
    Mahasiswa: "mahasiswa",
    Pewawancara: "volunteer-pewawancara",
    OrangTuaAsuh: "orang-tua-asuh",
    Pengurus_IOM: "pengurus-bidang-1",
    Guest: "mahasiswa", // fallback ke mahasiswa karena SSO tidak punya role guest
    Bankes: "bendahara",
  };

  return mapping[localRole] || "user";
}

/**
 * Update role user yang sudah ada di Keycloak
 * Dipanggil saat admin approve dan assign role ke user
 *
 * @param keycloakUserId - UUID user di Keycloak (oid)
 * @param role - Role Keycloak baru
 */
export async function updateSsoRole({
  keycloakUserId,
  role,
}: {
  keycloakUserId: string;
  role: string;
}): Promise<void> {
  const ssoApiUrl = process.env.SSO_API_URL;
  const registerApiKey = process.env.REGISTER_API_KEY;

  if (!ssoApiUrl || !registerApiKey) {
    throw new Error(
      "SSO_API_URL or REGISTER_API_KEY environment variables are not set"
    );
  }

  const res = await fetch(`${ssoApiUrl}/auth/users/${keycloakUserId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": registerApiKey,
    },
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message ?? `SSO role update failed with status ${res.status}`
    );
  }
}
