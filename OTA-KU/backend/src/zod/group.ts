import { z } from "@hono/zod-openapi";

// === Request Schemas ===

export const CreateGroupSchema = z.object({
  name: z.string().min(1).max(255).openapi({
    description: "Nama grup OTA",
    example: "Grup Alumni Teknik 2000",
  }),
  description: z.string().optional().openapi({
    description: "Deskripsi grup",
    example: "Grup alumni teknik angkatan 2000",
  }),
  criteria: z.string().optional().openapi({
    description: "Kriteria mahasiswa yang ingin dibantu",
    example: "Mahasiswa aktif semester 1-4",
  }),
  transferDate: z.coerce.number().min(1).max(31).optional().openapi({
    description: "Tanggal transfer bulanan (1-31)",
    example: 15,
  }),
});

export const InviteMemberSchema = z.object({
  invitedOtaId: z.string().uuid().openapi({
    description: "ID OTA yang diundang",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

export const RespondInvitationSchema = z.object({
  response: z.enum(["accepted", "rejected"]).openapi({
    description: "Respons undangan: accepted atau rejected",
    example: "accepted",
  }),
});

export const GroupIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    description: "ID grup OTA",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

export const GroupMemberParamSchema = z.object({
  id: z.string().uuid().openapi({
    description: "ID grup OTA",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  otaId: z.string().uuid().openapi({
    description: "ID OTA anggota yang akan dikeluarkan",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

export const InvitationIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    description: "ID undangan grup",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

export const GroupListQuerySchema = z.object({
  q: z.string().optional().openapi({
    description: "Pencarian berdasarkan nama grup",
    example: "Alumni",
  }),
  page: z.coerce.number().optional().openapi({
    description: "Halaman pagination",
    example: 1,
  }),
});

// === Response Schemas ===

export const CreateGroupResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Grup berhasil dibuat" }),
  body: z.object({
    groupId: z.string().uuid().openapi({
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  }),
});

export const GroupListResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Daftar grup berhasil diambil" }),
  body: z.object({
    data: z.array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        status: z.enum(["forming", "active"]),
        memberCount: z.number(),
        activeConnectionCount: z.number(),
        createdAt: z.string().datetime(),
      }),
    ),
    totalData: z.number().openapi({ example: 10 }),
  }),
});

export const GroupDetailResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Detail grup berhasil diambil" }),
  body: z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    status: z.enum(["forming", "active"]),
    criteria: z.string().nullable(),
    transferDate: z.number().nullable(),
    createdAt: z.string().datetime(),
    members: z.array(
      z.object({
        otaId: z.string().uuid(),
        name: z.string(),
        joinedAt: z.string().datetime(),
      }),
    ),
    pendingInvitations: z.array(
      z.object({
        invitationId: z.string().uuid(),
        invitedOtaId: z.string().uuid(),
        invitedOtaName: z.string(),
      }),
    ),
    activeConnectionCount: z.number(),
  }),
});

export const GroupSuccessResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Operasi berhasil" }),
});

// === Task 3: Proposal & Connection Schemas ===

export const ProposeStudentSchema = z.object({
  mahasiswaId: z.string().uuid().openapi({
    description: "ID mahasiswa yang diusulkan untuk disponsori",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

export const VoteProposalSchema = z.object({
  approve: z.enum(["true", "false"]).transform((v) => v === "true").openapi({
    description: "Setuju (true) atau tidak setuju (false)",
    example: "true",
  }),
  pledgeAmount: z.coerce.number().min(0).openapi({
    description: "Nominal kontribusi bulanan yang dijanjikan (IDR). Wajib > 0 jika approve = true.",
    example: 400000,
  }),
});

export const ProposalIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    description: "ID proposal",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

export const GroupConnectByAdminSchema = z.object({
  groupId: z.string().uuid().openapi({
    description: "ID grup OTA",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  mahasiswaId: z.string().uuid().openapi({
    description: "ID mahasiswa asuh",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

export const GroupConnectVerifySchema = z.object({
  groupConnectionId: z.string().uuid().openapi({
    description: "ID group connection yang akan diverifikasi",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

export const GroupConnectListQuerySchema = z.object({
  q: z.string().optional().openapi({
    description: "Pencarian berdasarkan nama mahasiswa, NIM, atau nama grup",
    example: "Budi",
  }),
  page: z.coerce.number().optional().openapi({
    description: "Halaman pagination",
    example: 1,
  }),
});

// Response schemas
export const ProposalListResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Daftar proposal berhasil diambil" }),
  body: z.object({
    data: z.array(
      z.object({
        id: z.string().uuid(),
        mahasiswaId: z.string().uuid(),
        mahasiswaName: z.string(),
        mahasiswaNim: z.string(),
        proposedById: z.string().uuid().nullable(),
        proposedByName: z.string().nullable(),
        status: z.enum(["open", "failed", "passed", "approved", "rejected"]),
        votes: z.array(
          z.object({
            otaId: z.string().uuid(),
            otaName: z.string(),
            approve: z.boolean(),
            pledgeAmount: z.number(),
          }),
        ),
        totalPledge: z.number(),
        memberCount: z.number(),
        createdAt: z.string().datetime(),
      }),
    ),
  }),
});

export const GroupConnectionListResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Daftar koneksi grup berhasil diambil" }),
  body: z.object({
    data: z.array(
      z.object({
        id: z.string().uuid(),
        mahasiswaId: z.string().uuid(),
        mahasiswaName: z.string(),
        mahasiswaNim: z.string(),
        groupId: z.string().uuid(),
        groupName: z.string(),
        connectionStatus: z.enum(["accepted", "pending", "rejected"]),
        paidFor: z.number(),
        requestTerminateGroup: z.boolean(),
        requestTerminateMahasiswa: z.boolean(),
        createdAt: z.string().datetime(),
      }),
    ),
    totalData: z.number(),
  }),
});
