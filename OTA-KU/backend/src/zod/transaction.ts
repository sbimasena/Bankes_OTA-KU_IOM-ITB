import { z } from "@hono/zod-openapi";

import { NIMSchema, PhoneNumberSchema } from "./atomic.js";

export const TransactionListOTAQuerySchema = z.object({
  year: z.coerce
    .number({
      required_error: "Year is required",
      invalid_type_error: "Year must be a number",
    })
    .optional()
    .openapi({
      description: "Year filter",
      example: 2024,
    }),
  month: z.coerce
    .number({
      required_error: "Month is required",
      invalid_type_error: "Month must be a number",
    })
    .optional()
    .openapi({
      description: "Month filter",
      example: 1,
    }),
});

export const TransactionListOTAQueryResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z
    .string()
    .openapi({ example: "Daftar transaction untuk OTA berhasil diambil" }),
  body: z.object({
    data: z.array(
      z
        .object({
          id: z.string().uuid().openapi({
            description: "ID transaksi",
            example: "123e4567-e89b-12d3-a456-426614174000",
          }),
          mahasiswa_id: z.string().uuid().openapi({
            description: "ID transaksi",
            example: "123e4567-e89b-12d3-a456-426614174000",
          }),
          name: z.string().openapi({ example: "John Doe" }),
          nim: NIMSchema,
          bill: z.number().openapi({ example: 300000 }),
          amount_paid: z.number().openapi({ example: 200000 }),
          paid_at: z.string().openapi({ example: "2023-10-01T00:00:00.000Z" }),
          due_date: z.string().openapi({ example: "2023-10-01T00:00:00.000Z" }),
          status: z
            .enum(["unpaid", "pending", "paid"])
            .openapi({ example: "pending" }),
          receipt: z
            .string()
            .openapi({ example: "https://example.com/file.pdf" }),
          rejection_note: z.string().optional().openapi({
            description: "Alasan penolakan verifikasi pembayaran",
            example: "Nominal yang ditransfer tidak sesuai dengan tagihan",
          }),
          paid_for: z.number().openapi({
            description: "Jumlah bulan yang dibayarkan",
            example: 3,
          }),
        })
        .openapi("TransactionOTA"),
    ),
    years: z.array(z.number()).openapi({
      description: "Tahun yang tersedia",
      example: [2024, 2025],
    }),
    totalBill: z.number().openapi({
      description: "Total tagihan",
      example: 300000,
    }),
  }),
});

export const TransactionListAdminQuerySchema = z.object({
  month: z
    .enum([
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ])
    .optional()
    .openapi({
      description: "Month filter",
      example: "June",
    }),
  year: z.coerce
    .number()
    .min(2024, { message: "Year must be 2024 or later." })
    .max(new Date().getFullYear(), { message: `Year cannot be in the future.` })
    .optional()
    .openapi({
      description: "Year filter",
      example: 2024,
    }),
  page: z.coerce.number().optional().openapi({
    description: "Page number for pagination.",
    example: 1,
  }),
  status: z.enum(["unpaid", "pending", "paid"]).optional().openapi({
    description: "Status of transaction.",
    example: "pending",
  }),
});

export const TransactionListAdminQueryResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z
    .string()
    .openapi({ example: "Daftar transaction untuk Admin berhasil diambil" }),
  body: z
    .object({
      data: z.array(
        z
          .object({
            id: z
              .string()
              .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
            mahasiswa_id: z
              .string()
              .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
            ota_id: z
              .string()
              .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
            name_ma: z.string().openapi({ example: "John Doe" }),
            nim_ma: NIMSchema,
            name_ota: z.string().openapi({ example: "Jane Doe" }),
            number_ota: PhoneNumberSchema,
            bill: z.number().openapi({ example: 300000 }),
            amount_paid: z.number().openapi({ example: 200000 }),
            paid_at: z
              .string()
              .openapi({ example: "2023-10-01T00:00:00.000Z" }),
            due_date: z
              .string()
              .openapi({ example: "2023-10-01T00:00:00.000Z" }),
            paid_for: z.number().openapi({
              description: "Jumlah bulan yang dibayarkan",
              example: 3,
            }),
            status: z
              .enum(["unpaid", "pending", "paid"])
              .openapi({ example: "pending" }),
            transferStatus: z
              .enum(["unpaid", "paid"])
              .openapi({ example: "unpaid" }),
            receipt: z
              .string()
              .openapi({ example: "https://example.com/file.pdf" }),
            createdAt: z
              .string()
              .openapi({ example: "2023-10-01T00:00:00.000Z" }),
          })
          .openapi("TransactionListAdminData"),
      ),
      totalData: z.number().openapi({ example: 100 }),
    })
    .openapi("TransactionListAdminSchema"),
});

