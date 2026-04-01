import { createRoute } from "@hono/zod-openapi";

import { AuthorizationErrorResponse } from "../types/response.js";
import { InternalServerErrorResponse } from "../zod/response.js";
import {
  ApplicationStatusParams,
  ApplicationStatusSchema,
  ApplicationStatusSuccessResponse,
  GetApplicationStatusForbiddenResponse,
  GetApplicationStatusSuccessResponse,
  GetReapplicationStatusSuccessResponse,
  GetVerificationStatusSuccessResponse,
} from "../zod/status.js";

export const applicationStatusRoute = createRoute({
  operationId: "applicationStatus",
  tags: ["Status"],
  method: "put",
  path: "/status/application/{id}",
  description: "Mengubah status pendaftaran.",
  request: {
    params: ApplicationStatusParams,
    body: {
      content: {
        "multipart/form-data": {
          schema: ApplicationStatusSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Berhasil mengubah status pendaftaran",
      content: {
        "application/json": {
          schema: ApplicationStatusSuccessResponse,
        },
      },
    },
    401: AuthorizationErrorResponse,
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const getApplicationStatusRoute = createRoute({
  operationId: "getApplicationStatus",
  tags: ["Status"],
  method: "get",
  path: "/status/application/{id}",
  description: "Mengambil status pendaftaran.",
  request: {
    params: ApplicationStatusParams,
  },
  responses: {
    200: {
      description: "Berhasil mengambil status pendaftaran",
      content: {
        "application/json": {
          schema: GetApplicationStatusSuccessResponse,
        },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: {
        "application/json": { schema: GetApplicationStatusForbiddenResponse },
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

export const getVerificationStatusRoute = createRoute({
  operationId: "getVerificationStatus",
  tags: ["Status"],
  method: "get",
  path: "/status/verification/{id}",
  description: "Mengambil status verifikasi.",
  request: {
    params: ApplicationStatusParams,
  },
  responses: {
    200: {
      description: "Berhasil mengambil status verifikasi",
      content: {
        "application/json": {
          schema: GetVerificationStatusSuccessResponse,
        },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: {
        "application/json": { schema: GetApplicationStatusForbiddenResponse },
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

export const getReapplicationStatusRoute = createRoute({
  operationId: "getReapplicationStatus",
  tags: ["Status"],
  method: "get",
  path: "/status/reapplication/{id}",
  description: "Mengambil status pendaftaran ulang.",
  request: {
    params: ApplicationStatusParams,
  },
  responses: {
    200: {
      description: "Berhasil mengambil status pendaftaran ulang",
      content: {
        "application/json": {
          schema: GetReapplicationStatusSuccessResponse,
        },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: {
        "application/json": { schema: GetApplicationStatusForbiddenResponse },
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
