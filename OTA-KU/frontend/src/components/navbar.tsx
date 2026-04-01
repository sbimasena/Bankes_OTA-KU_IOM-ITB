import { api, queryClient } from "@/api/client";
import { CreatePushSubscriptionSchema } from "@/api/generated";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { SessionContext } from "@/context/session";
import { useSidebar } from "@/context/sidebar-context";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, BellOff } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import Sidebar from "./sidebar";
import { Button } from "./ui/button";

export default function NavBar() {
  const session = useContext(SessionContext);
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
  const navigate = useNavigate();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const isLoggedIn = !!session;
  const isMahasiswa = session?.type === "mahasiswa";

  // Query to check if user needs to renew (mahasiswa within 30 days of due date)
  const { data: profileData } = useQuery({
    queryKey: ["getReapplicationStatus", session?.id],
    queryFn: () => {
      if (!session?.id || !isMahasiswa) return null;
      return api.status.getReapplicationStatus({
        id: session.id,
      });
    },
    enabled: !!session?.id && isMahasiswa,
  });

  const { data, refetch } = useQuery({
    queryKey: ["getPushSubscription", session?.id],
    queryFn: () => {
      if (!session?.id) return null;
      return api.pushSubscription.getPushSubscription({ id: session.id });
    },
    enabled: !!session?.id,
  });

  const registerServiceWorkerCallbackMutation = useMutation({
    mutationKey: ["registerServiceWorkerCallback"],
    mutationFn: async () => {
      if (!session?.id) return null;

      if (!("serviceWorker" in navigator)) {
        console.error("Service workers are not supported in this browser.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");

      if (!registration.pushManager) {
        console.error("Push manager unavailable.");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      const payload = {
        endpoint: subscription.endpoint,
        p256dh: subscription.toJSON().keys?.p256dh,
        auth: subscription.toJSON().keys?.auth,
      } as CreatePushSubscriptionSchema;

      return api.pushSubscription.createPushSubscription({
        id: session.id,
        formData: {
          auth: payload.auth,
          endpoint: payload.endpoint,
          p256dh: payload.p256dh,
        },
      });
    },
    onSuccess: (_data, _variables, context) => {
      setNotificationsEnabled(true);
      toast.dismiss(context);
      toast.success("Berhasil mengubah pengaturan notifikasi", {
        description: "Anda akan menerima notifikasi dari kami",
      });
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal mengubah pengaturan notifikasi", {
        description: error.message,
      });
    },
    onMutate: () => {
      const loading = toast.loading(
        "Sedang mengubah pengaturan notifikasi...",
        {
          description: "Mohon tunggu sebentar",
          duration: Infinity,
        },
      );
      return loading;
    },
  });

  const unregisterServiceWorkerCallbackMutation = useMutation({
    mutationKey: ["unregisterServiceWorkerCallback"],
    mutationFn: async () => {
      if (!session?.id) return null;

      if (!("serviceWorker" in navigator)) {
        console.error("Service workers are not supported in this browser.");
        return;
      }

      const registration = await navigator.serviceWorker.getRegistration();

      if (!registration) {
        console.error("No service worker registration found.");
        return;
      }

      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      return api.pushSubscription.deletePushSubscription({ id: session.id });
    },
    onSuccess: (_data, _variables, context) => {
      setNotificationsEnabled(false);
      toast.dismiss(context);
      toast.success("Berhasil mengubah pengaturan notifikasi", {
        description: "Anda tidak akan menerima notifikasi dari kami",
      });
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal mengubah pengaturan notifikasi", {
        description: error.message,
      });
    },
    onMutate: () => {
      const loading = toast.loading(
        "Sedang mengubah pengaturan notifikasi...",
        {
          description: "Mohon tunggu sebentar",
          duration: Infinity,
        },
      );
      return loading;
    },
  });

  useEffect(() => {
    if (session) {
      refetch();
    }
  }, [refetch, session]);

  useEffect(() => {
    if (data?.body.isSubscribed) {
      setNotificationsEnabled(true);
    } else {
      setNotificationsEnabled(false);
    }
  }, [data]);

  return (
    <>
      <nav
        className="font-anderson sticky top-0 right-0 left-0 z-[60] flex w-full flex-col bg-white shadow-md"
        id="navbar"
      >
        <div className="flex h-[70px] flex-row items-center justify-between px-7 lg:h-24 xl:px-14">
          <div className="relative flex items-center gap-6">
            <button
              onClick={toggleSidebar}
              className={cn(
                "flex items-center justify-center hover:cursor-pointer focus:outline-none",
                !isLoggedIn && "hidden",
              )}
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={isSidebarOpen}
            >
              <img
                src="/icon/Type=list-icon.svg"
                alt="sidebar-button"
                className="transform transition-transform duration-200 ease-in-out hover:scale-125"
              />
            </button>
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            <Link to="/" className="flex items-center space-x-2">
              <img
                className="h-9 w-auto object-contain xl:h-10"
                src="/logo-iom-icon.svg"
                alt="Logo"
              />
              {/* Title visible from md (desktop) and up */}
              <div className="hidden flex-col leading-tight md:flex">
                <span className="text-primary text-lg font-bold">
                  Ikatan Orang Tua Mahasiswa
                </span>
                <span className="text-primary text-base font-medium">
                  Institut Teknologi Bandung
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            {!isLoggedIn && (
              <Link className="w-fit" to="/auth/login">
                <Button size="lg" variant={"outline"} className="w-[90px]">
                  Masuk
                </Button>
              </Link>
            )}
            {!isLoggedIn && (
              <Link className="w-fit" to="/auth/register">
                <Button size="lg" className="w-[90px]">
                  Daftar
                </Button>
              </Link>
            )}
            {isLoggedIn && (
              <>
                {notificationsEnabled ? (
                  <Bell
                    className="text-dark h-6 w-6 transform transition-transform duration-200 ease-in-out hover:scale-125 hover:cursor-pointer"
                    onClick={() => {
                      unregisterServiceWorkerCallbackMutation.mutate();
                    }}
                  />
                ) : (
                  <BellOff
                    className="text-dark h-6 w-6 transform transition-transform duration-200 ease-in-out hover:scale-125 hover:cursor-pointer"
                    onClick={() => {
                      registerServiceWorkerCallbackMutation.mutate();
                    }}
                  />
                )}
              </>
            )}
            {isLoggedIn && (
              <Menubar className="border-none bg-transparent p-0 shadow-none">
                <MenubarMenu>
                  <MenubarTrigger className="cursor-pointer border-none bg-transparent p-0 shadow-none outline-none hover:bg-transparent focus:bg-transparent">
                    <div className="relative">
                      {(session.type === "mahasiswa" || session.type === "ota") ? (
                        <>
                          <img
                            src="/icon/Type=profile-icon.svg"
                            alt="Profile"
                            className="h-6 w-6 transform transition-transform duration-200 ease-in-out hover:scale-125"
                          />
                          {/* Red dot indicator above profile icon */}
                          {profileData?.body.status && (
                            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-600"></div>
                          )}
                        </>
                      ) : (
                        <img
                          src="/icon/Type=log-out.svg"
                          alt="Log out"
                          className="h-6 w-6 transform transition-transform duration-200 ease-in-out hover:scale-125"
                        />
                      )}
                    </div>
                  </MenubarTrigger>
                  <MenubarContent
                    className="z-[70]"
                    align="end"
                    alignOffset={-10}
                    sideOffset={5}
                  >
                    {session.type !== "admin" &&
                      session.type !== "bankes" &&
                      session.type !== "pengurus" && (
                        <>
                          <MenubarItem
                            className="text-dark relative hover:cursor-pointer"
                            asChild
                          >
                            <Link
                              to="/profile"
                              className="flex w-full items-center justify-between"
                            >
                              <span>Akun Saya</span>
                              {/* Red dot indicator next to "Akun Saya" */}
                              {profileData?.body.status && (
                                <div className="ml-2 h-3 w-3 rounded-full bg-red-600"></div>
                              )}
                            </Link>
                          </MenubarItem>

                          <MenubarSeparator />
                        </>
                      )}
                    <MenubarItem
                      className="text-destructive hover:cursor-pointer"
                      onClick={() => {
                        api.auth.logout();
                        localStorage.removeItem("state");
                        localStorage.removeItem("pendaftaran-ota");
                        localStorage.removeItem("pendaftaran-mahasiswa");
                        queryClient.invalidateQueries({ queryKey: ["verify"] });
                        navigate({
                          to: "/",
                          replace: true,
                          reloadDocument: true,
                        });
                      }}
                    >
                      Keluar
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
