import { z } from "zod";

import { getNimFakultasCodeMap, getNimJurusanCodeMap } from "../nim";

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
  z.instanceof(File, { message: "File harus diupload" })
    .refine((file) => file.type === "application/pdf", {
      message: "File harus berupa PDF",
    }),
  z.string().url(), // Menerima URL string
  z.undefined() // Benar-benar opsional
]);

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
  );

export const TokenSchema = z.string();

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
  });
