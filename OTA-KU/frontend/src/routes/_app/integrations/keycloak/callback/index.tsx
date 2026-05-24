import { api, queryClient } from "@/api/client";
import Metadata from "@/components/metadata";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute(
  "/_app/integrations/keycloak/callback/",
)({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (user) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (!code) {
      return;
    }

    api.auth
      .oauth({
        formData: { code },
      })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["verify"] });
        navigate({ to: "/", reloadDocument: true });
      })
      .catch((error) => {
        console.error(error);
        navigate({ to: "/auth/login" });
      });
  }, [navigate]);

  return (
    <div className="flex min-h-[calc(100vh-70px)] items-center justify-center">
      <Metadata title="Login | BOTA" />
      <div className="flex flex-col items-center gap-4">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-primary text-lg">Sedang memproses login SSO...</p>
      </div>
    </div>
  );
}
