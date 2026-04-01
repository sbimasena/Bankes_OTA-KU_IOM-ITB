import { and, count, eq, ilike, or } from "drizzle-orm";
import nodemailer from "nodemailer";

import { env } from "../config/env.config.js";
import { db } from "../db/drizzle.js";
import {
  accountMahasiswaDetailTable,
  accountOtaDetailTable,
  accountTable,
  connectionTable,
  pushSubscriptionTable,
  transactionTable,
} from "../db/schema.js";
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

  const userAccount = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.id, user.id))
    .limit(1);

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

    const countsQuery = db
      .select({ count: count() })
      .from(connectionTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(connectionTable.mahasiswaId, accountMahasiswaDetailTable.accountId),
      )
      .innerJoin(
        accountOtaDetailTable,
        eq(connectionTable.otaId, accountOtaDetailTable.accountId),
      )
      .where(
        and(
          or(
            eq(connectionTable.requestTerminateMahasiswa, true),
            eq(connectionTable.requestTerminateOta, true),
          ),
          eq(connectionTable.connectionStatus, "pending"),
          or(
            ilike(accountMahasiswaDetailTable.name, `%${q || ""}%`),
            ilike(accountMahasiswaDetailTable.nim, `%${q || ""}%`),
            ilike(accountOtaDetailTable.name, `%${q || ""}%`),
          ),
        ),
      );

    const terminateListQuery = db
      .select({
        otaId: connectionTable.otaId,
        otaName: accountOtaDetailTable.name,
        otaNumber: accountTable.phoneNumber,
        mahasiswaId: connectionTable.mahasiswaId,
        maName: accountMahasiswaDetailTable.name,
        maNIM: accountMahasiswaDetailTable.nim,
        createdAt: connectionTable.createdAt,
        requestTerminateOTA: connectionTable.requestTerminateOta,
        requestTerminateMA: connectionTable.requestTerminateMahasiswa,
        requestTerminationNoteOTA: connectionTable.requestTerminationNoteOTA,
        requestTerminationNoteMA: connectionTable.requestTerminationNoteMA,
      })
      .from(connectionTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(connectionTable.mahasiswaId, accountMahasiswaDetailTable.accountId),
      )
      .innerJoin(
        accountOtaDetailTable,
        eq(connectionTable.otaId, accountOtaDetailTable.accountId),
      )
      .innerJoin(accountTable, eq(connectionTable.otaId, accountTable.id))
      .where(
        and(
          or(
            eq(connectionTable.requestTerminateMahasiswa, true),
            eq(connectionTable.requestTerminateOta, true),
          ),
          // eq(connectionTable.connectionStatus, "pending"),
          or(
            ilike(accountMahasiswaDetailTable.name, `%${q || ""}%`),
            ilike(accountMahasiswaDetailTable.nim, `%${q || ""}%`),
            ilike(accountOtaDetailTable.name, `%${q || ""}%`),
          ),
        ),
      )
      .limit(LIST_PAGE_SIZE)
      .offset(offset);

    const [terminateList, counts] = await Promise.all([
      terminateListQuery,
      countsQuery,
    ]);

    return c.json(
      {
        success: true,
        message: "Berhasil mendapatkan daftar request terminate untuk Admin",
        body: {
          data: terminateList.map((terminate) => ({
            otaId: terminate.otaId,
            otaName: terminate.otaName,
            otaNumber: terminate.otaNumber ?? "",
            mahasiswaId: terminate.mahasiswaId,
            maName: terminate.maName ?? "",
            maNIM: terminate.maNIM,
            createdAt: terminate.createdAt,
            requestTerminateOTA: terminate.requestTerminateOTA,
            requestTerminateMA: terminate.requestTerminateMA,
            requestTerminationNoteOTA: terminate.requestTerminationNoteOTA!,
            requestTerminationNoteMA: terminate.requestTerminationNoteMA!,
          })),
          totalData: counts[0].count,
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
      .where(
        and(
          eq(connectionTable.otaId, user.id),
          eq(connectionTable.connectionStatus, "accepted"),
          or(
            ilike(accountMahasiswaDetailTable.name, `%${q || ""}%`),
            ilike(accountMahasiswaDetailTable.nim, `%${q || ""}%`),
          ),
        ),
      );

    const terminateListQuery = db
      .select({
        mahasiswaId: connectionTable.mahasiswaId,
        maName: accountMahasiswaDetailTable.name,
        maNIM: accountMahasiswaDetailTable.nim,
        requestTerminationNoteOTA: connectionTable.requestTerminationNoteOTA,
        requestTerminationNoteMA: connectionTable.requestTerminationNoteMA,
        requestTerminateMa: connectionTable.requestTerminateMahasiswa,
        requestTerminateOta: connectionTable.requestTerminateOta,
        createdAt: connectionTable.createdAt,
      })
      .from(connectionTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(connectionTable.mahasiswaId, accountMahasiswaDetailTable.accountId),
      )
      .where(
        and(
          eq(connectionTable.otaId, user.id),
          eq(connectionTable.connectionStatus, "accepted"),
          or(
            ilike(accountMahasiswaDetailTable.name, `%${q || ""}%`),
            ilike(accountMahasiswaDetailTable.nim, `%${q || ""}%`),
          ),
        ),
      )
      .limit(LIST_PAGE_SIZE)
      .offset(offset);

    const [terminateList, counts] = await Promise.all([
      terminateListQuery,
      countsQuery,
    ]);

    return c.json(
      {
        success: true,
        message: "Berhasil mendapatkan daftar terminate untuk OTA",
        body: {
          data: terminateList.map((terminate) => ({
            mahasiswaId: terminate.mahasiswaId,
            maName: terminate.maName ?? "",
            maNIM: terminate.maNIM,
            requestTerminationNoteOTA: terminate.requestTerminationNoteOTA!,
            requestTerminationNoteMA: terminate.requestTerminationNoteMA!,
            requestTerminateMa: terminate.requestTerminateMa,
            requestTerminateOta: terminate.requestTerminateOta,
            createdAt: terminate.createdAt,
          })),
          totalData: counts[0].count,
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

  const userAccount = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.id, user.id))
    .limit(1);

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

  try {
    const terminationStatus = await db
      .select({
        otaId: connectionTable.otaId,
        otaName: accountOtaDetailTable.name,
        connectionStatus: connectionTable.connectionStatus,
        requestTerminationNoteOTA: connectionTable.requestTerminationNoteOTA,
        requestTerminationNoteMA: connectionTable.requestTerminationNoteMA,
        requestTerminateOTA: connectionTable.requestTerminateOta,
        requestTerminateMA: connectionTable.requestTerminateMahasiswa,
      })
      .from(connectionTable)
      .innerJoin(
        accountOtaDetailTable,
        eq(connectionTable.otaId, accountOtaDetailTable.accountId),
      )
      .where(eq(connectionTable.mahasiswaId, user.id))
      .limit(1);

    const status = terminationStatus[0];

    return c.json(
      {
        success: true,
        message: "Status terminasi untuk MA berhasil diambil",
        body: {
          otaId: status.otaId,
          otaName: status.otaName,
          connectionStatus: status.connectionStatus,
          requestTerminationNoteOTA: status.requestTerminationNoteOTA!,
          requestTerminationNoteMA: status.requestTerminationNoteMA!,
          requestTerminateOTA: status.requestTerminateOTA,
          requestTerminateMA: status.requestTerminateMA,
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
          message: "Hanya MA yang bisa mengajukan request terminasi dari MA",
        },
      },
      403,
    );
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(connectionTable)
        .set({
          connectionStatus: "accepted",
          requestTerminateMahasiswa: true,
          requestTerminationNoteMA: requestTerminationNote,
        })
        .where(
          and(
            eq(connectionTable.mahasiswaId, mahasiswaId),
            eq(connectionTable.otaId, otaId),
          ),
        );
    });

    const otaData = await db
      .select({
        name: accountOtaDetailTable.name,
        email: accountTable.email,
      })
      .from(accountOtaDetailTable)
      .innerJoin(
        accountTable,
        eq(accountOtaDetailTable.accountId, accountTable.id),
      )
      .where(eq(accountOtaDetailTable.accountId, otaId))
      .limit(1);

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
        to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : otaData[0].email,
        subject: "Permintaan Pemutusan Bantuan Asuh",
        html: requestTerminasiEmail(
          user.name ?? "",
          otaData[0].name,
          "ma",
          "https://wa.me/6285624654990",
        ),
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    const subscription = await db
      .select()
      .from(pushSubscriptionTable)
      .where(eq(pushSubscriptionTable.accountId, user.id))
      .limit(1);

    if (subscription.length > 0) {
      const { endpoint, keys } = subscription[0];
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
          message: "Hanya OTA yang bisa mengajukan request terminasi dari OTA",
        },
      },
      403,
    );
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(connectionTable)
        .set({
          connectionStatus: "accepted",
          requestTerminateOta: true,
          requestTerminationNoteOTA: requestTerminationNote,
        })
        .where(
          and(
            eq(connectionTable.mahasiswaId, mahasiswaId),
            eq(connectionTable.otaId, otaId),
          ),
        );
    });

    const maData = await db
      .select({
        id: accountMahasiswaDetailTable.accountId,
        name: accountMahasiswaDetailTable.name,
        email: accountTable.email,
      })
      .from(accountMahasiswaDetailTable)
      .innerJoin(
        accountTable,
        eq(accountMahasiswaDetailTable.accountId, accountTable.id),
      )
      .where(eq(accountMahasiswaDetailTable.accountId, mahasiswaId))
      .limit(1);

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
        to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : maData[0].email,
        subject: "Permintaan Pemutusan Bantuan Asuh",
        html: requestTerminasiEmail(
          user.name ?? "",
          maData[0].name ?? "",
          "ota",
          "https://wa.me/6285624654990",
        ),
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    const subscription = await db
      .select()
      .from(pushSubscriptionTable)
      .where(eq(pushSubscriptionTable.accountId, user.id))
      .limit(1);

    if (subscription.length > 0) {
      const { endpoint, keys } = subscription[0];
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

  const connection = await db
    .select()
    .from(connectionTable)
    .where(
      and(
        eq(connectionTable.mahasiswaId, mahasiswaId),
        eq(connectionTable.otaId, otaId),
      ),
    )
    .limit(1);

  if (connection.length === 0) {
    return c.json(
      {
        success: false,
        message: "Connection not found.",
        error: {},
      },
      404,
    );
  }

  const otaData = await db
    .select({
      id: accountOtaDetailTable.accountId,
      name: accountOtaDetailTable.name,
      email: accountTable.email,
    })
    .from(accountOtaDetailTable)
    .innerJoin(
      accountTable,
      eq(accountOtaDetailTable.accountId, accountTable.id),
    )
    .where(eq(accountOtaDetailTable.accountId, otaId))
    .limit(1);

  if (otaData.length === 0) {
    return c.json(
      {
        success: false,
        message: "OTA data not found.",
        error: {},
      },
      404,
    );
  }

  const maData = await db
    .select({
      id: accountMahasiswaDetailTable.accountId,
      name: accountMahasiswaDetailTable.name,
      email: accountTable.email,
    })
    .from(accountMahasiswaDetailTable)
    .innerJoin(
      accountTable,
      eq(accountMahasiswaDetailTable.accountId, accountTable.id),
    )
    .where(eq(accountMahasiswaDetailTable.accountId, mahasiswaId))
    .limit(1);

  if (maData.length === 0) {
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
    await db.transaction(async (tx) => {
      await tx
        .update(accountMahasiswaDetailTable)
        .set({ mahasiswaStatus: "inactive" })
        .where(eq(accountMahasiswaDetailTable.accountId, mahasiswaId));

      await tx
        .update(transactionTable)
        .set({ transactionStatus: "paid", transferStatus: "paid" })
        .where(
          and(
            eq(transactionTable.mahasiswaId, mahasiswaId),
            eq(transactionTable.otaId, otaId),
            eq(transactionTable.transactionStatus, "unpaid"),
          ),
        );

      await tx
        .delete(connectionTable)
        .where(
          and(
            eq(connectionTable.mahasiswaId, mahasiswaId),
            eq(connectionTable.otaId, otaId),
            eq(connectionTable.connectionStatus, "accepted"),
            or(
              eq(connectionTable.requestTerminateMahasiswa, true),
              eq(connectionTable.requestTerminateOta, true),
            ),
          ),
        );
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

    if (connection[0].requestTerminateMahasiswa === true) {
      await transporter
        .sendMail({
          from: env.EMAIL_FROM,
          to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : maData[0].email,
          subject: "Permintaan Pemberhentian Hubungan Asuh Disetujui",
          html: terminasiAcceptedMAEmail(maData[0].name ?? "", otaData[0].name),
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        });

      const subscriptionMA = await db
        .select()
        .from(pushSubscriptionTable)
        .where(eq(pushSubscriptionTable.accountId, maData[0].id))
        .limit(1);

      if (subscriptionMA.length > 0) {
        const { endpoint, keys } = subscriptionMA[0];
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
          body: `Permintaan pemberhentian hubungan asuh dengan OTA ${otaData[0].name} disetujui`,
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

    if (connection[0].requestTerminateOta === true) {
      await transporter
        .sendMail({
          from: env.EMAIL_FROM,
          to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : otaData[0].email,
          subject: "Permintaan Pemberhentian Hubungan Asuh Disetujui",
          html: terminasiAcceptedMAEmail(otaData[0].name, maData[0].name ?? ""),
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        });

      const subscriptionOTA = await db
        .select()
        .from(pushSubscriptionTable)
        .where(eq(pushSubscriptionTable.accountId, otaData[0].id))
        .limit(1);

      if (subscriptionOTA.length > 0) {
        const { endpoint, keys } = subscriptionOTA[0];
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
          body: `Permintaan pemberhentian hubungan asuh dengan mahasiswa ${maData[0].name} disetujui`,
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
    await db.transaction(async (tx) => {
      await tx
        .update(connectionTable)
        .set({
          requestTerminateMahasiswa: false,
          requestTerminateOta: false,
          connectionStatus: "accepted",
          requestTerminationNoteMA: null,
          requestTerminationNoteOTA: null,
        })
        .where(
          and(
            eq(connectionTable.mahasiswaId, mahasiswaId),
            eq(connectionTable.otaId, otaId),
            eq(connectionTable.connectionStatus, "accepted"),
            or(
              eq(connectionTable.requestTerminateMahasiswa, true),
              eq(connectionTable.requestTerminateOta, true),
            ),
          ),
        );
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
