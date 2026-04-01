import { api, queryClient } from "@/api/client";
import { MahasiswaListElement, UserSchema } from "@/api/generated";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Fakultas, Jurusan, censorNim } from "@/lib/nim";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Mars, Venus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MahasiswaCardProps {
  mahasiswa: MahasiswaListElement;
  session: UserSchema;
  queries: {
    page: number;
    value: string;
    major: Jurusan | undefined;
    faculty: Fakultas | undefined;
    gender: "M" | "F" | undefined;
    religion:
      | "Islam"
      | "Kristen Protestan"
      | "Hindu"
      | "Buddha"
      | "Katolik"
      | "Konghucu"
      | undefined;
  };
}

function MahasiswaCard({ mahasiswa, session, queries }: MahasiswaCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const bantuHandler = useMutation({
    mutationFn: (id: { mahasiswa: string; ota: string }) => {
      return api.connect.connectOtaMahasiswa({
        formData: {
          mahasiswaId: id.mahasiswa,
          otaId: id.ota,
        },
      });
    },
    onSuccess: (_, _variables, context) => {
      toast.dismiss(context);
      toast.success("Berhasil melakukan permintaan Bantuan Orang Tua Asuh", {
        description: "Permintaan akan segera diproses oleh IOM ITB",
      });
      queryClient.invalidateQueries({
        queryKey: [
          "listMahasiswaOta",
          queries.page,
          queries.value,
          queries.faculty,
          queries.gender,
          queries.major,
          queries.religion,
        ],
      });
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal melakukan permintaan Bantuan Orang Tua Asuh", {
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

  const handleBantuConfirm = () => {
    bantuHandler.mutate({
      mahasiswa: mahasiswa.accountId,
      ota: session?.id || "",
    });
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{mahasiswa.name}</h2>
        {mahasiswa.gender === "M" ? (
          <Mars className="text-blue-300" />
        ) : (
          <Venus className="text-pink-300" />
        )}
      </div>

      <p className="text-sm text-gray-600">
        {mahasiswa.faculty} - {mahasiswa.major} ({censorNim(mahasiswa.nim)})
      </p>
      <p className="text-sm text-gray-600">Asal {mahasiswa.cityOfOrigin}</p>
      <p className="text-sm text-gray-600">
        Alumni {mahasiswa.highschoolAlumni}
      </p>
      <p className="text-sm text-gray-600">Agama {mahasiswa.religion}</p>
      <p className="text-sm text-gray-600">IPK {mahasiswa.gpa}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" asChild>
          <Link
            to="/detail/mahasiswa/$detailId"
            params={{ detailId: mahasiswa.accountId }}
          >
            Lihat Profil
          </Link>
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Bantu</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Konfirmasi Bantuan</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin memberikan bantuan kepada{" "}
                <span className="text-dark font-bold">{mahasiswa.name}</span>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row space-x-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
                disabled={bantuHandler.isPending}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleBantuConfirm}
                disabled={bantuHandler.isPending}
                className="flex-1"
              >
                {bantuHandler.isPending ? "Memproses..." : "Bantu"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default MahasiswaCard;
