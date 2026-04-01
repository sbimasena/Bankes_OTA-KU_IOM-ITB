import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";

import { env } from "../config/env.config.js";
import { db } from "../db/drizzle.js";
import {
  accountMahasiswaDetailTable,
  accountOtaDetailTable,
  accountTable,
  pushSubscriptionTable,
} from "../db/schema.js";
import { registrasiAcceptedEmail } from "../lib/email/registrasi-accepted.js";
import { registrasiRejectedEmail } from "../lib/email/registrasi-rejected.js";
import { sendNotification } from "../lib/web-push.js";
import {
  applicationStatusRoute,
  getApplicationStatusRoute,
  getReapplicationStatusRoute,
  getVerificationStatusRoute,
} from "../routes/status.route.js";
import { SubscriptionSchema } from "../zod/push.js";
import { ApplicationStatusSchema } from "../zod/status.js";
import { createAuthRouter, createRouter } from "./router-factory.js";

export const statusRouter = createRouter();
export const statusProtectedRouter = createAuthRouter();

statusProtectedRouter.openapi(applicationStatusRoute, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = ApplicationStatusSchema.parse(data);
  const { status, adminOnlyNotes, notes, bill } = zodParseResult;

  try {
    const [[user], [detail]] = await db.transaction(async (tx) => {
      await tx
        .update(accountTable)
        .set({
          applicationStatus: status,
        })
        .where(eq(accountTable.id, id));

      const user = await tx
        .select()
        .from(accountTable)
        .where(eq(accountTable.id, id));

      const type = user[0]?.type;

      let detail = null;

      if (type === "mahasiswa") {
        await tx
          .update(accountMahasiswaDetailTable)
          .set({
            bill: bill,
            notes: notes ?? null,
            adminOnlyNotes: adminOnlyNotes ?? null,
          })
          .where(eq(accountMahasiswaDetailTable.accountId, id));

        detail = await tx
          .select({ name: accountMahasiswaDetailTable.name })
          .from(accountMahasiswaDetailTable)
          .where(eq(accountMahasiswaDetailTable.accountId, id));
      } else {
        detail = await tx
          .select({ name: accountOtaDetailTable.name })
          .from(accountOtaDetailTable)
          .where(eq(accountOtaDetailTable.accountId, id));
      }

      return [user, detail];
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
        to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : user.email,
        subject: "Pendaftaran Bantuan Orang Tua Asuh Telah Diverifikasi",
        html:
          status === "accepted"
            ? registrasiAcceptedEmail(
                detail.name!,
                env.VITE_PUBLIC_URL,
                user.type === "mahasiswa" ? "ma" : "ota",
              )
            : registrasiRejectedEmail(
                detail.name!,
                "https://wa.me/6285624654990",
                user.type === "mahasiswa" ? "ma" : "ota",
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
        title: "Pendaftaran Bantuan Orang Tua Asuh Telah Diverifikasi",
        body: `Pendaftaran Anda telah diverifikasi oleh pengurus`,
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
        message: "Berhasil mengubah status pendaftaran",
        body: { status },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Gagal mengubah status pendaftaran",
        error: error,
      },
      500,
    );
  }
});

statusProtectedRouter.openapi(getApplicationStatusRoute, async (c) => {
  const user = c.var.user;
  const id = c.req.param("id");

  if (user.id !== id) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: {},
      },
      403,
    );
  }

  try {
    const user = await db
      .select()
      .from(accountTable)
      .where(eq(accountTable.id, id));

    return c.json(
      {
        success: true,
        message: "Berhasil mengambil status pendaftaran",
        body: { status: user[0].applicationStatus },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Gagal mengambil status pendaftaran",
        error: error,
      },
      500,
    );
  }
});

statusProtectedRouter.openapi(getVerificationStatusRoute, async (c) => {
  const user = c.var.user;
  const id = c.req.param("id");

  if (user.id !== id) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: {},
      },
      403,
    );
  }

  try {
    const user = await db
      .select()
      .from(accountTable)
      .where(eq(accountTable.id, id));

    return c.json(
      {
        success: true,
        message: "Berhasil mengambil status pendaftaran",
        body: { status: user[0].status },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Gagal mengambil status pendaftaran",
        error: error,
      },
      500,
    );
  }
});

statusProtectedRouter.openapi(getReapplicationStatusRoute, async (c) => {
  const user = c.var.user;
  const id = c.req.param("id");

  if (user.id !== id) {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {},
      },
      403,
    );
  }

  try {
    const user = await db
      .select()
      .from(accountTable)
      .where(eq(accountTable.id, id));

    if (user[0].type !== "mahasiswa") {
      return c.json(
        {
          success: false,
          message: "Forbidden",
          error: {},
        },
        403,
      );
    }

    const dueNextUpdateAt = await db
      .select({
        dueNextUpdateAt: accountMahasiswaDetailTable.dueNextUpdateAt,
      })
      .from(accountMahasiswaDetailTable)
      .where(eq(accountMahasiswaDetailTable.accountId, id));

    // Return true if current date is 30 days before dueNextUpdateAt
    const currentDate = new Date();
    const dueDate = new Date(dueNextUpdateAt[0].dueNextUpdateAt);
    const thirtyDaysBeforeDueDate = new Date(
      dueDate.getTime() - 30 * 24 * 60 * 60 * 1000,
    );
    const isThirtyDaysBeforeDueDate =
      currentDate >= thirtyDaysBeforeDueDate && currentDate <= dueDate;
    const daysRemaining = Math.ceil(
      (dueDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24),
    );

    return c.json(
      {
        success: true,
        message: "Berhasil mengambil status pendaftaran",
        body: {
          status: isThirtyDaysBeforeDueDate,
          daysRemaining: daysRemaining,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Gagal mengambil status pendaftaran",
        error: error,
      },
      500,
    );
  }
});
