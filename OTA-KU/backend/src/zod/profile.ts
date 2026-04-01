import { z } from "@hono/zod-openapi";

import { fakultasEnum, jurusanEnum } from "../db/schema.js";
import {
  EmailSchema,
  NIMSchema,
  PDFSchema,
  PasswordSchema,
  PhoneNumberSchema,
  ProfilePDFSchema,
  cloudinaryUrlSchema,
} from "./atomic.js";

// Mahasiswa Registration
export const MahasiswaRegistrationParams = z.object({
  id: z.string().openapi({ description: "ID akun" }),
});

export const MahasiswaRegistrationSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Nama harus berupa string",
      required_error: "Nama harus diisi",
    })
    .min(3, { message: "Nama terlalu pendek" })
    .max(255, { message: "Nama terlalu panjang" })
    .openapi({ example: "John Doe", description: "Nama mahasiswa" }),
  nim: NIMSchema,
  major: z
    .enum(jurusanEnum.enumValues, {
      required_error: "Jurusan harus dipilih",
      invalid_type_error: "Jurusan tidak valid",
    })
    .openapi({
      example: "Teknik Informatika",
      description: "Jurusan mahasiswa",
    }),
  faculty: z
    .enum(fakultasEnum.enumValues, {
      required_error: "Fakultas harus dipilih",
      invalid_type_error: "Fakultas tidak valid",
    })
    .openapi({ example: "STEI-R", description: "Fakultas mahasiswa" }),
  cityOfOrigin: z
    .string()
    .min(1, "Asal kota harus diisi")
    .max(255)
    .openapi({ example: "Bandung", description: "Kota asal mahasiswa" }),
  highschoolAlumni: z
    .string()
    .min(1, "Asal sekolah harus diisi")
    .max(255)
    .openapi({ example: "SMA Negeri 1 Bandung", description: "Asal SMA" }),
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
  gpa: z.coerce
    .number({
      invalid_type_error: "IPK harus berupa angka",
      required_error: "IPK harus diisi",
      message: "IPK harus berupa angka",
    })
    .nonnegative({
      message: "IPK tidak boleh negatif",
    })
    .max(4, { message: "IPK tidak valid" })
    .openapi({ example: 3.5, description: "IPK mahasiswa" }),
  description: z
    .string({
      required_error: "Deskripsi harus diisi",
      invalid_type_error: "Deskripsi harus berupa string",
    })
    .min(3, { message: "Deskripsi terlalu pendek" })
    .openapi({ example: "Mahasiswa baru", description: "Deskripsi mahasiswa" }),
  file: cloudinaryUrlSchema("File Essay Mahasiswa"),
  kk: cloudinaryUrlSchema("Kartu Keluarga"),
  ktm: cloudinaryUrlSchema("Kartu Tanda Mahasiswa"),
  waliRecommendationLetter: cloudinaryUrlSchema("Surat Rekomendasi Wali"),
  transcript: cloudinaryUrlSchema("Transkrip Nilai"),
  salaryReport: cloudinaryUrlSchema("Slip Gaji Orang Tua"),
  pbb: cloudinaryUrlSchema("Bukti Pembayaran PBB"),
  electricityBill: cloudinaryUrlSchema("Tagihan Listrik"),
  ditmawaRecommendationLetter: cloudinaryUrlSchema("Surat Rekomendasi Ditmawa"),
});

export const MahasiswaRegistrationFormSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Nama harus berupa string",
      required_error: "Nama harus diisi",
    })
    .min(3, { message: "Nama terlalu pendek" })
    .max(255, { message: "Nama terlalu panjang" })
    .openapi({ example: "John Doe", description: "Nama mahasiswa" }),
  phoneNumber: PhoneNumberSchema,
  nim: NIMSchema,
  major: z
    .enum(jurusanEnum.enumValues, {
      required_error: "Jurusan harus dipilih",
      invalid_type_error: "Jurusan tidak valid",
    })
    .openapi({
      example: "Teknik Informatika",
      description: "Jurusan mahasiswa",
    }),
  faculty: z
    .enum(fakultasEnum.enumValues, {
      required_error: "Fakultas harus dipilih",
      invalid_type_error: "Fakultas tidak valid",
    })
    .openapi({ example: "STEI-R", description: "Fakultas mahasiswa" }),
  cityOfOrigin: z
    .string()
    .min(1, "Asal kota harus diisi")
    .max(255)
    .openapi({ example: "Bandung", description: "Kota asal mahasiswa" }),
  highschoolAlumni: z
    .string()
    .min(1, "Asal sekolah harus diisi")
    .max(255)
    .openapi({ example: "SMA Negeri 1 Bandung", description: "Asal SMA" }),
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
  gpa: z.coerce
    .number({
      invalid_type_error: "IPK harus berupa angka",
      required_error: "IPK harus diisi",
      message: "IPK harus berupa angka",
    })
    .nonnegative({
      message: "IPK tidak boleh negatif",
    })
    .max(4, { message: "IPK tidak valid" })
    .openapi({ example: 3.5, description: "IPK mahasiswa" }),
  description: z
    .string({
      required_error: "Deskripsi harus diisi",
      invalid_type_error: "Deskripsi harus berupa string",
    })
    .min(3, { message: "Deskripsi terlalu pendek" })
    .openapi({ example: "Mahasiswa baru", description: "Deskripsi mahasiswa" }),
  file: PDFSchema.openapi({ description: "File Essay Mahasiswa" }),
  kk: PDFSchema.openapi({ description: "Kartu Keluarga" }),
  ktm: PDFSchema.openapi({ description: "Kartu Tanda Mahasiswa" }),
  waliRecommendationLetter: PDFSchema.openapi({
    description: "Surat Rekomendasi Wali",
  }),
  transcript: PDFSchema.openapi({ description: "Transkrip Nilai" }),
  salaryReport: PDFSchema.openapi({ description: "Slip Gaji Orang Tua" }),
  pbb: PDFSchema.openapi({ description: "Bukti Pembayaran PBB" }),
  electricityBill: PDFSchema.openapi({ description: "Tagihan Listrik" }),
  ditmawaRecommendationLetter: PDFSchema.optional().openapi({
    description: "Surat Rekomendasi Ditmawa",
  }),
});

export const MahasiswaProfileFormSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Nama harus berupa string",
      required_error: "Nama harus diisi",
    })
    .min(3, { message: "Nama terlalu pendek" })
    .max(255, { message: "Nama terlalu panjang" })
    .openapi({ example: "John Doe", description: "Nama mahasiswa" }),
  phoneNumber: PhoneNumberSchema,
  nim: NIMSchema,
  major: z
    .enum(jurusanEnum.enumValues, {
      required_error: "Jurusan harus dipilih",
      invalid_type_error: "Jurusan tidak valid",
    })
    .openapi({
      example: "Teknik Informatika",
      description: "Jurusan mahasiswa",
    }),
  faculty: z
    .enum(fakultasEnum.enumValues, {
      required_error: "Fakultas harus dipilih",
      invalid_type_error: "Fakultas tidak valid",
    })
    .openapi({ example: "STEI-R", description: "Fakultas mahasiswa" }),
  cityOfOrigin: z
    .string()
    .min(1, "Asal kota harus diisi")
    .max(255)
    .openapi({ example: "Bandung", description: "Kota asal mahasiswa" }),
  highschoolAlumni: z
    .string()
    .min(1, "Asal sekolah harus diisi")
    .max(255)
    .openapi({ example: "SMA Negeri 1 Bandung", description: "Asal SMA" }),
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
  gpa: z.coerce
    .number({
      invalid_type_error: "IPK harus berupa angka",
      required_error: "IPK harus diisi",
      message: "IPK harus berupa angka",
    })
    .nonnegative({
      message: "IPK tidak boleh negatif",
    })
    .max(4, { message: "IPK tidak valid" })
    .openapi({ example: 3.5, description: "IPK mahasiswa" }),
  description: z
    .string({
      required_error: "Deskripsi harus diisi",
      invalid_type_error: "Deskripsi harus berupa string",
    })
    .min(3, { message: "Deskripsi terlalu pendek" })
    .openapi({ example: "Mahasiswa baru", description: "Deskripsi mahasiswa" }),
  file: ProfilePDFSchema.openapi({
    description: "File Essay Mahasiswa",
  }).optional(),
  kk: ProfilePDFSchema.openapi({ description: "Kartu Keluarga" }).optional(),
  ktm: ProfilePDFSchema.openapi({
    description: "Kartu Tanda Mahasiswa",
  }).optional(),
  waliRecommendationLetter: ProfilePDFSchema.openapi({
    description: "Surat Rekomendasi Wali",
  }).optional(),
  transcript: ProfilePDFSchema.openapi({
    description: "Transkrip Nilai",
  }).optional(),
  salaryReport: ProfilePDFSchema.openapi({
    description: "Slip Gaji Orang Tua",
  }).optional(),
  pbb: ProfilePDFSchema.openapi({
    description: "Bukti Pembayaran PBB",
  }).optional(),
  electricityBill: ProfilePDFSchema.openapi({
    description: "Tagihan Listrik",
  }).optional(),
  ditmawaRecommendationLetter: ProfilePDFSchema.openapi({
    description: "Surat Rekomendasi Ditmawa",
  }).optional(),
});

export const MahasiswaRegistrationSuccessfulResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Berhasil mendaftar" }),
  body: MahasiswaRegistrationSchema,
});

export const MahasiswaRegistrationFailedResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Gagal mendaftar" }),
  error: z.object({}),
});

export const UnverifiedResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Akun MA belum terverifikasi" }),
  error: z.object({}),
});

export const MahasiswaNotFoundResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Mahasiswa tidak ditemukan" }),
  error: z.object({}),
});

// Orang Tua Registration
export const OrangTuaRegistrationParams = z.object({
  id: z.string().openapi({ description: "ID akun" }),
});

export const OrangTuaRegistrationSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Nama harus berupa string",
      required_error: "Nama harus diisi",
    })
    .min(3, {
      message: "Nama terlalu pendek",
    })
    .max(255, {
      message: "Nama terlalu panjang",
    })
    .openapi({ example: "John Doe", description: "Nama orang tua" }),
  job: z
    .string({
      invalid_type_error: "Pekerjaan harus berupa string",
      required_error: "Pekerjaan harus diisi",
    })
    .min(3, {
      message: "Pekerjaan terlalu pendek",
    })
    .max(255, {
      message: "Pekerjaan terlalu panjang",
    })
    .openapi({ example: "Guru", description: "Pekerjaan orang tua" }),
  address: z
    .string({
      invalid_type_error: "Alamat harus berupa string",
      required_error: "Alamat harus diisi",
    })
    .min(3, {
      message: "Alamat terlalu pendek",
    })
    .max(255, {
      message: "Alamat terlalu panjang",
    })
    .openapi({ example: "Jl. Merdeka No. 1", description: "Alamat orang tua" }),
  linkage: z.enum(["otm", "dosen", "alumni", "lainnya", "none"]).openapi({
    example: "otm",
    description: "Hubungan dengan mahasiswa",
  }),
  funds: z.coerce
    //TODO: gimana caranya biar ini facilitate integer values only tapi ga float
    .number({
      invalid_type_error: "Dana harus berupa angka",
      required_error: "Dana harus diisi",
      message: "Dana harus berupa angka",
    })
    .nonnegative({
      message: "Dana harus lebih dari 0",
    })
    .min(300000, {
      message: "Dana harus lebih dari Rp 300.000",
    })
    .openapi({ example: 1000000, description: "Dana yang disediakan" }),
  maxCapacity: z.coerce
    .number({
      invalid_type_error: "Kapasitas maksimal harus berupa angka",
      required_error: "Kapasitas maksimal harus diisi",
      message: "Kapasitas maksimal harus berupa angka",
    })
    .nonnegative({
      message: "Kapasitas maksimal harus lebih dari 0",
    })
    .openapi({ example: 10, description: "Kapasitas maksimal" }),
  startDate: z
    .string({
      invalid_type_error: "Tanggal invalid",
      required_error: "Tanggal harus diisi",
      message: "Tanggal harus berupa string",
    })
    .refine(
      (value) => {
        const date = new Date(value);
        return date instanceof Date && !isNaN(date.getTime());
      },
      {
        message: "Tanggal tidak valid",
        path: ["startDate"],
      },
    )
    .openapi({ example: "2022-01-01", description: "Tanggal mulai" }),
  maxSemester: z.coerce
    .number({
      invalid_type_error: "Semester maksimal harus berupa angka",
      required_error: "Semester maksimal harus diisi",
      message: "Semester maksimal harus berupa angka",
    })
    .nonnegative({
      message: "Semester maksimal harus lebih dari 0",
    })
    .openapi({ example: 8, description: "Semester maksimal" }),
  transferDate: z.coerce
    .number({
      invalid_type_error: "Tanggal transfer harus berupa angka",
      required_error: "Tanggal transfer harus diisi",
      message: "Tanggal transfer harus berupa angka",
    })
    .nonnegative({
      message: "Tanggal transfer harus lebih dari 0",
    })
    .max(28, {
      message: "Tanggal transfer tidak valid",
    })
    .openapi({ example: 1, description: "Tanggal transfer" }),
  criteria: z
    .string()
    .optional()
    .openapi({ example: "Mahasiswa dari daerah Indonesia Timur" }),
  isDetailVisible: z
    .enum(["true", "false"], {
      required_error: "Checkbox harus diisi",
      invalid_type_error: "Checkbox tidak valid",
    })
    .default("false")
    .openapi({
      example: "true",
    }),
  allowAdminSelection: z
    .enum(["true", "false"], {
      required_error: "Checkbox harus diisi",
      invalid_type_error: "Checkbox tidak valid",
    })
    .default("false")
    .openapi({
      example: "true",
    }),
});

