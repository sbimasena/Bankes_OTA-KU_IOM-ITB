import { z } from "zod";

const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const maxImageSize = 5 * 1024 * 1024;

export const TestimonialImageSchema = z
  .instanceof(File)
  .refine((file) => file.size <= maxImageSize, "Ukuran foto maksimal 5MB")
  .refine(
    (file) => allowedImageTypes.includes(file.type.toLowerCase()),
    "Format foto harus JPEG, PNG, atau WEBP",
  );

export const TestimonialFormSchema = z.object({
  content: z
    .string()
    .min(20, "Testimoni minimal 20 karakter")
    .max(1000, "Testimoni maksimal 1000 karakter"),
  images: z.array(TestimonialImageSchema).max(3, "Maksimal 3 foto").optional(),
});
