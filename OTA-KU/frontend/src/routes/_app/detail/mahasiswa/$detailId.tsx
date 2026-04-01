import { api } from "@/api/client";
import Metadata from "@/components/metadata";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

import DetailCardsMahasiswaAsuh from "./-components/detail-card";

export const Route = createFileRoute("/_app/detail/mahasiswa/$detailId")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = context.session;

    if (!user) {
      throw redirect({ to: "/auth/login" });
    }

    if (user.type !== "ota") {
      throw redirect({ to: "/" });
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

    if (applicationStatus.body.status !== "accepted") {
      throw redirect({ to: "/" });
    }

    return { user };
  },
});

function RouteComponent() {
  const { detailId } = Route.useParams();

  const { data } = useQuery({
    queryKey: ["getMahasiswaDetailForOta", detailId],
    queryFn: () => api.detail.getMahasiswaDetailForOta({ id: detailId }),
  });

  return (
    <main className="flex min-h-[calc(100vh-70px)] flex-col justify-center p-2 px-6 py-8 md:px-12 lg:min-h-[calc(100vh-96px)]">
      <Metadata title="Detail Mahasiswa | BOTA" />
      <h1 className="text-primary mb-4 text-2xl font-bold">
        Detail Mahasiswa Asuh
      </h1>

      {/* Data diri */}
      <DetailCardsMahasiswaAsuh
        email={data?.body.email || "-"}
        phoneNumber={data?.body.phoneNumber || "-"}
        name={data?.body.name || "-"}
        nim={data?.body.nim || "-"}
        major={data?.body.major || "-"}
        faculty={data?.body.faculty || "-"}
        cityOfOrigin={data?.body.cityOfOrigin || "-"}
        highschoolAlumni={data?.body.highschoolAlumni || "-"}
        gpa={data?.body.gpa || "-"}
        gender={data?.body.gender ?? "M"}
        religion={data?.body.religion || "Islam"}
        notes={data?.body.notes || "-"}
        createdAt={data?.body.createdAt || "-"}
        id={data?.body.id || "-"}
      />

      {/* IOM Notes */}
      <div className="mt-6 grid grid-cols-1">
        <Card className="gap-4 p-6">
          <div className="flex items-center">
            <FileText className="text-primary mr-2 h-5 w-5" />
            <h3 className="text-lg font-semibold">Catatan dari IOM</h3>
          </div>
          <div className="text-gray-600">{data?.body.notes || "-"}</div>
        </Card>
      </div>
    </main>
  );
}

export default RouteComponent;
