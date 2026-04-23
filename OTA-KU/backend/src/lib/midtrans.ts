import { createHash } from "crypto";

type MidtransBank = "bni" | "bri" | "mandiri";

interface CreateVaChargeInput {
  serverKey: string;
  isProduction: boolean;
  orderId: string;
  grossAmount: number;
  bank: MidtransBank;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface MidtransVaChargeResult {
  orderId: string;
  transactionStatus: string;
  paymentType: string;
  grossAmount: string;
  transactionTime?: string;
  expiryTime?: string;
  vaNumber?: string;
  bank?: string;
  billerCode?: string;
  billKey?: string;
}

interface MidtransChargeResponse {
  order_id: string;
  transaction_status: string;
  payment_type: string;
  gross_amount: string;
  transaction_time?: string;
  expiry_time?: string;
  va_numbers?: Array<{ bank: string; va_number: string }>;
  permata_va_number?: string;
  biller_code?: string;
  bill_key?: string;
  status_code?: string;
  status_message?: string;
}

export function verifyMidtransSignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
  serverKey: string;
}): boolean {
  const raw = `${input.orderId}${input.statusCode}${input.grossAmount}${input.serverKey}`;
  const expected = createHash("sha512").update(raw).digest("hex");
  return expected === input.signatureKey;
}

export async function createMidtransVaCharge(
  input: CreateVaChargeInput,
): Promise<MidtransVaChargeResult> {
  const baseUrl = input.isProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";

  const body = {
    payment_type: "bank_transfer",
    transaction_details: {
      order_id: input.orderId,
      gross_amount: input.grossAmount,
    },
    customer_details: {
      first_name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
    },
    bank_transfer: {
      bank: input.bank,
    },
  };

  const auth = Buffer.from(`${input.serverKey}:`).toString("base64");
  const response = await fetch(`${baseUrl}/v2/charge`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = (await response.json()) as MidtransChargeResponse;
  if (!response.ok) {
    throw new Error(
      `Midtrans charge failed: ${result.status_code ?? ""} ${result.status_message ?? "Unknown error"}`,
    );
  }

  const vaNumber =
    result.va_numbers?.[0]?.va_number ?? result.permata_va_number ?? undefined;
  const bank = result.va_numbers?.[0]?.bank ?? input.bank;

  return {
    orderId: result.order_id,
    transactionStatus: result.transaction_status,
    paymentType: result.payment_type,
    grossAmount: result.gross_amount,
    transactionTime: result.transaction_time,
    expiryTime: result.expiry_time,
    vaNumber,
    bank,
    billerCode: result.biller_code,
    billKey: result.bill_key,
  };
}
