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
  pledgeAmount: z.coerce.number().min(1).max(800000).openapi({
    description: "Nominal komitmen dana OTA pembuat grup (maksimum Rp800.000)",
    example: 400000,
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
  pledgeAmount: z.coerce.number().min(1).max(800000).optional().openapi({
    description: "Nominal komitmen dana OTA saat menerima undangan (wajib jika accepted)",
    example: 250000,
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
        pledgeAmount: z.number(),
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
    totalPledge: z.number(),
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
  approve: z.enum(["true", "false"]).transform((v: string) => v === "true").openapi({
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

// === Task 5: My Groups, My Invitations & Termination Schemas ===

export const MyGroupListResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Daftar grup berhasil diambil" }),
  body: z.object({
    data: z.array(
      z.object({
        groupId: z.string().uuid(),
        groupName: z.string(),
        groupStatus: z.enum(["forming", "active"]),
        memberCount: z.number(),
        activeConnectionCount: z.number(),
        joinedAt: z.string().datetime(),
      }),
    ),
  }),
});

export const MyInvitationListResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Daftar undangan berhasil diambil" }),
  body: z.object({
    data: z.array(
      z.object({
        invitationId: z.string().uuid(),
        groupId: z.string().uuid(),
        groupName: z.string(),
        groupStatus: z.enum(["forming", "active"]),
        invitedByName: z.string().nullable(),
        createdAt: z.string().datetime(),
      }),
    ),
  }),
});

export const RequestGroupTerminateSchema = z.object({
  groupConnectionId: z.string().uuid().openapi({
    description: "ID GroupConnection yang ingin diterminasi",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  requestTerminationNote: z.string().optional().openapi({
    description: "Catatan alasan terminasi",
    example: "Anggota tidak mampu melanjutkan kontribusi",
  }),
});

export const ValidateGroupTerminateSchema = z.object({
  groupConnectionId: z.string().uuid().openapi({
    description: "ID GroupConnection yang divalidasi terminasinya",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

export const GroupTerminateListQuerySchema = z.object({
  q: z.string().optional().openapi({
    description: "Cari berdasarkan nama mahasiswa, NIM, atau nama grup",
    example: "Budi",
  }),
  page: z.coerce.number().optional().openapi({ description: "Halaman pagination", example: 1 }),
});

export const GroupTerminateListResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Daftar request terminasi berhasil diambil" }),
  body: z.object({
    data: z.array(
      z.object({
        groupConnectionId: z.string().uuid(),
        groupId: z.string().uuid(),
        groupName: z.string(),
        mahasiswaId: z.string().uuid(),
        mahasiswaName: z.string(),
        mahasiswaNim: z.string(),
        requestTerminateGroup: z.boolean(),
        requestTerminationNoteGroup: z.string().nullable(),
        requestTerminateMahasiswa: z.boolean(),
        requestTerminationNoteMa: z.string().nullable(),
        createdAt: z.string().datetime(),
      }),
    ),
    totalData: z.number(),
  }),
});

// === Task 4: Transaction Schemas ===

export const GroupTransactionListOtaQuerySchema = z.object({
  year: z.coerce.number().optional().openapi({ description: "Filter tahun", example: 2025 }),
  month: z.coerce.number().min(1).max(12).optional().openapi({ description: "Filter bulan (1-12)", example: 4 }),
  page: z.coerce.number().optional().openapi({ description: "Halaman pagination", example: 1 }),
});

export const GroupTransactionListAdminQuerySchema = z.object({
  q: z.string().optional().openapi({
    description: "Cari berdasarkan nama mahasiswa, NIM, atau nama grup",
    example: "Budi",
  }),
  status: z.enum(["unpaid", "pending", "paid"]).optional().openapi({
    description: "Filter status transaksi grup",
    example: "pending",
  }),
  year: z.coerce.number().optional().openapi({ description: "Filter tahun", example: 2025 }),
  month: z.coerce.number().min(1).max(12).optional().openapi({ description: "Filter bulan (1-12)", example: 4 }),
  page: z.coerce.number().optional().openapi({ description: "Halaman pagination", example: 1 }),
});

export const GroupUploadReceiptSchema = z.object({
  groupMemberTransactionId: z.string().uuid().openapi({
    description: "ID GroupMemberTransaction milik OTA yang sedang login",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  receipt: z.instanceof(File).openapi({ description: "Bukti pembayaran (gambar)" }),
});

export const GroupVerifyMemberPaymentSchema = z.object({
  groupMemberTransactionId: z.string().uuid().openapi({
    description: "ID GroupMemberTransaction yang diverifikasi",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  action: z.enum(["accept", "reject"]).openapi({
    description: "Terima atau tolak pembayaran anggota",
    example: "accept",
  }),
  rejectionNote: z.string().optional().openapi({
    description: "Catatan penolakan (wajib jika action = reject)",
    example: "Bukti pembayaran tidak jelas",
  }),
});

export const GroupAcceptTransferStatusSchema = z.object({
  groupTransactionId: z.string().uuid().openapi({
    description: "ID GroupTransaction yang sudah ditransfer ke mahasiswa",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

// Task 4: Transaction Response Schemas

export const GroupMemberTransactionListResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Daftar transaksi grup berhasil diambil" }),
  body: z.object({
    data: z.array(
      z.object({
        id: z.string().uuid(),
        groupTransactionId: z.string().uuid(),
        groupId: z.string().uuid(),
        groupName: z.string(),
        mahasiswaId: z.string().uuid(),
        mahasiswaName: z.string(),
        mahasiswaNim: z.string(),
        expectedAmount: z.number(),
        amountPaid: z.number(),
        paymentStatus: z.enum(["unpaid", "pending", "paid"]),
        transactionReceipt: z.string().nullable(),
        rejectionNote: z.string().nullable(),
        dueDate: z.string().datetime(),
        createdAt: z.string().datetime(),
      }),
    ),
    years: z.array(z.number()),
    totalData: z.number(),
  }),
});

export const GroupTransactionAdminListResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Daftar transaksi grup berhasil diambil" }),
  body: z.object({
    data: z.array(
      z.object({
        id: z.string().uuid(),
        groupId: z.string().uuid(),
        groupName: z.string(),
        mahasiswaId: z.string().uuid(),
        mahasiswaName: z.string(),
        mahasiswaNim: z.string(),
        bill: z.number(),
        transactionStatus: z.enum(["unpaid", "pending", "paid"]),
        transferStatus: z.enum(["unpaid", "paid"]),
        dueDate: z.string().datetime(),
        memberPayments: z.array(
          z.object({
            id: z.string().uuid(),
            otaId: z.string().uuid(),
            otaName: z.string(),
            expectedAmount: z.number(),
            amountPaid: z.number(),
            paymentStatus: z.enum(["unpaid", "pending", "paid"]),
            transactionReceipt: z.string().nullable(),
            rejectionNote: z.string().nullable(),
            paidAt: z.string().datetime().nullable(),
          }),
        ),
        createdAt: z.string().datetime(),
      }),
    ),
    totalData: z.number(),
  }),
});