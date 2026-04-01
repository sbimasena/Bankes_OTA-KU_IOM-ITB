import { createRoute } from "@hono/zod-openapi";
import { AuthorizationErrorResponse } from "../types/response.js";
import {
  MahasiswaDetailParamsSchema,
  MahasiswaDetailResponse,
  MahasiswaSayaDetailResponse,
  MyOtaDetailResponse,
  OtaDetailParamsSchema,
  OtaDetailResponse,
} from "../zod/detail.js";
import { ForbiddenResponse, InternalServerErrorResponse, NotFoundResponse } from "../zod/response.js";

export const getMahasiswaDetailRoute = createRoute({
  operationId: "getMahasiswaDetail",
  tags: ["Detail"],
  method: "get",
  path: "/mahasiswa/{id}",
  description: "Get detailed information of a specific mahasiswa.",
  request: {
    params: MahasiswaDetailParamsSchema,
  },
  responses: {
    200: {
      description: "Berhasil mendapatkan detail mahasiswa.",
      content: {
        "application/json": {
          schema: MahasiswaDetailResponse,
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

export const getMahasiswaSayaDetailRoute = createRoute({
  operationId: "getMahasiswaSayaDetail",
  tags: ["Detail"],
  method: "get",
  path: "/mahasiswa-saya/{id}",
  description: "Get detailed information of my current mahasiswa.",
  request: {
    params: MahasiswaDetailParamsSchema,
  },
  responses: {
    200: {
      description: "Berhasil mendapatkan detail mahasiswa.",
      content: {
        "application/json": {
          schema: MahasiswaSayaDetailResponse,
        },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Anda tidak memiliki akses ke mahasiswa ini",
      content: {
        "application/json": { schema: ForbiddenResponse },
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

export const getMahasiswaDetailForOTARoute = createRoute({
  operationId: "getMahasiswaDetailForOTA",
  tags: ["Detail"],
  method: "get",
  path: "/mahasiswa-asuh/{id}",
  description: "Get detailed information of a specific mahasiswa asuh for orang tua asuh.",
  request: {
    params: MahasiswaDetailParamsSchema,
  },
  responses: {
    200: {
      description: "Berhasil mendapatkan detail mahasiswa asuh.",
      content: {
        "application/json": {
          schema: MahasiswaSayaDetailResponse,
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
      description: "Mahasiswa asuh tidak ditemukan",
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

export const getOtaDetailRoute = createRoute({
    operationId: "getOtaDetail",
    tags: ["Detail"],
    method: "get",
    path: "/orang-tua/{id}",
    description: "Get detailed information of a specific orang tua asuh.",
    request: {
      params: OtaDetailParamsSchema,
    },
    responses: {
      200: {
        description: "Berhasil mendapatkan detail orang tua asuh.",
        content: {
          "application/json": {
            schema: OtaDetailResponse,
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
        description: "Orang tua asuh tidak ditemukan",
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

export const getMyOtaDetailRoute = createRoute({
  operationId: "getMyOtaDetail",
  tags: ["Detail"],
  method: "get",
  path: "orang-tua-saya",
  description: "Get detailed information of my current orang tua asuh.",
  responses: {
    200: {
      description: "Berhasil mendapatkan detail orang tua asuh saya.",
      content: {
        "application/json": {
          schema: MyOtaDetailResponse,
        },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Anda tidak memiliki akses ke orang tua asuh ini",
      content: {
        "application/json": { schema: ForbiddenResponse },
      },
    },
    404: {
      description: "Orang tua asuh saya tidak ditemukan",
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
  }
})