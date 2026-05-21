import type { PendingConnection } from "@/types/group";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import DeleteGroupConnectionDialog from "./delete-group-connection-dialog";

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
    id: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const connection = row.original;
      return <DeleteGroupConnectionDialog connection={connection} />;
    },
  },
];
