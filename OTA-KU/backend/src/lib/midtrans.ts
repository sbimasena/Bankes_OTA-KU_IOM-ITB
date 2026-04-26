import { createHash } from "crypto";
import * as midtransClient from "midtrans-client";

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

interface MidtransStatusResponse {
  order_id: string;
  status_code: string;
  transaction_status: string;
  fraud_status?: string;
  gross_amount: string;
  payment_type?: string;
  transaction_time?: string;
  settlement_time?: string;
  va_numbers?: Array<{ bank: string; va_number: string }>;
  biller_code?: string;
  bill_key?: string;
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
  const coreApi = new midtransClient.CoreApi({
    isProduction: input.isProduction,
    serverKey: input.serverKey,
    clientKey: "",
  });

  const result = (await coreApi.charge({
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
  })) as MidtransChargeResponse;

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

export async function getMidtransTransactionStatus(input: {
  serverKey: string;
  isProduction: boolean;
  orderId: string;
}): Promise<MidtransStatusResponse> {
  const coreApi = new midtransClient.CoreApi({
    isProduction: input.isProduction,
    serverKey: input.serverKey,
    clientKey: "",
  });

  return (await coreApi.transaction.status(input.orderId)) as MidtransStatusResponse;
}

export async function cancelMidtransTransaction(input: {
  serverKey: string;
  isProduction: boolean;
  orderId: string;
}): Promise<MidtransStatusResponse> {
  const coreApi = new midtransClient.CoreApi({
    isProduction: input.isProduction,
    serverKey: input.serverKey,
    clientKey: "",
  });

  return (await coreApi.transaction.cancel(input.orderId)) as MidtransStatusResponse;
}
