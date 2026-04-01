import { z } from "@hono/zod-openapi";

export const TerminateRequestSchema = z.object({
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
  mahasiswaId: z
    .string({
      required_error: "ID mahasiswa asuh harus diisi",
      invalid_type_error: "ID mahasiswa asuh harus berupa string",
    })
    .uuid({
      message: "ID mahasiswa asuh tidak valid",
    })
    .openapi({
      description: "ID mahasiswa asuh",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  requestTerminationNote: z
    .string({
      required_error: "Catatan request terminasi harus diisi",
      invalid_type_error: "Catatan request terminasi harus berupa string",
    })
    .min(1, {
      message: "Catatan request terminasi tidak boleh kosong",
    })
    .openapi({
      description: "Catatan request terminasi",
      example: "Request terminasi hubungan",
    }),
});

export const verifTerminateRequestSchema = z.object({
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
  mahasiswaId: z
    .string({
      required_error: "ID mahasiswa asuh harus diisi",
      invalid_type_error: "ID mahasiswa asuh harus berupa string",
    })
    .uuid({
      message: "ID mahasiswa asuh tidak valid",
    })
    .openapi({
      description: "ID mahasiswa asuh",
      example: "123e4567-e89b-12d3-a456-426614174000",
    })
});

export const listTerminateQuerySchema = z.object({
  q: z.string().optional().openapi({
    description: "Query string for searching mahasiswa.",
    example: "John Doe",
  }),
  page: z.coerce.number().optional().openapi({
    description: "Page number for pagination.",
    example: 1,
  }),
});

export const listTerminateForAdminResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example: "Daftar request terminasi untuk Admin berhasil diambil",
  }),
  body: z.object({
    data: z.array(
      z.object({
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
        otaName: z.string().openapi({ example: "John Doe " }),
        otaNumber: z.string().openapi({ example: "6281234567890" }),
        mahasiswaId: z
          .string({
            required_error: "ID mahasiswa asuh harus diisi",
            invalid_type_error: "ID mahasiswa asuh harus berupa string",
          })
          .uuid({
            message: "ID mahasiswa asuh tidak valid",
          })
          .openapi({
            description: "ID mahasiswa asuh",
            example: "123e4567-e89b-12d3-a456-426614174000",
          }),
        maName: z.string().openapi({ example: "Jane Doe " }),
        maNIM: z.string().openapi({ example: "13522005" }),
        createdAt: z
          .string()
          .openapi({ example: "2025-05-12 05:38:29.984502" }),
        requestTerminateOTA: z.boolean().openapi({ example: true }),
        requestTerminateMA: z.boolean().openapi({ example: false }),
        requestTerminationNoteOTA: z
          .string()
          .openapi({ example: "Request terminasi hubungan dari OTA" }),
        requestTerminationNoteMA: z
          .string()
          .openapi({ example: "Request terminasi hubungan dari MA" }),
      })
      .openapi("ListTerminateForAdmin"),
    ),
  }),
});

export const listTerminateForOTAResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example: "Daftar request terminasi untuk OTA berhasil diambil",
  }),
  body: z.object({
    data: z.array(
      z.object({
        mahasiswaId: z
          .string({
            required_error: "ID mahasiswa asuh harus diisi",
            invalid_type_error: "ID mahasiswa asuh harus berupa string",
          })
          .uuid({
            message: "ID mahasiswa asuh tidak valid",
          })
          .openapi({
            description: "ID mahasiswa asuh",
            example: "123e4567-e89b-12d3-a456-426614174000",
          }),
        maName: z.string().openapi({ example: "Jane Doe " }),
        maNIM: z.string().openapi({ example: "13522005" }),
        requestTerminationNoteOTA: z.string().openapi({
          example: "Request terminasi hubungan dari OTA",
        }),
        requestTerminationNoteMA: z.string().openapi({
          example: "Request terminasi hubungan dari MA",
        }),
        requestTerminateMa: z.boolean().openapi({ example: true }),
        requestTerminateOta: z.boolean().openapi({ example: false }),
        createdAt: z
          .string()
          .openapi({ example: "2025-05-12 05:38:29.984502" }),
      })
      .openapi("ListTerminateForOTA"),
    ),
  }),
});

export const terminationStatusMA = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z
    .string()
    .openapi({ example: "Status terminasi untuk MA berhasil diambil" }),
  body: z.object({
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
    otaName: z.string().openapi({ example: "John Doe " }),
    connectionStatus: z.string().openapi({ example: "pending" }),
    requestTerminationNoteOTA: z.string().openapi({
      example: "Request terminasi hubungan dari OTA",
    }),
    requestTerminationNoteMA: z.string().openapi({
      example: "Request terminasi hubungan dari MA",
    }),
    requestTerminateOTA: z.boolean().openapi({ example: true }),
    requestTerminateMA: z.boolean().openapi({ example: false }),
  }),
});

export const requestTerminateMASuccessResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example: "Berhasil mengirimkan request terminasi hubungan dari MA",
  }),
  body: z.object({
    mahasiswaId: z.string().uuid().openapi({
      description: "ID mahasiswa asuh",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    otaId: z.string().uuid().openapi({
      description: "ID orang tua asuh",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  }),
});

export const requestTerminateMAFailedResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({
    example: "Gagal mengirimkan request terminasi hubungan dari MA",
  }),
  error: z.object({}),
});

export const requestTerminateOTASuccessResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example: "Berhasil mengirimkan request terminasi hubungan dari OTA",
  }),
  body: z.object({
    mahasiswaId: z.string().uuid().openapi({
      description: "ID mahasiswa asuh",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    otaId: z.string().uuid().openapi({
      description: "ID orang tua asuh",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  }),
});

export const requestTerminateOTAFailedResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({
    example: "Gagal mengirimkan request terminasi hubungan dari OTA",
  }),
  error: z.object({}),
});

export const validateTerminateSuccessResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({
    example: "Berhasil memvalidasi terminasi hubungan",
  }),
  body: z.object({
    mahasiswaId: z.string().uuid().openapi({
      description: "ID mahasiswa asuh",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    otaId: z.string().uuid().openapi({
      description: "ID orang tua asuh",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  }),
});

export const validateTerminateFailedResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({
    example: "Gagal memvalidasi terminasi hubungan",
  }),
  error: z.object({}),
});

export const AdminUnverifiedResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Akun admin belum terverifikasi" }),
  error: z.object({}),
});
