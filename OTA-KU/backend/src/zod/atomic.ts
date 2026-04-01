import { z } from "@hono/zod-openapi";

import { getNimFakultasCodeMap, getNimJurusanCodeMap } from "../lib/nim.js";

const allowedPdfTypes = ["application/pdf"];
const maxPdfSize = 5242880; // 5 MB

export const PDFSchema = z
  .instanceof(File, { message: "File harus berupa PDF" })
  .refine((file) => {
    return file.size <= maxPdfSize;
  }, "PDF file size should be less than 5 MB")
  .refine((file) => {
    return allowedPdfTypes.includes(file.type);
  }, "Only PDF files are allowed");

export const ProfilePDFSchema = z.union([
  z.instanceof(File, { message: "File harus berupa PDF" })
    .refine((file) => {
      return file.size <= maxPdfSize;
    }, "PDF file size should be less than 5 MB")
    .refine((file) => {
      return allowedPdfTypes.includes(file.type);
    }, "Only PDF files are allowed"),
  z.string().min(1, { message: "PDF string tidak boleh kosong" })
])
.optional()
.openapi({ description: "PDF file or string (optional)", format: "binary" });

export const EmailSchema = z
  .string({
    invalid_type_error: "Email harus berupa string",
    required_error: "Email harus diisi",
  })
  .email({
    message: "Format email tidak valid",
  })
  .max(255, {
    message: "Email terlalu panjang",
  })
  .openapi({
    example: "johndoe@example.com",
    description: "The user's email.",
  });

export const PhoneNumberSchema = z
  .string({
    invalid_type_error: "Nomor telepon harus berupa string",
    required_error: "Nomor telepon harus diisi",
  })
  .max(32, {
    message: "Nomor telepon terlalu panjang",
  })
  .regex(/^62\d{6,12}$/, {
    message: "Hanya dapat menggunakan nomor telepon Indonesia (62XXXXXXXXXX)",
  })
  .openapi({
    example: "6281234567890",
    description: "Nomor telepon pengguna yang dimulai dengan 62.",
  });

export const PasswordSchema = z
  .string({
    invalid_type_error: "Password harus berupa string",
    required_error: "Password harus diisi",
  })
  .min(8, {
    message: "Password minimal 8 karakter",
  })
  .max(128, {
    message: "Password terlalu panjang (maksimal 128 karakter)",
  })
  .regex(/^(?=.*[a-z])/, {
    message: "Password harus mengandung huruf kecil",
  })
  .regex(/^(?=.*[A-Z])/, {
    message: "Password harus mengandung huruf besar",
  })
  .regex(/^(?=.*\d)/, {
    message: "Password harus mengandung angka",
  })
  .regex(
    /^(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?])/,
    {
      message:
        "Password harus mengandung simbol.\nSimbol yang diperbolehkan: ! @ # $ % ^ & * ( ) _ - + = [ ] { } ; ' : \" \\ | , . < > / ?",
    }
  )
  .openapi({
    example: "Secret123!",
    description:
      "Password minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol.\nSimbol yang diperbolehkan: ! @ # $ % ^ & * ( ) _ - + = [ ] { } ; ' : \" \\ | , . < > / ?",
  });

export const TokenSchema = z.string().openapi({
  example: "eyJhbGciOiJIUzI1...",
  description: "JWT token for authentication.",
});

export const validNimPrefixes = new Set([
  ...Object.keys(getNimJurusanCodeMap()),
  ...Object.keys(getNimFakultasCodeMap()),
]);

export const NIMSchema = z
  .string({
    invalid_type_error: "NIM harus berupa string",
    required_error: "NIM harus diisi",
  })
  .length(8, {
    message: "NIM harus 8 karakter",
  })
  .regex(/^\d{8}$/, {
    message: "Format NIM tidak valid",
  })
  .refine((nim) => validNimPrefixes.has(nim.slice(0, 3)), {
    message: "Kode fakultas/jurusan NIM tidak valid",
  })
  .openapi({ example: "13522005", description: "Nomor Induk Mahasiswa" });

export function cloudinaryUrlSchema(description: string) {
  return z
    .string({
      required_error: `${description} harus diisi`,
      invalid_type_error: `${description} harus berupa string`,
    })
    .url({ message: `${description} harus berupa URL` })
    .regex(/^https:\/\/res\.cloudinary\.com/, {
      message: `${description} harus berupa URL dari cloudinary`,
    })
    .openapi({
      example: "https://res.cloudinary.com/your-image.pdf",
      description,
    });
}
