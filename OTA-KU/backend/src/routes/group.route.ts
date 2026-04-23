import { createRoute } from "@hono/zod-openapi";

import { AuthorizationErrorResponse } from "../types/response.js";
import {
  CreateGroupResponse,
  CreateGroupSchema,
  GroupDetailResponse,
  GroupIdParamSchema,
  GroupListQuerySchema,
  GroupListResponse,
  GroupMemberParamSchema,
  GroupSuccessResponse,
  InvitationIdParamSchema,
  InviteMemberSchema,
  RespondInvitationSchema,
} from "../zod/group.js";
import {
  ForbiddenResponse,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../zod/response.js";

export const createGroupRoute = createRoute({
  operationId: "createGroup",
  tags: ["Group"],
  method: "post",
  path: "/create",
  description: "Membuat grup OTA baru. OTA otomatis menjadi anggota pertama.",
  request: {
    body: {
      content: {
        "multipart/form-data": { schema: CreateGroupSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Grup berhasil dibuat",
      content: { "application/json": { schema: CreateGroupResponse } },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: InternalServerErrorResponse } },
    },
  },
});

export const listGroupsRoute = createRoute({
  operationId: "listGroups",
  tags: ["Group"],
  method: "get",
  path: "/list",
  description: "Daftar semua grup OTA beserta jumlah anggota dan koneksi aktif.",
  request: { query: GroupListQuerySchema },
  responses: {
    200: {
      description: "Daftar grup berhasil diambil",
      content: { "application/json": { schema: GroupListResponse } },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: InternalServerErrorResponse } },
    },
  },
});

export const getGroupDetailRoute = createRoute({
  operationId: "getGroupDetail",
  tags: ["Group"],
  method: "get",
  path: "/:id",
  description:
    "Detail grup OTA. OTA harus menjadi anggota grup untuk mengakses.",
  request: { params: GroupIdParamSchema },
  responses: {
    200: {
      description: "Detail grup berhasil diambil",
      content: { "application/json": { schema: GroupDetailResponse } },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    404: {
      description: "Grup tidak ditemukan",
      content: { "application/json": { schema: NotFoundResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: InternalServerErrorResponse } },
    },
  },
});

export const inviteMemberRoute = createRoute({
  operationId: "inviteGroupMember",
  tags: ["Group"],
  method: "post",
  path: "/:id/invite",
  description:
    "Mengundang OTA untuk bergabung ke grup. Bisa dilakukan anggota atau admin.",
  request: {
    params: GroupIdParamSchema,
    body: {
      content: {
        "multipart/form-data": { schema: InviteMemberSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Undangan berhasil dikirim",
      content: { "application/json": { schema: GroupSuccessResponse } },
    },
    400: {
      description: "OTA sudah menjadi anggota atau undangan masih pending",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    404: {
      description: "Grup atau OTA tidak ditemukan",
      content: { "application/json": { schema: NotFoundResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: InternalServerErrorResponse } },
    },
  },
});

export const respondInvitationRoute = createRoute({
  operationId: "respondGroupInvitation",
  tags: ["Group"],
  method: "post",
  path: "/invitation/:id/respond",
  description: "Menerima atau menolak undangan bergabung ke grup OTA.",
  request: {
    params: InvitationIdParamSchema,
    body: {
      content: {
        "multipart/form-data": { schema: RespondInvitationSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Respons undangan berhasil diproses",
      content: { "application/json": { schema: GroupSuccessResponse } },
    },
    400: {
      description: "Undangan tidak lagi dalam status pending",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden — bukan penerima undangan ini",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    404: {
      description: "Undangan tidak ditemukan",
      content: { "application/json": { schema: NotFoundResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: InternalServerErrorResponse } },
    },
  },
});

export const removeMemberRoute = createRoute({
  operationId: "removeGroupMember",
  tags: ["Group"],
  method: "delete",
  path: "/:id/member/:otaId",
  description: "Mengeluarkan anggota dari grup. Hanya admin/bankes/pengurus.",
  request: { params: GroupMemberParamSchema },
  responses: {
    200: {
      description: "Anggota berhasil dikeluarkan",
      content: { "application/json": { schema: GroupSuccessResponse } },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    404: {
      description: "Grup atau anggota tidak ditemukan",
      content: { "application/json": { schema: NotFoundResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: InternalServerErrorResponse } },
    },
  },
});

export const activateGroupRoute = createRoute({
  operationId: "activateGroup",
  tags: ["Group"],
  method: "post",
  path: "/:id/activate",
  description:
    "Mengaktifkan grup sehingga dapat memilih mahasiswa asuh. Hanya admin/bankes/pengurus.",
  request: { params: GroupIdParamSchema },
  responses: {
    200: {
      description: "Grup berhasil diaktifkan",
      content: { "application/json": { schema: GroupSuccessResponse } },
    },
    400: {
      description: "Grup sudah aktif atau tidak memiliki anggota",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    404: {
      description: "Grup tidak ditemukan",
      content: { "application/json": { schema: NotFoundResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: InternalServerErrorResponse } },
    },
  },
});
