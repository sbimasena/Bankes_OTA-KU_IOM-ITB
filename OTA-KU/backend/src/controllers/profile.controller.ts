import { hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";

import { env } from "../config/env.config.js";
import { db } from "../db/drizzle.js";
import {
  accountAdminDetailTable,
  accountMahasiswaDetailTable,
  accountOtaDetailTable,
  accountTable,
} from "../db/schema.js";
import { uploadPdfToCloudinary } from "../lib/file-upload.js";
import {
  deleteAccountRoute,
  editProfileMahasiswaRoute,
  editProfileOrangTuaRoute,
  pembuatanAkunBankesPengurusRoute,
  pendaftaranMahasiswaRoute,
  pendaftaranOrangTuaRoute,
  profileMahasiswaRoute,
  profileOrangTuaRoute,
} from "../routes/profile.route.js";
import {
  MahasiswaProfileFormSchema,
  MahasiswaRegistrationFormSchema,
  OrangTuaRegistrationSchema,
  createBankesPengurusSchema,
} from "../zod/profile.js";
import { createAuthRouter, createRouter } from "./router-factory.js";

export const profileRouter = createRouter();
export const profileProtectedRouter = createAuthRouter();

profileProtectedRouter.openapi(pendaftaranMahasiswaRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = MahasiswaRegistrationFormSchema.parse(data);
  const {
    name,
    nim,
    description,
    file,
    phoneNumber,
    cityOfOrigin,
    ditmawaRecommendationLetter,
    electricityBill,
    faculty,
    highschoolAlumni,
    kk,
    ktm,
    major,
    pbb,
    salaryReport,
    transcript,
    waliRecommendationLetter,
    gender,
    gpa,
    religion,
  } = zodParseResult;

  const userAccount = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.id, user.id))
    .limit(1);

  if (userAccount[0].status === "unverified") {
    return c.json(
      {
        success: false,
        message: "Akun anda belum diverifikasi.",
        error: {},
      },
      403,
    );
  }

  if (user.type !== "mahasiswa") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya MA yang bisa mendaftar sebagai mahasiswa asuh",
        },
      },
      403,
    );
  }

  try {
    const uploads = [
      uploadPdfToCloudinary(file),
      uploadPdfToCloudinary(kk),
      uploadPdfToCloudinary(ktm),
      uploadPdfToCloudinary(waliRecommendationLetter),
      uploadPdfToCloudinary(transcript),
      uploadPdfToCloudinary(salaryReport),
      uploadPdfToCloudinary(pbb),
      uploadPdfToCloudinary(electricityBill),
    ];

    if (ditmawaRecommendationLetter !== undefined) {
      uploads.push(uploadPdfToCloudinary(ditmawaRecommendationLetter));
    }

    const results = await Promise.all(uploads);

    const [
      fileResult,
      kkResult,
      ktmResult,
      waliRecommendationLetterResult,
      transcriptResult,
      salaryReportResult,
      pbbResult,
      electricityBillResult,
      ditmawaRecommendationLetterResult, // will be undefined if not uploaded
    ] = [
      ...results,
      ditmawaRecommendationLetter !== undefined
        ? results[results.length - 1]
        : undefined,
    ];

    await db.transaction(async (tx) => {
      const currentDateTime = new Date();

      // Due date time is 6 months from now
      const dueDateTime = new Date(
        currentDateTime.getFullYear(),
        currentDateTime.getMonth() + 6,
        currentDateTime.getDate(),
        currentDateTime.getHours(),
        currentDateTime.getMinutes(),
        currentDateTime.getSeconds(),
        currentDateTime.getMilliseconds(),
      );

      await tx
        .update(accountTable)
        .set({ phoneNumber })
        .where(eq(accountTable.id, user.id));

      const baseValues = {
        accountId: user.id,
        name,
        nim,
        description,
        major,
        faculty,
        cityOfOrigin,
        highschoolAlumni,
        religion,
        gender,
        gpa: String(gpa),
        file: fileResult?.secure_url,
        kk: kkResult?.secure_url,
        ktm: ktmResult?.secure_url,
        waliRecommendationLetter: waliRecommendationLetterResult?.secure_url,
        transcript: transcriptResult?.secure_url,
        salaryReport: salaryReportResult?.secure_url,
        pbb: pbbResult?.secure_url,
        electricityBill: electricityBillResult?.secure_url,
        createdAt: currentDateTime,
        updatedAt: currentDateTime,
        dueNextUpdateAt: dueDateTime,
        ...(ditmawaRecommendationLetterResult && {
          ditmawaRecommendationLetter:
            ditmawaRecommendationLetterResult.secure_url,
        }),
      };

      await tx
        .insert(accountMahasiswaDetailTable)
        .values(baseValues)
        .onConflictDoUpdate({
          target: [accountMahasiswaDetailTable.accountId],
          set: baseValues,
        });

      await tx
        .update(accountTable)
        .set({ applicationStatus: "pending" })
        .where(eq(accountTable.id, user.id));
    });

    const accessToken = await sign(
      {
        id: user.id,
        name,
        email: user.email,
        phoneNumber: phoneNumber,
        type: user.type,
        provider: user.provider,
        oid: user.oid,
        createdAt: user.createdAt,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      env.JWT_SECRET,
    );

    setCookie(c, "ota-ku.access-cookie", accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return c.json(
      {
        success: true,
        message: "Berhasil mendaftar.",
        body: {
          name,
          nim,
          description,
          major,
          faculty,
          cityOfOrigin,
          highschoolAlumni,
          religion,
          gender,
          gpa,
          file: fileResult?.secure_url ?? "",
          kk: kkResult?.secure_url ?? "",
          ktm: ktmResult?.secure_url ?? "",
          waliRecommendationLetter:
            waliRecommendationLetterResult?.secure_url ?? "",
          transcript: transcriptResult?.secure_url ?? "",
          salaryReport: salaryReportResult?.secure_url ?? "",
          pbb: pbbResult?.secure_url ?? "",
          electricityBill: electricityBillResult?.secure_url ?? "",
          ditmawaRecommendationLetter:
            ditmawaRecommendationLetterResult?.secure_url ?? "",
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
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

profileProtectedRouter.openapi(pendaftaranOrangTuaRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = OrangTuaRegistrationSchema.parse(data);

  const {
    name,
    address,
    criteria,
    funds,
    job,
    linkage,
    maxCapacity,
    maxSemester,
    startDate,
    transferDate,
    isDetailVisible,
    allowAdminSelection,
  } = zodParseResult;

  const userAccount = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.id, user.id))
    .limit(1);

  if (userAccount[0].status === "unverified") {
    return c.json(
      {
        success: false,
        message: "Akun anda belum diverifikasi.",
        error: {},
      },
      403,
    );
  }

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya OTA yang bisa mendaftar sebagai orang tua asuh",
        },
      },
      403,
    );
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(accountOtaDetailTable).values({
        accountId: user.id,
        address,
        criteria: criteria ?? "",
        funds,
        job,
        linkage,
        maxCapacity,
        maxSemester,
        startDate: new Date(startDate),
        name,
        transferDate,
        isDetailVisible: isDetailVisible === "true",
        allowAdminSelection: allowAdminSelection === "true",
      });

      await tx
        .update(accountTable)
        .set({ applicationStatus: "pending" })
        .where(eq(accountTable.id, user.id));
    });

    const accessToken = await sign(
      {
        id: user.id,
        name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        type: user.type,
        provider: user.provider,
        oid: user.oid,
        createdAt: user.createdAt,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      env.JWT_SECRET,
    );

    setCookie(c, "ota-ku.access-cookie", accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return c.json(
      {
        success: true,
        message: "Berhasil mendaftar.",
        body: {
          name,
          address,
          criteria,
          funds,
          job,
          linkage,
          maxCapacity,
          maxSemester,
          startDate,
          transferDate,
          isDetailVisible,
          allowAdminSelection,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
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

profileProtectedRouter.openapi(pembuatanAkunBankesPengurusRoute, async (c) => {
  const user = c.var.user
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = createBankesPengurusSchema.parse(data);

  const { name, email, password, type, phoneNumber } = zodParseResult;

  const hashedPassword = await hash(password, 10);

  if (user.type !== "admin") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya admin yang bisa membuatkan akun bankes dan pengurus",
        },
      },
      403,
    );
  }

  try {
    const newUser = await db
      .insert(accountTable)
      .values({
        email: email,
        password: hashedPassword,
        type: type,
        phoneNumber: phoneNumber,
        provider: "credentials",
        status: "verified",
        applicationStatus: "accepted",
      })
      .returning();

    await db.insert(accountAdminDetailTable).values({
      accountId: newUser[0].id,
      name: name,
    });

    return c.json(
      {
        success: true,
        message: "Berhasil membuat akun bankes/pengurus",
        body: {
          id: newUser[0].id,
          name: name,
          email: newUser[0].email,
          type: newUser[0].type,
          phoneNumber: newUser[0].phoneNumber ?? "",
          provider: newUser[0].provider,
          status: newUser[0].status,
          application_status: newUser[0].applicationStatus,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
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

profileProtectedRouter.openapi(editProfileOrangTuaRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());
  const zodParseResult = OrangTuaRegistrationSchema.parse(data);

  const {
    name,
    address,
    criteria,
    funds,
    job,
    linkage,
    maxCapacity,
    maxSemester,
    startDate,
    transferDate,
    isDetailVisible,
    allowAdminSelection,
  } = zodParseResult;

  const userAccount = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.id, user.id))
    .limit(1);

  if (userAccount[0].status === "unverified") {
    return c.json(
      {
        success: false,
        message: "Akun anda belum diverifikasi.",
        error: {},
      },
      403,
    );
  }

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya OTA yang bisa melakukan perubahan pada profile OTA",
        },
      },
      403,
    );
  }

  try {
    await db
      .update(accountOtaDetailTable)
      .set({
        address,
        criteria,
        funds,
        job,
        linkage,
        maxCapacity,
        maxSemester,
        name,
        transferDate,
      })
      .where(eq(accountOtaDetailTable.accountId, user.id));

    return c.json(
      {
        success: true,
        message: "Profil OTA berhasil diperbarui.",
        body: {
          name,
          address,
          criteria,
          funds,
          job,
          linkage,
          maxCapacity,
          maxSemester,
          startDate,
          transferDate,
          isDetailVisible,
          allowAdminSelection,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
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

profileProtectedRouter.openapi(editProfileMahasiswaRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = MahasiswaProfileFormSchema.parse(data);
  const {
    name,
    nim,
    description,
    file,
    phoneNumber,
    cityOfOrigin,
    ditmawaRecommendationLetter,
    electricityBill,
    faculty,
    highschoolAlumni,
    kk,
    ktm,
    major,
    pbb,
    salaryReport,
    transcript,
    waliRecommendationLetter,
    gender,
    gpa,
    religion,
  } = zodParseResult;

  const userAccount = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.id, user.id))
    .limit(1);

  if (userAccount[0].status === "unverified") {
    return c.json(
      {
        success: false,
        message: "Akun anda belum diverifikasi.",
        error: {},
      },
      403,
    );
  }

  if (user.type !== "mahasiswa") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya MA yang bisa melakukan perubahan pada profile MA",
        },
      },
      403,
    );
  }

  try {
    // Get existing profile data first
    const [existingProfile] = await db
      .select()
      .from(accountMahasiswaDetailTable)
      .where(eq(accountMahasiswaDetailTable.accountId, user.id))
      .limit(1);

    // Prepare upload tasks only for files that are actually File objects
    const uploadTasks = {
      file,
      kk,
      ktm,
      waliRecommendationLetter,
      transcript,
      salaryReport,
      pbb,
      electricityBill,
      ditmawaRecommendationLetter,
    };

    // Process uploads in parallel
    const uploadResults = await Promise.all(
      Object.entries(uploadTasks).map(async ([field, value]) => {
        if (value instanceof File) {
          const result = await uploadPdfToCloudinary(value);
          return { field, url: result?.secure_url };
        }
        return { field, url: value }; // This could be string URL or undefined
      }),
    );

    // Convert upload results to an object
    const resultUrls = uploadResults.reduce(
      (acc, { field, url }) => {
        acc[field] =
          url ||
          (existingProfile && field in existingProfile
            ? (existingProfile[field as keyof typeof existingProfile] as string)
            : "");
        return acc;
      },
      {} as Record<string, string>,
    );

    const currentDateTime = new Date();

    await db.transaction(async (tx) => {
      // Update phone number in account table and application status = reapply
      await tx
        .update(accountTable)
        .set({ phoneNumber, applicationStatus: "reapply" })
        .where(eq(accountTable.id, user.id));

      await tx
        .update(accountMahasiswaDetailTable)
        .set({
          name,
          nim,
          description,
          major,
          faculty,
          cityOfOrigin,
          highschoolAlumni,
          religion,
          gender,
          gpa: String(gpa),
          file: resultUrls.file,
          kk: resultUrls.kk,
          ktm: resultUrls.ktm,
          waliRecommendationLetter: resultUrls.waliRecommendationLetter,
          transcript: resultUrls.transcript,
          salaryReport: resultUrls.salaryReport,
          pbb: resultUrls.pbb,
          electricityBill: resultUrls.electricityBill,
          ditmawaRecommendationLetter: resultUrls.ditmawaRecommendationLetter,
          updatedAt: currentDateTime,
          dueNextUpdateAt: new Date(
            currentDateTime.getFullYear(),
            currentDateTime.getMonth() + 6,
            currentDateTime.getDate(),
            currentDateTime.getHours(),
            currentDateTime.getMinutes(),
            currentDateTime.getSeconds(),
            currentDateTime.getMilliseconds(),
          ),
        })
        .where(eq(accountMahasiswaDetailTable.accountId, user.id));
    });

    return c.json(
      {
        success: true,
        message: "Berhasil edit profile MA.",
        body: {
          name,
          nim,
          description,
          major,
          faculty,
          cityOfOrigin,
          highschoolAlumni,
          religion,
          gender,
          gpa,
          file: resultUrls.file,
          kk: resultUrls.kk,
          ktm: resultUrls.ktm,
          waliRecommendationLetter: resultUrls.waliRecommendationLetter,
          transcript: resultUrls.transcript,
          salaryReport: resultUrls.salaryReport,
          pbb: resultUrls.pbb,
          electricityBill: resultUrls.electricityBill,
          ditmawaRecommendationLetter: resultUrls.ditmawaRecommendationLetter,
          createdAt: existingProfile.createdAt,
          updatedAt: new Date(),
          dueNextUpdateAt: new Date(
            existingProfile.dueNextUpdateAt.getFullYear(),
            existingProfile.dueNextUpdateAt.getMonth() + 6,
            existingProfile.dueNextUpdateAt.getDate(),
            existingProfile.dueNextUpdateAt.getHours(),
            existingProfile.dueNextUpdateAt.getMinutes(),
            existingProfile.dueNextUpdateAt.getSeconds(),
            existingProfile.dueNextUpdateAt.getMilliseconds(),
          ),
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? { message: error.message } : {},
      },
      500,
    );
  }
});

