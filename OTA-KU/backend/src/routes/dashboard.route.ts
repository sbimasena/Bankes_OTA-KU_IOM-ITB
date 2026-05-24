import { createRoute } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";

// ─── Response Schema ──────────────────────────────────────────────────────────

const DashboardOtaItemSchema = z.object({
  id: z.string().uuid().openapi({ example: "dfe6dd7c-ae07-4e91-b412-c8bdecad0c33" }),
  name: z.string().openapi({ example: "Bapak Ahmad Suryadi" }),
  job: z.string().openapi({ example: "Direktur BUMN" }),
  funds: z.number().openapi({ example: 10000000 }),
  maxCapacity: z.number().openapi({ example: 2 }),
  criteria: z.string().openapi({
    example: "Mahasiswa tingkat akhir dari Fakultas STEI yang kurang mampu.",
  }),
  isDetailVisible: z.boolean().openapi({ example: true }),
});

const DashboardOtaResponseSchema = z.object({
  status: z.string().openapi({ example: "success" }),
  message: z.string().openapi({ example: "Data OTA berhasil diambil" }),
  data: z.array(DashboardOtaItemSchema),
});

// ─── Route Definition ─────────────────────────────────────────────────────────

/**
 * GET /api/dashboard/ota
 *
 * Endpoint publik untuk kelompok lain yang membutuhkan data OTA (Orang Tua Asuh)
 * dari sistem OTA-KU. Tidak memerlukan autentikasi.
 */
export const dashboardOtaRoute = createRoute({
  operationId: "dashboardOta",
  tags: ["Dashboard"],
  method: "get",
  path: "/ota",
  description:
    "Endpoint publik: daftar OTA (Orang Tua Asuh) untuk kebutuhan dashboard kelompok lain.",
  responses: {
    200: {
      description: "Data OTA berhasil diambil",
      content: {
        "application/json": {
          schema: DashboardOtaResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string(),
            message: z.string(),
            data: z.array(z.unknown()),
          }),
        },
      },
    },
  },
});
