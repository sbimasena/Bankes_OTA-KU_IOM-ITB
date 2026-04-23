import { addMonths, setDate } from "date-fns";

import { prisma } from "../db/prisma.js";
import { uploadFileToMinio } from "../lib/file-upload-minio.js";
import {
  acceptGroupTransferStatusRoute,
  activateGroupRoute,
  connectGroupByAdminRoute,
  createGroupRoute,
  getGroupDetailRoute,
  inviteMemberRoute,
  listAllGroupConnectionsRoute,
  listGroupsRoute,
  listGroupTransactionAdminRoute,
  listGroupTransactionOtaRoute,
  listPendingGroupConnectionsRoute,
  listProposalsRoute,
  proposeStudentRoute,
  removeMemberRoute,
  respondInvitationRoute,
  uploadGroupReceiptRoute,
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
  GroupTransactionListAdminQuerySchema,
  GroupTransactionListOtaQuerySchema,
  GroupUploadReceiptSchema,
  GroupVerifyMemberPaymentSchema,
  InviteMemberSchema,
  ProposeStudentSchema,
  RespondInvitationSchema,
  VoteProposalSchema,
} from "../zod/group.js";
import { createAuthRouter } from "./router-factory.js";

export const groupProtectedRouter = createAuthRouter();

const LIST_PAGE_SIZE = 10;

const isAdminRole = (type: string) =>
  type === "admin" || type === "bankes" || type === "pengurus";

