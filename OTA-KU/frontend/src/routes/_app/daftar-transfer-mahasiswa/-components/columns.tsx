import { TransactionListAdminData } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { formatFunding } from "@/lib/formatter";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

import ComboboxDialog from "./combobox-dialog";

export type StatusType = "pending" | "unpaid" | "paid";
export type TransferStatusType = "unpaid" | "paid";

export const tagihanColumns: ColumnDef<TransactionListAdminData>[] = [
  {
    accessorKey: "mahasiswa_id",
    header: "ID Mahasiswa",
  },
  {
    accessorKey: "ota_id",
    header: "ID OTA",
  },
  {
    accessorKey: "name_ma",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama (MA)
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
    accessorKey: "nim_ma",
    header: "NIM (MA)",
  },
  {
    accessorKey: "name_ota",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama (OTA)
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
    accessorKey: "number_ota",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No. Telp (OTA)
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDownAZ className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const numberOta = row.getValue("number_ota") as string;
      return <p>+{numberOta}</p>;
    },
  },
  {
    accessorKey: "bill",
    header: "Tagihan (Rp)",
    cell: ({ row }) => {
      const bill = row.getValue("bill") as number;
      return <p>{formatFunding(bill)}</p>;
    },
  },
  {
    accessorKey: "due_date",
    header: "Jatuh Tempo",
    cell: ({ row }) => {
      const dueDate = row.getValue("due_date") as string;
      return <p>{format(new Date(dueDate), "dd MMMM yyyy", { locale: id })}</p>;
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
      const status = row.getValue("status") as StatusType;
      let statusText = "";
      let statusClass = "";
      switch (status) {
        case "paid":
          statusText = "Telah Dibayar";
          statusClass =
            "bg-green-50 text-green-600 border border-green-300 rounded-full px-3 py-1 text-xs font-semibold";
          break;
        case "pending":
          statusText = "Menunggu Verifikasi";
          statusClass =
            "bg-yellow-50 text-yellow-600 border border-yellow-300 rounded-full px-3 py-1 text-xs font-semibold";
          break;
        case "unpaid":
          statusText = "Belum Dibayar";
          statusClass =
            "bg-red-50 text-red-600 border border-red-300 rounded-full px-3 py-1 text-xs font-semibold";
          break;
      }
      return <span className={statusClass}>{statusText}</span>;
    },
  },
  {
    accessorKey: "transferStatus",
    header: "Status Transfer",
    cell: ({ row }) => {
      return <ComboboxDialog row={row} />;
    },
  },
];
