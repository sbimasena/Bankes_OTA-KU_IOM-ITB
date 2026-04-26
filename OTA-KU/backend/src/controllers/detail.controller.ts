import { prisma } from "../db/prisma.js";
import { extractFilesFromStudentFiles } from "../lib/file-upload-minio.js";
import {
  getMahasiswaDetailRoute,
  getMahasiswaSayaDetailRoute,
  getMyOtaDetailRoute,
  getOtaDetailRoute,
  getMahasiswaDetailForOTARoute,
} from "../routes/detail.route.js";
import { createAuthRouter, createRouter } from "./router-factory.js";

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
    const mahasiswaUser = await prisma.user.findFirst({
      where: { id },
      include: { MahasiswaProfile: { include: { StudentFiles: true } } },
    });

    if (!mahasiswaUser || !mahasiswaUser.MahasiswaProfile) {
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

    const profile = mahasiswaUser.MahasiswaProfile;
    const files = extractFilesFromStudentFiles(profile.StudentFiles ?? []);

    return c.json(
      {
        success: true,
        message: "Detail mahasiswa berhasil diambil",
        body: {
          id: mahasiswaUser.id,
          email: mahasiswaUser.email,
          type: mahasiswaUser.role as unknown as "mahasiswa" | "ota" | "admin" | "bankes" | "pengurus",
          phoneNumber: mahasiswaUser.phoneNumber!,
          provider: mahasiswaUser.provider,
          applicationStatus: mahasiswaUser.applicationStatus,
          name: profile.name!,
          nim: profile.nim!,
          mahasiswaStatus: profile.mahasiswaStatus!,
          description: profile.description!,
          file: files.file!,
          major: profile.major!,
          faculty: profile.faculty!,
          cityOfOrigin: profile.cityOfOrigin!,
          highschoolAlumni: profile.highschoolAlumni!,
          religion: profile.religion as "Islam" | "Kristen Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu",
          gender: profile.gender as "M" | "F",
          gpa: profile.gpa!,
          kk: files.kk!,
          ktm: files.ktm!,
          waliRecommendationLetter: files.waliRecommendationLetter!,
          transcript: files.transcript!,
          salaryReport: files.salaryReport!,
          pbb: files.pbb!,
          electricityBill: files.electricityBill!,
          ditmawaRecommendationLetter: files.ditmawaRecommendationLetter!,
          bill: profile.bill,
          notes: profile.notes!,
          adminOnlyNotes: profile.adminOnlyNotes!,
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
    const connection = await prisma.connection.findFirst({
      where: { mahasiswaId: id, otaId: user.id },
      include: { MahasiswaProfile: { include: { User: true } } },
    });

    if (!connection || !connection.MahasiswaProfile) {
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

    const profile = connection.MahasiswaProfile;
    const mahasiswaUser = profile.User;
    const testimonial = await prisma.testimonial.findFirst({
      where: {
        mahasiswaId: id,
        otaId: user.id,
      },
      select: {
        content: true,
        imageUrls: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return c.json(
      {
        success: true,
        message: "Detail mahasiswa berhasil diambil",
        body: {
          id: mahasiswaUser.id,
          email: mahasiswaUser.email,
          phoneNumber: mahasiswaUser.phoneNumber!,
          name: profile.name!,
          nim: profile.nim!,
          major: profile.major!,
          faculty: profile.faculty!,
          cityOfOrigin: profile.cityOfOrigin!,
          highschoolAlumni: profile.highschoolAlumni!,
          religion: profile.religion as "Islam" | "Kristen Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu",
          gender: profile.gender as "M" | "F",
          gpa: profile.gpa!,
          notes: profile.notes!,
          createdAt: profile.createdAt.toISOString(),
          testimonial: testimonial?.content ?? null,
          testimonialImages: testimonial?.imageUrls ?? [],
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
    const connection = await prisma.connection.findFirst({
      where: {
        mahasiswaId: id,
        otaId: user.id,
        connectionStatus: "accepted",
      },
      include: {
        MahasiswaProfile: {
          include: {
            User: true,
          },
        },
      },
    });

    if (!connection || !connection.MahasiswaProfile) {
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

    const profile = connection.MahasiswaProfile;
    const mahasiswaUser = profile.User;
    const testimonial = await prisma.testimonial.findFirst({
      where: {
        mahasiswaId: id,
        otaId: user.id,
      },
      select: {
        content: true,
        imageUrls: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return c.json(
      {
        success: true,
        message: "Detail mahasiswa berhasil diambil",
        body: {
          id: mahasiswaUser.id,
          email: mahasiswaUser.email,
          phoneNumber: mahasiswaUser.phoneNumber!,
          name: profile.name!,
          nim: profile.nim!,
          major: profile.major!,
          faculty: profile.faculty!,
          cityOfOrigin: profile.cityOfOrigin!,
          highschoolAlumni: profile.highschoolAlumni!,
          religion: profile.religion as "Islam" | "Kristen Protestan" | "Katolik" | "Hindu" | "Buddha" | "Konghucu",
          gender: profile.gender as "M" | "F",
          gpa: profile.gpa!,
          notes: profile.notes!,
          createdAt: profile.createdAt.toISOString(),
          testimonial: testimonial?.content ?? null,
          testimonialImages: testimonial?.imageUrls ?? [],
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
    const otaUser = await prisma.user.findFirst({
      where: { id },
      include: { OtaProfile: true },
    });

    if (!otaUser || !otaUser.OtaProfile) {
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

    const profile = otaUser.OtaProfile;

    return c.json(
      {
        success: true,
        message: "Detail orang tua asuh berhasil diambil",
        body: {
          id: otaUser.id,
          email: otaUser.email,
          type: otaUser.role as unknown as "mahasiswa" | "ota" | "admin" | "bankes" | "pengurus",
          phoneNumber: otaUser.phoneNumber!,
          provider: otaUser.provider,
          applicationStatus: otaUser.applicationStatus,
          name: profile.name!,
          job: profile.job!,
          address: profile.address!,
          linkage: profile.linkage,
          funds: profile.funds,
          maxCapacity: profile.maxCapacity,
          startDate: profile.startDate.toISOString(),
          maxSemester: profile.maxSemester,
          transferDate: profile.transferDate,
          criteria: profile.criteria,
          allowAdminSelection: profile.allowAdminSelection,
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
    const connection = await prisma.connection.findFirst({
      where: { mahasiswaId: user.id, connectionStatus: "accepted" },
      include: { OtaProfile: { include: { User: true } } },
    });

    if (!connection || !connection.OtaProfile) {
      return c.json(
        {
          success: false,
          message: "Hubungan asuh belum terverifikasi",
          error: {},
        },
        404,
      );
    }

    const profile = connection.OtaProfile;
    const otaUser = profile.User;

    return c.json(
      {
        success: true,
        message: "Detail orang tua asuh berhasil diambil",
        body: {
          id: otaUser.id,
          email: otaUser.email,
          phoneNumber: otaUser.phoneNumber!,
          name: profile.name!,
          transferDate: profile.transferDate,
          isDetailVisible: profile.isDetailVisible,
          createdAt: profile.createdAt.toISOString(),
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
