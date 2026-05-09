import { createRouter } from "./router-factory.js";
import { dashboardOtaRoute } from "../routes/dashboard.route.js";
import { prisma } from "../db/prisma.js";

const dashboardRouter = createRouter();

dashboardRouter.openapi(dashboardOtaRoute, async (c) => {
  try {
    // name & job di OtaProfile adalah non-nullable String — tidak perlu filter { not: null }
    const otaList = await prisma.otaProfile.findMany({
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
      name: ota.name,
      job: ota.job,
      funds: ota.funds,           // Int — sudah number, tidak perlu cast
      maxCapacity: ota.maxCapacity, // Int — sudah number
      criteria: ota.criteria,
      isDetailVisible: ota.isDetailVisible,
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
