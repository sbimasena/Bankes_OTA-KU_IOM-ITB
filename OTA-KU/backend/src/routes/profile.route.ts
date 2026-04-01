import { createRoute } from "@hono/zod-openapi";

import { AuthorizationErrorResponse } from "../types/response.js";
import {
  MahasiswaNotFoundResponse,
  MahasiswaRegistrationFailedResponse,
  MahasiswaRegistrationFormSchema,
  MahasiswaRegistrationParams,
  MahasiswaRegistrationSuccessfulResponse,
  OrangTuaRegistrationFailedResponse,
  OrangTuaRegistrationParams,
  OrangTuaRegistrationSchema,
  OrangTuaRegistrationSuccessfulResponse,
  ProfileMahasiswaResponse,
  ProfileOrangTuaResponse,
  MahasiswaProfileFormSchema,
  UnverifiedResponse,
  createBankesPengurusSchema,
  createBankesPengurusResponse,
  DeleteAccountParamsSchema,
  DeleteAccountSuccessfulResponseSchema
} from "../zod/profile.js";
import { ForbiddenResponse, InternalServerErrorResponse } from "../zod/response.js";

export const pendaftaranMahasiswaRoute = createRoute({
  operationId: "pendaftaranMahasiswa",
  tags: ["Profile"],
  method: "post",
  path: "/mahasiswa",
  description: "Pendaftaran mahasiswa asuh.",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: MahasiswaRegistrationFormSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Berhasil mendaftar.",
      content: {
        "application/json": { schema: MahasiswaRegistrationSuccessfulResponse },
      },
    },
    400: {
      description: "Gagal mendaftar.",
      content: {
        "application/json": { schema: MahasiswaRegistrationFailedResponse },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Akun belum terverifikasi.",
      content: {
        "application/json": { schema: UnverifiedResponse },
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

export const pendaftaranOrangTuaRoute = createRoute({
  operationId: "pendaftaranOrangTua",
  tags: ["Profile"],
  method: "post",
  path: "/orang-tua",
  description: "Pendaftaran orang tua.",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: OrangTuaRegistrationSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Berhasil mendaftar.",
      content: {
        "application/json": { schema: OrangTuaRegistrationSuccessfulResponse },
      },
    },
    400: {
      description: "Gagal mendaftar.",
      content: {
        "application/json": { schema: OrangTuaRegistrationFailedResponse },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Akun belum terverifikasi.",
      content: {
        "application/json": { schema: UnverifiedResponse },
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

export const pembuatanAkunBankesPengurusRoute = createRoute({
  operationId: "pembuatanAkunBankesPengurus",
  tags: ["Profile"],
  method: "post",
  path: "/bankes-pengurus",
  description: "Pembuatan akun bankes dan pengurus oleh admin",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: createBankesPengurusSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Berhasil mendaftar.",
      content: {
        "application/json": { schema: createBankesPengurusResponse }
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
  }
});

export const profileOrangTuaRoute = createRoute({
  operationId: "profileOrangTua",
  tags: ["Profile"],
  method: "get",
  path: "/orang-tua/{id}",
  description: "Profile orang tua.",
  request: {
    params: OrangTuaRegistrationParams,
  },
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": { schema: ProfileOrangTuaResponse },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Akun belum terverifikasi.",
      content: {
        "application/json": { schema: UnverifiedResponse },
      },
    },
    404: {
      description: "Data tidak ditemukan.",
      content: {
        "application/json": { schema: MahasiswaRegistrationFailedResponse },
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

export const editProfileOrangTuaRoute = createRoute({
  operationId: "editProfileOTA",
  tags: ["Profile"],
  method: "post",
  path: "/orang-tua/{id}",
  description: "Edit profile OTA",
  request: {
    params: OrangTuaRegistrationParams,
    body: {
      content: {
        "multipart/form-data": {
          schema: OrangTuaRegistrationSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Berhasil edit profile OTA.",
      content: {
        "application/json": { schema: OrangTuaRegistrationSuccessfulResponse },
      },
    },
    400: {
      description: "Gagal edit profile OTA.",
      content: {
        "application/json": { schema: OrangTuaRegistrationFailedResponse },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Akun belum terverifikasi.",
      content: {
        "application/json": { schema: UnverifiedResponse },
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

export const profileMahasiswaRoute = createRoute({
  operationId: "profileMahasiswa",
  tags: ["Profile"],
  method: "get",
  path: "/mahasiswa/{id}",
  description: "Profile mahasiswa.",
  request: {
    params: MahasiswaRegistrationParams,
  },
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": { schema: ProfileMahasiswaResponse },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Akun belum terverifikasi.",
      content: {
        "application/json": { schema: UnverifiedResponse },
      },
    },
    404: {
      description: "Data tidak ditemukan.",
      content: {
        "application/json": { schema: MahasiswaNotFoundResponse },
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

export const editProfileMahasiswaRoute = createRoute({
  operationId: "editProfileMA",
  tags: ["Profile"],
  method: "post",
  path: "/mahasiswa/{id}",
  description: "Edit profile MA",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: MahasiswaProfileFormSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Berhasil edit profile MA.",
      content: {
        "application/json": { schema: MahasiswaRegistrationSuccessfulResponse },
      },
    },
    400: {
      description: "Gagal edit profile MA.",
      content: {
        "application/json": { schema: MahasiswaRegistrationFailedResponse },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Akun belum terverifikasi.",
      content: {
        "application/json": { schema: UnverifiedResponse },
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

export const deleteAccountRoute = createRoute({
  operationId: "deleteAccount",
  tags: ["Profile"],
  method: "delete",
  path: "/delete/{id}",
  description: "Delete an account",
  request: {
    params: DeleteAccountParamsSchema
  },
  responses: {
    200: {
      description: "Successfully deleted an account",
      content: {
        "application/json": { schema: DeleteAccountSuccessfulResponseSchema },
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