profileProtectedRouter.openapi(profileOrangTuaRoute, async (c) => {
  const user = c.var.user;

  const userAccount = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.id, user.id))
    .limit(1);

  if (userAccount[0].status === "unverified") {
    return c.json(
      {
        success: false,
        message: "Akun anda belum diverifikasi.",
        error: {},
      },
      403,
    );
  }

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya OTA yang bisa mengakses profile OTA",
        },
      },
      403,
    );
  }

  try {
    const profileDataOTA = await db
      .select({
        email: accountTable.email,
        phone_number: accountTable.phoneNumber,
        name: accountOtaDetailTable.name,
        join_date: accountOtaDetailTable.createdAt,
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
        eq(accountOtaDetailTable.accountId, accountTable.id),
      )
      .where(eq(accountTable.id, user.id))
      .limit(1);

    if (profileDataOTA.length === 0) {
      return c.json(
        {
          success: false,
          message: "Profil tidak ditemukan.",
          error: {},
        },
        404,
      );
    }

    const formattedProfile = {
      email: profileDataOTA[0].email,
      phone_number: profileDataOTA[0].phone_number ?? "",
      name: profileDataOTA[0].name,
      job: profileDataOTA[0].job,
      address: profileDataOTA[0].address,
      linkage: profileDataOTA[0].linkage,
      funds: profileDataOTA[0].funds,
      maxCapacity: profileDataOTA[0].maxCapacity,
      startDate: profileDataOTA[0].startDate
        ? profileDataOTA[0].startDate.toISOString().split("T")[0]
        : undefined,
      maxSemester: profileDataOTA[0].maxSemester,
      transferDate: profileDataOTA[0].transferDate,
      criteria: profileDataOTA[0].criteria,
      isDetailVisible: profileDataOTA[0].isDetailVisible,
      allowAdminSelection: profileDataOTA[0].allowAdminSelection!,
      join_date: profileDataOTA[0].join_date,
    };

    return c.json(
      {
        success: true,
        message: "Berhasil mengakses profil OTA",
        body: formattedProfile,
      },
      200,
    );
  } catch (error) {
    console.error(error);
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

profileProtectedRouter.openapi(profileMahasiswaRoute, async (c) => {
  const user = c.var.user;

  const userAccount = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.id, user.id))
    .limit(1);

  if (userAccount[0].status === "unverified") {
    return c.json(
      {
        success: false,
        message: "Akun anda belum diverifikasi.",
        error: {},
      },
      403,
    );
  }

  if (user.type !== "mahasiswa") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya MA yang bisa mengakses profile MA",
        },
      },
      403,
    );
  }

  try {
    const profileDataMahasiswa = await db
      .select({
        email: accountTable.email,
        phone_number: accountTable.phoneNumber,
        name: accountMahasiswaDetailTable.name,
        nim: accountMahasiswaDetailTable.nim,
        description: accountMahasiswaDetailTable.description,
        major: accountMahasiswaDetailTable.major,
        faculty: accountMahasiswaDetailTable.faculty,
        cityOfOrigin: accountMahasiswaDetailTable.cityOfOrigin,
        highschoolAlumni: accountMahasiswaDetailTable.highschoolAlumni,
        religion: accountMahasiswaDetailTable.religion,
        gender: accountMahasiswaDetailTable.gender,
        gpa: accountMahasiswaDetailTable.gpa,
        file: accountMahasiswaDetailTable.file,
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
        createdAt: accountMahasiswaDetailTable.createdAt,
        updatedAt: accountMahasiswaDetailTable.updatedAt,
        dueNextUpdateAt: accountMahasiswaDetailTable.dueNextUpdateAt,
        applicationStatus: accountTable.applicationStatus,
      })
      .from(accountTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(accountMahasiswaDetailTable.accountId, accountTable.id),
      )
      .where(eq(accountTable.id, user.id))
      .limit(1);

    if (profileDataMahasiswa.length === 0) {
      return c.json(
        {
          success: false,
          message: "Profil tidak ditemukan.",
          error: {},
        },
        404,
      );
    }

    const formattedProfile = {
      email: profileDataMahasiswa[0].email,
      phone_number: profileDataMahasiswa[0].phone_number ?? "",
      name: profileDataMahasiswa[0].name!,
      nim: profileDataMahasiswa[0].nim ?? undefined,
      description: profileDataMahasiswa[0].description ?? undefined,
      major: profileDataMahasiswa[0].major ?? undefined,
      faculty: profileDataMahasiswa[0].faculty ?? undefined,
      cityOfOrigin: profileDataMahasiswa[0].cityOfOrigin ?? undefined,
      highschoolAlumni: profileDataMahasiswa[0].highschoolAlumni ?? undefined,
      religion: profileDataMahasiswa[0].religion!,
      gender: profileDataMahasiswa[0].gender!,
      gpa: Number(profileDataMahasiswa[0].gpa!),
      file: profileDataMahasiswa[0].file ?? undefined,
      kk: profileDataMahasiswa[0].kk ?? undefined,
      ktm: profileDataMahasiswa[0].ktm ?? undefined,
      waliRecommendationLetter:
        profileDataMahasiswa[0].waliRecommendationLetter ?? undefined,
      transcript: profileDataMahasiswa[0].transcript ?? undefined,
      salaryReport: profileDataMahasiswa[0].salaryReport ?? undefined,
      pbb: profileDataMahasiswa[0].pbb ?? undefined,
      electricityBill: profileDataMahasiswa[0].electricityBill ?? undefined,
      ditmawaRecommendationLetter:
        profileDataMahasiswa[0].ditmawaRecommendationLetter ?? undefined,
      createdAt: profileDataMahasiswa[0].createdAt,
      updatedAt: profileDataMahasiswa[0].updatedAt,
      dueNextUpdateAt: profileDataMahasiswa[0].dueNextUpdateAt,
      applicationStatus: profileDataMahasiswa[0].applicationStatus,
      // join_date: new Date(profileDataMahasiswa[0].join_date).toLocaleString("en-US", {
      //   month: "long",
      //   year: "numeric",
      // }),
    };

    return c.json(
      {
        success: true,
        message: "Berhasil mengakses profil MA",
        body: formattedProfile,
      },
      200,
    );
  } catch (error) {
    console.error(error);
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

profileProtectedRouter.openapi(deleteAccountRoute, async (c) => {
  const { id } = c.req.param();

  try {
    await db.delete(accountTable).where(eq(accountTable.id, id));

    return c.json(
      {
        success: true,
        message: "Successfully deleted an account",
        body: { id: id },
      },
      200,
    );
  } catch (error) {
    console.error(error);
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
