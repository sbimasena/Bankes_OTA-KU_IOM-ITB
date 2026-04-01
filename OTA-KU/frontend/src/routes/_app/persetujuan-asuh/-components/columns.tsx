import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

import ConfirmationDialog from "./confirmation-dialog";
import DetailDialogMahasiswa from "./detail-dialog-mahasiswa";
import DetailDialogOta from "./detail-dialog-ota";

export type PersetujuanAsuhColumn = {
  mahasiswaId: string;
  mahasiswaName: string;
  nim: string;
  otaId: string;
  otaName: string;
  phoneNumber: string;
};

export const persetujuanAsuhColumns: ColumnDef<PersetujuanAsuhColumn>[] = [
  {
    accessorKey: "mahasiswaId",
    header: "ID Mahasiswa",
  },
  {
    accessorKey: "mahasiswaName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Mahasiswa
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-6 w-6" />
          ) : (
            <ArrowDownAZ className="ml-2 h-6 w-6" />
          )}
        </Button>
      );
    },
  },
  {
    accessorKey: "nim",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          NIM
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-6 w-6" />
          ) : (
            <ArrowDownAZ className="ml-2 h-6 w-6" />
          )}
        </Button>
      );
    }
  },
  {
    accessorKey: "detailMahasiswa",
    header: "Detail Mahasiswa",
    cell: ({ row }) => {
      const id = row.getValue("mahasiswaId") as string;
      return <DetailDialogMahasiswa id={id} />;
    },
  },
  {
    accessorKey: "otaId",
    header: "ID OTA",
  }, 
  {
    accessorKey: "otaName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama OTA
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-6 w-6" />
          ) : (
            <ArrowDownAZ className="ml-2 h-6 w-6" />
          )}
        </Button>
      );
    }
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No. Telepon
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-6 w-6" />
          ) : (
            <ArrowDownAZ className="ml-2 h-6 w-6" />
          )}
        </Button>
      );
    }
  },
  {
    accessorKey: "detailOta",
    header: "Detail OTA",
    cell: ({ row }) => {
      const id = row.getValue("otaId") as string;
      return <DetailDialogOta id={id} />;
    },
  },
  {
    accessorKey: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const mahasiswaId = row.getValue("mahasiswaId") as string;
      const otaId = row.getValue("otaId") as string;
      const mahasiswaName = row.getValue("mahasiswaName") as string;
      const otaName = row.getValue("otaName") as string;
      const compositeKey = {
        otaId: otaId,
        mahasiswaId: mahasiswaId,
      }
      return <ConfirmationDialog compositeKey={compositeKey} mahasiswaName={mahasiswaName} otaName={otaName} />;
    },
  },
];
