import { z } from "@hono/zod-openapi";

import { NIMSchema, PhoneNumberSchema } from "./atomic.js";

// Mahasiswa
export const VerifiedMahasiswaListQuerySchema = z.object({
  q: z.string().optional().openapi({
    description: "Query string for searching mahasiswa.",
    example: "John Doe",
  }),
  page: z.coerce.number().optional().openapi({
    description: "Page number for pagination.",
    example: 1,
  }),
  major: z
    .enum([
      "Matematika",
      "Fisika",
      "Astronomi",
      "Mikrobiologi",
      "Kimia",
      "Biologi",
      "Sains dan Teknologi Farmasi",
      "Aktuaria",
      "Rekayasa Hayati",
      "Rekayasa Pertanian",
      "Rekayasa Kehutanan",
      "Farmasi Klinik dan Komunitas",
      "Teknologi Pasca Panen",
      "Teknik Geologi",
      "Teknik Pertambangan",
      "Teknik Perminyakan",
      "Teknik Geofisika",
      "Teknik Metalurgi",
      "Meteorologi",
      "Oseanografi",
      "Teknik Kimia",
      "Teknik Mesin",
      "Teknik Elektro",
      "Teknik Fisika",
      "Teknik Industri",
      "Teknik Informatika",
      "Aeronotika dan Astronotika",
      "Teknik Material",
      "Teknik Pangan",
      "Manajemen Rekayasa Industri",
      "Teknik Bioenergi dan Kemurgi",
      "Teknik Sipil",
      "Teknik Geodesi dan Geomatika",
      "Arsitektur",
      "Teknik Lingkungan",
      "Perencanaan Wilayah dan Kota",
      "Teknik Kelautan",
      "Rekayasa Infrastruktur Lingkungan",
      "Teknik dan Pengelolaan Sumber Daya Air",
      "Seni Rupa",
      "Desain",
      "Kriya",
      "Desain Interior",
      "Desain Komunikasi Visual",
      "Desain Produk",
      "Teknik Tenaga Listrik",
      "Teknik Telekomunikasi",
      "Sistem Teknologi dan Informasi",
      "Teknik Biomedis",
      "Manajemen",
      "Kewirausahaan",
      "TPB",
    ])
    .optional()
    .openapi({
      description: "Query string for filtering major of mahasiswa",
      example: "Teknik Informatika",
    }),
  faculty: z
    .enum([
      "FMIPA",
      "SITH-S",
      "SF",
      "FITB",
      "FTTM",
      "STEI-R",
      "FTSL",
      "FTI",
      "FSRD",
      "FTMD",
      "STEI-K",
      "SBM",
      "SITH-R",
      "SAPPK",
    ])
    .optional()
    .openapi({
      description: "Query string for filtering faculty of mahasiswa",
      example: "STEI-K",
    }),
  religion: z
    .enum([
      "Islam",
      "Kristen Protestan",
      "Katolik",
      "Hindu",
      "Buddha",
      "Konghucu",
    ])
    .optional()
    .openapi({
      description: "Query string for filtering religion of mahasiswa",
      example: "Kristen Protestan",
    }),
  gender: z.enum(["M", "F"]).optional().openapi({
    description: "Query string for filtering gender of mahasiswa",
    example: "M",
  }),
});

export const VerifiedMahasiswaListQueryResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Daftar mahasiswa berhasil diambil" }),
  body: z.object({
    data: z.array(
      z
        .object({
          accountId: z
            .string()
            .openapi({ example: "3fc0317f-f143-43bf-aa65-13a7a8eca788" }),
          name: z.string().openapi({ example: "John Doe" }),
          nim: z.string().openapi({ example: "13522005" }),
          major: z.string().openapi({ example: "Teknik Informatika" }),
          faculty: z.string().openapi({ example: "STEI-K" }),
          cityOfOrigin: z.string().openapi({ example: "Jakarta" }),
          highschoolAlumni: z
            .string()
            .openapi({ example: "SMA Negeri 1 Jakarta" }),
          religion: z
            .enum([
              "Islam",
              "Kristen Protestan",
              "Katolik",
              "Hindu",
              "Buddha",
              "Konghucu",
            ])
            .openapi({
              example: "Islam",
            }),
          gender: z.enum(["M", "F"]).openapi({ example: "M" }),
          gpa: z.string().openapi({ example: "3.5" }),
        })
        .openapi("MahasiswaListElement"),
    ),
    totalData: z.number().openapi({ example: 100 }),
  }),
});

