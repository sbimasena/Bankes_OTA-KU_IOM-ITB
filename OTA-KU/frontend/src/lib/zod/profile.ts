import { z } from "zod";

import {
  EmailSchema,
  NIMSchema,
  PasswordSchema,
  PDFSchema,
  PhoneNumberSchema,
  ProfilePDFSchema,
} from "./atomic";

export const MahasiswaRegistrationFormSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Nama harus berupa string",
      required_error: "Nama harus diisi",
    })
    .min(3, { message: "Nama terlalu pendek" })
    .max(255, { message: "Nama terlalu panjang" }),
  phoneNumber: PhoneNumberSchema,
  nim: NIMSchema,
  major: z.enum(
    [
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
    ],
    {
      required_error: "Jurusan harus dipilih",
      invalid_type_error: "Jurusan tidak valid",
    },
  ),
  faculty: z.enum(
    [
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
    ],
    {
      required_error: "Fakultas harus dipilih",
      invalid_type_error: "Fakultas tidak valid",
    },
  ),
  cityOfOrigin: z
    .string({
      required_error: "Asal kota harus diisi",
      invalid_type_error: "Asal kota harus berupa string",
    })
    .min(1, "Asal kota harus diisi")
    .max(255),
  highschoolAlumni: z
    .string({
      required_error: "Asal sekolah harus diisi",
      invalid_type_error: "Asal sekolah harus berupa string",
    })
    .min(1, "Asal sekolah harus diisi")
    .max(255),
  religion: z.enum(
    ["Islam", "Kristen Protestan", "Katolik", "Hindu", "Buddha", "Konghucu"],
    {
      required_error: "Agama harus dipilih",
      invalid_type_error: "Agama tidak valid",
    },
  ),
  gender: z.enum(["M", "F"], {
    required_error: "Jenis kelamin harus dipilih",
    invalid_type_error: "Jenis kelamin tidak valid",
  }),
  gpa: z.coerce
    .number({
      invalid_type_error: "IPK harus berupa angka",
      required_error: "IPK harus diisi",
      message: "IPK harus berupa angka",
    })
    .nonnegative({
      message: "IPK tidak boleh negatif",
    })
    .max(4, { message: "IPK tidak valid" }),
  description: z
    .string({
      required_error: "Deskripsi harus diisi",
      invalid_type_error: "Deskripsi harus berupa string",
    })
    .min(3, { message: "Deskripsi terlalu pendek" }),
  file: PDFSchema,
  kk: PDFSchema,
  ktm: PDFSchema,
  waliRecommendationLetter: PDFSchema,
  transcript: PDFSchema,
  salaryReport: PDFSchema,
  pbb: PDFSchema,
  electricityBill: PDFSchema,
  ditmawaRecommendationLetter: PDFSchema.optional(),
});

export const MahasiswaProfileFormSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Nama harus berupa string",
      required_error: "Nama harus diisi",
    })
    .min(3, { message: "Nama terlalu pendek" })
    .max(255, { message: "Nama terlalu panjang" }),
  phoneNumber: PhoneNumberSchema,
  nim: NIMSchema,
  major: z.enum(
    [
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
    ],
    {
      required_error: "Jurusan harus dipilih",
      invalid_type_error: "Jurusan tidak valid",
    },
  ),
  faculty: z.enum(
    [
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
    ],
    {
      required_error: "Fakultas harus dipilih",
      invalid_type_error: "Fakultas tidak valid",
    },
  ),
  cityOfOrigin: z
    .string({
      required_error: "Asal kota harus diisi",
      invalid_type_error: "Asal kota harus berupa string",
    })
    .min(1, "Asal kota harus diisi")
    .max(255),
  highschoolAlumni: z
    .string({
      required_error: "Asal sekolah harus diisi",
      invalid_type_error: "Asal sekolah harus berupa string",
    })
    .min(1, "Asal sekolah harus diisi")
    .max(255),
  religion: z.enum(
    ["Islam", "Kristen Protestan", "Katolik", "Hindu", "Buddha", "Konghucu"],
    {
      required_error: "Agama harus dipilih",
      invalid_type_error: "Agama tidak valid",
    },
  ),
  gender: z.enum(["M", "F"], {
    required_error: "Jenis kelamin harus dipilih",
    invalid_type_error: "Jenis kelamin tidak valid",
  }),
  gpa: z.coerce
    .number({
      invalid_type_error: "IPK harus berupa angka",
      required_error: "IPK harus diisi",
      message: "IPK harus berupa angka",
    })
    .nonnegative({
      message: "IPK tidak boleh negatif",
    })
    .max(4, { message: "IPK tidak valid" }),
  description: z
    .string({
      required_error: "Deskripsi harus diisi",
      invalid_type_error: "Deskripsi harus berupa string",
    })
    .min(3, { message: "Deskripsi terlalu pendek" }),
  file: ProfilePDFSchema.optional(),
  kk: ProfilePDFSchema.optional(),
  ktm: ProfilePDFSchema.optional(),
  waliRecommendationLetter: ProfilePDFSchema.optional(),
  transcript: ProfilePDFSchema.optional(),
  salaryReport: ProfilePDFSchema.optional(),
  pbb: ProfilePDFSchema.optional(),
  electricityBill: ProfilePDFSchema.optional(),
  ditmawaRecommendationLetter: ProfilePDFSchema.optional(),
});

