import { createRouter } from "./router-factory.js";
import { dashboardOtaRoute } from "../routes/dashboard.route.js";
import { prisma } from "../db/prisma.js";

const dashboardRouter = createRouter();

dashboardRouter.openapi(dashboardOtaRoute, async (c) => {
  try {
    // Ambil semua OTA yang sudah memiliki profil lengkap
    const otaList = await prisma.otaProfile.findMany({
      where: {
        name: { not: null },
        job: { not: null },
      },
      select: {
        userId: true,
        name: true,
        job: true,
        funds: true,
        maxCapacity: true,
        criteria: true,
        isDetailVisible: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const data = otaList.map((ota) => ({
      id: ota.userId,
      name: ota.name ?? "",
      job: ota.job ?? "",
      funds: ota.funds ? Number(ota.funds) : 0,
      maxCapacity: ota.maxCapacity ? Number(ota.maxCapacity) : 0,
      criteria: ota.criteria ?? "",
      isDetailVisible: ota.isDetailVisible ?? true,
    }));

    return c.json(
      {
        status: "success",
        message: "Data OTA berhasil diambil",
        data,
      },
      200
    );
  } catch (error) {
    console.error("[dashboard/ota] Error:", error);
    return c.json(
      {
        status: "error",
        message: "Terjadi kesalahan pada server",
        data: [],
      },
      500
    );
  }
});

export { dashboardRouter };