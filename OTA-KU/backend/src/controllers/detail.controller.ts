import { and, eq } from "drizzle-orm";

import { db } from "../db/drizzle.js";
import {
  accountMahasiswaDetailTable,
  accountOtaDetailTable,
  accountTable,
  connectionTable,
} from "../db/schema.js";
import {
  getMahasiswaDetailRoute,
  getMahasiswaSayaDetailRoute,
  getMyOtaDetailRoute,
  getOtaDetailRoute,
  getMahasiswaDetailForOTARoute,
} from "../routes/detail.route.js";
import { createAuthRouter, createRouter } from "./router-factory.js";
import { create } from "domain";

export const detailRouter = createRouter();
export const detailProtectedRouter = createAuthRouter();

detailProtectedRouter.openapi(getMahasiswaDetailRoute, async (c) => {
  const user = c.var.user;
  const { id } = c.req.param();

  if (
    user.type !== "admin" &&
    user.type !== "bankes" &&
    user.type !== "pengurus"
  ) {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message:
            "Hanya admin, bankes, atau pengurus yang bisa mengakses detail ini",
        },
      },
      403,
    );
  }

  try {
    const mahasiswaDetail = await db
      .select()
      .from(accountTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(accountTable.id, accountMahasiswaDetailTable.accountId),
      )
      .where(eq(accountTable.id, id))
      .limit(1);

    if (mahasiswaDetail.length === 0) {
      return c.json(
        {
          success: false,
          message: "Mahasiswa tidak ditemukan",
          error: {
            code: "NOT_FOUND",
            message: "Mahasiswa dengan ID tersebut tidak ditemukan",
          },
        },
        404,
      );
    }

    const mahasiswa = mahasiswaDetail[0];

    return c.json(
      {
        success: true,
        message: "Detail mahasiswa berhasil diambil",
        body: {
          id: mahasiswa.account.id,
          email: mahasiswa.account.email,
          type: mahasiswa.account.type,
          phoneNumber: mahasiswa.account.phoneNumber!,
          provider: mahasiswa.account.provider,
          applicationStatus: mahasiswa.account.applicationStatus,
          name: mahasiswa.account_mahasiswa_detail.name!,
          nim: mahasiswa.account_mahasiswa_detail.nim!,
          mahasiswaStatus: mahasiswa.account_mahasiswa_detail.mahasiswaStatus!,
          description: mahasiswa.account_mahasiswa_detail.description!,
          file: mahasiswa.account_mahasiswa_detail.file!,
          major: mahasiswa.account_mahasiswa_detail.major!,
          faculty: mahasiswa.account_mahasiswa_detail.faculty!,
          cityOfOrigin: mahasiswa.account_mahasiswa_detail.cityOfOrigin!,
          highschoolAlumni:
            mahasiswa.account_mahasiswa_detail.highschoolAlumni!,
          religion: mahasiswa.account_mahasiswa_detail.religion!,
          gender: mahasiswa.account_mahasiswa_detail.gender!,
          gpa: mahasiswa.account_mahasiswa_detail.gpa!,
          kk: mahasiswa.account_mahasiswa_detail.kk!,
          ktm: mahasiswa.account_mahasiswa_detail.ktm!,
          waliRecommendationLetter:
            mahasiswa.account_mahasiswa_detail.waliRecommendationLetter!,
          transcript: mahasiswa.account_mahasiswa_detail.transcript!,
          salaryReport: mahasiswa.account_mahasiswa_detail.salaryReport!,
          pbb: mahasiswa.account_mahasiswa_detail.pbb!,
          electricityBill: mahasiswa.account_mahasiswa_detail.electricityBill!,
          ditmawaRecommendationLetter:
            mahasiswa.account_mahasiswa_detail.ditmawaRecommendationLetter!,
          bill: mahasiswa.account_mahasiswa_detail.bill!,
          notes: mahasiswa.account_mahasiswa_detail.notes!,
          adminOnlyNotes: mahasiswa.account_mahasiswa_detail.adminOnlyNotes!,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching mahasiswa detail:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});

detailProtectedRouter.openapi(getMahasiswaSayaDetailRoute, async (c) => {
  const user = c.var.user;
  const { id } = c.req.param();

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya OTA yang bisa mengakses detail ini",
        },
      },
      403,
    );
  }

  try {
    const mahasiswaDetail = await db
      .select({
        id: accountTable.id,
        email: accountTable.email,
        phoneNumber: accountTable.phoneNumber,
        name: accountMahasiswaDetailTable.name,
        nim: accountMahasiswaDetailTable.nim,
        major: accountMahasiswaDetailTable.major,
        faculty: accountMahasiswaDetailTable.faculty,
        cityOfOrigin: accountMahasiswaDetailTable.cityOfOrigin,
        highschoolAlumni: accountMahasiswaDetailTable.highschoolAlumni,
        religion: accountMahasiswaDetailTable.religion,
        gender: accountMahasiswaDetailTable.gender,
        gpa: accountMahasiswaDetailTable.gpa,
        notes: accountMahasiswaDetailTable.notes,
        createdAt: accountMahasiswaDetailTable.createdAt,
      })
      .from(accountTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(accountTable.id, accountMahasiswaDetailTable.accountId),
      )
      .innerJoin(
        connectionTable,
        and(
          eq(connectionTable.mahasiswaId, accountTable.id),
          eq(connectionTable.otaId, user.id),
        ),
      )
      .where(eq(accountTable.id, id))
      .limit(1);

    if (mahasiswaDetail.length === 0) {
      return c.json(
        {
          success: false,
          message: "Mahasiswa tidak ditemukan",
          error: {
            code: "NOT_FOUND",
            message: "Mahasiswa dengan ID tersebut tidak ditemukan",
          },
        },
        404,
      );
    }

    const mahasiswa = mahasiswaDetail[0];

    return c.json(
      {
        success: true,
        message: "Detail mahasiswa berhasil diambil",
        body: {
          id: mahasiswa.id,
          email: mahasiswa.email,
          phoneNumber: mahasiswa.phoneNumber!,
          name: mahasiswa.name!,
          nim: mahasiswa.nim!,
          major: mahasiswa.major!,
          faculty: mahasiswa.faculty!,
          cityOfOrigin: mahasiswa.cityOfOrigin!,
          highschoolAlumni: mahasiswa.highschoolAlumni!,
          religion: mahasiswa.religion!,
          gender: mahasiswa.gender!,
          gpa: mahasiswa.gpa!,
          notes: mahasiswa.notes!,
          createdAt: mahasiswa.createdAt.toISOString(),
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching mahasiswa detail:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});

detailProtectedRouter.openapi(getMahasiswaDetailForOTARoute, async (c) => {
  const user = c.var.user;
  const { id } = c.req.param();

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya OTA yang bisa mengakses detail ini",
        },
      },
      403,
    );
  }

  try {
    const mahasiswaDetail = await db
      .select()
      .from(accountTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(accountTable.id, accountMahasiswaDetailTable.accountId),
      )
      .where(eq(accountTable.id, id))
      .limit(1);

    if (mahasiswaDetail.length === 0) {
      return c.json(
        {
          success: false,
          message: "Mahasiswa tidak ditemukan",
          error: {
            code: "NOT_FOUND",
            message: "Mahasiswa dengan ID tersebut tidak ditemukan",
          },
        },
        404,
      );
    }

    const mahasiswa = mahasiswaDetail[0];

    return c.json(
      {
        success: true,
        message: "Detail mahasiswa berhasil diambil",
        body: {
          id: mahasiswa.account.id,
          email: mahasiswa.account.email,
          phoneNumber: mahasiswa.account.phoneNumber!,
          name: mahasiswa.account_mahasiswa_detail.name!,
          nim: mahasiswa.account_mahasiswa_detail.nim!,
          major: mahasiswa.account_mahasiswa_detail.major!,
          faculty: mahasiswa.account_mahasiswa_detail.faculty!,
          cityOfOrigin: mahasiswa.account_mahasiswa_detail.cityOfOrigin!,
          highschoolAlumni:
            mahasiswa.account_mahasiswa_detail.highschoolAlumni!,
          religion: mahasiswa.account_mahasiswa_detail.religion!,
          gender: mahasiswa.account_mahasiswa_detail.gender!,
          gpa: mahasiswa.account_mahasiswa_detail.gpa!,
          notes: mahasiswa.account_mahasiswa_detail.notes!,
          createdAt: mahasiswa.account_mahasiswa_detail.createdAt.toISOString(),
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching mahasiswa detail:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});

detailProtectedRouter.openapi(getOtaDetailRoute, async (c) => {
  const user = c.var.user;
  const { id } = c.req.param();

  if (
    user.type !== "admin" &&
    user.type !== "bankes" &&
    user.type !== "pengurus"
  ) {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message:
            "Hanya admin, bankes, atau pengurus yang bisa mengakses detail ini",
        },
      },
      403,
    );
  }

  try {
    const otaDetail = await db
      .select()
      .from(accountTable)
      .innerJoin(
        accountOtaDetailTable,
        eq(accountTable.id, accountOtaDetailTable.accountId),
      )
      .where(eq(accountTable.id, id))
      .limit(1);

    if (otaDetail.length === 0) {
      return c.json(
        {
          success: false,
          message: "Orang tua asuh tidak ditemukan",
          error: {
            code: "NOT_FOUND",
            message: "Orang tua asuh dengan ID tersebut tidak ditemukan",
          },
        },
        404,
      );
    }

    const ota = otaDetail[0];

    return c.json(
      {
        success: true,
        message: "Detail orang tua asuh berhasil diambil",
        body: {
          id: ota.account.id,
          email: ota.account.email,
          type: ota.account.type,
          phoneNumber: ota.account.phoneNumber!,
          provider: ota.account.provider,
          applicationStatus: ota.account.applicationStatus,
          name: ota.account_ota_detail.name!,
          job: ota.account_ota_detail.job!,
          address: ota.account_ota_detail.address!,
          linkage: ota.account_ota_detail.linkage,
          funds: ota.account_ota_detail.funds,
          maxCapacity: ota.account_ota_detail.maxCapacity,
          startDate: ota.account_ota_detail.startDate.toISOString(),
          maxSemester: ota.account_ota_detail.maxSemester,
          transferDate: ota.account_ota_detail.transferDate,
          criteria: ota.account_ota_detail.criteria,
          allowAdminSelection: ota.account_ota_detail.allowAdminSelection,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching orang tua asuh detail:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});

detailProtectedRouter.openapi(getMyOtaDetailRoute, async (c) => {
  const user = c.var.user;

  if (user.type !== "mahasiswa") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya MA yang bisa mengakses detail ini",
        },
      },
      403,
    );
  }

  try {
    const otaDetail = await db
      .select({
        id: accountTable.id,
        email: accountTable.email,
        phoneNumber: accountTable.phoneNumber,
        name: accountOtaDetailTable.name,
        transferDate: accountOtaDetailTable.transferDate,
        isDetailVisible: accountOtaDetailTable.isDetailVisible,
        createdAt: accountOtaDetailTable.createdAt,
      })
      .from(accountTable)
      .innerJoin(
        accountOtaDetailTable,
        eq(accountTable.id, accountOtaDetailTable.accountId),
      )
      .innerJoin(connectionTable, eq(connectionTable.mahasiswaId, user.id))
      .where(
        and(
          eq(connectionTable.connectionStatus, "accepted"),
          eq(connectionTable.otaId, accountTable.id),
        ),
      );

    if (otaDetail.length === 0) {
      return c.json(
        {
          success: false,
          message: "Hubungan asuh belum terverifikasi",
          error: {},
        },
        404,
      );
    }

    const ota = otaDetail[0];

    return c.json(
      {
        success: true,
        message: "Detail orang tua asuh berhasil diambil",
        body: {
          id: ota.id,
          email: ota.email,
          phoneNumber: ota.phoneNumber!,
          name: ota.name!,
          transferDate: ota.transferDate,
          isDetailVisible: ota.isDetailVisible,
          createdAt: ota.createdAt.toISOString(),
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching orang tua asuh detail:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});
