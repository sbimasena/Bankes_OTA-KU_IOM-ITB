import { ConnectionListAllResponse } from "@/api/generated";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import DeleteConnectionDialog from "./delete-connection-dialog";
import SetPeriodDialog from "./set-period-dialog";

export const connectionColumns: ColumnDef<ConnectionListAllResponse>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name_ma",
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

      return <p>{connection.name_ma}</p>;
    },
  },
  {
    accessorKey: "nim_ma",
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

      return <p>{connection.nim_ma}</p>;
    },
  },
  {
    accessorKey: "name_ota",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Orang Tua Asuh
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

      return <p>{connection.name_ota}</p>;
    },
  },
  {
    accessorKey: "number_ota",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No. Telepon OTA
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

      return <p>{connection.number_ota}</p>;
    },
  },
  {
    accessorKey: "connection_status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status Hubungan Asuh
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
          {connection.connection_status === "accepted" ? (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
              Aktif
            </span>
          ) : (
            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
              Menunggu Konfirmasi
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "start_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Mulai Periode
        {column.getIsSorted() === "asc" ? (
          <ArrowUpAZ className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDownAZ className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ row }) => {
      const d = row.original.start_date;
      return (
        <p className="text-sm">
          {d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
        </p>
      );
    },
  },
  {
    accessorKey: "end_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Akhir Periode
        {column.getIsSorted() === "asc" ? (
          <ArrowUpAZ className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDownAZ className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ row }) => {
      const d = row.original.end_date;
      return (
        <p className="text-sm">
          {d ? new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
        </p>
      );
    },
  },
  {
    accessorKey: "period_status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status Periode
        {column.getIsSorted() === "asc" ? (
          <ArrowUpAZ className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDownAZ className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.original.period_status;
      if (!row.original.start_date) {
        return <span className="text-muted-foreground text-xs">Belum diatur</span>;
      }
      return status === "active" ? (
        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
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
    header: () => <span className="text-blue-600 font-semibold">Aksi</span>,
    cell: ({ row }) => {
      const connection = row.original;
      return (
        <div className="flex items-center gap-2">
          <SetPeriodDialog connection={connection} />
          <DeleteConnectionDialog connection={connection} />
        </div>
      );
    },
  },
];
