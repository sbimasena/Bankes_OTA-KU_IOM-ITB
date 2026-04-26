import { prisma } from "../db/prisma.js";
import {
  cancelMidtransTransaction,
  createMidtransVaCharge,
  getMidtransTransactionStatus,
  verifyMidtransSignature,
} from "../lib/midtrans.js";
import {
  cancelMidtransPaymentRoute,
  createVAPaymentRoute,
  midtransWebhookRoute,
  verifyMidtransPaymentRoute,
} from "../routes/payment.route.js";
import {
  CancelMidtransPaymentSchema,
  CreateVAPaymentSchema,
  MidtransWebhookSchema,
  VerifyMidtransPaymentSchema,
} from "../zod/payment.js";
import { createAuthRouter, createRouter } from "./router-factory.js";
import { env } from "../config/env.config.js";

export const paymentRouter = createRouter();
export const paymentProtectedRouter = createAuthRouter();

function extractTransactionIdFromOrderId(orderId: string): string | null {
  const match = orderId.match(/^TX-([0-9a-fA-F-]{36})-\d+$/);
  return match?.[1] ?? null;
}

function extractOrderIdFromTransactionReceipt(receipt: string | null): string | null {
  if (!receipt) return null;

  try {
    const parsed = JSON.parse(receipt) as { orderId?: string };
    return parsed.orderId ?? null;
  } catch {
    return null;
  }
}

function mapMidtransStatusToTransactionStatus(
  transactionStatus: string,
  fraudStatus?: string,
): "unpaid" | "pending" | "paid" {
  const isPaidStatus =
    transactionStatus === "settlement" ||
    (transactionStatus === "capture" && fraudStatus === "accept");

  if (isPaidStatus) return "paid";
  if (
    transactionStatus === "pending" ||
    transactionStatus === "capture" ||
    transactionStatus === "authorize"
  ) {
    return "pending";
  }

  return "unpaid";
}

async function applyMidtransStatusToTransaction(input: {
  foundTransaction: { id: string; bill: number };
  payload: {
    order_id: string;
    status_code?: string;
    transaction_status: string;
    fraud_status?: string;
    gross_amount?: string;
    payment_type?: string;
    va_numbers?: Array<{ bank: string; va_number: string }>;
    bill_key?: string;
    biller_code?: string;
    transaction_time?: string;
    settlement_time?: string;
  };
}) {
  const nextStatus = mapMidtransStatusToTransactionStatus(
    input.payload.transaction_status,
    input.payload.fraud_status,
  );
  const isPaidStatus = nextStatus === "paid";

  await prisma.transaction.update({
    where: { id: input.foundTransaction.id },
    data: {
      transactionStatus: nextStatus,
      amountPaid: isPaidStatus ? input.foundTransaction.bill : 0,
      paidAt: isPaidStatus ? new Date() : null,
      transactionReceipt: JSON.stringify({
        provider: "midtrans",
        orderId: input.payload.order_id,
        statusCode: input.payload.status_code ?? null,
        transactionStatus: input.payload.transaction_status,
        grossAmount: input.payload.gross_amount ?? null,
        paymentType: input.payload.payment_type ?? null,
        vaNumbers: input.payload.va_numbers ?? null,
        billKey: input.payload.bill_key ?? null,
        billerCode: input.payload.biller_code ?? null,
        transactionTime: input.payload.transaction_time ?? null,
        settlementTime: input.payload.settlement_time ?? null,
      }),
    },
  });

  return nextStatus;
}

