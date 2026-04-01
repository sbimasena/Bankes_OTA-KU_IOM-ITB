import { z } from "@hono/zod-openapi";

// Application Status
export const ApplicationStatusParams = z.object({
  id: z.string().openapi({ description: "ID akun" }),
});

export const ApplicationStatusSchema = z.object({
  status: z
    .enum([
      "accepted",
      "rejected",
      "pending",
      "unregistered",
      "reapply",
      "outdated",
    ])
    .openapi({
      description: "Status aplikasi",
      example: "accepted",
    }),
  bill: z.coerce
    .number({
      invalid_type_error: "Tagihan harus berupa angka",
      required_error: "Tagihan harus diisi",
    })
    .min(0, {
      message: "Tagihan tidak boleh kurang dari 0",
    })
    .optional(),
  notes: z
    .string({
      invalid_type_error: "Catatan untuk Orang Tua Asuh harus berupa string",
      required_error: "Catatan untuk Orang Tua Asuh harus diisi",
    })
    .min(1, {
      message: "Catatan untuk Orang Tua Asuh tidak boleh kosong",
    })
    .optional(),
  adminOnlyNotes: z
    .string({
      invalid_type_error: "Catatan khusus Admin harus berupa string",
      required_error: "Catatan khusus Admin harus diisi",
    })
    .min(1, {
      message: "Catatan khusus Admin tidak boleh kosong",
    })
    .optional(),
});

export const ApplicationStatusSuccessResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example: "Berhasil mengubah status pendaftaran",
  }),
  body: z.object({
    status: z
      .enum([
        "accepted",
        "rejected",
        "pending",
        "unregistered",
        "reapply",
        "outdated",
      ])
      .openapi({
        description: "Status aplikasi",
        example: "accepted",
      }),
  }),
});

// Get Application Status
export const GetApplicationStatusSuccessResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example: "Berhasil mengambil status pendaftaran",
  }),
  body: z.object({
    status: z
      .enum([
        "accepted",
        "rejected",
        "pending",
        "unregistered",
        "reapply",
        "outdated",
      ])
      .openapi({
        description: "Status aplikasi",
        example: "accepted",
      }),
  }),
});

export const GetApplicationStatusForbiddenResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({
    example: "Forbidden",
  }),
  error: z.object({}),
});

// Get Verification Status
export const GetVerificationStatusSuccessResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example: "Berhasil mengambil status verifikasi",
  }),
  body: z.object({
    status: z.enum(["verified", "unverified"]).openapi({
      description: "Status verifikasi",
      example: "verified",
    }),
  }),
});

// Get Reapplication Status
export const GetReapplicationStatusSuccessResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example: "Berhasil mengambil status pendaftaran ulang",
  }),
  body: z.object({
    status: z.boolean().openapi({
      description: "Status pendaftaran ulang",
      example: true,
    }),
    daysRemaining: z.number().openapi({
      description: "Sisa hari hingga batas pendaftaran ulang",
      example: 10,
    }),
  }),
});
