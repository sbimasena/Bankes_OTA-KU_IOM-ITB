import { z } from "@hono/zod-openapi";

// Mahasiswa Connect
export const MahasiwaConnectSchema = z.object({
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
});

export const checkConnectParamsSchema = z.object({
  id: z.string().uuid().openapi({
    description: "ID of the mahasiswa to retrieve.",
    example: "3fc0317f-f143-43bf-aa65-13a7a8eca788",
  }),
});

export const OrangTuaSuccessResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({
    example: "Berhasil menghubungkan orang tua asuh dengan mahasiswa asuh",
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

export const OrangTuaFailedResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({
    example: "Gagal menghubungkan orang tua asuh dengan mahasiswa asuh",
  }),
  error: z.object({}),
});

export const OrangTuaUnverifiedResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Akun OTA belum terverifikasi" }),
  error: z.object({}),
});

export const verifyConnectionResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z
    .string()
    .openapi({ example: "Verifikasi koneksi berhasil di-accept" }),
});

export const connectionListQuerySchema = z.object({
  q: z.string().optional().openapi({
    description: "Query string for searching (NIM MA/Nama MA/Nama OTA).",
    example: "John Doe",
  }),
  page: z.coerce.number().optional().openapi({
    description: "Page number for pagination.",
    example: 1,
  }),
});

export const connectionListAllQuerySchema = z.object({
  q: z.string().optional().openapi({
    description: "Query string for searching (NIM MA/Nama MA/Nama OTA).",
    example: "John Doe",
  }),
  page: z.coerce.number().optional().openapi({
    description: "Page number for pagination.",
    example: 1,
  }),
  connection_status: z
    .enum(["accepted", "pending", "rejected"])
    .optional()
    .openapi({
      description: "Connection status of a given connection",
      example: "accepted",
    }),
});

export const connectionListQueryResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z
    .string()
    .openapi({ example: "Daftar connection berhasil diambil" }),
  body: z.object({
    data: z.array(
      z.object({
        mahasiswa_id: z.string().uuid().openapi({
          description: "ID mahasiswa asuh",
          example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        name_ma: z.string().openapi({ example: "John Doe" }),
        nim_ma: z.string().openapi({ example: "13522005" }),
        ota_id: z.string().uuid().openapi({
          description: "ID orang tua asuh",
          example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        name_ota: z.string().openapi({ example: "Jane Doe" }),
        number_ota: z.string().openapi({ example: "+6281234567890" }),
      }),
    ),
  }),
});

export const connectionListAllQueryResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z
    .string()
    .openapi({ example: "Daftar connection berhasil diambil" }),
  body: z.object({
    data: z.array(
      z
        .object({
          mahasiswa_id: z.string().uuid().openapi({
            description: "ID mahasiswa asuh",
            example: "123e4567-e89b-12d3-a456-426614174000",
          }),
          name_ma: z.string().openapi({ example: "John Doe" }),
          nim_ma: z.string().openapi({ example: "13522005" }),
          ota_id: z.string().uuid().openapi({
            description: "ID orang tua asuh",
            example: "123e4567-e89b-12d3-a456-426614174000",
          }),
          name_ota: z.string().openapi({ example: "Jane Doe" }),
          number_ota: z.string().openapi({ example: "+6281234567890" }),
          connection_status: z
            .enum(["accepted", "pending", "rejected"])
            .openapi({
              description: "Connection status of a given connection",
              example: "accepted",
            }),
          request_term_ota: z.boolean().openapi({ example: false }),
          request_term_ma: z.boolean().openapi({ example: true }),
          paidFor: z.number().openapi({ example: 0 }),
        })
        .openapi("ConnectionListAllResponse"),
    ),
    totalPagination: z.number().openapi({ example: 10 }),
  }),
});

export const connectionListTerminateQueryResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z
    .string()
    .openapi({ example: "Daftar connection berhasil diambil" }),
  body: z.object({
    data: z.array(
      z.object({
        mahasiswa_id: z.string().uuid().openapi({
          description: "ID mahasiswa asuh",
          example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        name_ma: z.string().openapi({ example: "John Doe" }),
        nim_ma: z.string().openapi({ example: "13522005" }),
        ota_id: z.string().uuid().openapi({
          description: "ID orang tua asuh",
          example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        name_ota: z.string().openapi({ example: "Jane Doe" }),
        number_ota: z.string().openapi({ example: "+6281234567890" }),
        request_term_ota: z.boolean().openapi({ example: false }),
        request_term_ma: z.boolean().openapi({ example: true }),
      }),
    ),
  }),
});

export const isConnectedResponse = z.object({
  isConnected: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Ada connection antara OTA dan MA" }),
});

export const DeleteConnectionSuccessfulResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Berhasil menghapus connection" }),
});
