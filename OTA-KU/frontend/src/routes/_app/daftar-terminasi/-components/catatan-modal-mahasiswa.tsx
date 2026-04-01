import type { ListTerminateForAdmin } from "@/api/generated";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface CatatanMahasiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ListTerminateForAdmin;
  note: string;
}

export default function CatatanMahasiswaModal({
  isOpen,
  onClose,
  item,
  note,
}: CatatanMahasiswaModalProps) {
  // Format tanggal dari string ISO ke format yang lebih mudah dibaca
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd MMMM yyyy", { locale: id });
    } catch (error) {
      console.error("Error parsing date:", error);
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Catatan Mahasiswa
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-semibold text-gray-700">Nama:</div>
            <div className="text-gray-800">{item.maName}</div>

            <div className="font-semibold text-gray-700">NIM:</div>
            <div className="text-gray-800">{item.maNIM}</div>

            <div className="font-semibold text-gray-700">OTA:</div>
            <div className="text-gray-800">{item.otaName}</div>

            <div className="font-semibold text-gray-700">Nomor OTA:</div>
            <div className="text-gray-800">{item.otaNumber}</div>

            <div className="font-semibold text-gray-700">
              Berhubungan Sejak:
            </div>
            <div className="text-gray-800">{formatDate(item.createdAt)}</div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="font-semibold text-gray-700">Catatan:</div>
            <div className="min-h-[120px] rounded-md border border-gray-200 bg-gray-50 p-3 text-sm whitespace-pre-wrap text-gray-800">
              {note || "Tidak ada catatan untuk mahasiswa ini."}
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button variant="default" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
