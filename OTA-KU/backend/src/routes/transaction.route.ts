import { createRoute } from "@hono/zod-openapi";

import { AuthorizationErrorResponse } from "../types/response.js";
import {
  ForbiddenResponse,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../zod/response.js";
import {
  AcceptTransferStatusResponse,
  AcceptTransferStatusSchema,
  DetailTransactionParams,
  TransactionDetailQueryResponse,
  TransactionListAdminQueryResponse,
  TransactionListAdminQuerySchema,
  TransactionListOTAQueryResponse,
  TransactionListOTAQuerySchema,
  TransactionListVerificationAdminQueryResponse,
  TransactionListVerificationAdminQuerySchema,
  UploadReceiptResponse,
  UploadReceiptSchema,
  VerifyTransactionAccResponse,
  VerifyTransactionAcceptSchema,
  VerifyTransactionRejectResponse,
  VerifyTransactionRejectSchema,
} from "../zod/transaction.js";

export const listTransactionOTARoute = createRoute({
  operationId: "listTransactionOTA",
  tags: ["Transaction"],
  method: "get",
  path: "/orang-tua/transactions",
  description: "Daftar tagihan seluruh mahasiswa asuh saya",
  request: {
    query: TransactionListOTAQuerySchema,
  },
  responses: {
    200: {
      description:
        "Berhasil mendapatkan daftar tagihan seluruh mahasiswa asuh saya.",
      content: {
        "application/json": {
          schema: TransactionListOTAQueryResponse,
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
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const listTransactionAdminRoute = createRoute({
  operationId: "listTransactionAdmin",
  tags: ["Transaction"],
  method: "get",
  path: "/admin/transactions",
  description: "Daftar seluruh tagihan yang ada",
  request: {
    query: TransactionListAdminQuerySchema,
  },
  responses: {
    200: {
      description: "Berhasil mendapatkan daftar tagihan.",
      content: {
        "application/json": {
          schema: TransactionListAdminQueryResponse,
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
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const listTransactionVerificationAdminRoute = createRoute({
  operationId: "listTransactionVerificationAdmin",
  tags: ["Transaction"],
  method: "get",
  path: "/admin/transactions/verification",
  description: "Daftar seluruh tagihan yang belum diverifikasi",
  request: {
    query: TransactionListVerificationAdminQuerySchema,
  },
  responses: {
    200: {
      description:
        "Berhasil mendapatkan daftar tagihan yang belum diverifikasi.",
      content: {
        "application/json": {
          schema: TransactionListVerificationAdminQueryResponse,
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
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const detailTransactionRoute = createRoute({
  operationId: "detailTransaction",
  tags: ["Transaction"],
  method: "get",
  path: "/transaction-detail/{id}",
  description: "Detail tagihan mahasiswa asuh saya",
  request: {
    params: DetailTransactionParams,
  },
  responses: {
    200: {
      description: "Berhasil mendapatkan detail tagihan mahasiswa asuh.",
      content: {
        "application/json": {
          schema: TransactionDetailQueryResponse,
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
      description: "Mahasiswa tidak ditemukan",
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

export const uploadReceiptRoute = createRoute({
  operationId: "uploadReceipt",
  tags: ["Transaction"],
  method: "post",
  path: "/upload-receipt",
  description: "Upload bukti pembayaran dari OTA",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: UploadReceiptSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Berhasil melakukan upload bukti pembayaran dari OTA.",
      content: {
        "application/json": {
          schema: UploadReceiptResponse,
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
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const verifyTransactionAccRoute = createRoute({
  operationId: "verifyTransactionAcc",
  tags: ["Transaction"],
  method: "post",
  path: "/verify-acc",
  description: "Melakukan penerimaan verifikasi pembayaran oleh admin",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: VerifyTransactionAcceptSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Berhasil melakukan penerimaan verifikasi pembayaran",
      content: {
        "application/json": {
          schema: VerifyTransactionAccResponse,
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
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const verifyTransactionRejectRoute = createRoute({
  operationId: "verifyTransactionReject",
  tags: ["Transaction"],
  method: "post",
  path: "/verify-reject",
  description: "Melakukan penolakan verifikasi pembayaran oleh admin",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: VerifyTransactionRejectSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Berhasil melakukan penolakan verifikasi pembayaran",
      content: {
        "application/json": {
          schema: VerifyTransactionRejectResponse,
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
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const acceptTransferStatusRoute = createRoute({
  operationId: "acceptTransferStatus",
  tags: ["Transaction"],
  method: "post",
  path: "/accept-transfer-status",
  description: "Mengubah status transfer menjadi paid",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: AcceptTransferStatusSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Berhasil mengubah status transfer menjadi paid",
      content: {
        "application/json": {
          schema: AcceptTransferStatusResponse,
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
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});
