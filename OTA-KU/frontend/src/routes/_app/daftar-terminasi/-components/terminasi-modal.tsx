import { api } from "@/api/client";
import { ListTerminateForAdmin } from "@/api/generated";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface TerminasiModalProps {
  mode: "accept" | "reject";
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: ListTerminateForAdmin;
}

export default function TerminasiModal({
  mode,
  isOpen,
  onClose,
  onConfirm,
  item,
}: TerminasiModalProps) {
  const terminateConnection = useMutation({
    mutationFn: (data: { maId: string; otaId: string }) => {
      return api.terminate.validateTerminate({
        formData: {
          mahasiswaId: data.maId,
          otaId: data.otaId,
        },
      });
    },
    onSuccess: (_, _variables, context) => {
      toast.dismiss(context);
      toast.success("Permintaan terminasi berhasil diproses", {
        description: "Hubungan asuh antara OTA dan Mahasiswa telah berakhir",
      });
      onConfirm();
      onClose();
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

  const cancelTerminateConnection = useMutation({
    mutationFn: (data: { maId: string; otaId: string }) => {
      return api.terminate.rejectTerminate({
        formData: {
          mahasiswaId: data.maId,
          otaId: data.otaId,
        },
      });
    },
    onSuccess: (_, _variables, context) => {
      toast.dismiss(context);
      toast.success("Permintaan terminasi berhasil ditolak", {
        description: "Hubungan asuh antara OTA dan Mahasiswa tetap aktif",
      });
      onConfirm();
      onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {mode === "accept" ? (
            <DialogTitle className="text-destructive text-xl font-semibold">
              Konfirmasi Terminasi
            </DialogTitle>
          ) : (
            <DialogTitle className="text-dark text-xl font-semibold">
              Konfirmasi Tolak Terminasi
            </DialogTitle>
          )}
          <DialogDescription className="text-justify text-gray-600">
            {mode === "accept"
              ? "Apakah Anda yakin ingin melakukan terminasi hubungan asuh antara OTA dan Mahasiswa berikut?"
              : "Apakah Anda yakin ingin menolak permintaan terminasi hubungan asuh antara OTA dan Mahasiswa berikut?"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-semibold text-gray-700">OTA:</div>
            <div className="text-gray-800">{item.otaName}</div>

            <div className="font-semibold text-gray-700">Nomor OTA:</div>
            <div className="text-gray-800">{item.otaNumber}</div>

            <div className="font-semibold text-gray-700">Mahasiswa:</div>
            <div className="text-gray-800">{item.maName}</div>

            <div className="font-semibold text-gray-700">NIM:</div>
            <div className="text-gray-800">{item.maNIM}</div>
          </div>
        </div>
        <DialogFooter className="flex flex-row space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={
              terminateConnection.isPending ||
              cancelTerminateConnection.isPending
            }
          >
            Batal
          </Button>
          {mode === "accept" ? (
            <Button
              variant="destructive"
              onClick={() => {
                terminateConnection.mutate({
                  maId: item.mahasiswaId,
                  otaId: item.otaId,
                });
              }}
              className="flex-1"
              disabled={terminateConnection.isPending}
            >
              {terminateConnection.isPending ? "Memproses..." : "Terminasi"}
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={() => {
                cancelTerminateConnection.mutate({
                  maId: item.mahasiswaId,
                  otaId: item.otaId,
                });
              }}
              disabled={cancelTerminateConnection.isPending}
              className="sm:flex-1"
            >
              {cancelTerminateConnection.isPending
                ? "Memproses..."
                : "Tolak Terminasi"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
