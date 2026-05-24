"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.id) {
      setIsRedirecting(true);
      const userRole = session.user.role as string;
      
      const roleBasedUrls: { [key: string]: string } = {
        Mahasiswa: "/student/profile",
        Admin: "/admin/dashboard",
        Pengurus_IOM: "/iom/home",
        Guest: "/guest",
        Pewawancara: "/interviewer/interview",
        OrangTuaAsuh: "/guest",
        Bankes: "/admin/dashboard"
      };

      const redirectUrl = roleBasedUrls[userRole];
      console.log("Redirecting user with role:", userRole, "to:", redirectUrl);
      
      if (redirectUrl) {
        setIsRedirecting(true);
        router.push(redirectUrl);
      } else {
        // Fallback if role not found
        router.push("/guest");
      }
      // If role not in map, don't set isRedirecting — show home content or nothing
    }
  }, [session, status, router]);

  // Show loading state while checking session OR while redirecting
  if (status === "loading" || isRedirecting) {
    return (
      <div className="flex min-h-screen bg-gray-100 justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  // Show home page content only for non-logged-in users
  if (!session) {
    return (
      <div className="text-var bg-cover bg-center min-h-screen overflow-x-hidden" style={{ backgroundImage: "url('/bg.png')" }}>
        <div className="w-full sm:w-4/5 md:w-3/5 px-6 sm:px-10 md:pl-[10%] py-16 sm:py-[10%] min-h-screen">
          <h1 className="text-xl sm:text-2xl">Selamat Datang di Sistem Seleksi Bantuan Kesejahteraan Mahasiswa</h1>
          <h2 className="mb-8 mt-2 text-sm sm:text-base">Kami hadir untuk membantu mahasiswa ITB yang membutuhkan dukungan finansial dalam menjalani pendidikan. Daftarkan diri Anda, lengkapi persyaratan, dan ikuti proses seleksi. Semoga bantuan ini dapat mendukung perjalanan akademik Anda!</h2>
          <Link href="/login" className="py-2 px-5 rounded-full bg-var hover:bg-var/90 text-white">Daftar Sekarang →</Link>
        </div>
      </div>
    );
  }

  // This should never be reached, but just in case
  return null;
}