// POST /group/create
groupProtectedRouter.openapi(createGroupRoute, async (c) => {
  const user = c.var.user;

  if (user.type !== "ota" && !isAdminRole(user.type)) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: { code: "UNAUTHORIZED", message: "Hanya OTA atau admin yang dapat membuat grup" },
      },
      403,
    );
  }

  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());
  const { name, description, criteria, transferDate } = CreateGroupSchema.parse(data);

  try {
    const group = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.otaGroup.create({
        data: {
          name,
          description: description ?? null,
          criteria: criteria ?? null,
          transferDate: transferDate ?? null,
          createdById: user.id,
        },
      });

      if (user.type === "ota") {
        await tx.otaGroupMember.create({
          data: { groupId: newGroup.id, otaId: user.id },
        });
      }

      return newGroup;
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
            joinedAt: m.joinedAt.toISOString(),
          })),
          pendingInvitations: group.Invitations.map((inv) => ({
            invitationId: inv.id,
            invitedOtaId: inv.invitedOtaId,
            invitedOtaName: inv.InvitedOta.name ?? "",
          })),
          activeConnectionCount: group._count.Connections,
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
  const { invitedOtaId } = InviteMemberSchema.parse(Object.fromEntries(body.entries()));

  try {
    const [group, invitedOta] = await Promise.all([
      prisma.otaGroup.findUnique({ where: { id: groupId } }),
      prisma.otaProfile.findUnique({ where: { userId: invitedOtaId } }),
    ]);

    if (!group) {
      return c.json({ success: false, message: "Grup tidak ditemukan", error: {} }, 404);
    }

    if (!invitedOta) {
      return c.json({ success: false, message: "OTA tidak ditemukan", error: {} }, 404);
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
  const { response } = RespondInvitationSchema.parse(Object.fromEntries(body.entries()));

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

    await prisma.$transaction(async (tx) => {
      await tx.groupInvitation.update({
        where: { id: invitationId },
        data: { status: response },
      });

      if (response === "accepted") {
        await tx.otaGroupMember.create({
          data: { groupId: invitation.groupId, otaId: user.id },
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
      include: { _count: { select: { Members: true } } },
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

const MIN_GROUP_CONTRIBUTION = 800_000;

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

    // Mahasiswa harus eligible: inactive + accepted
    if (
      mahasiswa.mahasiswaStatus !== "inactive" ||
      mahasiswa.User.applicationStatus !== "accepted"
    ) {
      return c.json(
        { success: false, message: "Mahasiswa tidak eligible (sudah aktif atau belum diterima)", error: { code: "NOT_ELIGIBLE" } },
        400,
      );
    }

    // Tidak boleh ada proposal open untuk pasangan (group, mahasiswa) yang sama
    const existingOpenProposal = await prisma.groupStudentProposal.findFirst({
      where: { groupId, mahasiswaId, status: "open" },
    });
    if (existingOpenProposal) {
      return c.json(
        { success: false, message: "Sudah ada proposal yang sedang berjalan untuk mahasiswa ini", error: { code: "PROPOSAL_EXISTS" } },
        400,
      );
    }

    const proposal = await prisma.groupStudentProposal.create({
      data: {
        groupId,
        mahasiswaId,
        proposedById: user.type === "ota" ? user.id : null,
        status: "open",
      },
    });

    return c.json(
      { success: true, message: "Proposal berhasil dibuat", body: { proposalId: proposal.id } } as any,
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
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json(
      {
        success: true,
        message: "Daftar proposal berhasil diambil",
        body: {
          data: proposals.map((p) => ({
            id: p.id,
            mahasiswaId: p.mahasiswaId,
            mahasiswaName: p.Mahasiswa.name ?? "",
            mahasiswaNim: p.Mahasiswa.nim,
            proposedById: p.proposedById,
            proposedByName: p.ProposedBy?.name ?? null,
            status: p.status,
            votes: p.Votes.map((v) => ({
              otaId: v.otaId,
              otaName: v.Ota.name ?? "",
              approve: v.approve,
              pledgeAmount: v.pledgeAmount,
            })),
            totalPledge: p.Votes.filter((v) => v.approve).reduce((s, v) => s + v.pledgeAmount, 0),
            memberCount: group._count.Members,
            createdAt: p.createdAt.toISOString(),
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

// POST /group/proposal/:id/vote
groupProtectedRouter.openapi(voteProposalRoute, async (c) => {
  const user = c.var.user;
  const proposalId = c.req.param("id");

  if (user.type !== "ota") {
    return c.json(
      { success: false, message: "Hanya OTA yang dapat vote proposal", error: { code: "UNAUTHORIZED" } },
      403,
    );
  }

  const body = await c.req.formData();
  const { approve, pledgeAmount } = VoteProposalSchema.parse(Object.fromEntries(body.entries()));

  if (approve && pledgeAmount <= 0) {
    return c.json(
      { success: false, message: "Pledge amount harus > 0 jika vote setuju", error: { code: "INVALID_PLEDGE" } },
      400,
    );
  }

  try {
    const proposal = await prisma.groupStudentProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return c.json({ success: false, message: "Proposal tidak ditemukan", error: {} }, 404);
    }

    if (proposal.status !== "open") {
      return c.json(
        { success: false, message: "Proposal sudah tidak dalam status open", error: { code: "PROPOSAL_NOT_OPEN" } },
        400,
      );
    }

    // Harus anggota grup
    const isMember = await prisma.otaGroupMember.findUnique({
      where: { groupId_otaId: { groupId: proposal.groupId, otaId: user.id } },
    });
    if (!isMember) {
      return c.json(
        { success: false, message: "Anda bukan anggota grup ini", error: { code: "NOT_MEMBER" } },
        403,
      );
    }

    let resultMessage = "Vote berhasil disimpan";

    await prisma.$transaction(async (tx) => {
      // Upsert vote
      await tx.groupStudentProposalVote.upsert({
        where: { proposalId_otaId: { proposalId, otaId: user.id } },
        create: { proposalId, otaId: user.id, approve, pledgeAmount: approve ? pledgeAmount : 0 },
        update: { approve, pledgeAmount: approve ? pledgeAmount : 0 },
      });

      // Ambil semua vote setelah upsert
      const [allVotes, memberCount] = await Promise.all([
        tx.groupStudentProposalVote.findMany({ where: { proposalId } }),
        tx.otaGroupMember.count({ where: { groupId: proposal.groupId } }),
      ]);

      const hasVotedNo = allVotes.some((v) => !v.approve);

      if (hasVotedNo) {
        // Proposal gagal jika ada yang vote tidak
        await tx.groupStudentProposal.update({
          where: { id: proposalId },
          data: { status: "failed" },
        });
        resultMessage = "Vote tidak setuju diterima — proposal telah gagal";
        return;
      }

      // Semua yang sudah vote setuju, cek apakah semua anggota sudah vote
      if (allVotes.length === memberCount) {
        const totalPledge = allVotes.reduce((s, v) => s + v.pledgeAmount, 0);

        if (totalPledge >= MIN_GROUP_CONTRIBUTION) {
          // Proposal lolos: buat GroupConnection pending
          await tx.groupStudentProposal.update({
            where: { id: proposalId },
            data: { status: "passed" },
          });

          await tx.groupConnection.create({
            data: {
              mahasiswaId: proposal.mahasiswaId,
              groupId: proposal.groupId,
              proposalId: proposal.id,
              connectionStatus: "pending",
              paidFor: 0,
            },
          });

          // Set mahasiswa active agar tidak dipilih OTA/grup lain
          await tx.mahasiswaProfile.update({
            where: { userId: proposal.mahasiswaId },
            data: { mahasiswaStatus: "active" },
          });

          resultMessage = "Vote setuju diterima — semua anggota setuju, proposal diteruskan ke admin";
        } else {
          // Semua vote setuju tapi total pledge belum cukup, tetap open
          resultMessage = `Vote setuju diterima — total pledge saat ini Rp${totalPledge.toLocaleString("id-ID")}, belum mencapai minimum Rp800.000`;
        }
      }
    });

    return c.json({ success: true, message: resultMessage }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Internal server error", error }, 500);
  }
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
            Members: { include: { Ota: { select: { funds: true } } } },
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

    // Tentukan kontribusi per anggota
    const contributions: { otaId: string; amount: number }[] =
      groupConn.Proposal
        ? groupConn.Proposal.Votes.filter((v) => v.approve).map((v) => ({
            otaId: v.otaId,
            amount: v.pledgeAmount,
          }))
        : groupConn.Group.Members.map((m) => ({ otaId: m.otaId, amount: m.Ota.funds }));

    const totalBill = contributions.reduce((s, c) => s + c.amount, 0);
    const transferDate = groupConn.Group.transferDate ?? 1;
    const dueDate = setDate(addMonths(new Date(), 1), transferDate);

    await prisma.$transaction(async (tx) => {
      await tx.groupConnection.update({
        where: { id: groupConnectionId },
        data: { connectionStatus: "accepted" },
      });

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
        include: { Members: { include: { Ota: { select: { funds: true } } } } },
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

    const contributions = group.Members.map((m) => ({ otaId: m.otaId, amount: m.Ota.funds }));
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
