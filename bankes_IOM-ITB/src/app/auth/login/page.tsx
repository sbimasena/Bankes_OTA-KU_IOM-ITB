'use client'
import { useState } from "react"
import Link from 'next/link';
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"
import { useEffect } from "react";
import { Toaster } from "sonner";

export default function LoginPage() {
    const router = useRouter()
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!session?.user?.id || !session?.user?.role) return;
        const roleBasedCallbackUrls: { [key: string]: string } = {
            Mahasiswa: "/student/profile",
            Admin: "/admin/account/",
            Pengurus_IOM: "/iom/document/",
            Guest: "/guest/",
            Pewawancara: "/interviewer/interview/",
            OrangTuaAsuh: "/guest/",
        };
        const callbackUrl = roleBasedCallbackUrls[session.user.role as string];
        if (callbackUrl) router.push(callbackUrl);
    }, [session, router])

    const handleSSOLogin = async () => {
        try {
            setIsLoading(true)
            setError(null)
            await signIn("keycloak", { callbackUrl: "/" })
        } catch (err) {
            setError("Gagal melakukan login. Silakan coba lagi.")
            console.error("SSO login error:", err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/bg.png')" }}>
            <Toaster />
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md my-[5%]">
                <h1 className="text-2xl font-bold mb-2 text-center text-var">
                    Masuk ke Akun Anda
                </h1>

                <div className="text-center font-normal mb-6">
                    <span className="text-sm mr-1">
                        Belum punya akun? 
                    </span>
                    <Link href="/auth/register" className="text-sm text-var font-bold hover:underline">
                        Daftar
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={handleSSOLogin}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded transition duration-200"
                    >
                        {isLoading ? "Memproses..." : "Login dengan SSO IOM-ITB"}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">atau</span>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        <p>Menggunakan SSO IOM-ITB (Keycloak)</p>
                        <p className="text-xs mt-2">Hubungi admin jika mengalami masalah login</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
