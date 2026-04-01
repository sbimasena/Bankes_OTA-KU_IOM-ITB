import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { connect } from "http2";

import { db } from "../db/drizzle.js";
import {
  accountAdminDetailTable,
  accountMahasiswaDetailTable,
  accountOtaDetailTable,
  accountTable,
  connectionTable,
} from "../db/schema.js";
import type { Jurusan } from "../lib/nim.js";
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

  // Validate page to be a positive integer
  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

    const conditions = [
      and(
        eq(accountMahasiswaDetailTable.mahasiswaStatus, "inactive"),
        eq(accountTable.applicationStatus, "accepted"),
        isNotNull(accountMahasiswaDetailTable.description),
        isNotNull(accountMahasiswaDetailTable.file),
        or(
          ilike(accountMahasiswaDetailTable.name, `%${q || ""}%`),
          ilike(accountMahasiswaDetailTable.nim, `%${q || ""}%`),
        ),
      ),
    ];

    if (major) {
      conditions.push(eq(accountMahasiswaDetailTable.major, major));
    }

    if (faculty) {
      conditions.push(eq(accountMahasiswaDetailTable.faculty, faculty));
    }

    if (religion) {
      conditions.push(eq(accountMahasiswaDetailTable.religion, religion));
    }

    if (gender) {
      conditions.push(eq(accountMahasiswaDetailTable.gender, gender));
    }

    const countsQuery = db
      .select({ count: count() })
      .from(accountMahasiswaDetailTable)
      .innerJoin(
        accountTable,
        eq(accountMahasiswaDetailTable.accountId, accountTable.id),
      )
      .where(and(...conditions));

    const mahasiswaListQuery = db
      .select({
        accountId: accountMahasiswaDetailTable.accountId,
        name: accountMahasiswaDetailTable.name,
        nim: accountMahasiswaDetailTable.nim,
        major: accountMahasiswaDetailTable.major,
        faculty: accountMahasiswaDetailTable.faculty,
        cityOfOrigin: accountMahasiswaDetailTable.cityOfOrigin,
        highschoolAlumni: accountMahasiswaDetailTable.highschoolAlumni,
        religion: accountMahasiswaDetailTable.religion,
        gender: accountMahasiswaDetailTable.gender,
        gpa: accountMahasiswaDetailTable.gpa,
      })
      .from(accountMahasiswaDetailTable)
      .innerJoin(
        accountTable,
        eq(accountMahasiswaDetailTable.accountId, accountTable.id),
      )
      .where(and(...conditions))
      .orderBy(desc(accountMahasiswaDetailTable.createdAt))
      .limit(LIST_PAGE_SIZE)
      .offset(offset);

    const [mahasiswaList, counts] = await Promise.all([
      mahasiswaListQuery,
      countsQuery,
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar mahasiswa berhasil diambil",
        body: {
          data: mahasiswaList.map((mahasiswa) => ({
            accountId: mahasiswa.accountId,
            name: mahasiswa.name!,
            nim: mahasiswa.nim,
            major: mahasiswa.major || "",
            faculty: mahasiswa.faculty || "",
            cityOfOrigin: mahasiswa.cityOfOrigin || "",
            highschoolAlumni: mahasiswa.highschoolAlumni || "",
            religion: mahasiswa.religion!,
            gender: mahasiswa.gender!,
            gpa: mahasiswa.gpa!,
          })),
          totalData: counts[0].count,
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

  // Validate page to be a positive integer
  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_DETAIL_SIZE;

    const baseConditions = [
      eq(accountTable.type, "mahasiswa"),
      isNotNull(accountTable.phoneNumber),
    ];

    const searchCondition = q
      ? or(
          ilike(accountMahasiswaDetailTable.name, `%${q}%`),
          ilike(accountTable.email, `%${q}%`),
        )
      : undefined;

    const filterConditions = [
      status
        ? eq(
            accountTable.applicationStatus,
            status as "pending" | "accepted" | "rejected" | "unregistered",
          )
        : undefined,
      jurusan
        ? eq(accountMahasiswaDetailTable.major, jurusan as Jurusan)
        : undefined,
    ];

    const countsQuery = db
      .select({
        total: sql<number>`sum(case when ${accountTable.applicationStatus} != 'unregistered' then 1 else 0 end)`,
        accepted: sql<number>`sum(case when ${accountTable.applicationStatus} = 'accepted' then 1 else 0 end)`,
        pending: sql<number>`sum(case when ${accountTable.applicationStatus} = 'pending' then 1 else 0 end)`,
        rejected: sql<number>`sum(case when ${accountTable.applicationStatus} = 'rejected' then 1 else 0 end)`,
      })
      .from(accountTable)
      .where(and(...baseConditions));

    const countsPaginationQuery = db
      .select({ count: count() })
      .from(accountTable)
      .leftJoin(
        accountMahasiswaDetailTable,
        eq(accountTable.id, accountMahasiswaDetailTable.accountId),
      )
      .where(
        and(
          ...baseConditions,
          searchCondition,
          ...filterConditions,
          isNotNull(accountMahasiswaDetailTable.description),
        ),
      );

    const mahasiswaListQuery = db
      .select({
        id: accountTable.id,
        email: accountTable.email,
        phoneNumber: accountTable.phoneNumber,
        provider: accountTable.provider,
        status: accountTable.status,
        applicationStatus: accountTable.applicationStatus,
        type: accountTable.type,
        name: accountMahasiswaDetailTable.name,
        nim: accountMahasiswaDetailTable.nim,
        mahasiswaStatus: accountMahasiswaDetailTable.mahasiswaStatus,
        description: accountMahasiswaDetailTable.description,
        file: accountMahasiswaDetailTable.file,
        major: accountMahasiswaDetailTable.major,
        faculty: accountMahasiswaDetailTable.faculty,
        cityOfOrigin: accountMahasiswaDetailTable.cityOfOrigin,
        highschoolAlumni: accountMahasiswaDetailTable.highschoolAlumni,
        religion: accountMahasiswaDetailTable.religion,
        gender: accountMahasiswaDetailTable.gender,
        gpa: accountMahasiswaDetailTable.gpa,
        kk: accountMahasiswaDetailTable.kk,
        ktm: accountMahasiswaDetailTable.ktm,
        waliRecommendationLetter:
          accountMahasiswaDetailTable.waliRecommendationLetter,
        transcript: accountMahasiswaDetailTable.transcript,
        salaryReport: accountMahasiswaDetailTable.salaryReport,
        pbb: accountMahasiswaDetailTable.pbb,
        electricityBill: accountMahasiswaDetailTable.electricityBill,
        ditmawaRecommendationLetter:
          accountMahasiswaDetailTable.ditmawaRecommendationLetter,
        bill: accountMahasiswaDetailTable.bill,
        notes: accountMahasiswaDetailTable.notes,
        adminOnlyNotes: accountMahasiswaDetailTable.adminOnlyNotes,
      })
      .from(accountTable)
      .leftJoin(
        accountMahasiswaDetailTable,
        eq(accountTable.id, accountMahasiswaDetailTable.accountId),
      )
      .where(
        and(
          ...baseConditions,
          searchCondition,
          ...filterConditions,
          isNotNull(accountMahasiswaDetailTable.description),
        ),
      )
      .orderBy(desc(accountMahasiswaDetailTable.createdAt))
      .limit(LIST_PAGE_DETAIL_SIZE)
      .offset(offset);

    const [mahasiswaList, counts, countsPagination] = await Promise.all([
      mahasiswaListQuery,
      countsQuery,
      countsPaginationQuery,
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar mahasiswa berhasil diambil",
        body: {
          data: mahasiswaList.map((mahasiswa) => ({
            id: mahasiswa.id,
            email: mahasiswa.email,
            phoneNumber: mahasiswa.phoneNumber!,
            provider: mahasiswa.provider,
            status: mahasiswa.status,
            applicationStatus: mahasiswa.applicationStatus,
            type: mahasiswa.type,
            name: mahasiswa.name!,
            nim: mahasiswa.nim!,
            mahasiswaStatus: mahasiswa.mahasiswaStatus!,
            description: mahasiswa.description!,
            file: mahasiswa.file!,
            major: mahasiswa.major || "",
            faculty: mahasiswa.faculty || "",
            cityOfOrigin: mahasiswa.cityOfOrigin || "",
            highschoolAlumni: mahasiswa.highschoolAlumni || "",
            religion: mahasiswa.religion!,
            gender: mahasiswa.gender!,
            gpa: mahasiswa.gpa!,
            kk: mahasiswa.kk || "",
            ktm: mahasiswa.ktm || "",
            waliRecommendationLetter: mahasiswa.waliRecommendationLetter || "",
            transcript: mahasiswa.transcript || "",
            salaryReport: mahasiswa.salaryReport || "",
            pbb: mahasiswa.pbb || "",
            electricityBill: mahasiswa.electricityBill || "",
            ditmawaRecommendationLetter:
              mahasiswa.ditmawaRecommendationLetter || "",
            bill: mahasiswa.bill || 0,
            notes: mahasiswa.notes || "",
            adminOnlyNotes: mahasiswa.adminOnlyNotes || "",
          })),
          totalPagination: countsPagination[0].count,
          totalData: Number(counts[0].total),
          totalPending: Number(counts[0].pending),
          totalAccepted: Number(counts[0].accepted),
          totalRejected: Number(counts[0].rejected),
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

  // Validate page to be a positive integer
  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_DETAIL_SIZE;

    const baseConditions = [eq(accountTable.type, "ota")];

    const searchCondition = q
      ? or(ilike(accountOtaDetailTable.name, `%${q}%`))
      : undefined;

    const filterConditions = [
      status
        ? eq(
            accountTable.applicationStatus,
            status as "pending" | "accepted" | "rejected",
          )
        : undefined,
    ];

    const countsQuery = db
      .select({
        total: sql<number>`sum(case when ${accountTable.applicationStatus} != 'unregistered' then 1 else 0 end)`,
        accepted: sql<number>`sum(case when ${accountTable.applicationStatus} = 'accepted' then 1 else 0 end)`,
        pending: sql<number>`sum(case when ${accountTable.applicationStatus} = 'pending' then 1 else 0 end)`,
        rejected: sql<number>`sum(case when ${accountTable.applicationStatus} = 'rejected' then 1 else 0 end)`,
      })
      .from(accountTable)
      .innerJoin(
        accountOtaDetailTable,
        eq(accountTable.id, accountOtaDetailTable.accountId),
      )
      .where(and(...baseConditions));

    const countsPaginationQuery = db
      .select({ count: count() })
      .from(accountTable)
      .innerJoin(
        accountOtaDetailTable,
        eq(accountTable.id, accountOtaDetailTable.accountId),
      )
      .where(and(...baseConditions, searchCondition, ...filterConditions));

    const orangTuaListQuery = db
      .select({
        id: accountTable.id,
        email: accountTable.email,
        phoneNumber: accountTable.phoneNumber,
        provider: accountTable.provider,
        status: accountTable.status,
        applicationStatus: accountTable.applicationStatus,
        name: accountOtaDetailTable.name,
        job: accountOtaDetailTable.job,
        address: accountOtaDetailTable.address,
        linkage: accountOtaDetailTable.linkage,
        funds: accountOtaDetailTable.funds,
        maxCapacity: accountOtaDetailTable.maxCapacity,
        startDate: accountOtaDetailTable.startDate,
        maxSemester: accountOtaDetailTable.maxSemester,
        transferDate: accountOtaDetailTable.transferDate,
        criteria: accountOtaDetailTable.criteria,
        isDetailVisible: accountOtaDetailTable.isDetailVisible,
        allowAdminSelection: accountOtaDetailTable.allowAdminSelection,
      })
      .from(accountTable)
      .innerJoin(
        accountOtaDetailTable,
        eq(accountTable.id, accountOtaDetailTable.accountId),
      )
      .where(and(...baseConditions, searchCondition, ...filterConditions))
      .orderBy(desc(accountOtaDetailTable.createdAt))
      .limit(LIST_PAGE_DETAIL_SIZE)
      .offset(offset);

    const [orangTuaList, counts, countsPagination] = await Promise.all([
      orangTuaListQuery,
      countsQuery,
      countsPaginationQuery,
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar orang tua berhasil diambil",
        body: {
          data: orangTuaList.map((orangTua) => ({
            id: orangTua.id,
            email: orangTua.email,
            phoneNumber: orangTua.phoneNumber!,
            provider: orangTua.provider,
            status: orangTua.status,
            applicationStatus: orangTua.applicationStatus,
            name: orangTua.name,
            job: orangTua.job,
            address: orangTua.address,
            linkage: orangTua.linkage,
            funds: orangTua.funds,
            maxCapacity: orangTua.maxCapacity,
            startDate: orangTua.startDate,
            maxSemester: orangTua.maxSemester,
            transferDate: orangTua.transferDate,
            criteria: orangTua.criteria,
            isDetailVisible: orangTua.isDetailVisible,
            allowAdminSelection: orangTua.allowAdminSelection,
          })),
          totalPagination: countsPagination[0].count,
          totalData: Number(counts[0].total),
          totalPending: Number(counts[0].pending),
          totalAccepted: Number(counts[0].accepted),
          totalRejected: Number(counts[0].rejected),
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

  // Validate page to be a positive integer
  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_DETAIL_SIZE;

    // Build filter conditions array with only non-undefined filters
    const filterConditions = [];

    // Add search condition if q is provided
    if (q) {
      filterConditions.push(
        or(
          ilike(accountMahasiswaDetailTable.name, `%${q}%`),
          ilike(accountOtaDetailTable.name, `%${q}%`),
          ilike(accountAdminDetailTable.name, `%${q}%`),
          ilike(accountTable.email, `%${q}%`),
        ),
      );
    }

    // Add status filter if provided
    if (status) {
      filterConditions.push(
        eq(accountTable.status, status as "verified" | "unverified"),
      );
    }

    // Add type filter if provided
    if (type) {
      filterConditions.push(
        eq(
          accountTable.type,
          type as "mahasiswa" | "ota" | "admin" | "bankes" | "pengurus",
        ),
      );
    }

    // Add applicationStatus filter if provided
    if (applicationStatus) {
      filterConditions.push(
        eq(
          accountTable.applicationStatus,
          applicationStatus as
            | "pending"
            | "accepted"
            | "rejected"
            | "unregistered"
            | "reapply"
            | "outdated",
        ),
      );
    }

    // Combine conditions with AND
    const whereCondition =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const countsPaginationQuery = db
      .select({ count: count() })
      .from(accountTable)
      .leftJoin(
        accountMahasiswaDetailTable,
        eq(accountTable.id, accountMahasiswaDetailTable.accountId),
      )
      .leftJoin(
        accountOtaDetailTable,
        eq(accountTable.id, accountOtaDetailTable.accountId),
      )
      .leftJoin(
        accountAdminDetailTable,
        eq(accountTable.id, accountAdminDetailTable.accountId),
      )
      .where(whereCondition);

    const accountListQuery = db
      .select({
        id: accountTable.id,
        email: accountTable.email,
        type: accountTable.type,
        phoneNumber: accountTable.phoneNumber,
        provider: accountTable.provider,
        status: accountTable.status,
        applicationStatus: accountTable.applicationStatus,
        ma_name: accountMahasiswaDetailTable.name,
        ota_name: accountOtaDetailTable.name,
        admin_name: accountAdminDetailTable.name,
        nim: accountMahasiswaDetailTable.nim,
        mahasiswaStatus: accountMahasiswaDetailTable.mahasiswaStatus,
        description: accountMahasiswaDetailTable.description,
        file: accountMahasiswaDetailTable.file,
        major: accountMahasiswaDetailTable.major,
        faculty: accountMahasiswaDetailTable.faculty,
        cityOfOrigin: accountMahasiswaDetailTable.cityOfOrigin,
        highschoolAlumni: accountMahasiswaDetailTable.highschoolAlumni,
        religion: accountMahasiswaDetailTable.religion,
        gender: accountMahasiswaDetailTable.gender,
        gpa: accountMahasiswaDetailTable.gpa,
        kk: accountMahasiswaDetailTable.kk,
        ktm: accountMahasiswaDetailTable.ktm,
        waliRecommendationLetter:
          accountMahasiswaDetailTable.waliRecommendationLetter,
        transcript: accountMahasiswaDetailTable.transcript,
        salaryReport: accountMahasiswaDetailTable.salaryReport,
        pbb: accountMahasiswaDetailTable.pbb,
        electricityBill: accountMahasiswaDetailTable.electricityBill,
        ditmawaRecommendationLetter:
          accountMahasiswaDetailTable.ditmawaRecommendationLetter,
        bill: accountMahasiswaDetailTable.bill,
        notes: accountMahasiswaDetailTable.notes,
        adminOnlyNotes: accountMahasiswaDetailTable.adminOnlyNotes,
        job: accountOtaDetailTable.job,
        address: accountOtaDetailTable.address,
        linkage: accountOtaDetailTable.linkage,
        funds: accountOtaDetailTable.funds,
        maxCapacity: accountOtaDetailTable.maxCapacity,
        startDate: accountOtaDetailTable.startDate,
        maxSemester: accountOtaDetailTable.maxSemester,
        transferDate: accountOtaDetailTable.transferDate,
        criteria: accountOtaDetailTable.criteria,
        isDetailVisible: accountOtaDetailTable.isDetailVisible,
        allowAdminSelection: accountOtaDetailTable.allowAdminSelection,
      })
      .from(accountTable)
      .leftJoin(
        accountMahasiswaDetailTable,
        eq(accountTable.id, accountMahasiswaDetailTable.accountId),
      )
      .leftJoin(
        accountOtaDetailTable,
        eq(accountTable.id, accountOtaDetailTable.accountId),
      )
      .leftJoin(
        accountAdminDetailTable,
        eq(accountTable.id, accountAdminDetailTable.accountId),
      )
      .where(whereCondition)
      .orderBy(desc(accountTable.createdAt))
      .limit(LIST_PAGE_DETAIL_SIZE)
      .offset(offset);

    const [accountList, countsPagination] = await Promise.all([
      accountListQuery,
      countsPaginationQuery,
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar seluruh akun berhasil diambil",
        body: {
          data: accountList.map((account) => ({
            id: account.id,
            email: account.email,
            phoneNumber: account.phoneNumber || "",
            provider: account.provider,
            status: account.status,
            applicationStatus: account.applicationStatus,
            type: account.type,
            ma_name: account.ma_name || "",
            ota_name: account.ota_name || "",
            admin_name: account.admin_name || "",
            nim: account.nim || "",
            mahasiswaStatus: account.mahasiswaStatus || "inactive",
            description: account.description || "",
            file: account.file || "",
            major: account.major || "",
            faculty: account.faculty || "",
            cityOfOrigin: account.cityOfOrigin || "",
            highschoolAlumni: account.highschoolAlumni || "",
            religion: account.religion || "Islam",
            gender: account.gender || "M",
            gpa: account.gpa || "",
            kk: account.kk || "",
            ktm: account.ktm || "",
            waliRecommendationLetter: account.waliRecommendationLetter || "",
            transcript: account.transcript || "",
            salaryReport: account.salaryReport || "",
            pbb: account.pbb || "",
            electricityBill: account.electricityBill || "",
            ditmawaRecommendationLetter:
              account.ditmawaRecommendationLetter || "",
            bill: account.bill || 0,
            notes: account.notes || "",
            adminOnlyNotes: account.adminOnlyNotes || "",
            job: account.job || "",
            address: account.address || "",
            linkage: account.linkage || "otm",
            funds: account.funds || 0,
            maxCapacity: account.maxCapacity || 0,
            startDate: account.startDate || "",
            maxSemester: account.maxSemester || 0,
            transferDate: account.transferDate || 0,
            criteria: account.criteria || "",
            isDetailVisible: account.isDetailVisible || false,
            allowAdminSelection: account.allowAdminSelection || false,
          })),
          totalPagination: countsPagination[0].count,
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

  // Validate page to be a positive integer
  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

    const countsQuery = db
      .select({ count: count() })
      .from(accountOtaDetailTable)
      .innerJoin(
        connectionTable,
        eq(connectionTable.otaId, accountOtaDetailTable.accountId),
      )
      .where(
        and(
          eq(connectionTable.mahasiswaId, maId),
          eq(connectionTable.connectionStatus, "accepted"),
          ilike(accountOtaDetailTable.name, `%${q || ""}%`),
        ),
      );

    const OTAListQuery = db
      .select({
        accountId: accountOtaDetailTable.accountId,
        name: accountOtaDetailTable.name,
        phoneNumber: accountTable.phoneNumber,
        nominal: accountOtaDetailTable.funds,
      })
      .from(accountOtaDetailTable)
      .innerJoin(
        accountTable,
        eq(accountTable.id, accountOtaDetailTable.accountId),
      )
      .innerJoin(
        connectionTable,
        eq(connectionTable.otaId, accountOtaDetailTable.accountId),
      )
      .where(
        and(
          eq(connectionTable.mahasiswaId, maId),
          eq(connectionTable.connectionStatus, "accepted"),
          ilike(accountOtaDetailTable.name, `%${q || ""}%`),
        ),
      )
      .limit(LIST_PAGE_SIZE)
      .offset(offset);

    const [OTAList, counts] = await Promise.all([OTAListQuery, countsQuery]);

    return c.json(
      {
        success: true,
        message: "Daftar OTA-ku berhasil diambil",
        body: {
          data: OTAList.map((OTA) => ({
            accountId: OTA.accountId,
            name: OTA.name,
            phoneNumber: OTA.phoneNumber ?? "",
            nominal: OTA.nominal,
          })),
          totalData: counts[0].count,
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

  // Validate page to be a positive integer
  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

    const countsQuery = db
      .select({ count: count() })
      .from(connectionTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(connectionTable.mahasiswaId, accountMahasiswaDetailTable.accountId),
      )
      .innerJoin(
        accountTable,
        eq(accountMahasiswaDetailTable.accountId, accountTable.id),
      )
      .where(
        and(
          eq(connectionTable.otaId, otaId),
          eq(connectionTable.connectionStatus, "accepted"),
          or(
            ilike(accountMahasiswaDetailTable.name, `%${q || ""}%`),
            ilike(accountMahasiswaDetailTable.nim, `%${q || ""}%`),
          ),
        ),
      );

    const mahasiswaListQuery = db
      .select({
        accountId: accountMahasiswaDetailTable.accountId,
        name: accountMahasiswaDetailTable.name,
        nim: accountMahasiswaDetailTable.nim,
        major: accountMahasiswaDetailTable.major,
        faculty: accountMahasiswaDetailTable.faculty,
        cityOfOrigin: accountMahasiswaDetailTable.cityOfOrigin,
        highschoolAlumni: accountMahasiswaDetailTable.highschoolAlumni,
        gender: accountMahasiswaDetailTable.gender,
        religion: accountMahasiswaDetailTable.religion,
        gpa: accountMahasiswaDetailTable.gpa,
        mahasiswaStatus: accountMahasiswaDetailTable.mahasiswaStatus,
        request_term_ota: connectionTable.requestTerminateOta,
        request_term_ma: connectionTable.requestTerminateMahasiswa,
      })
      .from(connectionTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(connectionTable.mahasiswaId, accountMahasiswaDetailTable.accountId),
      )
      .innerJoin(
        accountTable,
        eq(accountMahasiswaDetailTable.accountId, accountTable.id),
      )
      .where(
        and(
          eq(connectionTable.otaId, otaId),
          eq(connectionTable.connectionStatus, "accepted"),
          or(
            ilike(accountMahasiswaDetailTable.name, `%${q || ""}%`),
            ilike(accountMahasiswaDetailTable.nim, `%${q || ""}%`),
          ),
        ),
      )
      .limit(LIST_PAGE_SIZE)
      .offset(offset);

    const [mahasiswaList, counts] = await Promise.all([
      mahasiswaListQuery,
      countsQuery,
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar MA aktif berhasil diambil",
        body: {
          data: mahasiswaList.map((mahasiswa) => ({
            accountId: mahasiswa.accountId,
            name: mahasiswa.name!,
            nim: mahasiswa.nim,
            major: mahasiswa.major || "",
            faculty: mahasiswa.faculty || "",
            cityOfOrigin: mahasiswa.cityOfOrigin || "",
            highschoolAlumni: mahasiswa.highschoolAlumni || "",
            gender: mahasiswa.gender!,
            religion: mahasiswa.religion!,
            mahasiswaStatus: mahasiswa.mahasiswaStatus,
            gpa: mahasiswa.gpa!,
            request_term_ota: mahasiswa.request_term_ota,
            request_term_ma: mahasiswa.request_term_ma,
          })),
          totalData: counts[0].count,
        },
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

  // Validate page to be a positive integer
  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

    const countsQuery = db
      .select({ count: count() })
      .from(connectionTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(connectionTable.mahasiswaId, accountMahasiswaDetailTable.accountId),
      )
      .innerJoin(
        accountTable,
        eq(accountMahasiswaDetailTable.accountId, accountTable.id),
      )
      .where(
        and(
          eq(connectionTable.otaId, otaId),
          eq(connectionTable.connectionStatus, "pending"),
          eq(connectionTable.requestTerminateMahasiswa, false),
          eq(connectionTable.requestTerminateOta, false),
          or(
            ilike(accountMahasiswaDetailTable.name, `%${q || ""}%`),
            ilike(accountMahasiswaDetailTable.nim, `%${q || ""}%`),
          ),
        ),
      );

    const mahasiswaListQuery = db
      .select({
        accountId: accountMahasiswaDetailTable.accountId,
        name: accountMahasiswaDetailTable.name,
        nim: accountMahasiswaDetailTable.nim,
        major: accountMahasiswaDetailTable.major,
        faculty: accountMahasiswaDetailTable.faculty,
        cityOfOrigin: accountMahasiswaDetailTable.cityOfOrigin,
        highschoolAlumni: accountMahasiswaDetailTable.highschoolAlumni,
        gender: accountMahasiswaDetailTable.gender,
        religion: accountMahasiswaDetailTable.religion,
        gpa: accountMahasiswaDetailTable.gpa,
        mahasiswaStatus: accountMahasiswaDetailTable.mahasiswaStatus,
        request_term_ota: connectionTable.requestTerminateOta,
        request_term_ma: connectionTable.requestTerminateMahasiswa,
      })
      .from(connectionTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(connectionTable.mahasiswaId, accountMahasiswaDetailTable.accountId),
      )
      .innerJoin(
        accountTable,
        eq(accountMahasiswaDetailTable.accountId, accountTable.id),
      )
      .where(
        and(
          eq(connectionTable.otaId, otaId),
          eq(connectionTable.connectionStatus, "pending"),
          eq(connectionTable.requestTerminateMahasiswa, false),
          eq(connectionTable.requestTerminateOta, false),
          or(
            ilike(accountMahasiswaDetailTable.name, `%${q || ""}%`),
            ilike(accountMahasiswaDetailTable.nim, `%${q || ""}%`),
          ),
        ),
      )
      .limit(LIST_PAGE_SIZE)
      .offset(offset);

    const [mahasiswaList, counts] = await Promise.all([
      mahasiswaListQuery,
      countsQuery,
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar MA pending berhasil diambil",
        body: {
          data: mahasiswaList.map((mahasiswa) => ({
            accountId: mahasiswa.accountId,
            name: mahasiswa.name!,
            nim: mahasiswa.nim,
            major: mahasiswa.major || "",
            faculty: mahasiswa.faculty || "",
            cityOfOrigin: mahasiswa.cityOfOrigin || "",
            highschoolAlumni: mahasiswa.highschoolAlumni || "",
            gender: mahasiswa.gender!,
            religion: mahasiswa.religion!,
            gpa: mahasiswa.gpa!,
            mahasiswaStatus: mahasiswa.mahasiswaStatus,
            request_term_ota: mahasiswa.request_term_ota,
            request_term_ma: mahasiswa.request_term_ma,
          })),
          totalData: counts[0].count,
        },
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

  // Validate page to be a positive integer
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

    const countsQuery = db
      .select({ count: count() })
      .from(accountOtaDetailTable)
      .innerJoin(
        accountTable,
        eq(accountTable.id, accountOtaDetailTable.accountId),
      )
      .where(
        and(
          eq(accountOtaDetailTable.allowAdminSelection, true),
          eq(accountTable.applicationStatus, "accepted"),
          ilike(accountOtaDetailTable.name, `%${q || ""}%`),
        ),
      );

    const otaListQuery = db
      .select({
        id: accountOtaDetailTable.accountId,
        name: accountOtaDetailTable.name,
        number: accountTable.phoneNumber,
        funds: accountOtaDetailTable.funds,
        maxCapacity: accountOtaDetailTable.maxCapacity,
        currentCount: sql<number>`COUNT(${connectionTable.mahasiswaId})`,
        criteria: accountOtaDetailTable.criteria,
      })
      .from(accountOtaDetailTable)
      .innerJoin(
        accountTable,
        eq(accountTable.id, accountOtaDetailTable.accountId),
      )
      .leftJoin(
        connectionTable,
        and(
          eq(connectionTable.otaId, accountOtaDetailTable.accountId),
          eq(connectionTable.connectionStatus, "accepted"),
        ),
      )
      .where(
        and(
          eq(accountOtaDetailTable.allowAdminSelection, true),
          eq(accountTable.applicationStatus, "accepted"),
          ilike(accountOtaDetailTable.name, `%${q || ""}%`),
        ),
      )
      .groupBy(
        accountOtaDetailTable.accountId,
        accountOtaDetailTable.name,
        accountTable.phoneNumber,
        accountOtaDetailTable.funds,
        accountOtaDetailTable.maxCapacity,
        accountOtaDetailTable.criteria,
      )
      .having(
        lt(
          sql<number>`COUNT(${connectionTable.mahasiswaId})`,
          accountOtaDetailTable.maxCapacity,
        ),
      )
      .limit(LIST_PAGE_SIZE)
      .offset(offset);

    const [otaList, counts] = await Promise.all([otaListQuery, countsQuery]);

    return c.json(
      {
        success: true,
        message: "Daftar OTA yang tersedia berhasil diambil",
        body: {
          data: otaList.map((ota) => ({
            accountId: ota.id,
            name: ota.name,
            phoneNumber: ota.number ?? "",
            nominal: ota.funds,
          })),
          totalData: counts[0].count,
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
