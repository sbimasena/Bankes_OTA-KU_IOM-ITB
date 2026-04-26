import { z } from "@hono/zod-openapi";

export const TestimonialStatusSchema = z.enum([
  "pending",
  "confirmed",
]);

export const GetMyTestimonialQuerySchema = z.object({
  periodId: z.coerce.number().int().min(1).optional(),
  status: TestimonialStatusSchema.optional(),
});

export const UpsertTestimonialSchema = z.object({
  content: z
    .string({
      required_error: "Isi testimoni harus diisi",
      invalid_type_error: "Isi testimoni harus berupa string",
    })
    .min(20, { message: "Isi testimoni minimal 20 karakter" })
    .max(1000, { message: "Isi testimoni maksimal 1000 karakter" }),
  images: z.any().optional().openapi({
    type: "array",
    items: {
      type: "string",
      format: "binary",
    },
  }),
});

export const TestimonialMeResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Berhasil mengambil testimoni saya" }),
  body: z
    .object({
      currentPeriodId: z.number().int().nullable(),
      periods: z.array(
        z.object({
          id: z.number().int(),
          period: z.string(),
          isCurrent: z.boolean(),
        }),
      ),
      testimonial: z
        .object({
          id: z.string().uuid(),
          periodId: z.number().int(),
          periodLabel: z.string(),
          content: z.string(),
          images: z.array(z.string()).openapi({ example: [] }),
          status: TestimonialStatusSchema,
          isActive: z.boolean(),
          reviewedAt: z.string().nullable(),
          updatedAt: z.string(),
        })
        .nullable(),
      history: z.array(
        z.object({
          id: z.string().uuid(),
          periodId: z.number().int(),
          periodLabel: z.string(),
          status: TestimonialStatusSchema,
          isActive: z.boolean(),
          updatedAt: z.string(),
        }),
      ),
    })
    .openapi("TestimonialMeResponse"),
});

export const UpsertTestimonialResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Berhasil menyimpan testimoni" }),
  body: z.object({
    id: z.string().uuid(),
    periodId: z.number().int(),
    status: TestimonialStatusSchema,
  }),
});

export const ListModerationTestimonialQuerySchema = z.object({
  q: z.string().optional().openapi({ example: "andi" }),
  page: z.coerce.number().min(1).optional().openapi({ example: 1 }),
  status: TestimonialStatusSchema.optional(),
  periodId: z.coerce.number().int().min(1).optional(),
});

export const ListModerationTestimonialResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z
    .string()
    .openapi({ example: "Berhasil mengambil daftar moderasi testimoni" }),
  body: z.object({
    totalData: z.number().openapi({ example: 10 }),
    periods: z.array(
      z.object({
        id: z.number().int(),
        period: z.string(),
        isCurrent: z.boolean(),
      }),
    ),
    data: z.array(
      z
        .object({
          id: z.string().uuid(),
          mahasiswaId: z.string().uuid(),
          periodId: z.number().int(),
          periodLabel: z.string(),
          name: z.string(),
          nim: z.string(),
          major: z.string().nullable(),
          content: z.string(),
          images: z.array(z.string()),
          status: TestimonialStatusSchema,
          isActive: z.boolean(),
          approvedByName: z.string().nullable(),
          reviewedAt: z.string().nullable(),
          updatedAt: z.string(),
        })
        .openapi("ModerationTestimonialData"),
    ),
  }),
});

export const ReviewTestimonialParamsSchema = z.object({
  id: z.string().uuid(),
});

export const ReviewTestimonialBodySchema = z.object({
  status: z.literal("confirmed"),
});

export const ReviewTestimonialResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Berhasil memoderasi testimoni" }),
  body: z.object({
    id: z.string().uuid(),
    status: TestimonialStatusSchema,
  }),
});

export const ToggleTestimonialActiveParamsSchema = z.object({
  id: z.string().uuid(),
});

export const ToggleTestimonialActiveBodySchema = z.object({
  isActive: z
    .union([z.boolean(), z.string().transform((val) => val === "true")])
    .transform((val) => Boolean(val)),
});

export const ToggleTestimonialActiveResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Berhasil mengubah visibilitas testimoni" }),
  body: z.object({
    id: z.string().uuid(),
    isActive: z.boolean(),
  }),
});

export const PublicTestimonialQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(20).optional().openapi({ example: 10 }),
});

export const PublicTestimonialResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Berhasil mengambil testimoni publik" }),
  body: z.object({
    data: z.array(
      z
        .object({
          id: z.string().uuid(),
          major: z.string().nullable(),
          faculty: z.string().nullable(),
          content: z.string(),
          images: z.array(z.string()),
          reviewedAt: z.string().nullable(),
        })
        .openapi("PublicTestimonialData"),
    ),
  }),
});
