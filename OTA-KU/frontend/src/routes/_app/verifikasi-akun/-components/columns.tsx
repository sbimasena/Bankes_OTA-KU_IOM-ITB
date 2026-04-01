import { Button } from "@/components/ui/button";
import { formatPhoneNumber } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

import Combobox from "./combobox";
import DetailDialogMahasiswa from "./detail-dialog-mahasiswa";
import DetailDialogOta from "./detail-dialog-ota";

export type MahasiswaColumn = {
  id: string;
  name: string;
  email: string;
  jurusan: string;
  status: string;
};

export const mahasiswaColumns: ColumnDef<MahasiswaColumn>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama
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
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDownAZ className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
  },
  {
    accessorKey: "jurusan",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Jurusan
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDownAZ className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDownAZ className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold text-white",
            status === "pending"
              ? "bg-[#EAB308]"
              : status === "accepted"
                ? "bg-succeed"
                : status === "rejected"
                  ? "bg-destructive"
                  : status === "reapply"
                    ? "bg-blue-500"
                    : "bg-gray-500",
          )}
        >
          {status === "pending"
            ? "Tertunda"
            : status === "accepted"
              ? "Terverifikasi"
              : status === "rejected"
                ? "Tertolak"
                : status === "reapply"
                  ? "Pengajuan Ulang"
                  : "Kedaluarsa"}
        </span>
      );
    },
  },
  {
    accessorKey: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      const name = row.getValue("name") as string;
      const email = row.getValue("email") as string;
      const status = row.getValue("status") as
        | "pending"
        | "accepted"
        | "rejected"
        | "reapply"
        | "outdated";

      return (
        <Combobox
          id={id}
          name={name}
          email={email}
          status={status}
          type="mahasiswa"
        />
      );
    },
  },
  {
    accessorKey: "detail",
    header: "Detail",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      const status = row.getValue("status") as
        | "pending"
        | "accepted"
        | "rejected"
        | "reapply"
        | "outdated";

      return <DetailDialogMahasiswa id={id} status={status} />;
    },
  },
];

export type OrangTuaColumn = {
  id: string;
  name: string;
  phoneNumber: string;
  job: string;
  status: string;
};

export const orangTuaColumns: ColumnDef<OrangTuaColumn>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama
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
    accessorKey: "phoneNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No. Telepon
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDownAZ className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const phoneNumber = row.getValue("phoneNumber") as string;
      return <>{formatPhoneNumber(phoneNumber)}</>;
    },
  },
  {
    accessorKey: "job",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Pekerjaan
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDownAZ className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDownAZ className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold text-white",
            status === "pending"
              ? "bg-[#EAB308]"
              : status === "accepted"
                ? "bg-succeed"
                : status === "rejected"
                  ? "bg-destructive"
                  : status === "reapply"
                    ? "bg-blue-500"
                    : "bg-gray-500",
          )}
        >
          {status === "pending"
            ? "Tertunda"
            : status === "accepted"
              ? "Terverifikasi"
              : status === "rejected"
                ? "Tertolak"
                : status === "reapply"
                  ? "Pengajuan Ulang"
                  : "Kedaluarsa"}
        </span>
      );
    },
  },
  {
    accessorKey: "aksi",
    header: "Aksi",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      const name = row.getValue("name") as string;
      const phoneNumber = row.getValue("phoneNumber") as string;
      const status = row.getValue("status") as
        | "pending"
        | "accepted"
        | "rejected"
        | "reapply"
        | "outdated";

      return (
        <Combobox
          id={id}
          name={name}
          email={phoneNumber}
          status={status}
          type="ota"
        />
      );
    },
  },
  {
    accessorKey: "detail",
    header: "Detail",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      const status = row.getValue("status") as
        | "pending"
        | "accepted"
        | "rejected"
        | "reapply"
        | "outdated";

      return <DetailDialogOta id={id} status={status} />;
    },
  },
];
