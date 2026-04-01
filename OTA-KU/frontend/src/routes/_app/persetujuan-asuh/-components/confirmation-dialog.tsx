import { api, queryClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SessionContext } from "@/context/session";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { CircleCheck, CircleX } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";

function ConfirmationDialog({
  compositeKey,
  mahasiswaName,
  otaName,
}: {
  compositeKey: {
    mahasiswaId: string;
    otaId: string;
  };
  mahasiswaName: string;
  otaName: string;
}) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"accept" | "reject" | null>(null);
  const session = useContext(SessionContext);

  const connectionStatusCallbackMutation = useMutation({
    mutationFn: async () => {
      if (action === "accept") {
        return api.connect.verifyConnectionAccept({ formData: compositeKey });
      } else if (action === "reject") {
        return api.connect.verifyConnectionReject({ formData: compositeKey });
      }
    },
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      toast.success(
        action === "accept"
          ? "Berhasil menerima koneksi"
          : "Berhasil menolak koneksi",
      );
      queryClient.invalidateQueries({
        queryKey: ["listConnection"],
        refetchType: "active",
      }); // Refresh the table
      setOpen(false);
    },
    onError: (_error, _variables, context) => {
      toast.dismiss(context);
      toast.warning(
        action === "accept"
          ? "Gagal menerima koneksi"
          : "Gagal menolak koneksi",
      );
    },
    onMutate: () => {
      const loading = toast.loading(
        action === "accept"
          ? "Sedang memproses penerimaan koneksi..."
          : "Sedang memproses penolakan koneksi...",
        { duration: Infinity },
      );
      return loading;
    },
  });

  const handleConfirm = () => {
    connectionStatusCallbackMutation.mutate();
  };

  const isDisabled = session?.type !== "admin" && session?.type !== "bankes";

  return (
    <div className="flex gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger disabled={isDisabled}>
          <CircleCheck
            className={cn(
              "text-succeed h-6 w-6",
              !isDisabled && "cursor-pointer",
            )}
            onClick={() => {
              setAction("accept");
              setOpen(true);
            }}
          />
        </DialogTrigger>
        <DialogTrigger disabled={isDisabled}>
          <CircleX
            className={cn(
              "text-destructive h-6 w-6",
              !isDisabled && "cursor-pointer",
            )}
            onClick={() => {
              setAction("reject");
              setOpen(true);
            }}
          />
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "accept"
                ? "Konfirmasi Persetujuan"
                : "Konfirmasi Tolak"}
            </DialogTitle>
          </DialogHeader>
          <p>
            Apakah Anda yakin ingin{" "}
            {action === "accept" ? "menyetujui" : "menolak"} permintaan OTA
            <span className="font-bold"> {otaName} </span>
            untuk mengasuh
            <span className="font-bold"> {mahasiswaName}</span>? Aksi ini tidak
            akan bisa diulang.
          </p>
          <div className="mt-4 flex flex-row space-x-2">
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={connectionStatusCallbackMutation.isPending}
            >
              Batal
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirm}
              disabled={connectionStatusCallbackMutation.isPending}
            >
              Yakin
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ConfirmationDialog;
