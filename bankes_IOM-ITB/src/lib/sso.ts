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
    throw new Error("SSO_API_URL or REGISTER_API_KEY environment variables are not set");
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
    throw new Error(err.message ?? `SSO registration failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.data || data;
}

export function localRoleToKeycloak(localRole: string): string {
  const mapping: Record<string, string> = {
    Admin: "admin",
    Mahasiswa: "mahasiswa",
    Pewawancara: "volunteer-pewawancara",
    OrangTuaAsuh: "orang-tua-asuh",
    Pengurus_IOM: "pengurus-bidang-1",
    Guest: "mahasiswa",
    Bankes: "bendahara",
  };
  return mapping[localRole] || "user";
}

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
    throw new Error("SSO_API_URL or REGISTER_API_KEY environment variables are not set");
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
    throw new Error(err.message ?? `SSO role update failed with status ${res.status}`);
  }
}
