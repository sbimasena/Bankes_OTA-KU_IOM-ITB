"use client";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ redirect: false }).then(async () => {
      try {
        const res = await fetch("/api/auth/federated-logout");
        const { logoutUrl } = await res.json();
        window.location.href = logoutUrl;
      } catch {
        window.location.href = "/";
      }
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  );
}
