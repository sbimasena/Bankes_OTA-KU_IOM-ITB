"use client";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    const query = from ? `?from=${from}` : "";

    // Fetch the Keycloak logout URL first while the NextAuth token is still active,
    // then sign out of NextAuth, then redirect to Keycloak to end the SSO session.
    fetch(`/api/auth/federated-logout${query}`)
      .then((res) => res.json())
      .then(async ({ logoutUrl }) => {
        await signOut({ redirect: false });
        window.location.href = logoutUrl;
      })
      .catch(async () => {
        await signOut({ redirect: false });
        window.location.href = from === "ota" ? (process.env.NEXT_PUBLIC_OTA_URL ?? "/") : "/";
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  );
}
