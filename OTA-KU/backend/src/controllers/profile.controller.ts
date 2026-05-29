import { hash } from "bcrypt";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";

import { env } from "../config/env.config.js";
import { prisma } from "../db/prisma.js";
import {
  extractFilesFromStudentFiles,
  upsertStudentFile,
} from "../lib/file-upload-minio.js";
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
import type { StudentFileType } from "@prisma/client";
import type { Fakultas, Jurusan } from "../lib/nim.js";
import { createAuthRouter, createRouter } from "./router-factory.js";

export const profileRouter = createRouter();
export const profileProtectedRouter = createAuthRouter();

profileProtectedRouter.openapi(pendaftaranMahasiswaRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  try {
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

    // Convert space-formatted major to underscore format for Prisma
    const majorForDb = major?.replace(/ /g, "_") as Jurusan | undefined;

    // Convert hyphen-formatted faculty to underscore format for Prisma
    const facultyForDb = (faculty?.replace(/-/g, "_") as unknown) as Fakultas | undefined;

    const userAccount = await prisma.user.findFirst({
      where: { id: user.id },
    });

    if (userAccount?.verificationStatus === "unverified") {
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

    // Upload all files first (outside tx — cannot mix Prisma tx with MinIO)
    const fileUrls: Record<string, string | null> = {};
    const fileTypeMap: Array<[any, StudentFileType]> = [
      [file, "Profile_Photo"],
      [kk, "KK"],
      [ktm, "KTM"],
      [waliRecommendationLetter, "Wali_Recommendation_Letter"],
      [transcript, "Transcript"],
      [salaryReport, "Salary_Report"],
      [pbb, "PBB"],
      [electricityBill, "Electricity_Bill"],
    ];

    if (ditmawaRecommendationLetter !== undefined) {
      fileTypeMap.push([ditmawaRecommendationLetter, "Ditmawa_Recommendation_Letter"]);
    }

    await Promise.all(
      fileTypeMap.map(async ([f, type]) => {
        const url = await upsertStudentFile(user.id, type, f);
        fileUrls[type] = url;
      }),
    );

    // Then update profile + set applicationStatus in a transaction
    await prisma.$transaction(async (tx) => {
      const currentDateTime = new Date();

      // Due date is 6 months from now
      const dueDateTime = new Date(
        currentDateTime.getFullYear(),
        currentDateTime.getMonth() + 6,
        currentDateTime.getDate(),
        currentDateTime.getHours(),
        currentDateTime.getMinutes(),
        currentDateTime.getSeconds(),
        currentDateTime.getMilliseconds(),
      );

      await tx.user.update({
        where: { id: user.id },
        data: { phoneNumber },
      });

      await tx.mahasiswaProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          name,
          nim,
          description,
          major: majorForDb,
          faculty: facultyForDb,
          cityOfOrigin,
          highschoolAlumni,
          religion,
          gender,
          gpa: String(gpa),
          createdAt: currentDateTime,
          updatedAt: currentDateTime,
          dueNextUpdateAt: dueDateTime,
        },
        update: {
          name,
          nim,
          description,
          major: majorForDb,
          faculty: facultyForDb,
          cityOfOrigin,
          highschoolAlumni,
          religion,
          gender,
          gpa: String(gpa),
          updatedAt: currentDateTime,
          dueNextUpdateAt: dueDateTime,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { applicationStatus: "pending" },
      });
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
          file: fileUrls["Profile_Photo"] ?? "",
          kk: fileUrls["KK"] ?? "",
          ktm: fileUrls["KTM"] ?? "",
          waliRecommendationLetter: fileUrls["Wali_Recommendation_Letter"] ?? "",
          transcript: fileUrls["Transcript"] ?? "",
          salaryReport: fileUrls["Salary_Report"] ?? "",
          pbb: fileUrls["PBB"] ?? "",
          electricityBill: fileUrls["Electricity_Bill"] ?? "",
          ditmawaRecommendationLetter: fileUrls["Ditmawa_Recommendation_Letter"] ?? "",
        },
      },
      200,
    );
  } catch (error) {
    console.error("Pendaftaran Mahasiswa Error:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : error,
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

  const userAccount = await prisma.user.findFirst({
    where: { id: user.id },
  });

  if (userAccount?.verificationStatus === "unverified") {
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
    await prisma.$transaction(async (tx) => {
      await tx.otaProfile.create({
        data: {
          userId: user.id,
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
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { applicationStatus: "pending" },
      });
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
  const user = c.var.user;
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
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: (type === "bankes" ? "Bankes" : "Pengurus_IOM") as "Bankes" | "Pengurus_IOM",
        phoneNumber,
        provider: "credentials",
        verificationStatus: "verified",
        applicationStatus: "accepted",
      },
    });

    await prisma.adminProfile.create({
      data: {
        userId: newUser.id,
        name,
      },
    });

    return c.json(
      {
        success: true,
        message: "Berhasil membuat akun bankes/pengurus",
        body: {
          id: newUser.id,
          name: name,
          email: newUser.email,
          type: newUser.role as unknown as "mahasiswa" | "ota" | "admin" | "bankes" | "pengurus",
          phoneNumber: newUser.phoneNumber ?? "",
          provider: newUser.provider,
          status: newUser.verificationStatus,
          application_status: newUser.applicationStatus,
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

  const userAccount = await prisma.user.findFirst({
    where: { id: user.id },
  });

  if (userAccount?.verificationStatus === "unverified") {
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
    const parsedIsDetailVisible =
      typeof isDetailVisible === "boolean"
        ? isDetailVisible
        : isDetailVisible === "true";
    const parsedAllowAdminSelection =
      typeof allowAdminSelection === "boolean"
        ? allowAdminSelection
        : allowAdminSelection === "true";
    const responseIsDetailVisible: "true" | "false" = parsedIsDetailVisible
      ? "true"
      : "false";
    const responseAllowAdminSelection: "true" | "false" = parsedAllowAdminSelection
      ? "true"
      : "false";

    await prisma.otaProfile.update({
      where: { userId: user.id },
      data: {
        address,
        criteria,
        funds,
        job,
        linkage,
        maxCapacity,
        maxSemester,
        name,
        transferDate,
        startDate: startDate ? new Date(startDate) : undefined,
        isDetailVisible: parsedIsDetailVisible,
        allowAdminSelection: parsedAllowAdminSelection,
      },
    });

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
          isDetailVisible: responseIsDetailVisible,
          allowAdminSelection: responseAllowAdminSelection,
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

  const userAccount = await prisma.user.findFirst({
    where: { id: user.id },
  });

  if (userAccount?.verificationStatus === "unverified") {
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
    // Get existing profile for dueNextUpdateAt reference in response
    const existingProfile = await prisma.mahasiswaProfile.findFirst({
      where: { userId: user.id },
    });

    // Upload files outside of transaction (cannot mix Prisma tx with MinIO)
    const fileTypeMap: Array<[File | string | undefined, StudentFileType]> = [
      [file, "Profile_Photo"],
      [kk, "KK"],
      [ktm, "KTM"],
      [waliRecommendationLetter, "Wali_Recommendation_Letter"],
      [transcript, "Transcript"],
      [salaryReport, "Salary_Report"],
      [pbb, "PBB"],
      [electricityBill, "Electricity_Bill"],
      [ditmawaRecommendationLetter, "Ditmawa_Recommendation_Letter"],
    ];

    const fileUrls: Record<string, string | null> = {};

    await Promise.all(
      fileTypeMap.map(async ([f, type]) => {
        const url = await upsertStudentFile(user.id, type, f);
        fileUrls[type] = url;
      }),
    );

    const currentDateTime = new Date();

    await prisma.$transaction(async (tx) => {
      // Update phone number in account table and application status = reapply
      await tx.user.update({
        where: { id: user.id },
        data: { phoneNumber, applicationStatus: "reapply" },
      });

      await tx.mahasiswaProfile.update({
        where: { userId: user.id },
        data: {
          name,
          nim,
          description,
          major: major as Jurusan | undefined,
          faculty: faculty as Fakultas | undefined,
          cityOfOrigin,
          highschoolAlumni,
          religion,
          gender,
          gpa: String(gpa),
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
        },
      });
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
          file: fileUrls["Profile_Photo"] ?? "",
          kk: fileUrls["KK"] ?? "",
          ktm: fileUrls["KTM"] ?? "",
          waliRecommendationLetter: fileUrls["Wali_Recommendation_Letter"] ?? "",
          transcript: fileUrls["Transcript"] ?? "",
          salaryReport: fileUrls["Salary_Report"] ?? "",
          pbb: fileUrls["PBB"] ?? "",
          electricityBill: fileUrls["Electricity_Bill"] ?? "",
          ditmawaRecommendationLetter: fileUrls["Ditmawa_Recommendation_Letter"] ?? "",
          createdAt: existingProfile?.createdAt,
          updatedAt: new Date(),
          dueNextUpdateAt: existingProfile?.dueNextUpdateAt
            ? new Date(
              existingProfile.dueNextUpdateAt.getFullYear(),
              existingProfile.dueNextUpdateAt.getMonth() + 6,
              existingProfile.dueNextUpdateAt.getDate(),
              existingProfile.dueNextUpdateAt.getHours(),
              existingProfile.dueNextUpdateAt.getMinutes(),
              existingProfile.dueNextUpdateAt.getSeconds(),
              existingProfile.dueNextUpdateAt.getMilliseconds(),
            )
            : undefined,
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

  const userAccount = await prisma.user.findFirst({
    where: { id: user.id },
  });

  if (userAccount?.verificationStatus === "unverified") {
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
    const userData = await prisma.user.findFirst({
      where: { id: user.id },
      include: { OtaProfile: true },
    });

    if (!userData?.OtaProfile) {
      return c.json(
        {
          success: false,
          message: "Profil tidak ditemukan.",
          error: {},
        },
        404,
      );
    }

    const profile = userData.OtaProfile;

    const formattedProfile = {
      email: userData.email,
      phone_number: userData.phoneNumber ?? "",
      name: profile.name,
      job: profile.job,
      address: profile.address,
      linkage: profile.linkage,
      funds: profile.funds,
      maxCapacity: profile.maxCapacity,
      startDate: profile.startDate
        ? profile.startDate.toISOString().split("T")[0]
        : undefined,
      maxSemester: profile.maxSemester,
      transferDate: profile.transferDate,
      criteria: profile.criteria,
      isDetailVisible: profile.isDetailVisible,
      allowAdminSelection: profile.allowAdminSelection!,
      join_date: profile.createdAt,
    };

    console.log("ProfileOTA response body:", formattedProfile);

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

  const userAccount = await prisma.user.findFirst({
    where: { id: user.id },
  });

  if (userAccount?.verificationStatus === "unverified") {
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
    const userData = await prisma.user.findFirst({
      where: { id: user.id },
      include: {
        MahasiswaProfile: {
          include: { StudentFiles: true },
        },
      },
    });

    if (!userData?.MahasiswaProfile) {
      return c.json(
        {
          success: false,
          message: "Profil tidak ditemukan.",
          error: {},
        },
        404,
      );
    }

    const profile = userData.MahasiswaProfile;
    const files = extractFilesFromStudentFiles(profile.StudentFiles ?? []);

    const formattedProfile = {
      email: userData.email,
      phone_number: userData.phoneNumber ?? "",
      name: profile.name!,
      nim: profile.nim ?? undefined,
      description: profile.description ?? undefined,
      major: profile.major ?? undefined,
      faculty: profile.faculty ?? undefined,
      cityOfOrigin: profile.cityOfOrigin ?? undefined,
      highschoolAlumni: profile.highschoolAlumni ?? undefined,
      religion: profile.religion as "Islam" | "Kristen Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu",
      gender: profile.gender as "M" | "F",
      gpa: Number(profile.gpa!),
      file: files.file ?? undefined,
      kk: files.kk ?? undefined,
      ktm: files.ktm ?? undefined,
      waliRecommendationLetter: files.waliRecommendationLetter ?? undefined,
      transcript: files.transcript ?? undefined,
      salaryReport: files.salaryReport ?? undefined,
      pbb: files.pbb ?? undefined,
      electricityBill: files.electricityBill ?? undefined,
      ditmawaRecommendationLetter: files.ditmawaRecommendationLetter ?? undefined,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      dueNextUpdateAt: profile.dueNextUpdateAt,
      applicationStatus: userData.applicationStatus,
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
    await prisma.user.delete({ where: { id } });

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