paymentProtectedRouter.openapi(createVAPaymentRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());
  const zodParseResult = CreateVAPaymentSchema.parse(data);
  const { transactionId, bank } = zodParseResult;

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya OTA yang dapat membuat virtual account",
        },
      },
      403,
    );
  }

  if (env.PAYMENT_PROVIDER !== "midtrans" || !env.MIDTRANS_SERVER_KEY) {
    return c.json(
      {
        success: false,
        message: "Payment provider belum dikonfigurasi",
        error: {},
      },
      500,
    );
  }

  const foundTransaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      otaId: user.id,
    },
    include: {
      OtaProfile: {
        include: {
          User: true,
        },
      },
    },
  });

  if (!foundTransaction) {
    return c.json(
      {
        success: false,
        message: "Transaksi tidak ditemukan",
        error: {},
      },
      404,
    );
  }

  if (foundTransaction.transactionStatus === "paid") {
    return c.json(
      {
        success: false,
        message: "Transaksi sudah dibayar",
        error: {},
      },
      400,
    );
  }

  try {
    const orderId = `TX-${foundTransaction.id}-${Date.now()}`;
    const charge = await createMidtransVaCharge({
      serverKey: env.MIDTRANS_SERVER_KEY,
      isProduction: env.MIDTRANS_IS_PRODUCTION,
      orderId,
      grossAmount: foundTransaction.bill,
      bank,
      customer: {
        name: foundTransaction.OtaProfile?.name ?? "OTA",
        email: foundTransaction.OtaProfile?.User?.email ?? "",
        phone: foundTransaction.OtaProfile?.User?.phoneNumber ?? "",
      },
    });

    await prisma.transaction.update({
      where: { id: foundTransaction.id },
      data: {
        transactionStatus: "pending",
        transactionReceipt: JSON.stringify({
          provider: "midtrans",
          method: "bank_transfer_va",
          orderId: charge.orderId,
          bank: charge.bank,
          vaNumber: charge.vaNumber,
          billKey: charge.billKey,
          billerCode: charge.billerCode,
          transactionTime: charge.transactionTime,
          expiresAt: charge.expiryTime,
        }),
        rejectionNote: null,
      },
    });

    return c.json(
      {
        success: true,
        message: "Virtual account berhasil dibuat",
        body: {
          orderId: charge.orderId,
          transactionId: foundTransaction.id,
          bill: foundTransaction.bill,
          bank: charge.bank ?? bank,
          vaNumber: charge.vaNumber ?? null,
          billerCode: charge.billerCode ?? null,
          billKey: charge.billKey ?? null,
          expiresAt: charge.expiryTime ?? null,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});

paymentRouter.openapi(midtransWebhookRoute, async (c) => {
  if (env.PAYMENT_PROVIDER !== "midtrans" || !env.MIDTRANS_SERVER_KEY) {
    return c.json(
      {
        success: false,
        message: "Webhook payment provider belum dikonfigurasi",
        error: {},
      },
      500,
    );
  }

  try {
    const payload = MidtransWebhookSchema.parse(await c.req.json());
    const isValidSignature = verifyMidtransSignature({
      orderId: payload.order_id,
      statusCode: payload.status_code,
      grossAmount: payload.gross_amount,
      signatureKey: payload.signature_key,
      serverKey: env.MIDTRANS_SERVER_KEY,
    });

    if (!isValidSignature) {
      return c.json(
        {
          success: false,
          message: "Signature Midtrans tidak valid",
          error: {},
        },
        403,
      );
    }

    const transactionId = extractTransactionIdFromOrderId(payload.order_id);
    if (!transactionId) {
      return c.json(
        {
          success: true,
          message: "Order ID tidak dikenali, webhook diabaikan",
          body: undefined,
        },
        200,
      );
    }

    const foundTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!foundTransaction) {
      return c.json(
        {
          success: true,
          message: "Transaksi tidak ditemukan, webhook diabaikan",
          body: undefined,
        },
        200,
      );
    }

    const nextStatus = await applyMidtransStatusToTransaction({
      foundTransaction,
      payload,
    });

    return c.json(
      {
        success: true,
        message: "Webhook diproses",
        body: {
          transactionId: foundTransaction.id,
          status: nextStatus,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});

paymentProtectedRouter.openapi(verifyMidtransPaymentRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());
  const { transactionId } = VerifyMidtransPaymentSchema.parse(data);

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya OTA yang dapat melakukan verifikasi pembayaran",
        },
      },
      403,
    );
  }

  if (env.PAYMENT_PROVIDER !== "midtrans" || !env.MIDTRANS_SERVER_KEY) {
    return c.json(
      {
        success: false,
        message: "Payment provider belum dikonfigurasi",
        error: {},
      },
      500,
    );
  }

  try {
    const foundTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        otaId: user.id,
      },
      select: {
        id: true,
        bill: true,
        transactionReceipt: true,
      },
    });

    if (!foundTransaction) {
      return c.json(
        {
          success: false,
          message: "Transaksi tidak ditemukan",
          error: {},
        },
        404,
      );
    }

    const orderId = extractOrderIdFromTransactionReceipt(
      foundTransaction.transactionReceipt,
    );
    if (!orderId) {
      return c.json(
        {
          success: false,
          message: "Order ID Midtrans belum tersedia untuk transaksi ini",
          error: {},
        },
        400,
      );
    }

    const statusPayload = await getMidtransTransactionStatus({
      serverKey: env.MIDTRANS_SERVER_KEY,
      isProduction: env.MIDTRANS_IS_PRODUCTION,
      orderId,
    });

    const nextStatus = await applyMidtransStatusToTransaction({
      foundTransaction,
      payload: statusPayload,
    });

    return c.json(
      {
        success: true,
        message: "Status pembayaran berhasil disinkronkan",
        body: {
          transactionId: foundTransaction.id,
          orderId,
          status: nextStatus,
          paymentType: statusPayload.payment_type ?? null,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});

paymentProtectedRouter.openapi(cancelMidtransPaymentRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());
  const { transactionId } = CancelMidtransPaymentSchema.parse(data);

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya OTA yang dapat membatalkan pembayaran",
        },
      },
      403,
    );
  }

  if (env.PAYMENT_PROVIDER !== "midtrans" || !env.MIDTRANS_SERVER_KEY) {
    return c.json(
      {
        success: false,
        message: "Payment provider belum dikonfigurasi",
        error: {},
      },
      500,
    );
  }

  try {
    const foundTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        otaId: user.id,
      },
      select: {
        id: true,
        bill: true,
        transactionReceipt: true,
      },
    });

    if (!foundTransaction) {
      return c.json(
        {
          success: false,
          message: "Transaksi tidak ditemukan",
          error: {},
        },
        404,
      );
    }

    const orderId = extractOrderIdFromTransactionReceipt(
      foundTransaction.transactionReceipt,
    );
    if (!orderId) {
      return c.json(
        {
          success: false,
          message: "Order ID Midtrans belum tersedia untuk transaksi ini",
          error: {},
        },
        400,
      );
    }

    const cancelPayload = await cancelMidtransTransaction({
      serverKey: env.MIDTRANS_SERVER_KEY,
      isProduction: env.MIDTRANS_IS_PRODUCTION,
      orderId,
    });

    const nextStatus = await applyMidtransStatusToTransaction({
      foundTransaction,
      payload: cancelPayload,
    });

    return c.json(
      {
        success: true,
        message: "Pembayaran berhasil dibatalkan/disinkronkan",
        body: {
          transactionId: foundTransaction.id,
          orderId,
          status: nextStatus,
          paymentType: cancelPayload.payment_type ?? null,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});