export const TransactionListVerificationAdminQuerySchema = z.object({
  q: z.string().optional().openapi({
    description: "Query string for searching mahasiswa.",
    example: "John Doe",
  }),
  page: z.coerce.number().optional().openapi({
    description: "Page number for pagination.",
    example: 1,
  }),
  year: z.coerce
    .number({
      required_error: "Year is required",
      invalid_type_error: "Year must be a number",
    })
    .optional()
    .openapi({
      description: "Year filter",
      example: 2024,
    }),
  month: z.coerce
    .number({
      required_error: "Month is required",
      invalid_type_error: "Month must be a number",
    })
    .optional()
    .openapi({
      description: "Month filter",
      example: 1,
    }),
});

export const TransactionListVerificationAdminQueryResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z
    .string()
    .openapi({ example: "Daftar transaction untuk Admin berhasil diambil" }),
  body: z.object({
    data: z.array(
      z
        .object({
          ota_id: z.string().uuid().openapi({
            description: "ID orang tua asuh",
            example: "123e4567-e89b-12d3-a456-426614174000",
          }),
          name_ota: z.string().openapi({ example: "Jane Doe" }),
          number_ota: PhoneNumberSchema,
          totalBill: z.number().openapi({ example: 300000 }),
          transactions: z.array(
            z.object({
              id: z.string().uuid().openapi({
                description: "ID transaksi",
                example: "123e4567-e89b-12d3-a456-426614174000",
              }),
              mahasiswa_id: z.string().uuid().openapi({
                description: "ID mahasiswa asuh",
                example: "123e4567-e89b-12d3-a456-426614174000",
              }),
              name_ma: z.string().openapi({ example: "John Doe" }),
              nim_ma: NIMSchema,
              paidAt: z.string().openapi({
                example: "2023-10-01T00:00:00.000Z",
              }),
              dueDate: z.string().openapi({
                example: "2023-10-01T00:00:00.000Z",
              }),
              bill: z.number().openapi({ example: 300000 }),
              receipt: z.string().openapi({
                example: "https://example.com/file.pdf",
              }),
              rejectionNote: z.string().openapi({
                description: "Alasan penolakan verifikasi pembayaran",
                example: "Nominal yang ditransfer tidak sesuai dengan tagihan",
              }),
              transactionStatus: z.enum(["unpaid", "pending", "paid"]).openapi({
                example: "pending",
              }),
            }),
          ),
        })
        .openapi("TransactionListVerificationAdminData"),
    ),
    years: z.array(z.number()).openapi({
      description: "Tahun yang tersedia",
      example: [2024, 2025],
    }),
    totalData: z.number().openapi({ example: 100 }),
  }),
});

export const TransactionDetailQueryResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z
    .string()
    .openapi({ example: "Detail transaction berhasil diambil" }),
  body: z
    .object({
      nama_ma: z.string().openapi({ example: "John Doe" }),
      nim_ma: NIMSchema,
      fakultas: z.string().openapi({ example: "STEI-K" }), //TODO: kalau ada waktu bikin jadi enum,
      jurusan: z.string().openapi({ example: "Teknik Informatika " }),
      data: z.array(
        z.object({
          tagihan: z.number().openapi({ example: 300000 }),
          pembayaran: z.number().openapi({ example: 200000 }),
          due_date: z.string().openapi({ example: "2023-10-01T00:00:00.000Z" }),
          status_bayar: z
            .enum(["unpaid", "pending", "paid"])
            .openapi({ example: "pending" }),
          bukti_bayar: z
            .string()
            .openapi({ example: "https://example.com/file.pdf" }),
        }),
      ),
      totalData: z.number().openapi({ example: 100 }),
    })
    .openapi("TransactionDetailSchema"),
});

export const DetailTransactionParams = z.object({
  id: z.string().openapi({
    description: "ID mahasiswa asuh yang ingin diperiksa daftar tagihannya",
  }),
  page: z.coerce.number().optional().openapi({
    description: "Page number for pagination.",
    example: 1,
  }),
});

export const UploadReceiptSchema = z.object({
  ids: z
    .string({
      required_error: "ID transaksi harus diisi",
      invalid_type_error: "ID transaksi harus berupa string",
    })
    .transform((val) => {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [val];
      }
    })
    .pipe(
      z.array(
        z.string().uuid({
          message: "ID transaksi tidak valid",
        }),
      ),
    )
    .openapi({
      description: "ID transaksi",
      example:
        '["123e4567-e89b-12d3-a456-426614174000", "123e4567-e89b-12d3-a456-426614174000"]',
    }),
  receipt: z
    .instanceof(File, { message: "Bukti pembayaran harus diisi" })
    .refine(
      (file) =>
        file.type === "application/pdf" || file.type.startsWith("image/"),
      { message: "File harus berupa PDF atau gambar" },
    )
    .transform((file) => file)
    .openapi({
      type: "string",
      format: "binary",
    }),
  paidFor: z.coerce.number().openapi({
    description: "Pembayaran untuk berapa bulan",
    example: 3,
  }),
});

export const UploadReceiptResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example: "Berhasil melakukan upload bukti pembayaran dari OTA",
  }),
  body: z.object({
    bukti_bayar: z
      .string()
      .openapi({ example: "https://example.com/file.pdf" }),
  }),
});

