import { addMonths, setDate } from "date-fns";
import nodemailer from "nodemailer";

import { env } from "../config/env.config.js";
import { prisma } from "../db/prisma.js";
import { penjodohanOlehAdminEmail } from "../lib/email/penjodohan-oleh-admin.js";
import { persetujuanAsuhMA } from "../lib/email/persetujuan-asuh.js";
import { sendNotification } from "../lib/web-push.js";
import {
  connectOtaMahasiswaByAdminRoute,
  connectOtaMahasiswaRoute,
  deleteConnectionRoute,
  isConnectedRoute,
  listAllConnectionRoute,
  listPendingConnectionRoute,
  listPendingTerminationConnectionRoute,
  verifyConnectionAccRoute,
  verifyConnectionRejectRoute,
} from "../routes/connect.route.js";
import {
  MahasiwaConnectSchema,
  connectionListAllQuerySchema,
  connectionListQuerySchema,
} from "../zod/connect.js";
import { SubscriptionSchema } from "../zod/push.js";
import { createAuthRouter, createRouter } from "./router-factory.js";

export const connectRouter = createRouter();
export const connectProtectedRouter = createAuthRouter();

const LIST_PAGE_SIZE = 6;

connectProtectedRouter.openapi(connectOtaMahasiswaRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = MahasiwaConnectSchema.parse(data);
  const { mahasiswaId, otaId } = zodParseResult;

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: {
          code: "UNAUTHORIZED",
          message: "Hanya orang tua asuh yang dapat mengakses detail ini",
        },
      },
      403,
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Get OTA's max capacity
      const otaProfile = await tx.otaProfile.findFirst({
        where: { userId: otaId },
        select: { maxCapacity: true },
      });

      if (!otaProfile) {
        throw new Error("OTA profile not found");
      }

      // Count how many active mahasiswa this OTA already has
      const activeCount = await tx.connection.count({
        where: {
          otaId,
          connectionStatus: "accepted",
        },
      });

      if (activeCount >= otaProfile.maxCapacity) {
        throw new Error("KAPASITAS_PENUH");
      }

      // Update mahasiswa status to active
      await tx.mahasiswaProfile.update({
        where: { userId: mahasiswaId },
        data: { mahasiswaStatus: "active" },
      });

      await tx.connection.create({
        data: {
          mahasiswaId,
          otaId,
          paidFor: 0,
        },
      });
    });

    return c.json(
      {
        success: true,
        message: "Berhasil menghubungkan orang tua asuh dengan mahasiswa asuh.",
        body: {
          mahasiswaId,
          otaId,
        },
      },
      200,
    );
  } catch (error) {
    if (error instanceof Error && error.message === "KAPASITAS_PENUH") {
      return c.json(
        {
          success: false,
          message: "Kapasitas orang tua asuh sudah penuh.",
          error: {},
        },
        400,
      );
    }
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

connectProtectedRouter.openapi(connectOtaMahasiswaByAdminRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = MahasiwaConnectSchema.parse(data);
  const { mahasiswaId, otaId } = zodParseResult;

  if (user.type !== "admin" && user.type !== "bankes") {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: {
          code: "UNAUTHORIZED",
          message: "Hanya admin atau bankes yang dapat mengakses detail ini",
        },
      },
      403,
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Get OTA's max capacity
      const otaProfile = await tx.otaProfile.findFirst({
        where: { userId: otaId },
        select: { maxCapacity: true, transferDate: true },
      });

      if (!otaProfile) {
        throw new Error("OTA profile not found");
      }

      // Count how many active mahasiswa this OTA already has
      const activeCount = await tx.connection.count({
        where: {
          otaId,
          connectionStatus: "accepted",
        },
      });

      if (activeCount >= otaProfile.maxCapacity) {
        throw new Error("KAPASITAS_PENUH");
      }

      // Update mahasiswa status to active
      await tx.mahasiswaProfile.update({
        where: { userId: mahasiswaId },
        data: { mahasiswaStatus: "active" },
      });

      await tx.connection.create({
        data: {
          mahasiswaId,
          otaId,
          connectionStatus: "accepted",
          paidFor: 0,
        },
      });

      // Get bill
      const maProfile = await tx.mahasiswaProfile.findFirst({
        where: { userId: mahasiswaId },
        select: { bill: true },
      });

      const bill_mahasiswa = maProfile?.bill ?? 0;
      const transfer_date = otaProfile.transferDate;
      const dueDate = setDate(addMonths(new Date(), 1), transfer_date);

      await tx.transaction.create({
        data: {
          transferStatus: "unpaid",
          mahasiswaId,
          otaId,
          bill: bill_mahasiswa,
          dueDate,
        },
      });
    });

    const otaUser = await prisma.user.findFirst({
      where: { id: otaId },
      include: { OtaProfile: true },
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
        subject: "Penerimaan Hubungan Bantuan Asuh",
        html: persetujuanAsuhMA(
          maUser?.MahasiswaProfile?.name ?? "",
          otaUser?.OtaProfile?.name ?? "",
          "ma",
          env.VITE_PUBLIC_URL + "/orang-tua-asuh-saya",
        ),
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    const subscriptionMA = await prisma.pushSubscription.findFirst({
      where: { userId: mahasiswaId },
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
        title: "Penerimaan Hubungan Bantuan Asuh",
        body: `"Selamat Anda telah mendapatkan Bantuan Orang Tua Asuh"`,
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

    await transporter
      .sendMail({
        from: env.EMAIL_FROM,
        to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : otaUser?.email,
        subject: "Pemilihan Mahasiswa Asuh",
        html: penjodohanOlehAdminEmail(
          otaUser?.OtaProfile?.name ?? "",
          maUser?.MahasiswaProfile?.name ?? "",
          `/detail/mahasiswa/${mahasiswaId}`,
        ),
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    const subscriptionOTA = await prisma.pushSubscription.findFirst({
      where: { userId: otaId },
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
        title: "Penerimaan Hubungan Bantuan Asuh",
        body: "Mahasiswa Asuh Anda telah disetujui",
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
        message: "Berhasil menghubungkan orang tua asuh dengan mahasiswa asuh.",
        body: {
          mahasiswaId,
          otaId,
        },
      },
      200,
    );
  } catch (error) {
    if (error instanceof Error && error.message === "KAPASITAS_PENUH") {
      return c.json(
        {
          success: false,
          message: "Kapasitas orang tua asuh sudah penuh.",
          error: {},
        },
        400,
      );
    }
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

connectProtectedRouter.openapi(verifyConnectionAccRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());
  const zodParseResult = MahasiwaConnectSchema.parse(data);
  const { mahasiswaId, otaId } = zodParseResult;

  if (user.type !== "admin" && user.type !== "bankes") {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: {
          code: "UNAUTHORIZED",
          message: "Hanya admin atau bankes yang dapat mengakses detail ini",
        },
      },
      403,
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.connection.updateMany({
        where: {
          mahasiswaId,
          otaId,
          connectionStatus: "pending",
          requestTerminateMahasiswa: false,
          requestTerminateOta: false,
        },
        data: { connectionStatus: "accepted" },
      });

      // Get bill
      const maProfile = await tx.mahasiswaProfile.findFirst({
        where: { userId: mahasiswaId },
        select: { bill: true },
      });

      const bill_mahasiswa = maProfile?.bill ?? 0;

      // Get transfer_date from OTA
      const otaProfile = await tx.otaProfile.findFirst({
        where: { userId: otaId },
        select: { transferDate: true },
      });

      const transfer_date = otaProfile?.transferDate ?? 1;
      const dueDate = setDate(addMonths(new Date(), 1), transfer_date);

      // Check for existing transaction with same mahasiswaId, otaId, and dueDate (year, month, date)
      const dueDateStart = new Date(
        dueDate.getFullYear(),
        dueDate.getMonth(),
        dueDate.getDate(),
      );
      const dueDateEnd = new Date(
        dueDate.getFullYear(),
        dueDate.getMonth(),
        dueDate.getDate() + 1,
      );

      const existingTransaction = await tx.transaction.findFirst({
        where: {
          mahasiswaId,
          otaId,
          dueDate: {
            gte: dueDateStart,
            lt: dueDateEnd,
          },
        },
      });

      if (!existingTransaction) {
        await tx.transaction.create({
          data: {
            transferStatus: "unpaid",
            mahasiswaId,
            otaId,
            bill: bill_mahasiswa,
            dueDate,
          },
        });
      }
    });

    const otaUser = await prisma.user.findFirst({
      where: { id: otaId },
      include: { OtaProfile: true },
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
        to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : otaUser?.email,
        subject: "Penerimaan Hubungan Bantuan Asuh",
        html: persetujuanAsuhMA(
          otaUser?.OtaProfile?.name ?? "",
          maUser?.MahasiswaProfile?.name ?? "",
          "ota",
          env.VITE_PUBLIC_URL + `/detail/mahasiswa/${mahasiswaId}`,
        ),
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    const subscriptionOTA = await prisma.pushSubscription.findFirst({
      where: { userId: otaId },
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
        title: "Penerimaan Hubungan Bantuan Asuh",
        body: "Mahasiswa Asuh Anda telah disetujui",
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

    await transporter
      .sendMail({
        from: env.EMAIL_FROM,
        to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : maUser?.email,
        subject: "Penerimaan Hubungan Bantuan Asuh",
        html: persetujuanAsuhMA(
          maUser?.MahasiswaProfile?.name ?? "",
          otaUser?.OtaProfile?.name ?? "",
          "ma",
          "/orang-tua-asuh-saya",
        ),
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    const subscriptionMA = await prisma.pushSubscription.findFirst({
      where: { userId: mahasiswaId },
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
        title: "Penerimaan Hubungan Bantuan Asuh",
        body: `"Selamat Anda telah mendapatkan Bantuan Orang Tua Asuh"`,
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
          "Berhasil melakukan penerimaan verifikasi connection oleh Admin",
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

connectProtectedRouter.openapi(verifyConnectionRejectRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());
  const zodParseResult = MahasiwaConnectSchema.parse(data);
  const { mahasiswaId, otaId } = zodParseResult;

  if (user.type !== "admin" && user.type !== "bankes") {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: {
          code: "UNAUTHORIZED",
          message: "Hanya admin atau bankes yang dapat mengakses detail ini",
        },
      },
      403,
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.connection.updateMany({
        where: {
          mahasiswaId,
          otaId,
          connectionStatus: "pending",
          requestTerminateMahasiswa: false,
          requestTerminateOta: false,
        },
        data: { connectionStatus: "rejected" },
      });
    });

    return c.json(
      {
        success: true,
        message:
          "Berhasil melakukan penolakan verifikasi connection oleh Admin",
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

connectProtectedRouter.openapi(listPendingConnectionRoute, async (c) => {
  const user = c.var.user;
  const zodParseResult = connectionListQuerySchema.parse(c.req.query());
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
        message: "Unauthorized",
        error: {
          code: "UNAUTHORIZED",
          message:
            "Hanya admin, bankes, atau pengurus yang dapat mengakses detail ini",
        },
      },
      403,
    );
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

    const searchFilter = q
      ? {
          OR: [
            { MahasiswaProfile: { name: { contains: q, mode: "insensitive" as const } } },
            { MahasiswaProfile: { nim: { contains: q, mode: "insensitive" as const } } },
            { OtaProfile: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {};

    const baseWhere = {
      connectionStatus: "pending" as const,
      requestTerminateMahasiswa: false,
      requestTerminateOta: false,
      ...searchFilter,
    };

    const [connectionList, totalCount] = await Promise.all([
      prisma.connection.findMany({
        where: baseWhere,
        include: {
          MahasiswaProfile: {
            include: { User: true },
          },
          OtaProfile: {
            include: { User: true },
          },
        },
        skip: offset,
        take: LIST_PAGE_SIZE,
      }),
      prisma.connection.count({ where: baseWhere }),
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar connection pending berhasil diambil",
        body: {
          data: connectionList.map((connection) => ({
            mahasiswa_id: connection.mahasiswaId,
            name_ma: connection.MahasiswaProfile?.name ?? "",
            nim_ma: connection.MahasiswaProfile?.nim ?? "",
            ota_id: connection.otaId,
            name_ota: connection.OtaProfile?.name ?? "",
            number_ota: connection.OtaProfile?.User?.phoneNumber ?? "",
          })),
          totalData: totalCount,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching connection list:", error);
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

connectProtectedRouter.openapi(
  listPendingTerminationConnectionRoute,
  async (c) => {
    const user = c.var.user;
    const zodParseResult = connectionListQuerySchema.parse(c.req.param());
    const { q, page } = zodParseResult;

    if (
      user.type !== "admin" &&
      user.type !== "bankes" &&
      user.type !== "pengurus"
    ) {
      return c.json(
        {
          success: false,
          message: "Unauthorized",
          error: {
            code: "UNAUTHORIZED",
            message:
              "Hanya admin, bankes, atau pengurus yang dapat mengakses detail ini",
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

      const searchFilter = q
        ? {
            OR: [
              { MahasiswaProfile: { name: { contains: q, mode: "insensitive" as const } } },
              { MahasiswaProfile: { nim: { contains: q, mode: "insensitive" as const } } },
              { OtaProfile: { name: { contains: q, mode: "insensitive" as const } } },
            ],
          }
        : {};

      const baseWhere = {
        connectionStatus: "pending" as const,
        OR: [
          { requestTerminateMahasiswa: true },
          { requestTerminateOta: true },
        ],
        ...searchFilter,
      };

      const [connectionList, totalCount] = await Promise.all([
        prisma.connection.findMany({
          where: baseWhere,
          include: {
            MahasiswaProfile: {
              include: { User: true },
            },
            OtaProfile: {
              include: { User: true },
            },
          },
          skip: offset,
          take: LIST_PAGE_SIZE,
        }),
        prisma.connection.count({ where: baseWhere }),
      ]);

      return c.json(
        {
          success: true,
          message: "Daftar connection pending berhasil diambil",
          body: {
            data: connectionList.map((connection) => ({
              mahasiswa_id: connection.mahasiswaId,
              name_ma: connection.MahasiswaProfile?.name ?? "",
              nim_ma: connection.MahasiswaProfile?.nim ?? "",
              ota_id: connection.otaId,
              name_ota: connection.OtaProfile?.name ?? "",
              number_ota: connection.OtaProfile?.User?.phoneNumber ?? "",
              request_term_ota: connection.requestTerminateOta,
              request_term_ma: connection.requestTerminateMahasiswa,
            })),
            totalData: totalCount,
          },
        },
        200,
      );
    } catch (error) {
      console.error("Error fetching connection list:", error);
      return c.json(
        {
          success: false,
          message: "Internal server error",
          error: error,
        },
        500,
      );
    }
  },
);

connectProtectedRouter.openapi(listAllConnectionRoute, async (c) => {
  const user = c.var.user;
  const zodParseResult = connectionListAllQuerySchema.parse(c.req.query());
  const { q, page, connection_status } = zodParseResult;

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
        message: "Unauthorized",
        error: {
          code: "UNAUTHORIZED",
          message:
            "Hanya admin, bankes, atau pengurus yang dapat mengakses detail ini",
        },
      },
      403,
    );
  }

  try {
    const offset = (pageNumber - 1) * LIST_PAGE_SIZE;

    const searchFilter = q
      ? {
          OR: [
            { MahasiswaProfile: { name: { contains: q, mode: "insensitive" as const } } },
            { MahasiswaProfile: { nim: { contains: q, mode: "insensitive" as const } } },
            { OtaProfile: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {};

    const statusFilter = connection_status
      ? { connectionStatus: connection_status as "accepted" | "rejected" | "pending" }
      : {};

    const baseWhere = {
      ...searchFilter,
      ...statusFilter,
    };

    const [connectionList, totalCount] = await Promise.all([
      prisma.connection.findMany({
        where: baseWhere,
        include: {
          MahasiswaProfile: {
            include: { User: true },
          },
          OtaProfile: {
            include: { User: true },
          },
        },
        skip: offset,
        take: LIST_PAGE_SIZE,
      }),
      prisma.connection.count({ where: baseWhere }),
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar connection pending berhasil diambil",
        body: {
          data: connectionList.map((connection) => ({
            mahasiswa_id: connection.mahasiswaId,
            name_ma: connection.MahasiswaProfile?.name ?? "",
            nim_ma: connection.MahasiswaProfile?.nim ?? "",
            ota_id: connection.otaId,
            name_ota: connection.OtaProfile?.name ?? "",
            number_ota: connection.OtaProfile?.User?.phoneNumber ?? "",
            connection_status: connection.connectionStatus,
            request_term_ota: connection.requestTerminateOta,
            request_term_ma: connection.requestTerminateMahasiswa,
            paidFor: connection.paidFor,
          })),
          totalPagination: totalCount,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching connection list:", error);
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

connectProtectedRouter.openapi(isConnectedRoute, async (c) => {
  const user = c.var.user;
  const query = c.req.query();
  const zodParseResult = MahasiwaConnectSchema.parse(query);
  const { mahasiswaId } = zodParseResult;

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: {
          code: "UNAUTHORIZED",
          message: "Hanya OTA yang dapat mengakses detail ini",
        },
      },
      403,
    );
  }

  try {
    const connection = await prisma.connection.findFirst({
      where: {
        mahasiswaId,
        otaId: user.id,
      },
    });

    if (!connection) {
      return c.json(
        {
          isConnected: false,
          message: `Tidak ditemukan hubungan asuh antara ${mahasiswaId} dan ${user.id}`,
        },
        400,
      );
    }

    if (connection.connectionStatus === "accepted") {
      return c.json(
        {
          isConnected: true,
          message: `Ditemukan hubungan asuh antara ${mahasiswaId} dan ${user.id}`,
        },
        200,
      );
    }

    return c.json(
      {
        isConnected: false,
        message: `Hubungan asuh antara ${mahasiswaId} dan ${user.id} telah diajukan, tetapi belum diverifikasi admin`,
      },
      400,
    );
  } catch (error) {
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

connectProtectedRouter.openapi(deleteConnectionRoute, async (c) => {
  const user = c.var.user;
  const query = c.req.query();
  const zodParseResult = MahasiwaConnectSchema.parse(query);
  const { mahasiswaId, otaId } = zodParseResult;

  if (user.type !== "admin" && user.type !== "bankes") {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: {
          code: "UNAUTHORIZED",
          message: "Hanya admin atau bankes yang dapat mengakses detail ini",
        },
      },
      403,
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

      await tx.connection.delete({
        where: {
          mahasiswaId_otaId: { mahasiswaId, otaId },
        },
      });
    });

    return c.json(
      {
        success: true,
        message: `Successfuly deleted connection between ${mahasiswaId} and ${otaId}`,
      },
      200,
    );
  } catch (error) {
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
