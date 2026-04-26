import { prisma } from "../db/prisma.js";
import type { Fakultas, Jurusan } from "../lib/nim.js";
import {
  listAllAccountRoute,
  listAvailableOTARoute,
  listMAActiveRoute,
  listMAPendingRoute,
  listMahasiswaAdminRoute,
  listMahasiswaOtaRoute,
  listOrangTuaAdminRoute,
  listOtaKuRoute,
} from "../routes/list.route.js";
import {
  OTAListQuerySchema,
  VerifiedMahasiswaListQuerySchema,
} from "../zod/list.js";
import { createAuthRouter, createRouter } from "./router-factory.js";

export const listRouter = createRouter();
export const listProtectedRouter = createAuthRouter();

const LIST_PAGE_SIZE = 6;
const LIST_PAGE_DETAIL_SIZE = 8;

listProtectedRouter.openapi(listMahasiswaOtaRoute, async (c) => {
  const user = c.var.user;
  const zodParseResult = VerifiedMahasiswaListQuerySchema.parse(c.req.query());
  const { q, page, major, faculty, religion, gender } = zodParseResult;

  if (user.type === "mahasiswa") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Mahasiswa tidak bisa mengakses list ini",
        },
      },
      403,
    );
  }

  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

    const where: Record<string, unknown> = {
      mahasiswaStatus: "inactive",
      description: { not: null },
      StudentFiles: { some: { type: "Profile_Photo" } },
      User: { applicationStatus: "accepted" },
    };
    if (major) where.major = major as Jurusan;
    if (faculty) where.faculty = faculty as Fakultas;
    if (religion) where.religion = religion;
    if (gender) where.gender = gender;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { nim: { contains: q, mode: "insensitive" } },
      ];
    }

    const [mahasiswaList, totalCount] = await Promise.all([
      prisma.mahasiswaProfile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: LIST_PAGE_SIZE,
        skip: offset,
        select: {
          userId: true,
          name: true,
          nim: true,
          major: true,
          faculty: true,
          cityOfOrigin: true,
          highschoolAlumni: true,
          religion: true,
          gender: true,
          gpa: true,
        },
      }),
      prisma.mahasiswaProfile.count({ where }),
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar mahasiswa berhasil diambil",
        body: {
          data: mahasiswaList.map((m) => ({
            accountId: m.userId,
            name: m.name!,
            nim: m.nim,
            major: m.major || "",
            faculty: m.faculty || "",
            cityOfOrigin: m.cityOfOrigin || "",
            highschoolAlumni: m.highschoolAlumni || "",
            religion: m.religion as "Islam" | "Kristen Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu",
            gender: m.gender as "M" | "F",
            gpa: m.gpa!,
          })),
          totalData: totalCount,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching mahasiswa list:", error);
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

listProtectedRouter.openapi(listMahasiswaAdminRoute, async (c) => {
  const user = c.var.user;
  const { q, page, jurusan, status } = c.req.query();

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
            "Hanya admin, bankes, atau pengurus yang bisa mengakses list ini",
        },
      },
      403,
    );
  }

  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_DETAIL_SIZE;

    const baseWhere = {
      role: "Mahasiswa",
      phoneNumber: { not: null },
    } as const;

    const listWhere: Record<string, unknown> = {
      role: "Mahasiswa",
      phoneNumber: { not: null },
      MahasiswaProfile: { description: { not: null } },
    };
    if (q) {
      listWhere.OR = [
        { MahasiswaProfile: { name: { contains: q, mode: "insensitive" } } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }
    if (status) listWhere.applicationStatus = status;
    if (jurusan) {
      (listWhere.MahasiswaProfile as Record<string, unknown>).major =
        jurusan as Jurusan;
    }

    const [total, accepted, pending, rejected, totalPagination, mahasiswaList] =
      await Promise.all([
        prisma.user.count({
          where: { ...baseWhere, applicationStatus: { not: "unregistered" } },
        }),
        prisma.user.count({
          where: { ...baseWhere, applicationStatus: "accepted" },
        }),
        prisma.user.count({
          where: { ...baseWhere, applicationStatus: "pending" },
        }),
        prisma.user.count({
          where: { ...baseWhere, applicationStatus: "rejected" },
        }),
        prisma.user.count({ where: listWhere }),
        prisma.user.findMany({
          where: listWhere,
          orderBy: { MahasiswaProfile: { createdAt: "desc" } },
          take: LIST_PAGE_DETAIL_SIZE,
          skip: offset,
          include: {
            MahasiswaProfile: { include: { StudentFiles: true } },
          },
        }),
      ]);

    return c.json(
      {
        success: true,
        message: "Daftar mahasiswa berhasil diambil",
        body: {
          data: mahasiswaList.map((u) => {
            const mp = u.MahasiswaProfile;
            const files = mp?.StudentFiles ?? [];
            const getFile = (type: string) =>
              files.find((f) => f.type === type)?.fileUrl ?? "";
            return {
              id: u.id,
              email: u.email,
              phoneNumber: u.phoneNumber!,
              provider: u.provider,
              status: u.verificationStatus,
              applicationStatus: u.applicationStatus,
              type: u.role as unknown as "mahasiswa" | "ota" | "admin" | "bankes" | "pengurus",
              name: mp?.name ?? "",
              nim: mp?.nim ?? "",
              mahasiswaStatus: mp?.mahasiswaStatus ?? "inactive",
              description: mp?.description ?? "",
              file: getFile("Profile_Photo"),
              major: mp?.major ?? "",
              faculty: mp?.faculty ?? "",
              cityOfOrigin: mp?.cityOfOrigin ?? "",
              highschoolAlumni: mp?.highschoolAlumni ?? "",
              religion: (mp?.religion ?? "") as "Islam" | "Kristen Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu",
              gender: (mp?.gender ?? "") as "M" | "F",
              gpa: mp?.gpa ?? "",
              kk: getFile("KK"),
              ktm: getFile("KTM"),
              waliRecommendationLetter: getFile("Wali_Recommendation_Letter"),
              transcript: getFile("Transcript"),
              salaryReport: getFile("Salary_Report"),
              pbb: getFile("PBB"),
              electricityBill: getFile("Electricity_Bill"),
              ditmawaRecommendationLetter: getFile(
                "Ditmawa_Recommendation_Letter",
              ),
              bill: mp?.bill ?? 0,
              notes: mp?.notes ?? "",
              adminOnlyNotes: mp?.adminOnlyNotes ?? "",
            };
          }),
          totalPagination,
          totalData: total,
          totalPending: pending,
          totalAccepted: accepted,
          totalRejected: rejected,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching mahasiswa list:", error);
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

listProtectedRouter.openapi(listOrangTuaAdminRoute, async (c) => {
  const user = c.var.user;
  const { q, page, status } = c.req.query();

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
            "Hanya admin, bankes, atau pengurus yang bisa mengakses list ini",
        },
      },
      403,
    );
  }

  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_DETAIL_SIZE;

    const baseWhere = { role: "OrangTuaAsuh" } as const;

    const listWhere: Record<string, unknown> = { role: "OrangTuaAsuh" };
    if (q) {
      listWhere.OtaProfile = {
        name: { contains: q, mode: "insensitive" },
      };
    }
    if (status) listWhere.applicationStatus = status;

    const [total, accepted, pending, rejected, totalPagination, orangTuaList] =
      await Promise.all([
        prisma.user.count({
          where: {
            ...baseWhere,
            applicationStatus: { not: "unregistered" },
            OtaProfile: { isNot: null },
          },
        }),
        prisma.user.count({
          where: {
            ...baseWhere,
            applicationStatus: "accepted",
            OtaProfile: { isNot: null },
          },
        }),
        prisma.user.count({
          where: {
            ...baseWhere,
            applicationStatus: "pending",
            OtaProfile: { isNot: null },
          },
        }),
        prisma.user.count({
          where: {
            ...baseWhere,
            applicationStatus: "rejected",
            OtaProfile: { isNot: null },
          },
        }),
        prisma.user.count({ where: { ...listWhere, OtaProfile: { isNot: null } } }),
        prisma.user.findMany({
          where: { ...listWhere, OtaProfile: { isNot: null } },
          orderBy: { OtaProfile: { createdAt: "desc" } },
          take: LIST_PAGE_DETAIL_SIZE,
          skip: offset,
          include: { OtaProfile: true },
        }),
      ]);

    return c.json(
      {
        success: true,
        message: "Daftar orang tua berhasil diambil",
        body: {
          data: orangTuaList.map((u) => {
            const op = u.OtaProfile!;
            return {
              id: u.id,
              email: u.email,
              phoneNumber: u.phoneNumber!,
              provider: u.provider,
              status: u.verificationStatus,
              applicationStatus: u.applicationStatus,
              name: op.name,
              job: op.job,
              address: op.address,
              linkage: op.linkage,
              funds: op.funds,
              maxCapacity: op.maxCapacity,
              startDate: op.startDate,
              maxSemester: op.maxSemester,
              transferDate: op.transferDate,
              criteria: op.criteria,
              isDetailVisible: op.isDetailVisible,
              allowAdminSelection: op.allowAdminSelection,
            };
          }),
          totalPagination,
          totalData: total,
          totalPending: pending,
          totalAccepted: accepted,
          totalRejected: rejected,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching orang tua list:", error);
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

listProtectedRouter.openapi(listAllAccountRoute, async (c) => {
  const user = c.var.user;
  const { q, page, status, type, applicationStatus } = c.req.query();

  if (user.type !== "admin") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya admin yang bisa mengakses list ini",
        },
      },
      403,
    );
  }

  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_DETAIL_SIZE;

    const where: Record<string, unknown> = {};
    if (status) where.verificationStatus = status;
    if (type) where.role = type;
    if (applicationStatus) where.applicationStatus = applicationStatus;
    if (q) {
      where.OR = [
        { MahasiswaProfile: { name: { contains: q, mode: "insensitive" } } },
        { OtaProfile: { name: { contains: q, mode: "insensitive" } } },
        { AdminProfile: { name: { contains: q, mode: "insensitive" } } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    const [totalPagination, accountList] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: LIST_PAGE_DETAIL_SIZE,
        skip: offset,
        include: {
          MahasiswaProfile: { include: { StudentFiles: true } },
          OtaProfile: true,
          AdminProfile: true,
        },
      }),
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar seluruh akun berhasil diambil",
        body: {
          data: accountList.map((u) => {
            const mp = u.MahasiswaProfile;
            const op = u.OtaProfile;
            const ap = u.AdminProfile;
            const files = mp?.StudentFiles ?? [];
            const getFile = (t: string) =>
              files.find((f) => f.type === t)?.fileUrl ?? "";
            return {
              id: u.id,
              email: u.email,
              phoneNumber: u.phoneNumber ?? "",
              provider: u.provider,
              status: u.verificationStatus,
              applicationStatus: u.applicationStatus,
              type: u.role as unknown as "mahasiswa" | "ota" | "admin" | "bankes" | "pengurus",
              ma_name: mp?.name ?? "",
              ota_name: op?.name ?? "",
              admin_name: ap?.name ?? "",
              nim: mp?.nim ?? "",
              mahasiswaStatus: mp?.mahasiswaStatus ?? "inactive",
              description: mp?.description ?? "",
              file: getFile("Profile_Photo"),
              major: mp?.major ?? "",
              faculty: mp?.faculty ?? "",
              cityOfOrigin: mp?.cityOfOrigin ?? "",
              highschoolAlumni: mp?.highschoolAlumni ?? "",
              religion: (mp?.religion ?? "Islam") as "Islam" | "Kristen Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu",
              gender: (mp?.gender ?? "M") as "M" | "F",
              gpa: mp?.gpa ?? "",
              kk: getFile("KK"),
              ktm: getFile("KTM"),
              waliRecommendationLetter: getFile("Wali_Recommendation_Letter"),
              transcript: getFile("Transcript"),
              salaryReport: getFile("Salary_Report"),
              pbb: getFile("PBB"),
              electricityBill: getFile("Electricity_Bill"),
              ditmawaRecommendationLetter: getFile(
                "Ditmawa_Recommendation_Letter",
              ),
              bill: mp?.bill ?? 0,
              notes: mp?.notes ?? "",
              adminOnlyNotes: mp?.adminOnlyNotes ?? "",
              job: op?.job ?? "",
              address: op?.address ?? "",
              linkage: op?.linkage ?? "otm",
              funds: op?.funds ?? 0,
              maxCapacity: op?.maxCapacity ?? 0,
              startDate: op?.startDate ?? "",
              maxSemester: op?.maxSemester ?? 0,
              transferDate: op?.transferDate ?? 0,
              criteria: op?.criteria ?? "",
              isDetailVisible: op?.isDetailVisible ?? false,
              allowAdminSelection: op?.allowAdminSelection ?? false,
            };
          }),
          totalPagination,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching mahasiswa list:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

listProtectedRouter.openapi(listOtaKuRoute, async (c) => {
  const user = c.var.user;
  const { q, page } = c.req.query();
  const maId = c.get("user").id;

  if (user.type !== "mahasiswa") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya MA yang bisa mengakses list ini",
        },
      },
      403,
    );
  }

  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

    const where = {
      mahasiswaId: maId,
      connectionStatus: "accepted" as const,
      OtaProfile: q
        ? { name: { contains: q, mode: "insensitive" as const } }
        : undefined,
    };

    const [OTAList, totalCount] = await Promise.all([
      prisma.connection.findMany({
        where,
        take: LIST_PAGE_SIZE,
        skip: offset,
        include: {
          OtaProfile: { include: { User: { select: { phoneNumber: true } } } },
        },
      }),
      prisma.connection.count({ where }),
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar OTA-ku berhasil diambil",
        body: {
          data: OTAList.map((conn) => ({
            accountId: conn.otaId,
            name: conn.OtaProfile.name,
            phoneNumber: conn.OtaProfile.User.phoneNumber ?? "",
            nominal: conn.OtaProfile.funds,
          })),
          totalData: totalCount,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching OTA-ku list:", error);
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

listProtectedRouter.openapi(listMAActiveRoute, async (c) => {
  const user = c.var.user;
  const { q, page } = c.req.query();
  const otaId = c.get("user").id;

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya OTA yang bisa mengakses list ini",
        },
      },
      403,
    );
  }

  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

    const nameFilter = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { nim: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    const [individualConns, groupConns] = await Promise.all([
      prisma.connection.findMany({
        where: {
          otaId,
          connectionStatus: "accepted",
          ...(nameFilter ? { MahasiswaProfile: nameFilter } : {}),
        },
        include: { MahasiswaProfile: true },
      }),
      prisma.groupConnection.findMany({
        where: {
          connectionStatus: "accepted",
          Group: { Members: { some: { otaId } } },
          ...(nameFilter ? { Mahasiswa: nameFilter } : {}),
        },
        include: { Mahasiswa: true },
      }),
    ]);

    type MaEntry = {
      accountId: string;
      name: string;
      nim: string;
      major: string;
      faculty: string;
      cityOfOrigin: string;
      highschoolAlumni: string;
      gender: "M" | "F";
      religion: "Islam" | "Kristen Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu";
      mahasiswaStatus: "active" | "inactive";
      gpa: string;
      request_term_ota: boolean;
      request_term_ma: boolean;
    };

    const seen = new Set<string>();
    const merged: MaEntry[] = [];

    for (const conn of individualConns) {
      const mp = conn.MahasiswaProfile;
      if (seen.has(mp.userId)) continue;
      seen.add(mp.userId);
      merged.push({
        accountId: conn.mahasiswaId,
        name: mp.name!,
        nim: mp.nim,
        major: mp.major ?? "",
        faculty: mp.faculty ?? "",
        cityOfOrigin: mp.cityOfOrigin ?? "",
        highschoolAlumni: mp.highschoolAlumni ?? "",
        gender: mp.gender as "M" | "F",
        religion: mp.religion as "Islam" | "Kristen Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu",
        mahasiswaStatus: mp.mahasiswaStatus as "active" | "inactive",
        gpa: mp.gpa ? String(mp.gpa) : "0",
        request_term_ota: conn.requestTerminateOta,
        request_term_ma: conn.requestTerminateMahasiswa,
      });
    }

    for (const conn of groupConns) {
      const mp = conn.Mahasiswa;
      if (seen.has(mp.userId)) continue;
      seen.add(mp.userId);
      merged.push({
        accountId: conn.mahasiswaId,
        name: mp.name!,
        nim: mp.nim,
        major: mp.major ?? "",
        faculty: mp.faculty ?? "",
        cityOfOrigin: mp.cityOfOrigin ?? "",
        highschoolAlumni: mp.highschoolAlumni ?? "",
        gender: mp.gender as "M" | "F",
        religion: mp.religion as "Islam" | "Kristen Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu",
        mahasiswaStatus: mp.mahasiswaStatus as "active" | "inactive",
        gpa: mp.gpa ? String(mp.gpa) : "0",
        request_term_ota: conn.requestTerminateGroup,
        request_term_ma: conn.requestTerminateMahasiswa,
      });
    }

    const totalData = merged.length;
    const paginated = merged.slice(offset, offset + LIST_PAGE_SIZE);

    return c.json(
      {
        success: true,
        message: "Daftar MA aktif berhasil diambil",
        body: { data: paginated, totalData },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching MA aktif list:", error);
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

listProtectedRouter.openapi(listMAPendingRoute, async (c) => {
  const user = c.var.user;
  const { q, page } = c.req.query();
  const otaId = c.get("user").id;

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya OTA yang bisa mengakses list ini",
        },
      },
      403,
    );
  }

  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

    const nameFilter = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { nim: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : undefined;

    const [individualConns, groupConns] = await Promise.all([
      prisma.connection.findMany({
        where: {
          otaId,
          connectionStatus: "pending",
          requestTerminateMahasiswa: false,
          requestTerminateOta: false,
          ...(nameFilter ? { MahasiswaProfile: nameFilter } : {}),
        },
        include: { MahasiswaProfile: true },
      }),
      prisma.groupConnection.findMany({
        where: {
          connectionStatus: "pending",
          Group: { Members: { some: { otaId } } },
          ...(nameFilter ? { Mahasiswa: nameFilter } : {}),
        },
        include: { Mahasiswa: true },
      }),
    ]);

    type MaEntry = {
      accountId: string;
      name: string;
      nim: string;
      major: string;
      faculty: string;
      cityOfOrigin: string;
      highschoolAlumni: string;
      gender: "M" | "F";
      religion: "Islam" | "Kristen Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu";
      mahasiswaStatus: "active" | "inactive";
      gpa: string;
      request_term_ota: boolean;
      request_term_ma: boolean;
    };

    const seen = new Set<string>();
    const merged: MaEntry[] = [];

    for (const conn of individualConns) {
      const mp = conn.MahasiswaProfile;
      if (seen.has(mp.userId)) continue;
      seen.add(mp.userId);
      merged.push({
        accountId: conn.mahasiswaId,
        name: mp.name!,
        nim: mp.nim,
        major: mp.major ?? "",
        faculty: mp.faculty ?? "",
        cityOfOrigin: mp.cityOfOrigin ?? "",
        highschoolAlumni: mp.highschoolAlumni ?? "",
        gender: mp.gender as "M" | "F",
        religion: mp.religion as "Islam" | "Kristen Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu",
        mahasiswaStatus: mp.mahasiswaStatus as "active" | "inactive",
        gpa: mp.gpa ? String(mp.gpa) : "0",
        request_term_ota: conn.requestTerminateOta,
        request_term_ma: conn.requestTerminateMahasiswa,
      });
    }

    for (const conn of groupConns) {
      const mp = conn.Mahasiswa;
      if (seen.has(mp.userId)) continue;
      seen.add(mp.userId);
      merged.push({
        accountId: conn.mahasiswaId,
        name: mp.name!,
        nim: mp.nim,
        major: mp.major ?? "",
        faculty: mp.faculty ?? "",
        cityOfOrigin: mp.cityOfOrigin ?? "",
        highschoolAlumni: mp.highschoolAlumni ?? "",
        gender: mp.gender as "M" | "F",
        religion: mp.religion as "Islam" | "Kristen Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu",
        mahasiswaStatus: mp.mahasiswaStatus as "active" | "inactive",
        gpa: mp.gpa ? String(mp.gpa) : "0",
        request_term_ota: conn.requestTerminateGroup,
        request_term_ma: conn.requestTerminateMahasiswa,
      });
    }

    const totalData = merged.length;
    const paginated = merged.slice(offset, offset + LIST_PAGE_SIZE);

    return c.json(
      {
        success: true,
        message: "Daftar MA pending berhasil diambil",
        body: { data: paginated, totalData },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching MA pending list:", error);
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

listProtectedRouter.openapi(listAvailableOTARoute, async (c) => {
  const user = c.var.user;
  const zodParseResult = OTAListQuerySchema.parse(c.req.query());
  const { q, page } = zodParseResult;

  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

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
            "Hanya admin, bankes, atau pengurus yang bisa mengakses list ini",
        },
      },
      403,
    );
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

    const baseWhere = {
      allowAdminSelection: true,
      User: { applicationStatus: "accepted" as const },
      ...(q
        ? { name: { contains: q, mode: "insensitive" as const } }
        : undefined),
    };

    // Fetch all matching OTAs with accepted connection count, then filter by capacity
    const allOtas = await prisma.otaProfile.findMany({
      where: baseWhere,
      include: {
        User: { select: { phoneNumber: true } },
        _count: {
          select: {
            Connections: { where: { connectionStatus: "accepted" } },
          },
        },
      },
    });

    const available = allOtas.filter(
      (ota) => ota._count.Connections < ota.maxCapacity,
    );
    const paginated = available.slice(offset, offset + LIST_PAGE_SIZE);

    return c.json(
      {
        success: true,
        message: "Daftar OTA yang tersedia berhasil diambil",
        body: {
          data: paginated.map((ota) => ({
            accountId: ota.userId,
            name: ota.name,
            phoneNumber: ota.User.phoneNumber ?? "",
            nominal: ota.funds,
          })),
          totalData: available.length,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching available OTA list:", error);
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