export const OrangTuaPageOneSchema = z.object({
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
    }),
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
    }),
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
    }),
  linkage: z.enum(["otm", "dosen", "alumni", "lainnya", "none"]),
});

export const OrangTuaPageTwoSchema = z.object({
  funds: z.coerce
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
    }),
  maxCapacity: z.coerce
    .number({
      invalid_type_error: "Kapasitas maksimal harus berupa angka",
      required_error: "Kapasitas maksimal harus diisi",
      message: "Kapasitas maksimal harus berupa angka",
    })
    .nonnegative({
      message: "Kapasitas maksimal harus lebih dari 0",
    }),
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
    ),
  maxSemester: z.coerce
    .number({
      invalid_type_error: "Semester maksimal harus berupa angka",
      required_error: "Semester maksimal harus diisi",
      message: "Semester maksimal harus berupa angka",
    })
    .nonnegative({
      message: "Semester maksimal harus lebih dari 0",
    }),
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
    }),
  criteria: z.string().optional(),
  isDetailVisible: z
    .enum(["true", "false"], {
      required_error: "Checkbox harus diisi",
      invalid_type_error: "Checkbox tidak valid",
    })
    .default("false").optional(),
  allowAdminSelection: z.enum(["true", "false"]).default("false").optional(),
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
    }),
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
    }),
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
    }),
  linkage: z.enum(["otm", "dosen", "alumni", "lainnya", "none"]),
  funds: z.coerce
    .number({
      invalid_type_error: "Dana harus berupa angka",
      required_error: "Dana harus diisi",
      message: "Dana harus berupa angka",
    })
    .nonnegative({
      message: "Dana harus lebih dari 0",
    }),
  maxCapacity: z.coerce
    .number({
      invalid_type_error: "Kapasitas maksimal harus berupa angka",
      required_error: "Kapasitas maksimal harus diisi",
      message: "Kapasitas maksimal harus berupa angka",
    })
    .nonnegative({
      message: "Kapasitas maksimal harus lebih dari 0",
    }),
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
    ),
  maxSemester: z.coerce
    .number({
      invalid_type_error: "Semester maksimal harus berupa angka",
      required_error: "Semester maksimal harus diisi",
      message: "Semester maksimal harus berupa angka",
    })
    .nonnegative({
      message: "Semester maksimal harus lebih dari 0",
    }),
  transferDate: z.coerce
    .number({
      invalid_type_error: "Tanggal transfer harus berupa angka",
      required_error: "Tanggal transfer harus diisi",
      message: "Tanggal transfer harus berupa angka",
    })
    .nonnegative({
      message: "Tanggal transfer harus lebih dari 0",
    })
    .max(31, {
      message: "Tanggal transfer tidak valid",
    }),
  criteria: z.string().optional(),
  isDetailVisible: z
    .enum(["true", "false"], {
      required_error: "Checkbox harus diisi",
      invalid_type_error: "Checkbox tidak valid",
    })
    .default("false").optional(),
  allowAdminSelection: z.enum(["true", "false"]).default("false").optional(),
});

export const CreateBankesPengurusSchema = z
  .object({
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
      }),
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
    type: z.enum(["bankes", "pengurus"], {
      required_error: "Tipe harus dipilih",
      invalid_type_error: "Tipe tidak valid",
    }),
    phoneNumber: PhoneNumberSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Kata sandi tidak cocok",
    path: ["confirmPassword"],
  });
