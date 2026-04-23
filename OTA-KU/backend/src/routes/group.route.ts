import { createRoute } from "@hono/zod-openapi";

import { AuthorizationErrorResponse } from "../types/response.js";
import {
  CreateGroupResponse,
  CreateGroupSchema,
  GroupConnectByAdminSchema,
  GroupConnectListQuerySchema,
  GroupConnectVerifySchema,
  GroupConnectionListResponse,
  GroupDetailResponse,
  GroupIdParamSchema,
  GroupListQuerySchema,
  GroupListResponse,
  GroupMemberParamSchema,
  GroupSuccessResponse,
  InvitationIdParamSchema,
  InviteMemberSchema,
  ProposalIdParamSchema,
  ProposalListResponse,
  ProposeStudentSchema,
  RespondInvitationSchema,
  VoteProposalSchema,
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

// ── Task 3: Student Selection Routes ────────────────────────────────────────

export const proposeStudentRoute = createRoute({
  operationId: "proposeStudent",
  tags: ["Group"],
  method: "post",
  path: "/:id/propose-student",
  description:
    "Mengusulkan mahasiswa untuk disponsori oleh grup. Grup harus aktif. Bisa dilakukan anggota atau admin.",
  request: {
    params: GroupIdParamSchema,
    body: {
      content: { "multipart/form-data": { schema: ProposeStudentSchema } },
    },
  },
  responses: {
    200: {
      description: "Proposal berhasil dibuat",
      content: { "application/json": { schema: GroupSuccessResponse } },
    },
    400: {
      description: "Grup belum aktif, mahasiswa tidak eligible, atau proposal sudah ada",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    404: {
      description: "Grup atau mahasiswa tidak ditemukan",
      content: { "application/json": { schema: NotFoundResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: InternalServerErrorResponse } },
    },
  },
});

export const listProposalsRoute = createRoute({
  operationId: "listGroupProposals",
  tags: ["Group"],
  method: "get",
  path: "/:id/proposals",
  description: "Daftar proposal mahasiswa untuk sebuah grup beserta status voting.",
  request: { params: GroupIdParamSchema },
  responses: {
    200: {
      description: "Daftar proposal berhasil diambil",
      content: { "application/json": { schema: ProposalListResponse } },
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

export const voteProposalRoute = createRoute({
  operationId: "voteGroupProposal",
  tags: ["Group"],
  method: "post",
  path: "/proposal/:id/vote",
  description:
    "Vote setuju/tidak pada proposal mahasiswa. Menyertakan pledge kontribusi bulanan. " +
    "Jika semua anggota vote setuju dan total pledge >= 800k, proposal otomatis diteruskan ke admin.",
  request: {
    params: ProposalIdParamSchema,
    body: {
      content: { "multipart/form-data": { schema: VoteProposalSchema } },
    },
  },
  responses: {
    200: {
      description: "Vote berhasil disimpan",
      content: { "application/json": { schema: GroupSuccessResponse } },
    },
    400: {
      description: "Proposal sudah tidak open atau vote tidak valid",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Bukan anggota grup ini",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    404: {
      description: "Proposal tidak ditemukan",
      content: { "application/json": { schema: NotFoundResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: InternalServerErrorResponse } },
    },
  },
});

export const listPendingGroupConnectionsRoute = createRoute({
  operationId: "listPendingGroupConnections",
  tags: ["Group"],
  method: "get",
  path: "/connect/list/pending",
  description: "Daftar group connection yang menunggu persetujuan admin.",
  request: { query: GroupConnectListQuerySchema },
  responses: {
    200: {
      description: "Daftar pending group connection berhasil diambil",
      content: { "application/json": { schema: GroupConnectionListResponse } },
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

export const listAllGroupConnectionsRoute = createRoute({
  operationId: "listAllGroupConnections",
  tags: ["Group"],
  method: "get",
  path: "/connect/list/all",
  description: "Daftar semua group connection.",
  request: { query: GroupConnectListQuerySchema },
  responses: {
    200: {
      description: "Daftar semua group connection berhasil diambil",
      content: { "application/json": { schema: GroupConnectionListResponse } },
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

export const verifyGroupConnectionAccRoute = createRoute({
  operationId: "verifyGroupConnectionAccept",
  tags: ["Group"],
  method: "post",
  path: "/connect/verify-accept",
  description:
    "Admin menyetujui group connection. Membuat kontribusi per anggota dan transaksi pertama.",
  request: {
    body: {
      content: { "multipart/form-data": { schema: GroupConnectVerifySchema } },
    },
  },
  responses: {
    200: {
      description: "Group connection berhasil disetujui",
      content: { "application/json": { schema: GroupSuccessResponse } },
    },
    400: {
      description: "Group connection tidak dalam status pending",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    404: {
      description: "Group connection tidak ditemukan",
      content: { "application/json": { schema: NotFoundResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: InternalServerErrorResponse } },
    },
  },
});

export const verifyGroupConnectionRejectRoute = createRoute({
  operationId: "verifyGroupConnectionReject",
  tags: ["Group"],
  method: "post",
  path: "/connect/verify-reject",
  description: "Admin menolak group connection dan mengembalikan mahasiswa ke status inactive.",
  request: {
    body: {
      content: { "multipart/form-data": { schema: GroupConnectVerifySchema } },
    },
  },
  responses: {
    200: {
      description: "Group connection berhasil ditolak",
      content: { "application/json": { schema: GroupSuccessResponse } },
    },
    400: {
      description: "Group connection tidak dalam status pending",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    404: {
      description: "Group connection tidak ditemukan",
      content: { "application/json": { schema: NotFoundResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: InternalServerErrorResponse } },
    },
  },
});

export const connectGroupByAdminRoute = createRoute({
  operationId: "connectGroupByAdmin",
  tags: ["Group"],
  method: "post",
  path: "/connect/by-admin",
  description:
    "Admin langsung menghubungkan grup dengan mahasiswa (bypass proposal). " +
    "Kontribusi otomatis diambil dari field funds tiap anggota. Total harus >= 800.000.",
  request: {
    body: {
      content: { "multipart/form-data": { schema: GroupConnectByAdminSchema } },
    },
  },
  responses: {
    200: {
      description: "Grup berhasil dihubungkan dengan mahasiswa",
      content: { "application/json": { schema: GroupSuccessResponse } },
    },
    400: {
      description: "Grup belum aktif, mahasiswa tidak eligible, atau total funds < 800k",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: { "application/json": { schema: ForbiddenResponse } },
    },
    404: {
      description: "Grup atau mahasiswa tidak ditemukan",
      content: { "application/json": { schema: NotFoundResponse } },
    },
    500: {
      description: "Internal server error",
      content: { "application/json": { schema: InternalServerErrorResponse } },
    },
  },
});
