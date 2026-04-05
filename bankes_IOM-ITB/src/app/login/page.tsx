"use client"

import { useRouter } from "next/navigation";
import { useEffect } from "react"

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/login")
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-cover bg-center" style={{ backgroundImage: "url('/bg.png')" }}>
      <div className="bg-white/90 px-6 py-4 rounded-lg shadow-sm text-sm text-gray-700">
        Mengalihkan ke halaman login...
      </div>
    </div>
  );
}