export const MahasiswaDetailsListQuerySchema = z.object({
  q: z.string().optional().openapi({
    description: "Query string for searching mahasiswa.",
    example: "John Doe",
  }),
  page: z.coerce.number().optional().openapi({
    description: "Page number for pagination.",
    example: 1,
  }),
  jurusan: z.string().optional().openapi({
    description: "Jurusan of mahasiswa.",
    example: "Teknik Informatika",
  }),
  status: z
    .enum([
      "pending",
      "accepted",
      "rejected",
      "unregistered",
      "reapply",
      "outdated",
    ])
    .optional()
    .openapi({
      description: "Status of mahasiswa.",
      example: "pending",
    }),
});

export const MahasiswaDetailsListQueryResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Daftar mahasiswa berhasil diambil" }),
  body: z.object({
    data: z.array(
      z.object({
        id: z
          .string()
          .openapi({ example: "3fc0317f-f143-43bf-aa65-13a7a8eca788" }),
        email: z.string().openapi({ example: "johndoe@example.com" }),
        type: z
          .enum(["mahasiswa", "admin", "ota", "bankes", "pengurus"])
          .openapi({ example: "mahasiswa" }),
        phoneNumber: z.string().openapi({ example: "6281234567890" }),
        provider: z
          .enum(["credentials", "azure"])
          .openapi({ example: "credentials" }),
        applicationStatus: z
          .enum([
            "pending",
            "accepted",
            "rejected",
            "unregistered",
            "reapply",
            "outdated",
          ])
          .openapi({ example: "pending" }),
        name: z.string().openapi({ example: "John Doe" }),
        nim: z.string().openapi({ example: "13522005" }),
        mahasiswaStatus: z
          .enum(["active", "inactive"])
          .openapi({ example: "inactive" }),
        description: z.string().openapi({
          example: "Mahasiswa aktif yang sedang mencari orang tua asuh",
        }),
        file: z.string().openapi({ example: "https://example.com/file.pdf" }),
        major: z.string().openapi({ example: "Computer Science" }),
        faculty: z.string().openapi({ example: "Engineering" }),
        cityOfOrigin: z.string().openapi({ example: "Jakarta" }),
        highschoolAlumni: z
          .string()
          .openapi({ example: "SMA Negeri 1 Jakarta" }),
        religion: z
          .enum([
            "Islam",
            "Kristen Protestan",
            "Katolik",
            "Hindu",
            "Buddha",
            "Konghucu",
          ])
          .openapi({
            example: "Islam",
          }),
        gender: z.enum(["M", "F"]).openapi({ example: "M" }),
        gpa: z.string().openapi({ example: "3.5" }),
        kk: z.string().openapi({ example: "https://example.com/file.pdf" }),
        ktm: z.string().openapi({ example: "https://example.com/file.pdf" }),
        waliRecommendationLetter: z
          .string()
          .openapi({ example: "https://example.com/file.pdf" }),
        transcript: z
          .string()
          .openapi({ example: "https://example.com/file.pdf" }),
        salaryReport: z
          .string()
          .openapi({ example: "https://example.com/file.pdf" }),
        pbb: z.string().openapi({ example: "https://example.com/file.pdf" }),
        electricityBill: z
          .string()
          .openapi({ example: "https://example.com/file.pdf" }),
        ditmawaRecommendationLetter: z
          .string()
          .openapi({ example: "https://example.com/file.pdf" }),
        bill: z.number().openapi({
          example: 1000000,
          description: "Total bill of mahasiswa",
        }),
        notes: z.string().openapi({ example: "Mahasiswa aktif" }),
        adminOnlyNotes: z.string().openapi({ example: "Catatan admin" }),
      }),
    ),
    totalPagination: z.number().openapi({ example: 10 }),
    totalData: z.number().openapi({ example: 100 }),
    totalPending: z.number().openapi({ example: 50 }),
    totalAccepted: z.number().openapi({ example: 30 }),
    totalRejected: z.number().openapi({ example: 20 }),
  }),
});

export const OrangTuaDetailsListQuerySchema = z.object({
  q: z.string().optional().openapi({
    description: "Query string for searching mahasiswa.",
    example: "John Doe",
  }),
  page: z.coerce.number().optional().openapi({
    description: "Page number for pagination.",
    example: 1,
  }),
  status: z.enum(["pending", "accepted", "rejected"]).optional().openapi({
    description: "Status of mahasiswa.",
    example: "pending",
  }),
});

export const OrangTuaDetailsListQueryResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Daftar mahasiswa berhasil diambil" }),
  body: z.object({
    data: z.array(
      z.object({
        id: z.string().openapi({ example: "dfe6dd7c-ae07-4e91-b412-c8bdecad0c33" }),
        name: z.string().openapi({ example: "John Doe" }),
        email: z.string().openapi({ example: "johndoe@example.com" }),
        phoneNumber: z.string().openapi({ example: "6281234567890" }),
        provider: z.enum(["credentials", "azure"]).openapi({
          example: "credentials",
        }),
        status: z
          .enum(["verified", "unverified"])
          .openapi({ example: "unverified" }),
        applicationStatus: z
          .enum([
            "accepted",
            "rejected",
            "pending",
            "unregistered",
            "reapply",
            "outdated",
          ])
          .openapi({
            example: "pending",
          }),
        job: z.string().openapi({ example: "Guru" }),
        address: z.string().openapi({ example: "Jl. Merdeka No. 1" }),
        linkage: z.enum(["otm", "dosen", "alumni", "lainnya", "none"]).openapi({
          example: "otm",
        }),
        funds: z.coerce.number().openapi({ example: 1000000 }),
        maxCapacity: z.coerce.number().openapi({ example: 10 }),
        startDate: z.string().openapi({ example: "2022-01-01" }),
        maxSemester: z.coerce.number().openapi({ example: 8 }),
        transferDate: z.coerce.number().openapi({ example: 1 }),
        criteria: z.string().openapi({ example: "Kriteria orang tua" }),
        isDetailVisible: z.boolean().openapi({
          example: true,
        }),
        allowAdminSelection: z.boolean().openapi({
          example: true,
        }),
      }),
    ),
    totalPagination: z.number().openapi({ example: 10 }),
    totalData: z.number().openapi({ example: 100 }),
    totalPending: z.number().openapi({ example: 50 }),
    totalAccepted: z.number().openapi({ example: 30 }),
    totalRejected: z.number().openapi({ example: 20 }),
  }),
});

export const OTAListQuerySchema = z.object({
  q: z.string().optional().openapi({
    description: "Query string for searching mahasiswa.",
    example: "John Doe",
  }),
  page: z.coerce.number().optional().openapi({
    description: "Page number for pagination.",
    example: 1,
  }),
});

export const OTAListElementSchema = z.object({
  accountId: z.string().openapi({ example: "dfe6dd7c-ae07-4e91-b412-c8bdecad0c33" }),
  name: z.string().openapi({ example: "John Doe" }),
  phoneNumber: PhoneNumberSchema,
  nominal: z.number().openapi({ example: 5000000 }),
});

export const OTAListQueryResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Daftar OTA-ku berhasil diambil" }),
  body: z.object({
    data: z.array(OTAListElementSchema),
    totalData: z.number().openapi({ example: 100 }),
  }),
});

export const MAListElementSchema = z.object({
  accountId: z.string().openapi({ example: "dfe6dd7c-ae07-4e91-b412-c8bdecad0c33" }),
  name: z.string().openapi({ example: "John Doe" }),
  nim: NIMSchema,
  faculty: z.string().openapi({ example: "STEI-K" }),
  major: z.string().openapi({ example: "Teknik Informatika" }),
  cityOfOrigin: z.string().openapi({ example: "Jakarta" }),
  highschoolAlumni: z.string().openapi({ example: "SMA Negeri 1 Jakarta" }),
  gender: z.enum(["M", "F"]).openapi({ example: "M" }),
  religion: z
    .enum([
      "Islam",
      "Kristen Protestan",
      "Katolik",
      "Hindu",
      "Buddha",
      "Konghucu",
    ])
    .openapi({
      example: "Islam",
    }),
  gpa: z.string().openapi({ example: "3.5" }),
  mahasiswaStatus: z.enum(["active", "inactive"]).openapi({
    example: "active",
    description: "Status mahasiswa",
  }),
  request_term_ota: z.boolean().openapi({ example: false }),
  request_term_ma: z.boolean().openapi({ example: false })
});

export const MAListQueryResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Daftar MA berhasil diambil" }),
  body: z.object({
    data: z.array(MAListElementSchema.openapi("MAListElementStatus")),
    totalData: z.number().openapi({ example: 100 }),
  }),
});

export const AllAccountListQuerySchema = z.object({
  q: z.string().optional().openapi({
    description: "Query string for searching mahasiswa.",
    example: "John Doe",
  }),
  page: z.coerce.number().optional().openapi({
    description: "Page number for pagination.",
    example: 1,
  }),
  status: z
    .enum([
      "verified",
      "unverified"
    ])
    .optional()
    .openapi({
      description: "Verification status of account",
      example: "verified",
    }),
  type: z
    .enum(["mahasiswa", "ota", "admin", "bankes", "pengurus"])
    .optional()
    .openapi({
      example: "bankes",
      description: "Type of account",
    }),
  applicationStatus: z
    .enum([
      "pending",
      "accepted",
      "rejected",
      "unregistered",
      "reapply",
      "outdated",
    ])
    .optional()
    .openapi({ 
      description: "Application status of account",
      example: "pending" 
    }),
});

