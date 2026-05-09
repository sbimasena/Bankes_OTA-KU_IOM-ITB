import { createRouter } from "./router-factory.js";
import { dashboardOtaRoute } from "../routes/dashboard.route.js";
import { prisma } from "../db/prisma.js";

const dashboardRouter = createRouter();

dashboardRouter.openapi(dashboardOtaRoute, async (c) => {
  try {
    // Query dari User table dengan role OrangTuaAsuh
    // sehingga semua akun OTA muncul meski belum isi profil lengkap
    const userList = await prisma.user.findMany({
      where: {
        role: "OrangTuaAsuh",
      },
      select: {
        id: true,
        OtaProfile: {
          select: {
            name: true,
            job: true,
            funds: true,
            maxCapacity: true,
            criteria: true,
            isDetailVisible: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = userList
      // hanya tampilkan yang sudah punya profil OTA
      .filter((u) => u.OtaProfile !== null)
      .map((u) => ({
        id: u.id,
        name: u.OtaProfile!.name,
        job: u.OtaProfile!.job,
        funds: u.OtaProfile!.funds,
        maxCapacity: u.OtaProfile!.maxCapacity,
        criteria: u.OtaProfile!.criteria,
        isDetailVisible: u.OtaProfile!.isDetailVisible,
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
