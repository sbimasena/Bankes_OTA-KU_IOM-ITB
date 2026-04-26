import { createRoute } from "@hono/zod-openapi";

import { AuthorizationErrorResponse } from "../types/response.js";
import {
  ForbiddenResponse,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../zod/response.js";
import {
  CancelMidtransPaymentResponse,
  CancelMidtransPaymentSchema,
  CreateVAPaymentResponse,
  CreateVAPaymentSchema,
  MidtransWebhookResponse,
  MidtransWebhookSchema,
  VerifyMidtransPaymentResponse,
  VerifyMidtransPaymentSchema,
} from "../zod/payment.js";

export const createVAPaymentRoute = createRoute({
  operationId: "createVAPayment",
  tags: ["Payment"],
  method: "post",
  path: "/va/create",
  description: "Membuat Virtual Account pembayaran tagihan OTA.",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: CreateVAPaymentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Virtual account berhasil dibuat",
      content: {
        "application/json": {
          schema: CreateVAPaymentResponse,
        },
      },
    },
    401: AuthorizationErrorResponse,
    400: {
      description: "Bad request",
      content: {
        "application/json": {
          schema: InternalServerErrorResponse,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: ForbiddenResponse,
        },
      },
    },
    404: {
      description: "Transaksi tidak ditemukan",
      content: {
        "application/json": { schema: NotFoundResponse },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const midtransWebhookRoute = createRoute({
  operationId: "midtransWebhook",
  tags: ["Payment"],
  method: "post",
  path: "/webhook/midtrans",
  description: "Webhook callback dari Midtrans untuk update status pembayaran.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: MidtransWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Webhook diproses",
      content: {
        "application/json": {
          schema: MidtransWebhookResponse,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: ForbiddenResponse,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const verifyMidtransPaymentRoute = createRoute({
  operationId: "verifyMidtransPayment",
  tags: ["Payment"],
  method: "post",
  path: "/verify",
  description: "Sinkronisasi status pembayaran transaksi OTA dari Midtrans.",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: VerifyMidtransPaymentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Status pembayaran berhasil disinkronkan",
      content: {
        "application/json": {
          schema: VerifyMidtransPaymentResponse,
        },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: ForbiddenResponse,
        },
      },
    },
    404: {
      description: "Transaksi tidak ditemukan",
      content: {
        "application/json": { schema: NotFoundResponse },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const cancelMidtransPaymentRoute = createRoute({
  operationId: "cancelMidtransPayment",
  tags: ["Payment"],
  method: "post",
  path: "/cancel",
  description: "Batalkan transaksi pembayaran Midtrans untuk transaksi OTA.",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: CancelMidtransPaymentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Pembayaran berhasil dibatalkan/disinkronkan",
      content: {
        "application/json": {
          schema: CancelMidtransPaymentResponse,
        },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: ForbiddenResponse,
        },
      },
    },
    404: {
      description: "Transaksi tidak ditemukan",
      content: {
        "application/json": { schema: NotFoundResponse },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});
