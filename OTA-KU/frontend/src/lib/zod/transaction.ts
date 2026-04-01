import { z } from "zod";

const allowedPdfTypes = ["application/pdf", "image/png", "image/jpeg"];
const maxPdfSize = 5242880; // 5 MB

export const FileSchema = z
  .instanceof(File, { message: "File harus diisi" })
  .refine((file) => {
    return file.size <= maxPdfSize;
  }, "File size should be less than 5 MB")
  .refine((file) => {
    return allowedPdfTypes.includes(file.type);
  }, "Only PDF, PNG, and JPEG files are allowed");

export const UploadReceiptSchema = z.object({
  ids: z.array(
    z
      .string({
        required_error: "ID transaksi harus diisi",
        invalid_type_error: "ID transaksi harus berupa string",
      })
      .uuid({
        message: "ID transaksi tidak valid",
      }),
  ),
  receipt: FileSchema,
  paidFor: z.coerce
    .number()
    .min(1, { message: "Pembayaran tidak boleh kurang dari 1 bulan" })
    .max(6, { message: "Pembayaran tidak boleh lebih dari 6 bulan" }),
});
