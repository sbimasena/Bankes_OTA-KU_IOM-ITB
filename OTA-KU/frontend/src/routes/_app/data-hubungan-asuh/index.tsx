import Metadata from "@/components/metadata";
import { createFileRoute, redirect } from "@tanstack/react-router";

import DataHubunganAsuhContent from "./-components/data-hubungan-asuh-content";

export const Route = createFileRoute("/_app/data-hubungan-asuh/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (!user) {
      throw redirect({ to: "/auth/login" });
    }

    if (user.type === "mahasiswa" || user.type === "ota") {
      throw redirect({ to: "/" });
    }

    return { user };
  },
});

function RouteComponent() {
  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col gap-4 p-2 px-6 py-16 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Data Hubungan Asuh | BOTA" />
      <h1 className="text-dark text-3xl font-bold md:text-[50px]">
        Data Hubungan Asuh
      </h1>
      <DataHubunganAsuhContent />
    </main>
  );
}
