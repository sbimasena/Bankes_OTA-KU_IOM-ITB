import { createHash } from "crypto";
import * as midtransClient from "midtrans-client";

const midtrans =
  ((midtransClient as unknown as { default?: { CoreApi: unknown } }).default ??
    midtransClient) as unknown as {
    CoreApi: new (input: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    }) => {
      charge: (payload: unknown) => Promise<unknown>;
      transaction: {
        status: (orderId: string) => Promise<unknown>;
        cancel: (orderId: string) => Promise<unknown>;
      };
    };
  };

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

function toSearchableText(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function extractMidtransError(input: unknown): {
  statusCode: number;
  message: string;
  isNotFound: boolean;
} {
  const error = input as {
    message?: string;
    httpStatusCode?: number;
    statusCode?: number;
    status?: number;
    ApiResponse?: { status_message?: string; status_code?: string | number };
    rawHttpClientData?: { status?: number; statusText?: string; body?: unknown };
  };

  const statusCode = Number(
    error?.httpStatusCode ??
      error?.statusCode ??
      error?.status ??
      error?.ApiResponse?.status_code ??
      error?.rawHttpClientData?.status ??
      0,
  );

  const message =
    error?.ApiResponse?.status_message ??
    error?.rawHttpClientData?.statusText ??
    error?.message ??
    "Midtrans request failed";

  const errorText = [
    toSearchableText(error?.message),
    toSearchableText(error?.ApiResponse),
    toSearchableText(error?.rawHttpClientData),
  ]
    .filter(Boolean)
    .join(" ");

  const isNotFound =
    statusCode === 404 ||
    errorText.includes('"status_code":"404"') ||
    errorText.includes('"status_code":404') ||
    errorText.includes("HTTP status code: 404") ||
    errorText.includes("requested resource is not found") ||
    errorText.includes("Transaction doesn't exist");

  return { statusCode, message, isNotFound };
}

export function getMidtransErrorMessage(error: unknown): string {
  return extractMidtransError(error).message;
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
  const coreApi = new midtrans.CoreApi({
    isProduction: input.isProduction,
    serverKey: input.serverKey,
    clientKey: "",
  });

  const customerDetails: {
    first_name: string;
    email?: string;
    phone?: string;
  } = {
    first_name: input.customer.name || "OTA",
  };

  if (input.customer.email?.trim()) {
    customerDetails.email = input.customer.email.trim();
  }

  if (input.customer.phone?.trim()) {
    customerDetails.phone = input.customer.phone.trim();
  }

  let result: MidtransChargeResponse;
  try {
    result = (await coreApi.charge({
      payment_type: "bank_transfer",
      transaction_details: {
        order_id: input.orderId,
        gross_amount: input.grossAmount,
      },
      customer_details: customerDetails,
      bank_transfer: {
        bank: input.bank,
      },
    })) as MidtransChargeResponse;
  } catch (error) {
    const parsed = extractMidtransError(error);
    throw Object.assign(new Error(parsed.message), {
      name: "MidtransApiError",
      statusCode: parsed.statusCode,
      isNotFound: parsed.isNotFound,
      cause: error,
    });
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

export async function getMidtransTransactionStatus(input: {
  serverKey: string;
  isProduction: boolean;
  orderId: string;
}): Promise<MidtransStatusResponse> {
  const coreApi = new midtrans.CoreApi({
    isProduction: input.isProduction,
    serverKey: input.serverKey,
    clientKey: "",
  });

  try {
    return (await coreApi.transaction.status(input.orderId)) as MidtransStatusResponse;
  } catch (error) {
    const parsed = extractMidtransError(error);
    throw Object.assign(new Error(parsed.message), {
      name: "MidtransApiError",
      statusCode: parsed.statusCode,
      isNotFound: parsed.isNotFound,
      cause: error,
    });
  }
}

export async function cancelMidtransTransaction(input: {
  serverKey: string;
  isProduction: boolean;
  orderId: string;
}): Promise<MidtransStatusResponse> {
  const coreApi = new midtrans.CoreApi({
    isProduction: input.isProduction,
    serverKey: input.serverKey,
    clientKey: "",
  });

  try {
    return (await coreApi.transaction.cancel(input.orderId)) as MidtransStatusResponse;
  } catch (error) {
    const parsed = extractMidtransError(error);
    throw Object.assign(new Error(parsed.message), {
      name: "MidtransApiError",
      statusCode: parsed.statusCode,
      isNotFound: parsed.isNotFound,
      cause: error,
    });
  }
}
