import { TransactionOTA } from "@/api/generated";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFunding } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";
import TransactionForm from "./transaction-form";

interface TransactionCardProps {
  data: Array<TransactionOTA>;
  year: number;
  month: number;
}

function TransactionCard({ data, year, month }: TransactionCardProps) {
  const [paidFor, setPaidFor] = useState<number>(data[0].paid_for || 1);
  const unpaidData = data.filter((item) => item.status === "unpaid");
  const totalBillUnpaid = unpaidData.reduce((acc, item) => acc + item.bill, 0);
  const status = unpaidData.some((item) => item.status === "unpaid")
    ? "unpaid"
    : data.some((item) => item.status === "pending")
      ? "pending"
      : "paid";

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

  return (
    <Card
      className={cn(
        "mt-8 w-full max-w-[1000px] self-center",
        status === "pending" && "max-w-[600px]",
      )}
    >
      <CardHeader>
        {status !== "pending" && (
          <CardTitle className="text-dark text-xl font-bold">
            Pembayaran Mahasiswa Asuh - {unpaidData.length} Mahasiswa
          </CardTitle>
        )}
      </CardHeader>
      <CardContent
        className={cn(
          // Mobile: single column (flex-col), Desktop: grid with 2 columns
          "flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-12",
          status === "pending" && "md:grid-cols-1",
        )}
      >
        <div
          className={cn(
            status !== "pending" ? "flex flex-col gap-4" : "hidden",
          )}
        >
          {/* Bantuan Terkirim */}
          <div
            className={cn(status !== "pending" ? "flex flex-col" : "hidden")}
          >
            <p className="text-dark text-sm font-medium">Bantuan Terkirim</p>
            <div className="rounded-md p-3">
              <p className="text-dark text-lg font-semibold">
                {formatFunding(totalBillUnpaid * paidFor)}
              </p>
              <p className="text-sm text-gray-600">
                {unpaidData.length} mahasiswa × {paidFor} bulan
              </p>
            </div>
          </div>
          
          {/* Tenggat Waktu */}
          <div
            className={cn(status !== "pending" ? "flex flex-col" : "hidden")}
          >
            <p className="text-dark text-sm font-medium">Tenggat Waktu</p>
            <div className="rounded-md p-3">
              <p className="text-dark font-bold">
                {format(data[0].due_date, "dd MMMM yyyy", { locale: id })}
              </p>
              <p className="text-sm text-gray-600">
                Tenggat waktu dari semua mahasiswa
              </p>
            </div>
          </div>
          
          {/* Status */}
          <div
            className={cn(status !== "pending" ? "flex flex-col" : "hidden")}
          >
            <p className="text-dark text-sm font-medium">Status Pembayaran</p>
            <div className="flex items-center justify-between rounded-md p-2">
              {getStatusBadge(status)}
            </div>
          </div>
        </div>
        
        <TransactionForm
          data={data}
          setPaidFor={setPaidFor}
          year={year}
          month={month}
        />
      </CardContent>
    </Card>
  );
}

export default TransactionCard;