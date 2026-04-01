import { api } from "@/api/client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Navigate } from "@tanstack/react-router";

import ProfileMahasiswa from "./-components/profile-mahasiswa";
import ProfileOta from "./-components/profile-ota";

export const Route = createFileRoute("/_app/profile/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (!user) {
      throw redirect({ to: "/auth/login" });
    }

    const verificationStatus = await api.status
      .getVerificationStatus({
        id: user.id,
      })
      .catch(() => null);

    if (!verificationStatus) {
      throw redirect({ to: "/auth/login" });
    }

    if (verificationStatus.body.status !== "verified") {
      throw redirect({ to: "/auth/otp-verification" });
    }

    const applicationStatus = await api.status
      .getApplicationStatus({ id: user.id })
      .catch(() => null);

    if (!applicationStatus) {
      throw redirect({ to: "/auth/login" });
    }

    return { session: user, applicationStatus: applicationStatus.body.status };
  },
  loader: async ({ context }) => {
    return {
      session: context.session,
      applicationStatus: context.applicationStatus,
    };
  },
});

function RouteComponent() {
  const { session, applicationStatus } = Route.useLoaderData();

  // For mahasiswa users
  if (session.type === "mahasiswa") {
    return (
      <ProfileMahasiswa
        session={session}
        applicationStatus={applicationStatus}
      />
    );
  }

  // For OTA users
  if (session.type === "ota") {
    return (
      <ProfileOta session={session} applicationStatus={applicationStatus} />
    );
  }

  // Redirect if user is admin
  return <Navigate to="/" />;
}
