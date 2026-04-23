import { prisma } from "../db/prisma.js";
import {
  activateGroupRoute,
  createGroupRoute,
  getGroupDetailRoute,
  inviteMemberRoute,
  listGroupsRoute,
  removeMemberRoute,
  respondInvitationRoute,
} from "../routes/group.route.js";
import {
  CreateGroupSchema,
  GroupListQuerySchema,
  InviteMemberSchema,
  RespondInvitationSchema,
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