export const AllAccountListElementSchema = z.object({
  id: z.string().uuid().openapi({
    example: "3fc0317f-f143-43bf-aa65-13a7a8eca788",
  }),
  email: z.string().email().openapi({ example: "johndoe@example.com" }),
  type: z
    .enum(["mahasiswa", "admin", "ota", "bankes", "pengurus"])
    .openapi({ example: "mahasiswa" }),
  phoneNumber: z.string().openapi({ example: "+6281234567890" }),
  provider: z
    .enum(["credentials", "azure"])
    .openapi({ example: "credentials" }),
  status: z.enum(["verified", "unverified"]).openapi({
    description: "Verification status of account",
    example: "verified",
  }),
  applicationStatus: z
    .enum([
      "pending",
      "accepted",
      "rejected",
      "unregistered",
      "reapply",
      "outdated",
    ])
    .openapi({ example: "pending" }),
  ma_name: z.string().openapi({ example: "John Doe" }),
  ota_name: z.string().openapi({ example: "John Doe" }),
  admin_name: z.string().openapi({ example: "John Doe" }),
  nim: z.string().openapi({ example: "13522005" }),
  mahasiswaStatus: z
    .enum(["active", "inactive"])
    .openapi({ example: "inactive" }),
  description: z.string().openapi({
    example: "Mahasiswa aktif yang sedang mencari orang tua asuh",
  }),
  file: z.string().openapi({ example: "https://example.com/file.pdf" }),
  major: z.string().openapi({ example: "Computer Science" }),
  faculty: z.string().openapi({ example: "Engineering" }),
  cityOfOrigin: z.string().openapi({ example: "Jakarta" }),
  highschoolAlumni: z.string().openapi({ example: "SMA Negeri 1 Jakarta" }),
  religion: z
    .enum([
      "Islam",
      "Kristen Protestan",
      "Katolik",
      "Hindu",
      "Buddha",
      "Konghucu",
    ])
    .openapi({
      example: "Islam",
    }),
  gender: z.enum(["M", "F"]).openapi({ example: "M" }),
  gpa: z.string().openapi({ example: "3.5" }),
  kk: z.string().openapi({ example: "https://example.com/file.pdf" }),
  ktm: z.string().openapi({ example: "https://example.com/file.pdf" }),
  waliRecommendationLetter: z
    .string()
    .openapi({ example: "https://example.com/file.pdf" }),
  transcript: z.string().openapi({ example: "https://example.com/file.pdf" }),
  salaryReport: z
    .string()
    .openapi({ example: "https://example.com/file.pdf" }),
  pbb: z.string().openapi({ example: "https://example.com/file.pdf" }),
  electricityBill: z
    .string()
    .openapi({ example: "https://example.com/file.pdf" }),
  ditmawaRecommendationLetter: z
    .string()
    .openapi({ example: "https://example.com/file.pdf" }),
  bill: z.number().openapi({
    example: 1000000,
    description: "The amount of the bill in IDR",
  }),
  notes: z.string().openapi({ example: "Mahasiswa aktif" }),
  adminOnlyNotes: z.string().openapi({ example: "Catatan admin" }),
  job: z.string().openapi({ example: "Scholarship Provider" }),
  address: z.string().openapi({ example: "Jl. Example No. 1, Jakarta" }),
  linkage: z.enum(["otm", "dosen", "alumni", "lainnya", "none"]).openapi({
    example: "otm",
  }),
  funds: z.number().openapi({ example: 50000000 }),
  maxCapacity: z.number().openapi({ example: 10 }),
  startDate: z.string().openapi({ example: "2025-03-30T09:40:05.508Z" }),
  maxSemester: z.number().openapi({ example: 8 }),
  transferDate: z.number().openapi({ example: 10 }),
  criteria: z
    .string()
    .openapi({ example: "GPA minimum 3.5, active in organizations" }),
  allowAdminSelection: z.boolean().openapi({
    example: true,
  }),
});

export const AllAccountListQueryResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Daftar MA berhasil diambil" }),
  body: z.object({
    data: z.array(AllAccountListElementSchema.openapi("AllAccountListElement")),
    totalPagination: z.number().openapi({ example: 100 }),
  }),
});
