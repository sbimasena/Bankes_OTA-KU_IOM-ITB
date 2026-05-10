import { queryClient } from "@/api/client";
import { TransactionOTA } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

type MidtransChargeResponse = {
  success: boolean;
  message: string;
  body?: {
    orderId: string;
    transactionId: string;
    bill: number;
    bank: string;
    vaNumber: string | null;
    billerCode: string | null;
    billKey: string | null;
    expiresAt: string | null;
  };
};

type MidtransReceipt = {
  provider?: string;
  orderId?: string;
  bank?: string;
  vaNumber?: string;
  billerCode?: string;
  billKey?: string;
  expiresAt?: string;
};

interface TransactionFormProps {
  data: Array<TransactionOTA>;
  year: number;
  month: number;
}

const bankOptions = [
  { value: "bni", label: "BNI Virtual Account" },
  { value: "bri", label: "BRI Virtual Account" },
  { value: "mandiri", label: "Mandiri Bill Payment" },
] as const;

function parseMidtransReceipt(receipt: string): MidtransReceipt | null {
  if (!receipt) return null;
  try {
    const parsed = JSON.parse(receipt) as MidtransReceipt;
    if (parsed.provider !== "midtrans") return null;
    return parsed;
  } catch {
    return null;
  }
}

function TransactionForm({ data, year, month }: TransactionFormProps) {
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>(
    data.find((item) => item.status === "unpaid")?.id ?? data[0]?.id ?? "",
  );
  const [selectedBank, setSelectedBank] = useState<"bni" | "bri" | "mandiri">(
    "bni",
  );
  const [latestCharge, setLatestCharge] = useState<
    MidtransChargeResponse["body"] | null
  >(null);

  const selectedTransaction = useMemo(
    () => data.find((item) => item.id === selectedTransactionId) ?? null,
    [data, selectedTransactionId],
  );

  const existingMidtransReceipt = useMemo(
    () => parseMidtransReceipt(selectedTransaction?.receipt ?? ""),
    [selectedTransaction?.receipt],
  );

  const uploadReceiptCallbackMutation = useMutation({
    mutationFn: async (payload: {
      transactionId: string;
      bank: "bni" | "bri" | "mandiri";
    }) => {
      const formData = new FormData();
      formData.append("transactionId", payload.transactionId);
      formData.append("bank", payload.bank);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/va/create`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const body = (await response.json()) as MidtransChargeResponse;
      if (!response.ok || !body.success || !body.body) {
        throw new Error(body.message || "Gagal membuat virtual account");
      }

      return body;
    },
    onSuccess: (_data, _variables, context) => {
      toast.dismiss(context);
      setLatestCharge(_data.body ?? null);
      toast.success("Virtual account berhasil dibuat", {
        description: "Selesaikan pembayaran dari aplikasi bank/e-channel",
      });
      queryClient.invalidateQueries({
        queryKey: ["listAllTransaction", year, month],
      });
    },
    onError: (error, _variables, context) => {
      toast.dismiss(context);
      toast.warning("Gagal mengirim pembayaran", {
        description: error.message,
      });
    },
    onMutate: () => {
      const loading = toast.loading("Membuat virtual account Midtrans...", {
        description: "Mohon tunggu sebentar",
        duration: Infinity,
      });
      return loading;
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const formData = new FormData();
      formData.append("transactionId", transactionId);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/verify`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const body = (await response.json()) as {
        success: boolean;
        message: string;
        body?: { status: "unpaid" | "pending" | "paid" };
      };

      if (!response.ok || !body.success) {
        throw new Error(body.message || "Gagal verifikasi status pembayaran");
      }

      return body;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["listAllTransaction", year, month] });
      toast.success("Status pembayaran diperbarui", {
        description: `Status terbaru: ${data.body?.status ?? "unknown"}`,
      });
    },
    onError: (error: Error) => {
      toast.warning("Gagal verifikasi status", { description: error.message });
    },
  });

  const cancelPaymentMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const formData = new FormData();
      formData.append("transactionId", transactionId);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/cancel`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const body = (await response.json()) as {
        success: boolean;
        message: string;
        body?: { status: "unpaid" | "pending" | "paid" };
      };

      if (!response.ok || !body.success) {
        throw new Error(body.message || "Gagal membatalkan pembayaran");
      }

      return body;
    },
    onSuccess: () => {
      setLatestCharge(null);
      queryClient.invalidateQueries({ queryKey: ["listAllTransaction", year, month] });
      toast.success("Pembayaran berhasil dibatalkan");
    },
    onError: (error: Error) => {
      toast.warning("Gagal membatalkan pembayaran", { description: error.message });
    },
  });

  const isPaid = selectedTransaction?.status === "paid";
  const isPending = selectedTransaction?.status === "pending";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label className="text-dark">Pilih Tagihan</Label>
        <select
          value={selectedTransactionId}
          onChange={(e) => {
            setSelectedTransactionId(e.target.value);
            setLatestCharge(null);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {data.map((transaction) => (
            <option key={transaction.id} value={transaction.id}>
              {transaction.name} | {transaction.nim} | Rp {transaction.bill.toLocaleString("id-ID")} | {transaction.status}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-dark">Bank Virtual Account</Label>
        <select
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value as "bni" | "bri" | "mandiri")}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {bankOptions.map((bank) => (
            <option key={bank.value} value={bank.value}>
              {bank.label}
            </option>
          ))}
        </select>
      </div>

      {selectedTransaction && (
        <div className="rounded-md border p-4 text-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="font-medium">Ringkasan Tagihan</p>
            <Badge
              className={
                selectedTransaction.status === "paid"
                  ? "bg-green-100 text-green-800"
                  : selectedTransaction.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }
            >
              {selectedTransaction.status}
            </Badge>
          </div>
          <p>Mahasiswa: {selectedTransaction.name}</p>
          <p>NIM: {selectedTransaction.nim}</p>
          <p>Tagihan: Rp {selectedTransaction.bill.toLocaleString("id-ID")}</p>
          <p>
            Jatuh tempo: {format(new Date(selectedTransaction.due_date), "dd MMMM yyyy", { locale: id })}
          </p>
        </div>
      )}

      {(latestCharge || existingMidtransReceipt) && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="mb-2 font-semibold">Detail Pembayaran Midtrans</p>
          <p>Order ID: {latestCharge?.orderId ?? existingMidtransReceipt?.orderId ?? "-"}</p>
          <p>Bank: {(latestCharge?.bank ?? existingMidtransReceipt?.bank ?? selectedBank).toUpperCase()}</p>
          <p>VA Number: {latestCharge?.vaNumber ?? existingMidtransReceipt?.vaNumber ?? "-"}</p>
          {latestCharge?.billerCode || existingMidtransReceipt?.billerCode ? (
            <p>Biller Code: {latestCharge?.billerCode ?? existingMidtransReceipt?.billerCode}</p>
          ) : null}
          {latestCharge?.billKey || existingMidtransReceipt?.billKey ? (
            <p>Bill Key: {latestCharge?.billKey ?? existingMidtransReceipt?.billKey}</p>
          ) : null}
          {(latestCharge?.expiresAt || existingMidtransReceipt?.expiresAt) && (
            <p>Kedaluwarsa: {latestCharge?.expiresAt ?? existingMidtransReceipt?.expiresAt}</p>
          )}
        </div>
      )}

      <div className="flex gap-2 self-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (!selectedTransaction) return;
            verifyPaymentMutation.mutate(selectedTransaction.id);
          }}
          disabled={!selectedTransaction || verifyPaymentMutation.isPending}
        >
          Verifikasi Status
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (!selectedTransaction) return;
            cancelPaymentMutation.mutate(selectedTransaction.id);
          }}
          disabled={!selectedTransaction || isPaid || cancelPaymentMutation.isPending}
        >
          Batalkan
        </Button>
        <Button
          type="button"
          disabled={
            !selectedTransaction ||
            isPaid ||
            isPending ||
            uploadReceiptCallbackMutation.isPending ||
            cancelPaymentMutation.isPending ||
            verifyPaymentMutation.isPending
          }
          onClick={() => {
            if (!selectedTransaction) return;
            uploadReceiptCallbackMutation.mutate({
              transactionId: selectedTransaction.id,
              bank: selectedBank,
            });
          }}
        >
          Buat Virtual Account
        </Button>
      </div>

      {isPending && (
        <p className="text-xs text-yellow-700">
          Tagihan ini sudah memiliki instruksi pembayaran Midtrans. Lakukan pembayaran lalu klik Verifikasi Status.
        </p>
      )}
      {isPaid && (
        <p className="text-xs text-green-700">Tagihan ini sudah lunas.</p>
      )}
    </div>
  );
}

export default TransactionForm;
