import type { ListTerminateForAdmin } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { SessionContext } from "@/context/session";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { useContext } from "react";

interface TerminasiTableProps {
  data: ListTerminateForAdmin[];
  onTerminasi: (item: ListTerminateForAdmin) => void;
  onBatalTerminasi: (item: ListTerminateForAdmin) => void;
  onViewOtaNotes: (item: ListTerminateForAdmin) => void;
  onViewMaNotes: (item: ListTerminateForAdmin) => void;
}

export default function TerminasiTable({
  data,
  onTerminasi,
  onBatalTerminasi,
  onViewOtaNotes,
  onViewMaNotes,
}: TerminasiTableProps) {
  const session = useContext(SessionContext);

  // Format tanggal dari string ISO ke format yang lebih mudah dibaca
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd MMMM yyyy", { locale: id });
    } catch (error) {
      console.error("Error parsing date:", error);
      return dateString;
    }
  };

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center p-4 text-center text-gray-500">
        Tidak ada data terminasi yang tersedia.
      </div>
    );
  }

  const isDisabled = session?.type !== "admin" && session?.type !== "bankes";

  return (
    <div className="w-full overflow-x-auto px-4">
      <table className="w-full min-w-[1200px] border-collapse">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="px-2 py-3 font-medium whitespace-nowrap">OTA</th>
            <th className="px-2 py-3 font-medium whitespace-nowrap">
              Nomor OTA
            </th>
            <th className="px-2 py-3 font-medium whitespace-nowrap">
              Mahasiswa
            </th>
            <th className="px-2 py-3 font-medium whitespace-nowrap">NIM</th>
            <th className="px-2 py-3 font-medium whitespace-nowrap">
              Berhubungan Sejak
            </th>
            <th className="px-2 py-3 font-medium whitespace-nowrap">
              Diminta Oleh
            </th>
            <th className="px-2 py-3 font-medium whitespace-nowrap">
              Catatan OTA
            </th>
            <th className="px-2 py-3 font-medium whitespace-nowrap">
              Catatan MA
            </th>
            <th className="px-2 py-3 font-medium whitespace-nowrap">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={`${item.otaId}-${item.mahasiswaId}`} className="border-b">
              <td className="px-2 py-4 whitespace-nowrap">{item.otaName}</td>
              <td className="px-2 py-4 whitespace-nowrap">{item.otaNumber}</td>
              <td className="px-2 py-4 whitespace-nowrap">{item.maName}</td>
              <td className="px-2 py-4 whitespace-nowrap">{item.maNIM}</td>
              <td className="px-2 py-4 whitespace-nowrap">
                {formatDate(item.createdAt)}
              </td>
              <td className="px-2 py-4 whitespace-nowrap">
                <div className="flex gap-2">
                  {item.requestTerminateMA && (
                    <span className="inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                      By MA
                    </span>
                  )}
                  {item.requestTerminateOTA && (
                    <span className="inline-flex items-center rounded-full border border-purple-300 bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-600">
                      By OTA
                    </span>
                  )}
                </div>
              </td>
              <td className="px-2 py-3">
                {item.requestTerminationNoteOTA ? (
                  <Button
                    variant={"outline"}
                    onClick={() => onViewOtaNotes(item)}
                  >
                    Detail
                  </Button>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-2 py-3">
                {item.requestTerminationNoteMA ? (
                  <Button
                    variant={"outline"}
                    onClick={() => onViewMaNotes(item)}
                  >
                    Detail
                  </Button>
                ) : (
                  "-"
                )}
              </td>
              <td className="flex gap-2 px-2 py-4">
                <Button
                  className="w-[88px] rounded-md"
                  variant="destructive"
                  size="sm"
                  onClick={() => onTerminasi(item)}
                  disabled={isDisabled}
                >
                  Terminasi
                </Button>
                <Button
                  className="w-[88px] rounded-md"
                  variant="default"
                  size="sm"
                  onClick={() => onBatalTerminasi(item)}
                  disabled={isDisabled}
                >
                  Tolak
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
