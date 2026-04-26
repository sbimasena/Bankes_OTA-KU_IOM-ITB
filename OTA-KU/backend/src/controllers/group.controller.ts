import { addMonths, setDate } from "date-fns";

import { prisma } from "../db/prisma.js";
import { uploadFileToMinio } from "../lib/file-upload-minio.js";
import {
  acceptGroupTransferStatusRoute,
  activateGroupRoute,
  autoPairGroupRoute,
  connectGroupByAdminRoute,
  createGroupRoute,
  getMaOtaGroupRoute,
  getGroupDetailRoute,
  inviteMemberRoute,
  listAllGroupConnectionsRoute,
  listGroupsRoute,
  listGroupTerminateRoute,
  listGroupTransactionAdminRoute,
  listGroupTransactionOtaRoute,
  listMyGroupsRoute,
  listMyInvitationsRoute,
  listPendingGroupConnectionsRoute,
  listProposalsRoute,
  proposeStudentRoute,
  rejectGroupTerminateRoute,
  removeMemberRoute,
  requestGroupTerminateRoute,
  respondInvitationRoute,
  uploadGroupReceiptRoute,
  validateGroupTerminateRoute,
  verifyGroupConnectionAccRoute,
  verifyGroupConnectionRejectRoute,
  verifyGroupMemberPaymentRoute,
  voteProposalRoute,
} from "../routes/group.route.js";
import {
  CreateGroupSchema,
  GroupAcceptTransferStatusSchema,
  GroupConnectByAdminSchema,
  GroupConnectListQuerySchema,
  GroupConnectVerifySchema,
  GroupListQuerySchema,
  GroupTerminateListQuerySchema,
  GroupTransactionListAdminQuerySchema,
  GroupTransactionListOtaQuerySchema,
  GroupUploadReceiptSchema,
  GroupVerifyMemberPaymentSchema,
  InviteMemberSchema,
  ProposeStudentSchema,
  RequestGroupTerminateSchema,
  RespondInvitationSchema,
  ValidateGroupTerminateSchema,
  VoteProposalSchema,
} from "../zod/group.js";
import { createAuthRouter } from "./router-factory.js";

export const groupProtectedRouter = createAuthRouter();

const LIST_PAGE_SIZE = 10;
const MAX_GROUP_MEMBERS = 8;
const MAX_PLEDGE_AMOUNT = 800_000;
const MIN_GROUP_CONTRIBUTION = 800_000;

const isAdminRole = (type: string) =>
  type === "admin" || type === "bankes" || type === "pengurus";
const isSystemAdmin = (type: string) => type === "admin";

