import { prisma } from "../db/prisma.js";
import {
  createMidtransVaCharge,
  verifyMidtransSignature,
} from "../lib/midtrans.js";
import {
  createVAPaymentRoute,
  midtransWebhookRoute,
} from "../routes/payment.route.js";
import { CreateVAPaymentSchema, MidtransWebhookSchema } from "../zod/payment.js";
import { createAuthRouter, createRouter } from "./router-factory.js";
import { env } from "../config/env.config.js";

export const paymentRouter = createRouter();
export const paymentProtectedRouter = createAuthRouter();

function extractTransactionIdFromOrderId(orderId: string): string | null {
  const match = orderId.match(/^TX-([0-9a-fA-F-]{36})-\d+$/);
  return match?.[1] ?? null;
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

    const isPaidStatus =
      payload.transaction_status === "settlement" ||
      (payload.transaction_status === "capture" &&
        payload.fraud_status === "accept");

    const isPendingStatus = payload.transaction_status === "pending";

    const nextStatus = isPaidStatus
      ? "paid"
      : isPendingStatus
        ? "pending"
        : "unpaid";

    await prisma.transaction.update({
      where: { id: foundTransaction.id },
      data: {
        transactionStatus: nextStatus,
        amountPaid: isPaidStatus ? foundTransaction.bill : 0,
        paidAt: isPaidStatus ? new Date() : null,
        transactionReceipt: JSON.stringify({
          provider: "midtrans",
          orderId: payload.order_id,
          statusCode: payload.status_code,
          transactionStatus: payload.transaction_status,
          grossAmount: payload.gross_amount,
          paymentType: payload.payment_type,
          vaNumbers: payload.va_numbers,
          billKey: payload.bill_key,
          billerCode: payload.biller_code,
          transactionTime: payload.transaction_time,
          settlementTime: payload.settlement_time,
        }),
      },
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
