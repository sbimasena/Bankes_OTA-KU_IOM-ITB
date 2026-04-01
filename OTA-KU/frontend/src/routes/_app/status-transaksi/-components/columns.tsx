import { TransactionOTA } from "@/api/generated";
import { Badge } from "@/components/ui/badge";
import { formatFunding } from "@/lib/formatter";
import { censorNim } from "@/lib/nim";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-100 text-green-800">Lunas</Badge>;
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          Menunggu Verifikasi
        </Badge>
      );
    case "unpaid":
      return <Badge className="bg-red-100 text-red-800">Belum Bayar</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const transactionColumns: ColumnDef<TransactionOTA>[] = [
  {
    accessorKey: "id",
    header: () => <span className="text-dark font-bold">ID</span>,
  },
  {
    accessorKey: "name",
    header: () => <span className="text-dark font-bold">Nama Mahasiswa</span>,
    cell: ({ row }) => {
      const transaction = row.original;
      const isTotal = transaction.id === "total";

      return <p className={cn(isTotal && "font-bold")}>{transaction.name}</p>;
    },
  },
  {
    accessorKey: "nim",
    header: () => <span className="text-dark font-bold">NIM Mahasiswa</span>,
    cell: ({ row }) => {
      const transaction = row.original;
      const isTotal = transaction.id === "total";

      return (
        <p className={cn(isTotal && "font-bold")}>
          {isTotal ? "" : censorNim(transaction.nim)}
        </p>
      );
    },
  },
  {
    accessorKey: "transactionStatus",
    header: () => <span className="text-dark font-bold">Status</span>,
    cell: ({ row }) => {
      const transaction = row.original;
      const isTotal = transaction.id === "total";

      return (
        <p className={cn(isTotal && "hidden")}>
          {getStatusBadge(transaction.status)}
        </p>
      );
    },
  },
  {
    accessorKey: "bill",
    header: () => <span className="text-dark font-bold">Tagihan</span>,
    cell: ({ row }) => {
      const transaction = row.original;
      const isTotal = transaction.id === "total";

      return (
        <p className={cn(isTotal && "font-bold")}>
          {formatFunding(transaction.bill)}
        </p>
      );
    },
  },
];