// POST /group/create
groupProtectedRouter.openapi(createGroupRoute, async (c) => {
  const user = c.var.user;

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED", message: "Hanya OTA yang dapat membuat grup" },
      },
      403,
    );
  }

  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());
  const { name, description, criteria, transferDate, pledgeAmount } = CreateGroupSchema.parse(data);

  try {
    const existingMembership = await prisma.otaGroupMember.findFirst({
      where: { otaId: user.id },
    });

    if (existingMembership) {
      return c.json(
        {
          success: false,
          message: "OTA sudah tergabung di grup lain",
          error: { code: "ALREADY_IN_GROUP" },
        },
        400,
      );
    }

    const group = await prisma.otaGroup.create({
      data: {
        name,
        description: description ?? null,
        criteria: criteria ?? null,
        transferDate: transferDate ?? null,
        createdById: user.id,
        Members: {
          create: {
            otaId: user.id,
            pledgeAmount,
          },
        },
      },
    });

    return c.json(
      {
        success: true,
        message: "Grup berhasil dibuat",
        body: { groupId: group.id },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// GET /group/list
groupProtectedRouter.openapi(listGroupsRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED", message: "Hanya admin yang dapat melihat daftar grup" },
      },
      403,
    );
  }

  const { q, page } = GroupListQuerySchema.parse(c.req.query());
  const pageNumber = (!page || page < 1) ? 1 : page;
  const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

  const nameFilter = q ? { name: { contains: q, mode: "insensitive" as const } } : {};

  try {
    const [groups, totalData] = await Promise.all([
      prisma.otaGroup.findMany({
        where: nameFilter,
        include: {
          _count: {
            select: {
              Members: true,
              Connections: { where: { connectionStatus: "accepted" } },
            },
          },
          Members: { select: { pledgeAmount: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: LIST_PAGE_SIZE,
      }),
      prisma.otaGroup.count({ where: nameFilter }),
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar grup berhasil diambil",
        body: {
          data: groups.map((g) => ({
            id: g.id,
            name: g.name,
            status: g.status,
            memberCount: g._count.Members,
            activeConnectionCount: g._count.Connections,
            totalPledge: g.Members.reduce((sum, m) => sum + m.pledgeAmount, 0),
            createdAt: g.createdAt.toISOString(),
          })),
          totalData,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// GET /group/my
groupProtectedRouter.openapi(listMyGroupsRoute, async (c) => {
  const user = c.var.user;

  if (user.type !== "ota") {
    return c.json(
      { success: false, message: "Forbidden", error: { code: "FORBIDDEN" } },
      403,
    );
  }

  try {
    const memberships = await prisma.otaGroupMember.findMany({
      where: { otaId: user.id },
      include: {
        Group: {
          include: {
            _count: {
              select: {
                Members: true,
                Connections: { where: { connectionStatus: "accepted" } },
              },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return c.json(
      {
        success: true,
        message: "Daftar grup berhasil diambil",
        body: {
          data: memberships.map((m) => ({
            groupId: m.groupId,
            groupName: m.Group.name,
            groupStatus: m.Group.status,
            memberCount: m.Group._count.Members,
            activeConnectionCount: m.Group._count.Connections,
            joinedAt: m.joinedAt.toISOString(),
          })),
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// GET /group/my-ota-group (mahasiswa: lihat grup dari OTA yang mengasuh)
groupProtectedRouter.openapi(getMaOtaGroupRoute, async (c) => {
  const user = c.var.user;

  if (user.type !== "mahasiswa") {
    return c.json(
      { success: false, message: "Forbidden", error: { code: "FORBIDDEN" } },
      403,
    );
  }

  try {
    const connections = await prisma.groupConnection.findMany({
      where: { mahasiswaId: user.id },
      include: {
        Group: {
          include: {
            Members: {
              include: {
                Ota: {
                  select: {
                    name: true,
                    isDetailVisible: true,
                    transferDate: true,
                    createdAt: true,
                    User: { select: { email: true, phoneNumber: true } },
                  },
                },
              },
              orderBy: { joinedAt: "asc" },
            },
          },
        },
      },
    });

    return c.json(
      {
        success: true,
        message: "Grup orang tua asuh berhasil diambil",
        body: {
          data: connections.map((conn) => ({
            groupId: conn.groupId,
            groupName: conn.Group.name,
            groupStatus: conn.Group.status,
            transferDate: conn.Group.transferDate ?? null,
            members: conn.Group.Members.map((m) => ({
              otaId: m.otaId,
              name: m.Ota.name ?? "-",
              email: m.Ota.User.email,
              phoneNumber: m.Ota.User.phoneNumber ?? "-",
              isDetailVisible: m.Ota.isDetailVisible,
              pledgeAmount: m.pledgeAmount,
              joinedAt: m.joinedAt.toISOString(),
            })),
          })),
        },
      } as any,
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// GET /group/invitations/my
groupProtectedRouter.openapi(listMyInvitationsRoute, async (c) => {
  const user = c.var.user;

  if (user.type !== "ota") {
    return c.json(
      { success: false, message: "Forbidden", error: { code: "FORBIDDEN" } },
      403,
    );
  }

  try {
    const invitations = await prisma.groupInvitation.findMany({
      where: { invitedOtaId: user.id, status: "pending" },
      include: {
        Group: {
          select: {
            name: true,
            status: true,
            Members: { select: { pledgeAmount: true } },
          },
        },
        InvitedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json(
      {
        success: true,
        message: "Daftar undangan berhasil diambil",
        body: {
          data: invitations.map((inv) => ({
            invitationId: inv.id,
            groupId: inv.groupId,
            groupName: inv.Group.name,
            groupStatus: inv.Group.status,
            invitedByName: inv.InvitedBy?.name ?? null,
            memberCount: inv.Group.Members.length,
            totalPledge: inv.Group.Members.reduce((sum, m) => sum + m.pledgeAmount, 0),
            createdAt: inv.createdAt.toISOString(),
          })),
        },
      } as any,
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// GET /group/:id
groupProtectedRouter.openapi(getGroupDetailRoute, async (c) => {
  const user = c.var.user;
  const groupId = c.req.param("id");

  try {
    const group = await prisma.otaGroup.findUnique({
      where: { id: groupId },
      include: {
        Members: {
          include: { Ota: { select: { name: true } } },
          orderBy: { joinedAt: "asc" },
        },
        Invitations: {
          where: { status: "pending" },
          include: { InvitedOta: { select: { name: true } } },
        },
        _count: {
          select: { Connections: { where: { connectionStatus: "accepted" } } },
        },
      },
    });

    if (!group) {
      return c.json(
        { success: false, message: "Grup tidak ditemukan", error: {} },
        404,
      );
    }

    // OTA harus anggota grup, admin bebas
    if (user.type === "ota") {
      const isMember = group.Members.some((m) => m.otaId === user.id);
      if (!isMember) {
        return c.json(
          {
            success: false,
            message: "Unauthorized",
            error: { code: "UNAUTHORIZED", message: "Anda bukan anggota grup ini" },
          },
          403,
        );
      }
    } else if (!isAdminRole(user.type)) {
      return c.json(
        {
          success: false,
          message: "Unauthorized",
          error: { code: "UNAUTHORIZED", message: "Akses ditolak" },
        },
        403,
      );
    }

    return c.json(
      {
        success: true,
        message: "Detail grup berhasil diambil",
        body: {
          id: group.id,
          name: group.name,
          description: group.description,
          status: group.status,
          criteria: group.criteria,
          transferDate: group.transferDate,
          createdAt: group.createdAt.toISOString(),
          members: group.Members.map((m) => ({
            otaId: m.otaId,
            name: m.Ota.name ?? "",
            pledgeAmount: m.pledgeAmount,
            joinedAt: m.joinedAt.toISOString(),
          })),
          pendingInvitations: group.Invitations.map((inv) => ({
            invitationId: inv.id,
            invitedOtaId: inv.invitedOtaId,
            invitedOtaName: inv.InvitedOta.name ?? "",
          })),
          activeConnectionCount: group._count.Connections,
          totalPledge: group.Members.reduce((sum, m) => sum + m.pledgeAmount, 0),
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// POST /group/:id/invite
groupProtectedRouter.openapi(inviteMemberRoute, async (c) => {
  const user = c.var.user;
  const groupId = c.req.param("id");

  if (user.type !== "ota" && !isAdminRole(user.type)) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED", message: "Hanya OTA atau admin yang dapat mengundang anggota" },
      },
      403,
    );
  }

  const body = await c.req.formData();
  const { email } = InviteMemberSchema.parse(Object.fromEntries(body.entries()));

  try {
    const invitedUser = await prisma.user.findUnique({
      where: { email },
      include: { OtaProfile: true },
    });

    if (!invitedUser || !invitedUser.OtaProfile) {
      return c.json({ success: false, message: "OTA dengan email tersebut tidak ditemukan", error: {} }, 404);
    }

    const invitedOtaId = invitedUser.id;

    const [group, invitedOta] = await Promise.all([
      prisma.otaGroup.findUnique({
        where: { id: groupId },
        include: { _count: { select: { Members: true } } },
      }),
      Promise.resolve(invitedUser.OtaProfile),
    ]);

    if (!group) {
      return c.json({ success: false, message: "Grup tidak ditemukan", error: {} }, 404);
    }

    if (!invitedOta) {
      return c.json({ success: false, message: "OTA tidak ditemukan", error: {} }, 404);
    }

    if (group._count.Members >= MAX_GROUP_MEMBERS) {
      return c.json(
        {
          success: false,
          message: `Jumlah anggota grup sudah maksimum (${MAX_GROUP_MEMBERS})`,
          error: { code: "GROUP_MEMBER_LIMIT_REACHED" },
        },
        400,
      );
    }

    // OTA pengundang harus anggota grup
    if (user.type === "ota") {
      const isMember = await prisma.otaGroupMember.findUnique({
        where: { groupId_otaId: { groupId, otaId: user.id } },
      });
      if (!isMember) {
        return c.json(
          {
            success: false,
            message: "Anda bukan anggota grup ini",
            error: { code: "NOT_MEMBER" },
          },
          403,
        );
      }
    }

    // Cek sudah anggota
    const alreadyMember = await prisma.otaGroupMember.findUnique({
      where: { groupId_otaId: { groupId, otaId: invitedOtaId } },
    });
    if (alreadyMember) {
      return c.json(
        {
          success: false,
          message: "OTA sudah menjadi anggota grup ini",
          error: { code: "ALREADY_MEMBER" },
        },
        400,
      );
    }

    // Cek undangan pending
    const pendingInvitation = await prisma.groupInvitation.findFirst({
      where: { groupId, invitedOtaId, status: "pending" },
    });
    if (pendingInvitation) {
      return c.json(
        {
          success: false,
          message: "OTA sudah memiliki undangan yang masih pending",
          error: { code: "PENDING_INVITATION_EXISTS" },
        },
        400,
      );
    }

    await prisma.groupInvitation.create({
      data: {
        groupId,
        invitedOtaId,
        invitedByOtaId: user.type === "ota" ? user.id : null,
      },
    });

    return c.json({ success: true, message: "Undangan berhasil dikirim" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// POST /group/invitation/:id/respond
groupProtectedRouter.openapi(respondInvitationRoute, async (c) => {
  const user = c.var.user;
  const invitationId = c.req.param("id");

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED", message: "Hanya OTA yang dapat merespons undangan" },
      },
      403,
    );
  }

  const body = await c.req.formData();
  const { response, pledgeAmount } = RespondInvitationSchema.parse(Object.fromEntries(body.entries()));

  try {
    const invitation = await prisma.groupInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return c.json({ success: false, message: "Undangan tidak ditemukan", error: {} }, 404);
    }

    if (invitation.invitedOtaId !== user.id) {
      return c.json(
        {
          success: false,
          message: "Unauthorized",
          error: { code: "UNAUTHORIZED", message: "Bukan penerima undangan ini" },
        },
        403,
      );
    }

    if (invitation.status !== "pending") {
      return c.json(
        {
          success: false,
          message: "Undangan sudah tidak dalam status pending",
          error: { code: "INVITATION_NOT_PENDING" },
        },
        400,
      );
    }

    if (response === "accepted" && pledgeAmount === undefined) {
      return c.json(
        {
          success: false,
          message: "pledgeAmount wajib diisi saat menerima undangan",
          error: { code: "PLEDGE_AMOUNT_REQUIRED" },
        },
        400,
      );
    }

    if (response === "accepted") {
      const [groupWithMemberCount, existingMembership] = await Promise.all([
        prisma.otaGroup.findUnique({
          where: { id: invitation.groupId },
          include: { _count: { select: { Members: true } } },
        }),
        prisma.otaGroupMember.findFirst({
          where: { otaId: invitation.invitedOtaId },
        }),
      ]);

      if (!groupWithMemberCount) {
        return c.json({ success: false, message: "Grup tidak ditemukan", error: {} }, 404);
      }

      if (groupWithMemberCount._count.Members >= MAX_GROUP_MEMBERS) {
        return c.json(
          {
            success: false,
            message: `Jumlah anggota grup sudah maksimum (${MAX_GROUP_MEMBERS})`,
            error: { code: "GROUP_MEMBER_LIMIT_REACHED" },
          },
          400,
        );
      }

      if (existingMembership) {
        return c.json(
          {
            success: false,
            message: "OTA sudah tergabung di grup lain",
            error: { code: "ALREADY_IN_GROUP" },
          },
          400,
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.groupInvitation.update({
        where: { id: invitationId },
        data: { status: response },
      });

      if (response === "accepted") {
        await tx.otaGroupMember.create({
          data: {
            groupId: invitation.groupId,
            otaId: invitation.invitedOtaId,
            pledgeAmount: pledgeAmount!,
          },
        });
      }
    });

    const message = response === "accepted"
      ? "Undangan berhasil diterima, Anda sekarang anggota grup"
      : "Undangan berhasil ditolak";

    return c.json({ success: true, message }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// DELETE /group/:id/member/:otaId
groupProtectedRouter.openapi(removeMemberRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED", message: "Hanya admin yang dapat mengeluarkan anggota" },
      },
      403,
    );
  }

  const groupId = c.req.param("id");
  const otaId = c.req.param("otaId");

  try {
    const member = await prisma.otaGroupMember.findUnique({
      where: { groupId_otaId: { groupId, otaId } },
    });

    if (!member) {
      return c.json({ success: false, message: "Anggota tidak ditemukan di grup ini", error: {} }, 404);
    }

    await prisma.otaGroupMember.delete({
      where: { groupId_otaId: { groupId, otaId } },
    });

    return c.json({ success: true, message: "Anggota berhasil dikeluarkan dari grup" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// POST /group/:id/activate
groupProtectedRouter.openapi(activateGroupRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED", message: "Hanya admin yang dapat mengaktifkan grup" },
      },
      403,
    );
  }

  const groupId = c.req.param("id");

  try {
    const group = await prisma.otaGroup.findUnique({
      where: { id: groupId },
      include: {
        _count: { select: { Members: true } },
        Members: { select: { pledgeAmount: true } },
      },
    });

    if (!group) {
      return c.json({ success: false, message: "Grup tidak ditemukan", error: {} }, 404);
    }

    if (group.status === "active") {
      return c.json(
        { success: false, message: "Grup sudah dalam status aktif", error: { code: "ALREADY_ACTIVE" } },
        400,
      );
    }

    if (group._count.Members === 0) {
      return c.json(
        { success: false, message: "Grup harus memiliki minimal satu anggota sebelum diaktifkan", error: { code: "NO_MEMBERS" } },
        400,
      );
    }

    const totalPledge = group.Members.reduce((sum, member) => sum + member.pledgeAmount, 0);
    if (totalPledge < MIN_GROUP_CONTRIBUTION) {
      return c.json(
        {
          success: false,
          message: `Total pledge grup saat ini Rp${totalPledge.toLocaleString("id-ID")}, minimum Rp${MIN_GROUP_CONTRIBUTION.toLocaleString("id-ID")} untuk aktivasi`,
          error: { code: "INSUFFICIENT_GROUP_PLEDGE" },
        },
        400,
      );
    }

    await prisma.otaGroup.update({
      where: { id: groupId },
      data: { status: "active" },
    });

    return c.json({ success: true, message: "Grup berhasil diaktifkan" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// ── Task 3: Student Selection Handlers ──────────────────────────────────────

// POST /group/:id/propose-student
groupProtectedRouter.openapi(proposeStudentRoute, async (c) => {
  const user = c.var.user;
  const groupId = c.req.param("id");

  if (user.type !== "ota" && !isAdminRole(user.type)) {
    return c.json(
      { success: false, message: "Unauthorized", error: { code: "UNAUTHORIZED" } },
      403,
    );
  }

  const body = await c.req.formData();
  const { mahasiswaId } = ProposeStudentSchema.parse(Object.fromEntries(body.entries()));

  try {
    const [group, mahasiswa] = await Promise.all([
      prisma.otaGroup.findUnique({
        where: { id: groupId },
        include: { _count: { select: { Members: true } } },
      }),
      prisma.mahasiswaProfile.findUnique({
        where: { userId: mahasiswaId },
        include: { User: { select: { applicationStatus: true } } },
      }),
    ]);

    if (!group) {
      return c.json({ success: false, message: "Grup tidak ditemukan", error: {} }, 404);
    }

    if (!mahasiswa) {
      return c.json({ success: false, message: "Mahasiswa tidak ditemukan", error: {} }, 404);
    }

    if (group.status !== "active") {
      return c.json(
        { success: false, message: "Grup belum aktif, tidak bisa mengajukan proposal", error: { code: "GROUP_NOT_ACTIVE" } },
        400,
      );
    }

    // OTA harus anggota grup
    if (user.type === "ota") {
      const isMember = await prisma.otaGroupMember.findUnique({
        where: { groupId_otaId: { groupId, otaId: user.id } },
      });
      if (!isMember) {
        return c.json(
          { success: false, message: "Anda bukan anggota grup ini", error: { code: "NOT_MEMBER" } },
          403,
        );
      }
    }

    if (
      mahasiswa.mahasiswaStatus !== "inactive" ||
      mahasiswa.User.applicationStatus !== "accepted"
    ) {
      return c.json(
        { success: false, message: "Mahasiswa tidak eligible (status harus inactive dan applicationStatus accepted)", error: { code: "NOT_ELIGIBLE" } },
        400,
      );
    }

    const [existingOpenOrPassedProposal, existingPendingOrAcceptedConnection, groupExistingConnection] = await Promise.all([
      prisma.groupStudentProposal.findFirst({
        where: {
          mahasiswaId,
          status: { in: ["open", "passed"] },
          groupId: { not: groupId },
        },
      }),
      prisma.groupConnection.findFirst({
        where: {
          mahasiswaId,
          connectionStatus: { in: ["pending", "accepted"] },
          groupId: { not: groupId },
        },
      }),
      prisma.groupConnection.findFirst({
        where: {
          groupId,
          connectionStatus: { in: ["pending", "accepted"] },
        },
      }),
    ]);

    if (existingOpenOrPassedProposal || existingPendingOrAcceptedConnection) {
      return c.json(
        {
          success: false,
          message: "Mahasiswa sedang diproses oleh grup lain",
          error: { code: "STUDENT_ALREADY_IN_FIFS_PROCESS" },
        },
        400,
      );
    }

    if (groupExistingConnection) {
      return c.json(
        {
          success: false,
          message: "Grup ini sudah memiliki mahasiswa asuh atau sedang dalam proses persetujuan dengan mahasiswa lain.",
          error: { code: "GROUP_ALREADY_HAS_CONNECTION" },
        },
        400,
      );
    }

    const proposal = await prisma.$transaction(async (tx) => {
      const createdProposal = await tx.groupStudentProposal.create({
        data: {
          groupId,
          mahasiswaId,
          proposedById: user.type === "ota" ? user.id : null,
          status: "passed",
        },
      });

      await tx.groupConnection.create({
        data: {
          mahasiswaId,
          groupId,
          proposalId: createdProposal.id,
          connectionStatus: "pending",
          paidFor: 0,
        },
      });

      await tx.mahasiswaProfile.update({
        where: { userId: mahasiswaId },
        data: { mahasiswaStatus: "active" },
      });

      return createdProposal;
    });

    return c.json(
      { success: true, message: "Proposal berhasil diajukan dan menunggu persetujuan admin", body: { proposalId: proposal.id } } as any,
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// GET /group/:id/proposals
groupProtectedRouter.openapi(listProposalsRoute, async (c) => {
  const user = c.var.user;
  const groupId = c.req.param("id");

  try {
    const group = await prisma.otaGroup.findUnique({
      where: { id: groupId },
      include: { _count: { select: { Members: true } } },
    });

    if (!group) {
      return c.json({ success: false, message: "Grup tidak ditemukan", error: {} }, 404);
    }

    // OTA harus anggota, admin bebas
    if (user.type === "ota") {
      const isMember = await prisma.otaGroupMember.findUnique({
        where: { groupId_otaId: { groupId, otaId: user.id } },
      });
      if (!isMember) {
        return c.json(
          { success: false, message: "Anda bukan anggota grup ini", error: { code: "NOT_MEMBER" } },
          403,
        );
      }
    } else if (!isAdminRole(user.type)) {
      return c.json({ success: false, message: "Unauthorized", error: { code: "UNAUTHORIZED" } }, 403);
    }

    const proposals = await prisma.groupStudentProposal.findMany({
      where: { groupId },
      include: {
        Mahasiswa: { select: { name: true, nim: true } },
        ProposedBy: { select: { name: true } },
        Votes: { include: { Ota: { select: { name: true } } } },
        Connection: { select: { connectionStatus: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json(
      {
        success: true,
        message: "Daftar proposal berhasil diambil",
        body: {
          data: proposals.map((p) => {
            let effectiveStatus: string = p.status;
            if (p.Connection?.connectionStatus === "accepted") effectiveStatus = "approved";
            else if (p.Connection?.connectionStatus === "rejected") effectiveStatus = "rejected";

            return {
            id: p.id,
            mahasiswaId: p.mahasiswaId,
            mahasiswaName: p.Mahasiswa.name ?? "",
            mahasiswaNim: p.Mahasiswa.nim,
            proposedById: p.proposedById,
            proposedByName: p.ProposedBy?.name ?? null,
            status: effectiveStatus,
            votes: p.Votes.map((v) => ({
              otaId: v.otaId,
              otaName: v.Ota.name ?? "",
              approve: v.approve,
              pledgeAmount: v.pledgeAmount,
            })),
            totalPledge: p.Votes.filter((v) => v.approve).reduce((s, v) => s + v.pledgeAmount, 0),
            memberCount: group._count.Members,
            createdAt: p.createdAt.toISOString(),
          };
          }),
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// POST /group/proposal/:id/vote
groupProtectedRouter.openapi(voteProposalRoute, async (c) => {
  return c.json(
    {
      success: false,
      message: "Voting proposal dinonaktifkan pada mode pre-funded group",
      error: { code: "VOTING_DISABLED" },
    },
    400,
  );
});

// GET /group/connect/list/pending
groupProtectedRouter.openapi(listPendingGroupConnectionsRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      { success: false, message: "Unauthorized", error: { code: "UNAUTHORIZED" } },
      403,
    );
  }

  const { q, page } = GroupConnectListQuerySchema.parse(c.req.query());
  const pageNumber = (!page || page < 1) ? 1 : page;
  const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

  const searchFilter = q
    ? {
      OR: [
        { Mahasiswa: { name: { contains: q, mode: "insensitive" as const } } },
        { Mahasiswa: { nim: { contains: q, mode: "insensitive" as const } } },
        { Group: { name: { contains: q, mode: "insensitive" as const } } },
      ],
    }
    : {};

  try {
    const [connections, totalData] = await Promise.all([
      prisma.groupConnection.findMany({
        where: { connectionStatus: "pending", ...searchFilter },
        include: {
          Mahasiswa: { select: { name: true, nim: true } },
          Group: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: LIST_PAGE_SIZE,
      }),
      prisma.groupConnection.count({ where: { connectionStatus: "pending", ...searchFilter } }),
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar pending group connection berhasil diambil",
        body: {
          data: connections.map((c) => ({
            id: c.id,
            mahasiswaId: c.mahasiswaId,
            mahasiswaName: c.Mahasiswa.name ?? "",
            mahasiswaNim: c.Mahasiswa.nim,
            groupId: c.groupId,
            groupName: c.Group.name,
            connectionStatus: c.connectionStatus,
            paidFor: c.paidFor,
            requestTerminateGroup: c.requestTerminateGroup,
            requestTerminateMahasiswa: c.requestTerminateMahasiswa,
            createdAt: c.createdAt.toISOString(),
          })),
          totalData,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// GET /group/connect/list/all
groupProtectedRouter.openapi(listAllGroupConnectionsRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      { success: false, message: "Unauthorized", error: { code: "UNAUTHORIZED" } },
      403,
    );
  }

  const { q, page } = GroupConnectListQuerySchema.parse(c.req.query());
  const pageNumber = (!page || page < 1) ? 1 : page;
  const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

  const searchFilter = q
    ? {
      OR: [
        { Mahasiswa: { name: { contains: q, mode: "insensitive" as const } } },
        { Mahasiswa: { nim: { contains: q, mode: "insensitive" as const } } },
        { Group: { name: { contains: q, mode: "insensitive" as const } } },
      ],
    }
    : {};

  try {
    const [connections, totalData] = await Promise.all([
      prisma.groupConnection.findMany({
        where: searchFilter,
        include: {
          Mahasiswa: { select: { name: true, nim: true } },
          Group: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: LIST_PAGE_SIZE,
      }),
      prisma.groupConnection.count({ where: searchFilter }),
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar semua group connection berhasil diambil",
        body: {
          data: connections.map((c) => ({
            id: c.id,
            mahasiswaId: c.mahasiswaId,
            mahasiswaName: c.Mahasiswa.name ?? "",
            mahasiswaNim: c.Mahasiswa.nim,
            groupId: c.groupId,
            groupName: c.Group.name,
            connectionStatus: c.connectionStatus,
            paidFor: c.paidFor,
            requestTerminateGroup: c.requestTerminateGroup,
            requestTerminateMahasiswa: c.requestTerminateMahasiswa,
            createdAt: c.createdAt.toISOString(),
          })),
          totalData,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// POST /group/connect/verify-accept
groupProtectedRouter.openapi(verifyGroupConnectionAccRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      { success: false, message: "Unauthorized", error: { code: "UNAUTHORIZED" } },
      403,
    );
  }

  const body = await c.req.formData();
  const { groupConnectionId } = GroupConnectVerifySchema.parse(Object.fromEntries(body.entries()));

  try {
    const groupConn = await prisma.groupConnection.findUnique({
      where: { id: groupConnectionId },
      include: {
        Proposal: { include: { Votes: true } },
        Group: {
          include: {
            Members: { select: { otaId: true, pledgeAmount: true } },
          },
        },
      },
    });

    if (!groupConn) {
      return c.json({ success: false, message: "Group connection tidak ditemukan", error: {} }, 404);
    }

    if (groupConn.connectionStatus !== "pending") {
      return c.json(
        { success: false, message: "Group connection tidak dalam status pending", error: { code: "NOT_PENDING" } },
        400,
      );
    }

    // Check if the group already has an active connection
    const activeConnectionForGroup = await prisma.groupConnection.findFirst({
      where: { groupId: groupConn.groupId, connectionStatus: "accepted" },
    });

    if (activeConnectionForGroup) {
      return c.json(
        {
          success: false,
          message: "Grup sudah memiliki mahasiswa asuh yang aktif. Satu grup hanya dapat mensponsori satu mahasiswa.",
          error: { code: "GROUP_ALREADY_HAS_ACTIVE_CONNECTION" },
        },
        400,
      );
    }

    // Check if the student already has an active connection (group or individual)
    const existingMahasiswaGroupConn = await prisma.groupConnection.findFirst({
      where: { mahasiswaId: groupConn.mahasiswaId, connectionStatus: "accepted" },
    });
    
    const existingMahasiswaIndividualConn = await prisma.connection.findFirst({
      where: { mahasiswaId: groupConn.mahasiswaId, connectionStatus: "accepted" },
    });

    if (existingMahasiswaGroupConn || existingMahasiswaIndividualConn) {
      return c.json(
        {
          success: false,
          message: "Mahasiswa ini sudah memiliki grup/OTA asuh yang aktif.",
          error: { code: "MAHASISWA_ALREADY_HAS_ACTIVE_CONNECTION" },
        },
        400,
      );
    }

    // Tentukan kontribusi per anggota
    const approvedVotes = groupConn.Proposal?.Votes.filter((v) => v.approve) ?? [];
    const contributions: { otaId: string; amount: number }[] =
      approvedVotes.length > 0
        ? approvedVotes.map((v) => ({ otaId: v.otaId, amount: v.pledgeAmount }))
        : groupConn.Group.Members.map((m) => ({ otaId: m.otaId, amount: m.pledgeAmount }));

    if (contributions.length === 0) {
      return c.json(
        {
          success: false,
          message: "Belum ada data kontribusi grup untuk koneksi ini",
          error: { code: "NO_GROUP_CONTRIBUTIONS" },
        },
        400,
      );
    }

    const totalBill = contributions.reduce((s, c) => s + c.amount, 0);
    const transferDate = groupConn.Group.transferDate ?? 1;
    const dueDate = setDate(addMonths(new Date(), 1), transferDate);

    await prisma.$transaction(async (tx) => {
      await tx.groupConnection.update({
        where: { id: groupConnectionId },
        data: { connectionStatus: "accepted" },
      });

      if (groupConn.proposalId) {
        await tx.groupStudentProposal.update({
          where: { id: groupConn.proposalId },
          data: { status: "approved" },
        });
      }

      await tx.groupMemberContribution.createMany({
        data: contributions.map((contrib) => ({
          groupConnectionId,
          otaId: contrib.otaId,
          amount: contrib.amount,
        })),
        skipDuplicates: true,
      });

      const groupTx = await tx.groupTransaction.create({
        data: {
          mahasiswaId: groupConn.mahasiswaId,
          groupId: groupConn.groupId,
          groupConnectionId,
          bill: totalBill,
          dueDate,
        },
      });

      await tx.groupMemberTransaction.createMany({
        data: contributions.map((contrib) => ({
          groupTransactionId: groupTx.id,
          otaId: contrib.otaId,
          expectedAmount: contrib.amount,
        })),
      });
    });

    return c.json({ success: true, message: "Group connection berhasil disetujui" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// POST /group/connect/verify-reject
groupProtectedRouter.openapi(verifyGroupConnectionRejectRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      { success: false, message: "Unauthorized", error: { code: "UNAUTHORIZED" } },
      403,
    );
  }

  const body = await c.req.formData();
  const { groupConnectionId } = GroupConnectVerifySchema.parse(Object.fromEntries(body.entries()));

  try {
    const groupConn = await prisma.groupConnection.findUnique({
      where: { id: groupConnectionId },
    });

    if (!groupConn) {
      return c.json({ success: false, message: "Group connection tidak ditemukan", error: {} }, 404);
    }

    if (groupConn.connectionStatus !== "pending") {
      return c.json(
        { success: false, message: "Group connection tidak dalam status pending", error: { code: "NOT_PENDING" } },
        400,
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.groupConnection.update({
        where: { id: groupConnectionId },
        data: { connectionStatus: "rejected" },
      });

      // Kembalikan mahasiswa ke inactive agar bisa dipilih lagi
      await tx.mahasiswaProfile.update({
        where: { userId: groupConn.mahasiswaId },
        data: { mahasiswaStatus: "inactive" },
      });

      // Jika ada proposal, kembalikan ke status open agar grup bisa re-propose
      if (groupConn.proposalId) {
        await tx.groupStudentProposal.update({
          where: { id: groupConn.proposalId },
          data: { status: "rejected" },
        });
      }
    });

    return c.json({ success: true, message: "Group connection berhasil ditolak" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// POST /group/connect/by-admin
groupProtectedRouter.openapi(connectGroupByAdminRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      { success: false, message: "Unauthorized", error: { code: "UNAUTHORIZED" } },
      403,
    );
  }

  const body = await c.req.formData();
  const { groupId, mahasiswaId } = GroupConnectByAdminSchema.parse(Object.fromEntries(body.entries()));

  try {
    const [group, mahasiswa] = await Promise.all([
      prisma.otaGroup.findUnique({
        where: { id: groupId },
        include: { Members: { select: { otaId: true, pledgeAmount: true } } },
      }),
      prisma.mahasiswaProfile.findUnique({
        where: { userId: mahasiswaId },
        include: { User: { select: { applicationStatus: true } } },
      }),
    ]);

    if (!group) {
      return c.json({ success: false, message: "Grup tidak ditemukan", error: {} }, 404);
    }

    if (!mahasiswa) {
      return c.json({ success: false, message: "Mahasiswa tidak ditemukan", error: {} }, 404);
    }

    if (group.status !== "active") {
      return c.json(
        { success: false, message: "Grup belum aktif", error: { code: "GROUP_NOT_ACTIVE" } },
        400,
      );
    }

    if (
      mahasiswa.mahasiswaStatus !== "inactive" ||
      mahasiswa.User.applicationStatus !== "accepted"
    ) {
      return c.json(
        { success: false, message: "Mahasiswa tidak eligible", error: { code: "NOT_ELIGIBLE" } },
        400,
      );
    }

    const contributions = group.Members.map((m) => ({ otaId: m.otaId, amount: m.pledgeAmount }));
    const totalFunds = contributions.reduce((s, c) => s + c.amount, 0);

    if (totalFunds < MIN_GROUP_CONTRIBUTION) {
      return c.json(
        {
          success: false,
          message: `Total funds anggota (Rp${totalFunds.toLocaleString("id-ID")}) kurang dari minimum Rp800.000`,
          error: { code: "INSUFFICIENT_FUNDS" },
        },
        400,
      );
    }

    const transferDate = group.transferDate ?? 1;
    const dueDate = setDate(addMonths(new Date(), 1), transferDate);

    await prisma.$transaction(async (tx) => {
      const groupConn = await tx.groupConnection.create({
        data: {
          mahasiswaId,
          groupId,
          connectionStatus: "accepted",
          paidFor: 0,
        },
      });

      await tx.groupMemberContribution.createMany({
        data: contributions.map((c) => ({
          groupConnectionId: groupConn.id,
          otaId: c.otaId,
          amount: c.amount,
        })),
      });

      await tx.mahasiswaProfile.update({
        where: { userId: mahasiswaId },
        data: { mahasiswaStatus: "active" },
      });

      const groupTx = await tx.groupTransaction.create({
        data: {
          mahasiswaId,
          groupId,
          groupConnectionId: groupConn.id,
          bill: totalFunds,
          dueDate,
        },
      });

      await tx.groupMemberTransaction.createMany({
        data: contributions.map((c) => ({
          groupTransactionId: groupTx.id,
          otaId: c.otaId,
          expectedAmount: c.amount,
        })),
      });
    });

    return c.json(
      { success: true, message: "Grup berhasil dihubungkan dengan mahasiswa" },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// ── Task 5: My Groups, Invitations & Termination Handlers ────────────────────

// POST /group/terminate/request
groupProtectedRouter.openapi(requestGroupTerminateRoute, async (c) => {
  const user = c.var.user;

  if (user.type !== "ota" && !isAdminRole(user.type)) {
    return c.json(
      { success: false, message: "Forbidden", error: { code: "FORBIDDEN" } },
      403,
    );
  }

  const body = await c.req.formData();
  const { groupConnectionId, requestTerminationNote } = RequestGroupTerminateSchema.parse(
    Object.fromEntries(body.entries()),
  );

  try {
    const conn = await prisma.groupConnection.findUnique({
      where: { id: groupConnectionId },
      include: { Group: { include: { Members: { select: { otaId: true } } } } },
    });

    if (!conn) {
      return c.json({ success: false, message: "GroupConnection tidak ditemukan", error: {} }, 404);
    }

    if (conn.connectionStatus !== "accepted") {
      return c.json(
        { success: false, message: "Hanya koneksi aktif yang bisa diterminasi", error: { code: "NOT_ACCEPTED" } },
        400,
      );
    }

    // OTA harus anggota grup
    if (user.type === "ota") {
      const isMember = conn.Group.Members.some((m) => m.otaId === user.id);
      if (!isMember) {
        return c.json(
          { success: false, message: "Anda bukan anggota grup ini", error: { code: "NOT_MEMBER" } },
          403,
        );
      }
    }

    if (conn.requestTerminateGroup) {
      return c.json(
        { success: false, message: "Request terminasi dari grup sudah ada", error: { code: "ALREADY_REQUESTED" } },
        400,
      );
    }

    await prisma.groupConnection.update({
      where: { id: groupConnectionId },
      data: {
        requestTerminateGroup: true,
        requestTerminationNoteGroup: requestTerminationNote ?? null,
      },
    });

    return c.json({ success: true, message: "Permintaan terminasi berhasil diajukan" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// GET /group/terminate/list
groupProtectedRouter.openapi(listGroupTerminateRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      { success: false, message: "Forbidden", error: { code: "FORBIDDEN" } },
      403,
    );
  }

  const { q, page } = GroupTerminateListQuerySchema.parse(c.req.query());
  const pageNumber = (!page || page < 1) ? 1 : page;
  const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

  try {
    const searchFilter = q
      ? {
        OR: [
          { Mahasiswa: { name: { contains: q, mode: "insensitive" as const } } },
          { Mahasiswa: { nim: { contains: q, mode: "insensitive" as const } } },
          { Group: { name: { contains: q, mode: "insensitive" as const } } },
        ],
      }
      : {};

    const where = {
      OR: [{ requestTerminateGroup: true }, { requestTerminateMahasiswa: true }],
      ...searchFilter,
    };

    const [connections, totalData] = await Promise.all([
      prisma.groupConnection.findMany({
        where,
        include: {
          Group: { select: { name: true } },
          Mahasiswa: { select: { name: true, nim: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: offset,
        take: LIST_PAGE_SIZE,
      }),
      prisma.groupConnection.count({ where }),
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar request terminasi berhasil diambil",
        body: {
          data: connections.map((c) => ({
            groupConnectionId: c.id,
            groupId: c.groupId,
            groupName: c.Group.name,
            mahasiswaId: c.mahasiswaId,
            mahasiswaName: c.Mahasiswa.name ?? "",
            mahasiswaNim: c.Mahasiswa.nim,
            requestTerminateGroup: c.requestTerminateGroup,
            requestTerminationNoteGroup: c.requestTerminationNoteGroup ?? null,
            requestTerminateMahasiswa: c.requestTerminateMahasiswa,
            requestTerminationNoteMa: c.requestTerminationNoteMa ?? null,
            createdAt: c.createdAt.toISOString(),
          })),
          totalData,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// POST /group/terminate/validate
groupProtectedRouter.openapi(validateGroupTerminateRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      { success: false, message: "Forbidden", error: { code: "FORBIDDEN" } },
      403,
    );
  }

  const body = await c.req.formData();
  const { groupConnectionId } = ValidateGroupTerminateSchema.parse(
    Object.fromEntries(body.entries()),
  );

  try {
    const conn = await prisma.groupConnection.findUnique({
      where: { id: groupConnectionId },
    });

    if (!conn) {
      return c.json({ success: false, message: "GroupConnection tidak ditemukan", error: {} }, 404);
    }

    if (!conn.requestTerminateGroup && !conn.requestTerminateMahasiswa) {
      return c.json(
        { success: false, message: "Tidak ada request terminasi aktif pada koneksi ini", error: { code: "NO_REQUEST" } },
        400,
      );
    }

    await prisma.$transaction(async (tx) => {
      // Close all unpaid group transactions (mark as paid to clear outstanding debt)
      const openGroupTxs = await tx.groupTransaction.findMany({
        where: { groupConnectionId, transactionStatus: { not: "paid" } },
        select: { id: true },
      });

      if (openGroupTxs.length > 0) {
        const txIds = openGroupTxs.map((t) => t.id);
        await tx.groupTransaction.updateMany({
          where: { id: { in: txIds } },
          data: { transactionStatus: "paid", transferStatus: "paid" },
        });
        await tx.groupMemberTransaction.updateMany({
          where: { groupTransactionId: { in: txIds } },
          data: { paymentStatus: "paid" },
        });
      }

      // Reset mahasiswaStatus to inactive
      await tx.mahasiswaProfile.update({
        where: { userId: conn.mahasiswaId },
        data: { mahasiswaStatus: "inactive" },
      });

      // Delete the connection (follows same pattern as individual termination)
      await tx.groupConnection.delete({ where: { id: groupConnectionId } });
    });

    return c.json({ success: true, message: "Terminasi hubungan asuh grup berhasil disetujui" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// POST /group/terminate/reject
groupProtectedRouter.openapi(rejectGroupTerminateRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      { success: false, message: "Forbidden", error: { code: "FORBIDDEN" } },
      403,
    );
  }

  const body = await c.req.formData();
  const { groupConnectionId } = ValidateGroupTerminateSchema.parse(
    Object.fromEntries(body.entries()),
  );

  try {
    const conn = await prisma.groupConnection.findUnique({
      where: { id: groupConnectionId },
    });

    if (!conn) {
      return c.json({ success: false, message: "GroupConnection tidak ditemukan", error: {} }, 404);
    }

    await prisma.groupConnection.update({
      where: { id: groupConnectionId },
      data: {
        requestTerminateGroup: false,
        requestTerminationNoteGroup: null,
        requestTerminateMahasiswa: false,
        requestTerminationNoteMa: null,
      },
    });

    return c.json({ success: true, message: "Request terminasi berhasil ditolak" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// ── Task 4: Transaction Handlers ─────────────────────────────────────────────

// GET /group/transaction/list/ota
groupProtectedRouter.openapi(listGroupTransactionOtaRoute, async (c) => {
  const user = c.var.user;

  if (user.type !== "ota") {
    return c.json(
      { success: false, message: "Forbidden", error: { code: "FORBIDDEN" } },
      403,
    );
  }

  const { year, month, page } = GroupTransactionListOtaQuerySchema.parse(c.req.query());
  const pageNumber = (!page || page < 1) ? 1 : page;
  const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

  try {
    const yearFilter = year
      ? { dueDate: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } }
      : {};

    const [allRows, allForYears] = await Promise.all([
      prisma.groupMemberTransaction.findMany({
        where: {
          otaId: user.id,
          GroupTransaction: yearFilter,
        },
        include: {
          GroupTransaction: {
            include: {
              Group: { select: { name: true } },
              Mahasiswa: { select: { name: true, nim: true } },
            },
          },
        },
        orderBy: { GroupTransaction: { dueDate: "desc" } },
      }),
      prisma.groupMemberTransaction.findMany({
        where: { otaId: user.id },
        include: { GroupTransaction: { select: { dueDate: true } } },
      }),
    ]);

    const years = [...new Set(allForYears.map((t) => t.GroupTransaction.dueDate.getFullYear()))].sort(
      (a, b) => b - a,
    );

    const filtered = month
      ? allRows.filter((t) => t.GroupTransaction.dueDate.getMonth() + 1 === month)
      : allRows;

    const totalData = filtered.length;
    const paginated = filtered.slice(offset, offset + LIST_PAGE_SIZE);

    return c.json(
      {
        success: true,
        message: "Daftar transaksi grup berhasil diambil",
        body: {
          data: paginated.map((t) => ({
            id: t.id,
            groupTransactionId: t.groupTransactionId,
            groupId: t.GroupTransaction.groupId,
            groupName: t.GroupTransaction.Group.name,
            mahasiswaId: t.GroupTransaction.mahasiswaId,
            mahasiswaName: t.GroupTransaction.Mahasiswa.name ?? "",
            mahasiswaNim: t.GroupTransaction.Mahasiswa.nim,
            expectedAmount: t.expectedAmount,
            amountPaid: t.amountPaid,
            paymentStatus: t.paymentStatus,
            transactionReceipt: t.transactionReceipt ?? null,
            rejectionNote: t.rejectionNote ?? null,
            dueDate: t.GroupTransaction.dueDate.toISOString(),
            createdAt: t.createdAt.toISOString(),
          })),
          years,
          totalData,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// GET /group/transaction/list/admin
groupProtectedRouter.openapi(listGroupTransactionAdminRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      { success: false, message: "Forbidden", error: { code: "FORBIDDEN" } },
      403,
    );
  }

  const { q, status, year, month, page } = GroupTransactionListAdminQuerySchema.parse(c.req.query());
  const pageNumber = (!page || page < 1) ? 1 : page;
  const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

  try {
    const where: any = {};
    if (status) where.transactionStatus = status;
    if (year) {
      where.dueDate = { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) };
    }

    const allRows = await prisma.groupTransaction.findMany({
      where,
      include: {
        Group: { select: { name: true } },
        Mahasiswa: { select: { name: true, nim: true } },
        MemberPayments: {
          include: { Ota: { select: { name: true } } },
        },
      },
      orderBy: { dueDate: "desc" },
    });

    const monthFiltered = month
      ? allRows.filter((t) => t.dueDate.getMonth() + 1 === month)
      : allRows;

    const qFiltered = q
      ? monthFiltered.filter((t) => {
        const qLower = q.toLowerCase();
        return (
          t.Group.name.toLowerCase().includes(qLower) ||
          (t.Mahasiswa.name ?? "").toLowerCase().includes(qLower) ||
          t.Mahasiswa.nim.toLowerCase().includes(qLower)
        );
      })
      : monthFiltered;

    const totalData = qFiltered.length;
    const paginated = qFiltered.slice(offset, offset + LIST_PAGE_SIZE);

    return c.json(
      {
        success: true,
        message: "Daftar transaksi grup berhasil diambil",
        body: {
          data: paginated.map((t) => ({
            id: t.id,
            groupId: t.groupId,
            groupName: t.Group.name,
            mahasiswaId: t.mahasiswaId,
            mahasiswaName: t.Mahasiswa.name ?? "",
            mahasiswaNim: t.Mahasiswa.nim,
            bill: t.bill,
            transactionStatus: t.transactionStatus,
            transferStatus: t.transferStatus,
            dueDate: t.dueDate.toISOString(),
            memberPayments: t.MemberPayments.map((mp) => ({
              id: mp.id,
              otaId: mp.otaId,
              otaName: mp.Ota.name ?? "",
              expectedAmount: mp.expectedAmount,
              amountPaid: mp.amountPaid,
              paymentStatus: mp.paymentStatus,
              transactionReceipt: mp.transactionReceipt ?? null,
              rejectionNote: mp.rejectionNote ?? null,
              paidAt: mp.paidAt?.toISOString() ?? null,
            })),
            createdAt: t.createdAt.toISOString(),
          })),
          totalData,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// POST /group/transaction/upload-receipt
groupProtectedRouter.openapi(uploadGroupReceiptRoute, async (c) => {
  const user = c.var.user;

  if (user.type !== "ota") {
    return c.json(
      { success: false, message: "Forbidden", error: { code: "FORBIDDEN" } },
      403,
    );
  }

  const body = await c.req.formData();
  const { groupMemberTransactionId, receipt } = GroupUploadReceiptSchema.parse(
    Object.fromEntries(body.entries()),
  );

  try {
    const memberTx = await prisma.groupMemberTransaction.findUnique({
      where: { id: groupMemberTransactionId },
    });

    if (!memberTx || memberTx.otaId !== user.id) {
      return c.json(
        { success: false, message: "Transaksi tidak ditemukan atau bukan milik Anda", error: {} },
        404,
      );
    }

    if (memberTx.paymentStatus !== "unpaid") {
      return c.json(
        {
          success: false,
          message: "Bukti pembayaran hanya bisa diunggah saat status unpaid",
          error: { code: "INVALID_STATUS" },
        },
        400,
      );
    }

    const uploadResult = await uploadFileToMinio(receipt);
    const receiptUrl = uploadResult?.secure_url ?? "";

    await prisma.$transaction(async (tx) => {
      await tx.groupMemberTransaction.update({
        where: { id: groupMemberTransactionId },
        data: { paymentStatus: "pending", transactionReceipt: receiptUrl },
      });

      // If all member transactions for this GroupTransaction are pending or paid,
      // promote the GroupTransaction status to pending so admin can review
      const allMemberTxs = await tx.groupMemberTransaction.findMany({
        where: { groupTransactionId: memberTx.groupTransactionId },
        select: { paymentStatus: true },
      });

      const allUploaded = allMemberTxs.every((m) => m.paymentStatus !== "unpaid");
      if (allUploaded) {
        await tx.groupTransaction.update({
          where: { id: memberTx.groupTransactionId },
          data: { transactionStatus: "pending" },
        });
      }
    });

    return c.json(
      { success: true, message: "Bukti pembayaran berhasil diunggah" },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// POST /group/transaction/verify
groupProtectedRouter.openapi(verifyGroupMemberPaymentRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      { success: false, message: "Forbidden", error: { code: "FORBIDDEN" } },
      403,
    );
  }

  const body = await c.req.formData();
  const { groupMemberTransactionId, action, rejectionNote } = GroupVerifyMemberPaymentSchema.parse(
    Object.fromEntries(body.entries()),
  );

  try {
    const memberTx = await prisma.groupMemberTransaction.findUnique({
      where: { id: groupMemberTransactionId },
    });

    if (!memberTx) {
      return c.json(
        { success: false, message: "Transaksi tidak ditemukan", error: {} },
        404,
      );
    }

    if (memberTx.paymentStatus !== "pending") {
      return c.json(
        {
          success: false,
          message: "Hanya transaksi dengan status pending yang dapat diverifikasi",
          error: { code: "INVALID_STATUS" },
        },
        400,
      );
    }

    let resultMessage = "";

    await prisma.$transaction(async (tx) => {
      if (action === "accept") {
        await tx.groupMemberTransaction.update({
          where: { id: groupMemberTransactionId },
          data: {
            paymentStatus: "paid",
            amountPaid: memberTx.expectedAmount,
            paidAt: new Date(),
            transactionReceipt: "",
            rejectionNote: null,
          },
        });

        // Check if ALL member transactions for this GroupTransaction are now paid
        const allMemberTxs = await tx.groupMemberTransaction.findMany({
          where: { groupTransactionId: memberTx.groupTransactionId },
          select: { paymentStatus: true },
        });

        const allPaid = allMemberTxs.every((m) => m.paymentStatus === "paid");
        if (allPaid) {
          await tx.groupTransaction.update({
            where: { id: memberTx.groupTransactionId },
            data: { transactionStatus: "paid" },
          });
          resultMessage = "Pembayaran disetujui — semua anggota telah membayar, transaksi grup selesai";
        } else {
          resultMessage = "Pembayaran anggota berhasil disetujui";
        }
      } else {
        await tx.groupMemberTransaction.update({
          where: { id: groupMemberTransactionId },
          data: {
            paymentStatus: "unpaid",
            transactionReceipt: "",
            rejectionNote: rejectionNote ?? null,
          },
        });

        // Reset GroupTransaction status back to unpaid if it was pending
        await tx.groupTransaction.updateMany({
          where: { id: memberTx.groupTransactionId, transactionStatus: "pending" },
          data: { transactionStatus: "unpaid" },
        });

        resultMessage = "Pembayaran anggota berhasil ditolak";
      }
    });

    return c.json({ success: true, message: resultMessage }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// POST /group/transaction/accept-transfer-status
groupProtectedRouter.openapi(acceptGroupTransferStatusRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      { success: false, message: "Forbidden", error: { code: "FORBIDDEN" } },
      403,
    );
  }

  const body = await c.req.formData();
  const { groupTransactionId } = GroupAcceptTransferStatusSchema.parse(
    Object.fromEntries(body.entries()),
  );

  try {
    const groupTx = await prisma.groupTransaction.findUnique({
      where: { id: groupTransactionId },
    });

    if (!groupTx) {
      return c.json(
        { success: false, message: "GroupTransaction tidak ditemukan", error: {} },
        404,
      );
    }

    if (groupTx.transactionStatus !== "paid") {
      return c.json(
        {
          success: false,
          message: "Transfer hanya bisa dikonfirmasi setelah semua anggota selesai diverifikasi",
          error: { code: "NOT_FULLY_PAID" },
        },
        400,
      );
    }

    await prisma.groupTransaction.update({
      where: { id: groupTransactionId },
      data: { transferStatus: "paid" },
    });

    return c.json(
      { success: true, message: "Transfer status grup berhasil dikonfirmasi" },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});

// GET /group/:id/auto-pair-preview
groupProtectedRouter.openapi(autoPairGroupRoute, async (c) => {
  const user = c.var.user;

  if (!isAdminRole(user.type)) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED", message: "Hanya admin yang dapat menggunakan auto-pair" },
      },
      403,
    );
  }

  const groupId = c.req.param("id");

  try {
    const group = await prisma.otaGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return c.json(
        { success: false, message: "Grup tidak ditemukan", error: {} },
        404,
      );
    }

    if (group.status !== "active") {
      return c.json(
        {
          success: false,
          message: "Auto-pair hanya tersedia untuk grup yang sudah aktif",
          error: { code: "GROUP_NOT_ACTIVE" },
        },
        400,
      );
    }

    // Check group doesn't already have a pending or accepted connection
    const existingConnection = await prisma.groupConnection.findFirst({
      where: {
        groupId,
        connectionStatus: { in: ["pending", "accepted"] },
      },
    });

    if (existingConnection) {
      return c.json(
        {
          success: false,
          message: "Grup ini sudah memiliki mahasiswa asuh atau sedang dalam proses persetujuan",
          error: { code: "GROUP_ALREADY_HAS_CONNECTION" },
        },
        400,
      );
    }

    // Find all eligible mahasiswa:
    // - mahasiswaStatus = inactive
    // - applicationStatus = accepted
    // - not in any open/passed proposal (in any group)
    // - not in any pending/accepted group connection
    const eligibleMahasiswas = await prisma.mahasiswaProfile.findMany({
      where: {
        mahasiswaStatus: "inactive",
        User: { applicationStatus: "accepted" },
        GroupProposals: {
          none: {
            status: { in: ["open", "passed"] },
          },
        },
        GroupConnections: {
          none: {
            connectionStatus: { in: ["pending", "accepted"] },
          },
        },
      },
      select: {
        userId: true,
        nim: true,
        name: true,
        major: true,
        description: true,
      },
    });

    if (eligibleMahasiswas.length === 0) {
      return c.json(
        {
          success: false,
          message: "Tidak ada mahasiswa yang tersedia untuk dipasangkan saat ini",
          error: { code: "NO_ELIGIBLE_STUDENT" },
        },
        404,
      );
    }

    // Randomly pick one
    const picked = eligibleMahasiswas[Math.floor(Math.random() * eligibleMahasiswas.length)];

    return c.json(
      {
        success: true,
        message: "Mahasiswa saran berhasil dipilih",
        body: {
          mahasiswaId: picked.userId,
          nim: picked.nim,
          name: picked.name ?? "-",
          major: picked.major ?? null,
          description: picked.description ?? null,
          groupId: group.id,
          groupName: group.name,
        },
      } as any,
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
});