export const VerifyTransactionAcceptSchema = z.object({
  ids: z
    .string({
      required_error: "ID transaksi harus diisi",
      invalid_type_error: "ID transaksi harus berupa string",
    })
    .transform((val) => {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [val];
      }
    })
    .pipe(
      z.array(
        z.string().uuid({
          message: "ID transaksi tidak valid",
        }),
      ),
    )
    .openapi({
      description: "ID transaksi",
      example:
        '["123e4567-e89b-12d3-a456-426614174000", "123e4567-e89b-12d3-a456-426614174000"]',
    }),
  otaId: z
    .string({
      required_error: "ID orang tua asuh harus diisi",
      invalid_type_error: "ID orang tua asuh harus berupa string",
    })
    .uuid({
      message: "ID orang tua asuh tidak valid",
    })
    .openapi({
      description: "ID orang tua asuh",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
});

export const VerifyTransactionRejectSchema = z.object({
  ids: z
    .string({
      required_error: "ID transaksi harus diisi",
      invalid_type_error: "ID transaksi harus berupa string",
    })
    .transform((val) => {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [val];
      }
    })
    .pipe(
      z.array(
        z.string().uuid({
          message: "ID transaksi tidak valid",
        }),
      ),
    )
    .openapi({
      description: "ID transaksi",
      example:
        '["123e4567-e89b-12d3-a456-426614174000", "123e4567-e89b-12d3-a456-426614174000"]',
    }),
  otaId: z
    .string({
      required_error: "ID orang tua asuh harus diisi",
      invalid_type_error: "ID orang tua asuh harus berupa string",
    })
    .uuid({
      message: "ID orang tua asuh tidak valid",
    })
    .openapi({
      description: "ID orang tua asuh",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  rejectionNote: z.string().openapi({
    description:
      "Notes untuk menjelaskan alasan penolakan verifikasi transaction",
    example: "Nominal yang ditransfer tidak sesuai dengan tagihan",
  }),
  amountPaid: z.coerce
    .number()
    .int("Nominal yang telah dibayarkan harus berupa sebuah bilangan bulat")
    .openapi({
      description: "Nominal yang telah dibayarkan",
      example: 300000,
    }),
});

export const VerifyTransactionAccResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example: "Berhasil melakukan accept verifikasi pembayaran",
  }),
  body: z.object({
    ids: z
      .string({
        required_error: "ID transaksi harus diisi",
        invalid_type_error: "ID transaksi harus berupa string",
      })
      .transform((val) => {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return [val];
        }
      })
      .pipe(
        z.array(
          z.string().uuid({
            message: "ID transaksi tidak valid",
          }),
        ),
      )
      .openapi({
        description: "ID transaksi",
        example:
          '["123e4567-e89b-12d3-a456-426614174000", "123e4567-e89b-12d3-a456-426614174000"]',
      }),
    otaId: z.string().uuid().openapi({
      description: "ID orang tua asuh",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    amountPaid: z
      .number()
      .int("Nominal yang dibayarkan harus berupa sebuah bilangan bulat")
      .openapi({
        description: "Nominal yang telah dibayarkan",
        example: 300000,
      }),
  }),
});

export const VerifyTransactionRejectResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example: "Berhasil melakukan accept verifikasi pembayaran",
  }),
  body: z.object({
    ids: z
      .string({
        required_error: "ID transaksi harus diisi",
        invalid_type_error: "ID transaksi harus berupa string",
      })
      .transform((val) => {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return [val];
        }
      })
      .pipe(
        z.array(
          z.string().uuid({
            message: "ID transaksi tidak valid",
          }),
        ),
      )
      .openapi({
        description: "ID transaksi",
        example:
          '["123e4567-e89b-12d3-a456-426614174000", "123e4567-e89b-12d3-a456-426614174000"]',
      }),
    otaId: z.string().uuid().openapi({
      description: "ID orang tua asuh",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    rejectionNote: z.string().openapi({
      description:
        "Notes untuk menjelaskan alasan penolakan verifikasi transaction",
      example: "Nominal yang ditransfer tidak sesuai dengan tagihan",
    }),
    amountPaid: z
      .number()
      .int("Nominal yang dibayarkan harus berupa sebuah bilangan bulat")
      .openapi({
        description: "Nominal yang telah dibayarkan",
        example: 300000,
      }),
  }),
});

export const AcceptTransferStatusSchema = z.object({
  id: z
    .string({
      required_error: "ID transaksi harus diisi",
      invalid_type_error: "ID transaksi harus berupa string",
    })
    .uuid({
      message: "ID transaksi tidak valid",
    })
    .openapi({
      description: "ID transaksi",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
});

export const AcceptTransferStatusResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example: "Berhasil melakukan accept verifikasi pembayaran",
  }),
  body: z.object({
    id: z.string().uuid().openapi({
      description: "ID transaksi",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    status: z.enum(["unpaid", "paid"]).openapi({ example: "paid" }),
  }),
});
