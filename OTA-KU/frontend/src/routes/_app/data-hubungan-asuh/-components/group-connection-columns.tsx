import type { PendingConnection } from "@/types/group";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import DeleteGroupConnectionDialog from "./delete-group-connection-dialog";
import SetGroupPeriodDialog from "./set-group-period-dialog";

export const groupConnectionColumns: ColumnDef<PendingConnection>[] = [
  {
    accessorKey: "id",
    header: "ID",
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
    cell: ({ row }) => {
      const connection = row.original;
      return <p>{connection.mahasiswaName}</p>;
    },
  },
  {
    accessorKey: "mahasiswaNim",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          NIM Mahasiswa
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-6 w-6" />
          ) : (
            <ArrowDownAZ className="ml-2 h-6 w-6" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const connection = row.original;
      return <p>{connection.mahasiswaNim}</p>;
    },
  },
  {
    accessorKey: "groupName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Grup OTA
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-6 w-6" />
          ) : (
            <ArrowDownAZ className="ml-2 h-6 w-6" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const connection = row.original;
      return <p>{connection.groupName}</p>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tanggal Dibuat
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDownAZ className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const connection = row.original;
      return <p>{new Date(connection.createdAt).toLocaleDateString("id-ID")}</p>;
    },
  },
  {
    accessorKey: "connectionStatus",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status Hubungan
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDownAZ className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const connection = row.original;

      return (
        <div className="capitalize">
          {connection.connectionStatus === "accepted" ? (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
              Aktif
            </span>
          ) : connection.connectionStatus === "pending" ? (
            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
              Menunggu Konfirmasi
            </span>
          ) : (
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
              Ditolak
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Mulai Periode",
    cell: ({ row }) => {
      const d = row.original.startDate;
      return (
        <p className="text-sm">
          {d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
        </p>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: "Akhir Periode",
    cell: ({ row }) => {
      const d = row.original.endDate;
      return (
        <p className="text-sm">
          {d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
        </p>
      );
    },
  },
  {
    accessorKey: "periodStatus",
    header: "Status Periode",
    cell: ({ row }) => {
      const status = row.original.periodStatus;
      if (!row.original.startDate) {
        return <span className="text-muted-foreground text-xs">Belum diatur</span>;
      }
      return status === "active" ? (
        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
          Aktif
        </span>
      ) : (
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
          Berakhir
        </span>
      );
    },
  },
  {
    id: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const connection = row.original;
      return (
        <div className="flex items-center gap-2">
          <SetGroupPeriodDialog connection={connection} />
          <DeleteGroupConnectionDialog connection={connection} />
        </div>
      );
    },
  },
];
