import { z } from "@hono/zod-openapi";

export const MahasiswaDetailParamsSchema = z.object({
  id: z.string().uuid().openapi({
    description: "ID of the mahasiswa to retrieve.",
    example: "3fc0317f-f143-43bf-aa65-13a7a8eca788",
  }),
});

export const MahasiswaDetailResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Detail mahasiswa berhasil diambil" }),
  body: z.object({
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
  }),
});

export const MahasiswaSayaDetailResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Detail mahasiswa berhasil diambil" }),
  body: z
    .object({
      id: z.string().uuid().openapi({
        example: "3fc0317f-f143-43bf-aa65-13a7a8eca788",
      }),
      email: z.string().email().openapi({ example: "johndoe@example.com" }),
      phoneNumber: z.string().openapi({ example: "+6281234567890" }),
      name: z.string().openapi({ example: "John Doe" }),
      nim: z.string().openapi({ example: "13522005" }),
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
      notes: z.string().openapi({ example: "Mahasiswa aktif" }),
      createdAt: z.string().openapi({
        example: "2025-03-30T09:40:05.508Z",
        description: "Timestamp when the mahasiswa was created",
      }),
    })
    .openapi("MahasiswaSayaDetailResponse"),
});

export const OtaDetailParamsSchema = z.object({
  id: z.string().uuid().openapi({
    description: "ID of the orang tua asuh to retrieve.",
    example: "addd5a71-2b68-4a1c-9479-d7831f57b5ca",
  }),
});

export const OtaDetailResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z
    .string()
    .openapi({ example: "Detail orang tua asuh berhasil diambil" }),
  body: z.object({
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
    name: z.string().openapi({ example: "OTA Organization One" }),
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
  }),
});

export const MyOtaDetailResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z
    .string()
    .openapi({ example: "Detail orang tua asuh berhasil diambil" }),
  body: z
    .object({
      id: z.string().uuid().openapi({
        example: "3fc0317f-f143-43bf-aa65-13a7a8eca788",
      }),
      email: z.string().email().openapi({ example: "johndoe@example.com" }),
      phoneNumber: z.string().openapi({ example: "+6281234567890" }),
      name: z.string().openapi({ example: "OTA Organization One" }),
      transferDate: z.number().openapi({ example: 10 }),
      isDetailVisible: z.boolean().openapi({
        example: true,
        description: "Indicates if the detail is visible to the mahasiswa",
      }),
      createdAt: z.string().openapi({
        example: "2025-03-30T09:40:05.508Z",
        description: "Timestamp when the orang tua asuh was created",
      }),
    })
    .openapi("MyOtaDetailResponse"),
});
