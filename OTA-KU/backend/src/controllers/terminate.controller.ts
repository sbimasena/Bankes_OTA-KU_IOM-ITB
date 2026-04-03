import nodemailer from "nodemailer";

import { env } from "../config/env.config.js";
import { prisma } from "../db/prisma.js";
import { requestTerminasiEmail } from "../lib/email/request-terminasi.js";
import { terminasiAcceptedMAEmail } from "../lib/email/terminasi-accepted-ma.js";
import { sendNotification } from "../lib/web-push.js";
import {
  listTerminateForAdminRoute,
  listTerminateForOTARoute,
  rejectTerminateRoute,
  requestTerminateFromMARoute,
  requestTerminateFromOTARoute,
  terminationStatusMARoute,
  validateTerminateRoute,
} from "../routes/terminate.route.js";
import { SubscriptionSchema } from "../zod/push.js";
import {
  TerminateRequestSchema,
  listTerminateQuerySchema,
  verifTerminateRequestSchema,
} from "../zod/terminate.js";
import { createAuthRouter } from "./router-factory.js";

export const terminateProtectedRouter = createAuthRouter();

const LIST_PAGE_SIZE = 6;

terminateProtectedRouter.openapi(listTerminateForAdminRoute, async (c) => {
  const user = c.var.user;
  const zodParseResult = listTerminateQuerySchema.parse(c.req.query());
  const { q, page } = zodParseResult;

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

  // Validate page to be a positive integer
  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

    const whereClause = {
      AND: [
        {
          OR: [
            { requestTerminateMahasiswa: true },
            { requestTerminateOta: true },
          ],
        },
        {
          OR: [
            {
              MahasiswaProfile: {
                name: { contains: q || "", mode: "insensitive" as const },
              },
            },
            {
              MahasiswaProfile: {
                nim: { contains: q || "", mode: "insensitive" as const },
              },
            },
            {
              OtaProfile: {
                name: { contains: q || "", mode: "insensitive" as const },
              },
            },
          ],
        },
      ],
    };

    const [terminateList, totalCount] = await Promise.all([
      prisma.connection.findMany({
        where: whereClause,
        include: {
          MahasiswaProfile: true,
          OtaProfile: { include: { User: true } },
        },
        skip: offset,
        take: LIST_PAGE_SIZE,
      }),
      prisma.connection.count({ where: whereClause }),
    ]);

    return c.json(
      {
        success: true,
        message: "Berhasil mendapatkan daftar request terminate untuk Admin",
        body: {
          data: terminateList.map((terminate) => ({
            otaId: terminate.otaId,
            otaName: terminate.OtaProfile?.name ?? "",
            otaNumber: terminate.OtaProfile?.User?.phoneNumber ?? "",
            mahasiswaId: terminate.mahasiswaId,
            maName: terminate.MahasiswaProfile?.name ?? "",
            maNIM: terminate.MahasiswaProfile?.nim ?? null,
            createdAt: terminate.createdAt,
            requestTerminateOTA: terminate.requestTerminateOta,
            requestTerminateMA: terminate.requestTerminateMahasiswa,
            requestTerminationNoteOTA: terminate.requestTerminationNoteOta!,
            requestTerminationNoteMA: terminate.requestTerminationNoteMa!,
          })),
          totalData: totalCount,
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

terminateProtectedRouter.openapi(listTerminateForOTARoute, async (c) => {
  const user = c.var.user;
  const zodParseResult = listTerminateQuerySchema.parse(c.req.query());
  const { q, page } = zodParseResult;

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

  const userAccount = await prisma.user.findFirst({
    where: { id: user.id },
    select: { verificationStatus: true },
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

  // Validate page to be a positive integer
  let pageNumber = Number(page);
  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = 1;
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

    const whereClause = {
      otaId: user.id,
      connectionStatus: "accepted" as const,
      OR: [
        {
          MahasiswaProfile: {
            name: { contains: q || "", mode: "insensitive" as const },
          },
        },
        {
          MahasiswaProfile: {
            nim: { contains: q || "", mode: "insensitive" as const },
          },
        },
      ],
    };

    const [terminateList, totalCount] = await Promise.all([
      prisma.connection.findMany({
        where: whereClause,
        include: { MahasiswaProfile: true },
        skip: offset,
        take: LIST_PAGE_SIZE,
      }),
      prisma.connection.count({ where: whereClause }),
    ]);

    return c.json(
      {
        success: true,
        message: "Berhasil mendapatkan daftar terminate untuk OTA",
        body: {
          data: terminateList.map((terminate) => ({
            mahasiswaId: terminate.mahasiswaId,
            maName: terminate.MahasiswaProfile?.name ?? "",
            maNIM: terminate.MahasiswaProfile?.nim ?? null,
            requestTerminationNoteOTA: terminate.requestTerminationNoteOta!,
            requestTerminationNoteMA: terminate.requestTerminationNoteMa!,
            requestTerminateMa: terminate.requestTerminateMahasiswa,
            requestTerminateOta: terminate.requestTerminateOta,
            createdAt: terminate.createdAt,
          })),
          totalData: totalCount,
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

terminateProtectedRouter.openapi(terminationStatusMARoute, async (c) => {
  const user = c.var.user;

  if (user.type !== "mahasiswa") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya MA yang bisa mengakses status terminasi MA",
        },
      },
      403,
    );
  }

  const userAccount = await prisma.user.findFirst({
    where: { id: user.id },
    select: { verificationStatus: true },
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

  try {
    const status = await prisma.connection.findFirst({
      where: { mahasiswaId: user.id },
      include: { OtaProfile: true },
    });

    return c.json(
      {
        success: true,
        message: "Status terminasi untuk MA berhasil diambil",
        body: {
          otaId: status?.otaId ?? "",
          otaName: status?.OtaProfile?.name ?? "",
          connectionStatus: status?.connectionStatus ?? "",
          requestTerminationNoteOTA: status?.requestTerminationNoteOta ?? "",
          requestTerminationNoteMA: status?.requestTerminationNoteMa ?? "",
          requestTerminateOTA: status?.requestTerminateOta ?? false,
          requestTerminateMA: status?.requestTerminateMahasiswa ?? false,
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

terminateProtectedRouter.openapi(requestTerminateFromMARoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = TerminateRequestSchema.parse(data);
  const { mahasiswaId, otaId, requestTerminationNote } = zodParseResult;

  const userAccount = await prisma.user.findFirst({
    where: { id: user.id },
    select: { verificationStatus: true },
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
          message: "Hanya MA yang bisa mengajukan request terminasi dari MA",
        },
      },
      403,
    );
  }

  try {
    await prisma.connection.update({
      where: { mahasiswaId_otaId: { mahasiswaId, otaId } },
      data: {
        connectionStatus: "accepted",
        requestTerminateMahasiswa: true,
        requestTerminationNoteMa: requestTerminationNote,
      },
    });

    const otaUser = await prisma.user.findFirst({
      where: { id: otaId },
      include: { OtaProfile: true },
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secure: true,
      port: 465,
      auth: {
        user: env.EMAIL,
        pass: env.EMAIL_PASSWORD,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error("SMTP Server verification failed:", error);
      } else {
        console.log("SMTP Server is ready:", success);
      }
    });

    await transporter
      .sendMail({
        from: env.EMAIL_FROM,
        to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : otaUser?.email,
        subject: "Permintaan Pemutusan Bantuan Asuh",
        html: requestTerminasiEmail(
          user.name ?? "",
          otaUser?.OtaProfile?.name ?? "",
          "ma",
          "https://wa.me/6285624654990",
        ),
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    const subscription = await prisma.pushSubscription.findFirst({
      where: { userId: user.id },
    });

    if (subscription) {
      const { endpoint, keys } = subscription;
      const { p256dh, auth } = keys as { p256dh: string; auth: string };

      const validatedData = SubscriptionSchema.parse({
        endpoint,
        p256dh,
        auth,
      });

      const pushSubscription = {
        endpoint: validatedData.endpoint,
        keys: {
          p256dh: validatedData.p256dh,
          auth: validatedData.auth,
        },
      };

      const notificationData = {
        title: "Permintaan Pemutusan Bantuan Asuh",
        body: `Permintaan pemutusan bantuan asuh telah diajukan`,
        icon: "/icon/logo-iom-white.png",
        actions: [
          {
            action: "open_url",
            title: "Buka Aplikasi",
            icon: "/icon/logo-iom-white.png",
          },
        ],
      };

      await sendNotification(pushSubscription, notificationData);
    }

    return c.json(
      {
        success: true,
        message:
          "Berhasil mengirimkan request terminate hubungan asuh dari akun MA",
        body: {
          mahasiswaId,
          otaId,
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

terminateProtectedRouter.openapi(requestTerminateFromOTARoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = TerminateRequestSchema.parse(data);
  const { mahasiswaId, otaId, requestTerminationNote } = zodParseResult;

  const userAccount = await prisma.user.findFirst({
    where: { id: user.id },
    select: { verificationStatus: true },
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
          message: "Hanya OTA yang bisa mengajukan request terminasi dari OTA",
        },
      },
      403,
    );
  }

  try {
    await prisma.connection.update({
      where: { mahasiswaId_otaId: { mahasiswaId, otaId } },
      data: {
        connectionStatus: "accepted",
        requestTerminateOta: true,
        requestTerminationNoteOta: requestTerminationNote,
      },
    });

    const maUser = await prisma.user.findFirst({
      where: { id: mahasiswaId },
      include: { MahasiswaProfile: true },
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secure: true,
      port: 465,
      auth: {
        user: env.EMAIL,
        pass: env.EMAIL_PASSWORD,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error("SMTP Server verification failed:", error);
      } else {
        console.log("SMTP Server is ready:", success);
      }
    });

    await transporter
      .sendMail({
        from: env.EMAIL_FROM,
        to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : maUser?.email,
        subject: "Permintaan Pemutusan Bantuan Asuh",
        html: requestTerminasiEmail(
          user.name ?? "",
          maUser?.MahasiswaProfile?.name ?? "",
          "ota",
          "https://wa.me/6285624654990",
        ),
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    const subscription = await prisma.pushSubscription.findFirst({
      where: { userId: user.id },
    });

    if (subscription) {
      const { endpoint, keys } = subscription;
      const { p256dh, auth } = keys as { p256dh: string; auth: string };

      const validatedData = SubscriptionSchema.parse({
        endpoint,
        p256dh,
        auth,
      });

      const pushSubscription = {
        endpoint: validatedData.endpoint,
        keys: {
          p256dh: validatedData.p256dh,
          auth: validatedData.auth,
        },
      };

      const notificationData = {
        title: "Permintaan Pemutusan Bantuan Asuh",
        body: `Permintaan pemutusan bantuan asuh telah diajukan`,
        icon: "/icon/logo-iom-white.png",
        actions: [
          {
            action: "open_url",
            title: "Buka Aplikasi",
            icon: "/icon/logo-iom-white.png",
          },
        ],
      };

      await sendNotification(pushSubscription, notificationData);
    }

    return c.json(
      {
        success: true,
        message:
          "Berhasil mengirimkan request terminate hubungan asuh dari akun OTA",
        body: {
          mahasiswaId,
          otaId,
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

terminateProtectedRouter.openapi(validateTerminateRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = verifTerminateRequestSchema.parse(data);
  const { mahasiswaId, otaId } = zodParseResult;

  const userAccount = await prisma.user.findFirst({
    where: { id: user.id },
    select: { verificationStatus: true },
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

  if (user.type !== "admin" && user.type !== "bankes") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message:
            "Hanya admin atau bankes yang bisa menerima validasi request terminasi",
        },
      },
      403,
    );
  }

  const connection = await prisma.connection.findFirst({
    where: { mahasiswaId, otaId },
  });

  if (!connection) {
    return c.json(
      {
        success: false,
        message: "Connection not found.",
        error: {},
      },
      404,
    );
  }

  const otaUser = await prisma.user.findFirst({
    where: { id: otaId },
    include: { OtaProfile: true },
  });

  if (!otaUser || !otaUser.OtaProfile) {
    return c.json(
      {
        success: false,
        message: "OTA data not found.",
        error: {},
      },
      404,
    );
  }

  const maUser = await prisma.user.findFirst({
    where: { id: mahasiswaId },
    include: { MahasiswaProfile: true },
  });

  if (!maUser || !maUser.MahasiswaProfile) {
    return c.json(
      {
        success: false,
        message: "Mahasiswa data not found.",
        error: {},
      },
      404,
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.mahasiswaProfile.update({
        where: { userId: mahasiswaId },
        data: { mahasiswaStatus: "inactive" },
      });

      await tx.transaction.updateMany({
        where: {
          mahasiswaId,
          otaId,
          transactionStatus: "unpaid",
        },
        data: { transactionStatus: "paid", transferStatus: "paid" },
      });

      await tx.connection.deleteMany({
        where: {
          mahasiswaId,
          otaId,
          connectionStatus: "accepted",
          OR: [
            { requestTerminateMahasiswa: true },
            { requestTerminateOta: true },
          ],
        },
      });
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secure: true,
      port: 465,
      auth: {
        user: env.EMAIL,
        pass: env.EMAIL_PASSWORD,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error("SMTP Server verification failed:", error);
      } else {
        console.log("SMTP Server is ready:", success);
      }
    });

    if (connection.requestTerminateMahasiswa === true) {
      await transporter
        .sendMail({
          from: env.EMAIL_FROM,
          to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : maUser.email,
          subject: "Permintaan Pemberhentian Hubungan Asuh Disetujui",
          html: terminasiAcceptedMAEmail(
            maUser.MahasiswaProfile.name ?? "",
            otaUser.OtaProfile.name ?? "",
          ),
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        });

      const subscriptionMA = await prisma.pushSubscription.findFirst({
        where: { userId: maUser.id },
      });

      if (subscriptionMA) {
        const { endpoint, keys } = subscriptionMA;
        const { p256dh, auth } = keys as { p256dh: string; auth: string };

        const validatedData = SubscriptionSchema.parse({
          endpoint,
          p256dh,
          auth,
        });

        const pushSubscription = {
          endpoint: validatedData.endpoint,
          keys: {
            p256dh: validatedData.p256dh,
            auth: validatedData.auth,
          },
        };

        const notificationData = {
          title: "Permintaan Pemberhentian Hubungan Asuh Disetujui",
          body: `Permintaan pemberhentian hubungan asuh dengan OTA ${otaUser.OtaProfile.name} disetujui`,
          icon: "/icon/logo-iom-white.png",
          actions: [
            {
              action: "open_url",
              title: "Buka Aplikasi",
              icon: "/icon/logo-iom-white.png",
            },
          ],
        };

        await sendNotification(pushSubscription, notificationData);
      }
    }

    if (connection.requestTerminateOta === true) {
      await transporter
        .sendMail({
          from: env.EMAIL_FROM,
          to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : otaUser.email,
          subject: "Permintaan Pemberhentian Hubungan Asuh Disetujui",
          html: terminasiAcceptedMAEmail(
            otaUser.OtaProfile.name ?? "",
            maUser.MahasiswaProfile.name ?? "",
          ),
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        });

      const subscriptionOTA = await prisma.pushSubscription.findFirst({
        where: { userId: otaUser.id },
      });

      if (subscriptionOTA) {
        const { endpoint, keys } = subscriptionOTA;
        const { p256dh, auth } = keys as { p256dh: string; auth: string };

        const validatedData = SubscriptionSchema.parse({
          endpoint,
          p256dh,
          auth,
        });

        const pushSubscription = {
          endpoint: validatedData.endpoint,
          keys: {
            p256dh: validatedData.p256dh,
            auth: validatedData.auth,
          },
        };

        const notificationData = {
          title: "Permintaan Pemberhentian Hubungan Asuh Disetujui",
          body: `Permintaan pemberhentian hubungan asuh dengan mahasiswa ${maUser.MahasiswaProfile.name} disetujui`,
          icon: "/icon/logo-iom-white.png",
          actions: [
            {
              action: "open_url",
              title: "Buka Aplikasi",
              icon: "/icon/logo-iom-white.png",
            },
          ],
        };

        await sendNotification(pushSubscription, notificationData);
      }
    }

    return c.json(
      {
        success: true,
        message: "Berhasil memvalidasi terminasi hubungan",
        body: {
          mahasiswaId,
          otaId,
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

terminateProtectedRouter.openapi(rejectTerminateRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = verifTerminateRequestSchema.parse(data);
  const { mahasiswaId, otaId } = zodParseResult;

  const userAccount = await prisma.user.findFirst({
    where: { id: user.id },
    select: { verificationStatus: true },
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

  if (user.type !== "admin" && user.type !== "bankes") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message:
            "Hanya admin atau bankes yang bisa menolak validasi request terminasi",
        },
      },
      403,
    );
  }

  try {
    await prisma.connection.updateMany({
      where: {
        mahasiswaId,
        otaId,
        connectionStatus: "accepted",
        OR: [
          { requestTerminateMahasiswa: true },
          { requestTerminateOta: true },
        ],
      },
      data: {
        requestTerminateMahasiswa: false,
        requestTerminateOta: false,
        connectionStatus: "accepted",
        requestTerminationNoteMa: null,
        requestTerminationNoteOta: null,
      },
    });

    return c.json(
      {
        success: true,
        message: "Berhasil menolak request terminasi hubungan asuh",
        body: {
          mahasiswaId,
          otaId,
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
