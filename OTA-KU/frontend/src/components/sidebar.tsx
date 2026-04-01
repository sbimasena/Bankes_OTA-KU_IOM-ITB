import { api, queryClient } from "@/api/client";
import SidebarContent from "@/components/sidebar-content";
import SidebarOverlay from "@/components/sidebar-overlay";
import { SessionContext } from "@/context/session";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { useContext, useEffect, useState } from "react";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  iconColorClass?: string;
  textColorClass?: string;
  bgColorClass?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const adminRoutes = [
  {
    id: "verification",
    label: "Verifikasi Akun",
    icon: "/icon/Type=shield.svg",
    path: "/verifikasi-akun",
  },
  {
    id: "persetujuan-asuh",
    label: "Persetujuan Asuh",
    icon: "/icon/Type=user-round-check.svg",
    path: "/persetujuan-asuh",
  },
  {
    id: "pemasangan-bota",
    label: "Pemasangan BOTA",
    icon: "/icon/Type=handshake.svg",
    path: "/pemasangan-bota",
  },
  {
    id: "connection",
    label: "Data Hubungan Asuh",
    icon: "/icon/Type=connection.svg",
    path: "/data-hubungan-asuh",
  },
  {
    id: "daftar-transfer-mahasiswa",
    label: "Daftar Transfer Mahasiswa",
    icon: "/icon/Type=transaction.svg",
    path: "/daftar-transfer-mahasiswa",
  },
  {
    id: "transaction",
    label: "Daftar Tagihan OTA",
    icon: "/icon/Type=receipt.svg",
    path: "/daftar-tagihan",
  },
  {
    id: "daftar-terminasi",
    label: "Daftar Terminasi",
    icon: "/icon/Type=remove-destructive.svg",
    path: "/daftar-terminasi",
    bgColorClass: " bg-destructive/10",
    textColorClass: "text-destructive",
  },
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const session = useContext(SessionContext);
  const location = useLocation();
  const [activeItem, setActiveItem] = useState<string>("");

  const { data } = useQuery({
    queryKey: ["getApplicationStatus"],
    queryFn: () => {
      if (!session) return null;

      return api.status
        .getApplicationStatus({ id: session.id })
        .catch(() => null);
    },
  });

  const applicationStatus = data?.body.status;

  const userRole = session?.type;

  const menuItems = getMenuItems(userRole!, applicationStatus);

  useEffect(() => {
    if (session) {
      queryClient.refetchQueries({
        queryKey: ["getApplicationStatus"],
        exact: true,
      });
    }
  }, [session]);

  useEffect(() => {
    const currentPath = location.pathname;
    const matchingItem = menuItems.find((item) =>
      currentPath.startsWith(item.path),
    );
    if (matchingItem) {
      setActiveItem(matchingItem.id);
    } else {
      setActiveItem("");
    }
  }, [location.pathname, menuItems]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscKey);
    }

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!session) {
    return null;
  }

  return (
    <>
      <SidebarOverlay isOpen={isOpen} onClose={onClose} />
      <SidebarContent
        isOpen={isOpen}
        onClose={onClose}
        menuItems={menuItems}
        activeItem={activeItem}
        userData={session}
      />
    </>
  );
};

const getMenuItems = (role: string, applicationStatus?: string): MenuItem[] => {
  if (
    (role === "ota" || role === "mahasiswa") &&
    (applicationStatus === "unregistered" ||
      applicationStatus === "pending" ||
      applicationStatus === "rejected" ||
      applicationStatus === "outdated")
  ) {
    return [
      {
        id: "pendaftaran",
        label: "Pendaftaran",
        icon: "/icon/Type=form.svg",
        path: "/pendaftaran",
      },
    ];
  }

  switch (role) {
    case "mahasiswa":
      return [
        {
          id: "ota-saya",
          label: "Orang Tua Asuh Saya",
          icon: "/icon/Type=student-list.svg",
          path: "/orang-tua-asuh-saya",
        },
      ];
    case "ota":
      return [
        {
          id: "student-list",
          label: "Cari Mahasiswa",
          icon: "/icon/Type=search.svg",
          path: "/cari-mahasiswa",
        },
        {
          id: "my-students",
          label: "Mahasiswa Asuh Saya",
          icon: "/icon/Type=people.svg",
          path: "/mahasiswa-asuh-saya",
        },
        {
          id: "status-transaksi",
          label: "Status Transaksi",
          icon: "/icon/Type=transaction-status.svg",
          path: "/status-transaksi",
        },
        {
          id: "terminasi-mahasiswa",
          label: "Berhenti Mengasuh",
          icon: "/icon/Type=remove-destructive.svg",
          path: "/daftar/terminasi-mahasiswa",
          bgColorClass: " bg-destructive/10",
          textColorClass: "text-destructive",
        },
      ];
    case "admin":
      return [
        {
          id: "manejemen-akun",
          label: "Manajemen Akun",
          icon: "/icon/Type=people.svg",
          path: "/manajemen-akun",
        },
        ...adminRoutes,
      ];
    case "bankes":
      return adminRoutes;
    case "pengurus":
      return adminRoutes;
    default:
      return [];
  }
};

export default Sidebar;