export const createBankesPengurusSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Nama harus berupa string",
      required_error: "Nama harus diisi",
    })
    .min(3, {
      message: "Nama terlalu pendek",
    })
    .max(255, {
      message: "Nama terlalu panjang",
    })
    .openapi({ example: "John Doe", description: "Nama dari bankes atau pengurus" }),
  email: EmailSchema,
  password: PasswordSchema,
  type: z.enum(["bankes", "pengurus"]).openapi({
    example: "bankes",
    description: "Jenis akun",
  }),
  phoneNumber: PhoneNumberSchema
});

export const createBankesPengurusResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Berhasil membuat akun bankes/pengurus" }),
  body: z.object({
    id: z.string().openapi({ description: "ID akun" }), 
    name: z
      .string({
        invalid_type_error: "Nama harus berupa string",
        required_error: "Nama harus diisi",
      })
      .min(3, {
        message: "Nama terlalu pendek",
      })
      .max(255, {
        message: "Nama terlalu panjang",
      })
      .openapi({ example: "John Doe", description: "Nama dari bankes atau pengurus" }),
    email: EmailSchema,
    type: z.enum([  "mahasiswa", "ota", "admin", "bankes", "pengurus"]).openapi({
      example: "bankes",
      description: "Jenis akun",
    }),
    phoneNumber: PhoneNumberSchema,
    provider: z
      .enum(["credentials", "azure"])
      .openapi({ example: "credentials" }),
    status: z
      .enum(["verified", "unverified"])
      .openapi({ example: "verified" }),
    application_status: z
      .enum([ "accepted", "rejected", "pending", "unregistered", "reapply", "outdated"])
      .openapi({ example: "accepted" })
  })
})

export const OrangTuaRegistrationSuccessfulResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Berhasil mendaftar" }),
  body: OrangTuaRegistrationSchema,
});

export const OrangTuaRegistrationFailedResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Gagal mendaftar" }),
  error: z.object({}),
});

export const OrangTuaNotFoundResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Orang tua tidak ditemukan" }),
  error: z.object({}),
});

