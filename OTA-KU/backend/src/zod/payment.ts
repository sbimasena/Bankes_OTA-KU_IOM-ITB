import { z } from "@hono/zod-openapi";

export const CreateVAPaymentSchema = z.object({
  transactionId: z
    .string({
      required_error: "ID transaksi harus diisi",
      invalid_type_error: "ID transaksi harus berupa string",
    })
    .uuid({ message: "ID transaksi tidak valid" })
    .openapi({
      description: "ID transaksi yang akan dibayarkan",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  bank: z
    .enum(["bni", "bri", "mandiri"])
    .default("bni")
    .openapi({ description: "Bank virtual account", example: "bni" }),
});

export const CreateVAPaymentResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Virtual account berhasil dibuat" }),
  body: z.object({
    orderId: z.string().openapi({ example: "TX-123e4567-e89b-12d3-a456-426614174000-1713760110000" }),
    transactionId: z.string().uuid().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    bill: z.number().int().openapi({ example: 500000 }),
    bank: z.string().openapi({ example: "bni" }),
    vaNumber: z.string().nullable().openapi({ example: "9888123412341234" }),
    billerCode: z.string().nullable().openapi({ example: "70012" }),
    billKey: z.string().nullable().openapi({ example: "123456789012" }),
    expiresAt: z.string().nullable().openapi({ example: "2026-04-23 10:00:00" }),
  }),
});

export const MidtransWebhookSchema = z.object({
  order_id: z.string(),
  status_code: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
  transaction_status: z.string(),
  fraud_status: z.string().optional(),
  payment_type: z.string().optional(),
  va_numbers: z
    .array(
      z.object({
        bank: z.string(),
        va_number: z.string(),
      }),
    )
    .optional(),
  bill_key: z.string().optional(),
  biller_code: z.string().optional(),
  transaction_time: z.string().optional(),
  settlement_time: z.string().optional(),
});

export const MidtransWebhookResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Webhook diproses" }),
  body: z
    .object({
      transactionId: z.string().uuid(),
      status: z.enum(["unpaid", "pending", "paid"]),
    })
    .optional(),
});

export const VerifyMidtransPaymentSchema = z.object({
  transactionId: z
    .string({
      required_error: "ID transaksi harus diisi",
      invalid_type_error: "ID transaksi harus berupa string",
    })
    .uuid({ message: "ID transaksi tidak valid" })
    .openapi({
      description: "ID transaksi OTA yang ingin disinkronkan status Midtrans-nya",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
});

export const VerifyMidtransPaymentResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Status pembayaran berhasil disinkronkan" }),
  body: z.object({
    transactionId: z.string().uuid(),
    orderId: z.string(),
    status: z.enum(["unpaid", "pending", "paid"]),
    paymentType: z.string().nullable(),
  }),
});

export const CancelMidtransPaymentSchema = VerifyMidtransPaymentSchema;

export const CancelMidtransPaymentResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Pembayaran berhasil dibatalkan" }),
  body: z.object({
    transactionId: z.string().uuid(),
    orderId: z.string(),
    status: z.enum(["unpaid", "pending", "paid"]),
    paymentType: z.string().nullable(),
  }),
});
