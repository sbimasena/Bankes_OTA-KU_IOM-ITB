import { api } from "@/api/client";
import { MyOtaDetailResponse } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SessionContext } from "@/context/session";
import { censorEmail } from "@/lib/formatter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CircleDollarSign,
  Mail,
  Phone,
} from "lucide-react";
import React, { useContext, useState } from "react";
import { toast } from "sonner";

const DetailCardsOrangTuaAsuh: React.FC<MyOtaDetailResponse> = ({
  id,
  name,
  email,
  phoneNumber,
  transferDate,
  isDetailVisible,
  createdAt,
}) => {
  const session = useContext(SessionContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isRequested, setIsRequested] = useState(false);

  const reqTerminateOTA = useMutation({
    mutationFn: (data: { otaId: string; note: string }) => {
      return api.terminate.requestTerminateFromMa({
        formData: {
          requestTerminationNote: note,
          mahasiswaId: session?.id ? session.id : "",
          otaId: data.otaId,
        },
      });
    },
    onSuccess: (_, _variables, context) => {
      toast.dismiss(context);
      setIsModalOpen(false);
      setIsRequested(true);
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal memproses permintaan terminasi", {
        description: error.message,
      });
    },
    onMutate: () => {
      const loading = toast.loading("Sedang memproses permintaan...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const handleTerminate = () => {
    reqTerminateOTA.mutate({ otaId: id, note: note });
  };

  const { data: terminationData } = useQuery({
    queryKey: ["terminationData"],
    queryFn: () => api.terminate.terminationStatusMa(),
  });

  React.useEffect(() => {
    setIsRequested(
      terminationData?.body.requestTerminateMA === undefined
        ? false
        : terminationData.body.requestTerminateMA,
    );
  }, [terminationData]);

  return (
    <div className="flex w-full max-w-[300px] justify-center">
      <div className="flex w-full flex-col gap-4">
        <Card className="mx-auto w-full md:max-w-sm">
          <CardHeader className="flex flex-col items-center justify-center pt-6 pb-4">
            <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-100">
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
                {name.charAt(0)}
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold xl:text-xl">{name}</h2>
              <p className="text-muted-foreground">Orang Tua Asuh</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-primary space-y-3 text-sm xl:text-base">
              <div className="flex items-start space-x-3">
                <Mail className="text-muted-foreground h-5 w-5" />
                <a
                  href={isDetailVisible ? `mailto:${email}` : "#"}
                  target={isDetailVisible ? "_blank" : "_self"}
                  className="text-sm"
                >
                  {isDetailVisible ? email : censorEmail(email)}
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="text-muted-foreground h-5 w-5" />
                <a
                  href={isDetailVisible ? `https://wa.me/${phoneNumber}` : "#"}
                  target={isDetailVisible ? "_blank" : "_self"}
                  className="text-sm"
                >
                  +{isDetailVisible ? phoneNumber : "**********"}
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <CircleDollarSign className="text-muted-foreground min-h-5 min-w-5" />
                <span className="text-sm">
                  Bantuan dikirim tanggal {transferDate} untuk setiap bulan
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="text-muted-foreground h-5 w-5" />
                <span className="text-sm">
                  Terdaftar sejak{" "}
                  {new Date(createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Button
          className="rounded-xl transition-colors hover:bg-red-600 focus:ring-2 focus:ring-red-300 focus:outline-none active:bg-red-700"
          variant={"destructive"}
          disabled={isRequested}
          onClick={() => setIsModalOpen(true)}
        >
          Akhiri Hubungan Asuh
        </Button>

        {isRequested && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-15 w-15 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800">
                  Menunggu Konfirmasi Admin
                </h3>
                <p className="text-sm text-amber-700">
                  Permintaan terminasi Anda sedang diproses. Kami akan memberi
                  tahu Anda setelah dikonfirmasi.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              Konfirmasi Pengakhiran Hubungan
            </DialogTitle>
            <DialogDescription className="text-justify">
              Apakah Anda yakin ingin mengakhiri hubungan dengan orang tua asuh{" "}
              <span className="font-bold">{name}</span>?
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Masukkan alasan terminasi (wajib)"
            disabled={reqTerminateOTA.isPending}
          />

          <DialogFooter className="flex flex-row space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
              disabled={reqTerminateOTA.isPending}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleTerminate}
              className="flex-1"
              disabled={reqTerminateOTA.isPending}
            >
              Akhiri Hubungan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetailCardsOrangTuaAsuh;
