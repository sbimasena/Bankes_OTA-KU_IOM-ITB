import { createRoute } from "@hono/zod-openapi";

import { AuthorizationErrorResponse } from "../types/response.js";
import {
  DeleteConnectionSuccessfulResponseSchema,
  MahasiwaConnectSchema,
  OrangTuaFailedResponse,
  OrangTuaSuccessResponse,
  OrangTuaUnverifiedResponse,
  checkConnectParamsSchema,
  connectionListAllQueryResponse,
  connectionListAllQuerySchema,
  connectionListQueryResponse,
  connectionListQuerySchema,
  connectionListTerminateQueryResponse,
  isConnectedResponse,
  verifyConnectionResponse,
} from "../zod/connect.js";
import {
  ForbiddenResponse,
  InternalServerErrorResponse,
} from "../zod/response.js";

export const connectOtaMahasiswaRoute = createRoute({
  operationId: "connectOtaMahasiswa",
  tags: ["Connect"],
  method: "post",
  path: "/by-ota",
  description:
    "Menghubungkan orang tua asuh dengan mahasiswa asuh via pilihan mandiri OTA",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: MahasiwaConnectSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "Berhasil menghubungkan orang tua asuh dengan mahasiswa asuh via pilihan mandiri OTA",
      content: {
        "application/json": {
          schema: OrangTuaSuccessResponse,
        },
      },
    },
    400: {
      description:
        "Gagal menghubungkan orang tua asuh dengan mahasiswa asuh via pilihan mandiri OTA",
      content: {
        "application/json": {
          schema: OrangTuaFailedResponse,
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

export const connectOtaMahasiswaByAdminRoute = createRoute({
  operationId: "connectOtaMahasiswaByAdmin",
  tags: ["Connect"],
  method: "post",
  path: "/by-admin",
  description: "Menghubungkan orang tua asuh dengan mahasiswa asuh via Admin",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: MahasiwaConnectSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "Berhasil menghubungkan orang tua asuh dengan mahasiswa asuh via Admin",
      content: {
        "application/json": {
          schema: OrangTuaSuccessResponse,
        },
      },
    },
    400: {
      description:
        "Gagal menghubungkan orang tua asuh dengan mahasiswa asuh via Admin",
      content: {
        "application/json": {
          schema: OrangTuaFailedResponse,
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

export const verifyConnectionAccRoute = createRoute({
  operationId: "verifyConnectionAccept",
  tags: ["Connect"],
  method: "post",
  path: "/verify-connect-acc",
  description: "Melakukan penerimaan verifikasi connection oleh admin",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: MahasiwaConnectSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "Berhasil melakukan penerimaan verifikasi connection oleh admin",
      content: {
        "application/json": {
          schema: verifyConnectionResponse,
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

export const verifyConnectionRejectRoute = createRoute({
  operationId: "verifyConnectionReject",
  tags: ["Connect"],
  method: "post",
  path: "/verify-connect-reject",
  description: "Melakukan penolakan verifikasi connection oleh admin",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: MahasiwaConnectSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "Berhasil melakukan penolakan verifikasi connection oleh admin",
      content: {
        "application/json": {
          schema: verifyConnectionResponse,
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

export const listPendingConnectionRoute = createRoute({
  operationId: "listPendingConnection",
  tags: ["Connect"],
  method: "get",
  path: "/list/pending",
  description: "List seluruh connection yang pending beserta detailnya",
  request: {
    query: connectionListQuerySchema,
  },
  responses: {
    200: {
      description: "Daftar connection pending berhasil diambil",
      content: {
        "application/json": {
          schema: connectionListQueryResponse,
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

export const listPendingTerminationConnectionRoute = createRoute({
  operationId: "listPendingTerminationConnection",
  tags: ["Connect"],
  method: "get",
  path: "/list/pending-terminate",
  description:
    "List seluruh connection yang pending terminasi beserta detailnya",
  request: {
    query: connectionListQuerySchema,
  },
  responses: {
    200: {
      description: "Daftar connection pending berhasil diambil",
      content: {
        "application/json": {
          schema: connectionListTerminateQueryResponse,
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

export const listAllConnectionRoute = createRoute({
  operationId: "listAllConnection",
  tags: ["Connect"],
  method: "get",
  path: "/list/all",
  description: "List seluruh connection yang ada beserta detailnya",
  request: {
    query: connectionListAllQuerySchema,
  },
  responses: {
    200: {
      description: "Daftar semua connection berhasil diambil",
      content: {
        "application/json": {
          schema: connectionListAllQueryResponse,
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

export const isConnectedRoute = createRoute({
  operationId: "isConnected",
  tags: ["Connect"],
  method: "get",
  path: "/is-connected/{id}",
  description:
    "Memeriksa apakah OTA dan MA tertentu sudah memiliki hubungan asuh",
  request: {
    params: checkConnectParamsSchema,
  },
  responses: {
    200: {
      description: "Ditemukan hubungan asuh antara MA dan OTA",
      content: {
        "application/json": {
          schema: isConnectedResponse,
        },
      },
    },
    400: {
      description: "Gagal menemukan hubungan asuh antara MA dan OTA",
      content: {
        "application/json": {
          schema: isConnectedResponse,
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

export const deleteConnectionRoute = createRoute({
  operationId: "deleteConnection",
  tags: ["Connect"],
  method: "delete",
  path: "/delete",
  description: "Delete an account",
  request: {
    query: MahasiwaConnectSchema,
  },
  responses: {
    200: {
      description: "Successfully deleted a connection",
      content: {
        "application/json": {
          schema: DeleteConnectionSuccessfulResponseSchema,
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