export const ProfileOrangTuaResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Berhasil mengakses profil OTA" }),
  body: z.object({
    name: z.string().openapi({ example: "Budi Santoso" }),
    email: EmailSchema,
    phone_number: PhoneNumberSchema,
    join_date: z.string().openapi({ example: "March 2025" }),
    job: z.string().optional().openapi({ example: "Dokter" }),
    address: z
      .string()
      .optional()
      .openapi({ example: "Jl. Ganesha No. 10, Bandung" }),
    linkage: z.string().optional().openapi({ example: "alumni" }),
    funds: z.number().optional().openapi({ example: 500000 }),
    maxCapacity: z.number().optional().openapi({ example: 2 }),
    startDate: z.string().optional().openapi({ example: "2025-01-01" }),
    maxSemester: z.number().optional().openapi({ example: 8 }),
    transferDate: z.number().optional().openapi({ example: 10 }),
    criteria: z
      .string()
      .optional()
      .openapi({ example: "Mahasiswa dari daerah Indonesia Timur" }),
    isDetailVisible: z
      .boolean({
        required_error: "Checkbox harus diisi",
      })
      .optional()
      .openapi({
        example: true,
      }),
    allowAdminSelection: z
      .boolean({
        required_error: "Checkbox harus diisi",
      })
      .optional()
      .openapi({
        example: true,
      }),
  }),
});

export const ProfileMahasiswaResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Berhasil mengakses profil MA" }),
  body: z.object({
    name: z.string().openapi({ example: "Alex Kurniawan" }),
    email: EmailSchema,
    phone_number: PhoneNumberSchema,
    nim: z.string().optional().openapi({ example: "13520001" }),
    major: z.string().optional().openapi({ example: "Teknik Informatika" }),
    faculty: z.string().optional().openapi({ example: "STEI-K" }),
    cityOfOrigin: z.string().optional().openapi({ example: "Bandung" }),
    highschoolAlumni: z
      .string()
      .optional()
      .openapi({ example: "SMAN 3 Bandung" }),
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
    gpa: z.number().openapi({ example: 3.5 }),
    description: z
      .string()
      .optional()
      .openapi({ example: "Membutuhkan bantuan biaya kuliah" }),
    file: z
      .string()
      .optional()
      .openapi({ example: "https://res.cloudinary.com/example/file.pdf" }),
    kk: z
      .string()
      .optional()
      .openapi({ example: "https://res.cloudinary.com/example/kk.pdf" }),
    ktm: z
      .string()
      .optional()
      .openapi({ example: "https://res.cloudinary.com/example/ktm.pdf" }),
    waliRecommendationLetter: z
      .string()
      .optional()
      .openapi({ example: "https://res.cloudinary.com/example/wali.pdf" }),
    transcript: z.string().optional().openapi({
      example: "https://res.cloudinary.com/example/transcript.pdf",
    }),
    salaryReport: z
      .string()
      .optional()
      .openapi({ example: "https://res.cloudinary.com/example/salary.pdf" }),
    pbb: z
      .string()
      .optional()
      .openapi({ example: "https://res.cloudinary.com/example/pbb.pdf" }),
    electricityBill: z.string().optional().openapi({
      example: "https://res.cloudinary.com/example/electricity.pdf",
    }),
    ditmawaRecommendationLetter: z
      .string()
      .optional()
      .openapi({ example: "https://res.cloudinary.com/example/ditmawa.pdf" }),
    createdAt: z
      .string()
      .optional()
      .openapi({ example: "2025-01-01T00:00:00.000Z" }),
    updatedAt: z
      .string()
      .optional()
      .openapi({ example: "2025-01-01T00:00:00.000Z" }),
    dueNextUpdateAt: z
      .string()
      .optional()
      .openapi({ example: "2025-01-01T00:00:00.000Z" }),
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
        example: "accepted",
        description: "Status aplikasi mahasiswa",
      })
  }),
});

export const DeleteAccountParamsSchema = z.object({
  id: z.string().openapi({
    example: "3762d870-158e-4832-804c-f0be220d40c0",
    description: "Unique account ID",
  }),
});

export const DeleteAccountSuccessfulResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Berhasil menghapus akun" }),
  body: DeleteAccountParamsSchema,
});
