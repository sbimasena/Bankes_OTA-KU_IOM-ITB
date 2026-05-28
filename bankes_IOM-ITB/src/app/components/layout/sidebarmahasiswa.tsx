"use client"

import { signOut, useSession } from "next-auth/react";
import type React from "react"
import { User, FileUp, GraduationCap, Calendar, LogOut, Menu, X, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { memo, useState } from "react";
import Image from "next/image";
import NotificationBell from '@/components/ui/notificationBell';
import { useUser } from "@/app/contexts/UserContext";

const OTA_URL = process.env.NEXT_PUBLIC_OTA_URL ?? "http://localhost:5173";

type NavItem = {
  id: string
  label: string
  link: string
  icon: React.ReactNode
}

type SidebarMahasiswaProps = {
  activeTab: string
}

function SidebarMahasiswa({ activeTab }: SidebarMahasiswaProps) {
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter()
  const { userName } = useUser();

  const showFullContent = !isCollapsed || isMobileOpen;

  const navItems: NavItem[] = [
    { id: "profile", label: "Profil", link: "/student/profile", icon: <User className="h-5 w-5" /> },
    { id: "scholarship", label: "Beasiswa Saya", link: "/student/scholarship", icon: <GraduationCap className="h-5 w-5" /> },
    { id: "upload", label: "Unggah Dokumen", link: "/student/upload", icon: <FileUp className="h-5 w-5" /> },
    { id: "interview", label: "Interview", link: "/student/interview", icon: <Calendar className="h-5 w-5" /> },
  ]

  const handleNavigation = (link: string) => {
    setIsMobileOpen(false);
    router.push(link)
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-30 md:hidden bg-white border rounded-full p-2 shadow-md"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-screen bg-white shadow-lg transition-all duration-300 z-50 border-r",
        "w-64",
        isCollapsed ? "md:w-16" : "md:w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Desktop toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "hidden md:block absolute top-6 bg-white border rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-20",
            isCollapsed ? "-right-2" : "-right-3"
          )}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 z-20"
          aria-label="Tutup menu"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <Image
                src="/logoIOM.png"
                alt="IOM logo"
                width={32}
                height={32}
                priority
                className="flex-shrink-0"
              />
              {!showFullContent && (
                <>
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    IOM ITB
                  </div>
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-16 bg-white border rounded-full p-1 shadow-md z-10">
                          <NotificationBell parentStateKey={`${isCollapsed}-${isMobileOpen}`} />
                        </div>
                </>
              )}
            </div>
            {showFullContent && (
              <div className="min-w-0 flex-1 flex items-start justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <h2 className="text-lg font-semibold text-gray-800 break-words leading-tight">{userName || "Mahasiswa"}</h2>
                  <p className="text-sm text-gray-600">Mahasiswa</p>
                </div>
                <div className="flex-shrink-0">
                  <NotificationBell parentStateKey={`${isCollapsed}-${isMobileOpen}`} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4">
          {navItems.map((item) => (
            <div key={item.id} className="relative group">
              <button
                onClick={() => handleNavigation(item.link)}
                className={cn(
                  "w-full flex items-center px-4 py-3 text-left transition-colors hover:bg-gray-50",
                  activeTab === item.id ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700"
                )}
              >
                <span className={cn("flex-shrink-0", activeTab === item.id ? "text-blue-700" : "text-gray-500")}>
                  {item.icon}
                </span>
                {showFullContent && <span className="ml-3 truncate">{item.label}</span>}
              </button>
              {!showFullContent && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="border-t p-4 space-y-1">
          {/* Go to OTA-KU */}
          <div className="relative group">
            <a
              href={`${OTA_URL}/auth/login?sso=keycloak`}
              className="w-full flex items-center px-4 py-3 text-left transition-colors hover:bg-blue-50 text-blue-600 rounded"
            >
              <ExternalLink className="h-5 w-5 flex-shrink-0" />
              {showFullContent && <span className="ml-3">Ke OTA-KU</span>}
            </a>
            {!showFullContent && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Ke OTA-KU
              </div>
            )}
          </div>
          {/* Logout */}
          <div className="relative group">
            <button
              onClick={async () => {
                const res = await fetch("/api/auth/federated-logout");
                const { logoutUrl } = await res.json();
                await signOut({ redirect: false });
                window.location.href = logoutUrl;
              }}
              className="w-full flex items-center px-4 py-3 text-left transition-colors hover:bg-gray-50 text-gray-700"
            >
              <LogOut className="h-5 w-5 flex-shrink-0 text-gray-500" />
              {showFullContent && <span className="ml-3">Keluar</span>}
            </button>
            {!showFullContent && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Keluar
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(SidebarMahasiswa);
