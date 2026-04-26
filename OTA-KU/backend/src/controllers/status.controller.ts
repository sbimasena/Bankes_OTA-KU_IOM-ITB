import nodemailer from "nodemailer";

import { env } from "../config/env.config.js";
import { prisma } from "../db/prisma.js";
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
    const [user, detail] = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { applicationStatus: status },
      });

      let detail: { name: string | null } | null = null;

      if (user.role === "Mahasiswa") {
        await tx.mahasiswaProfile.update({
          where: { userId: id },
          data: {
            bill: bill ?? 0,
            notes: notes ?? null,
            adminOnlyNotes: adminOnlyNotes ?? null,
          },
        });

        detail = await tx.mahasiswaProfile.findFirst({
          where: { userId: id },
          select: { name: true },
        });
      } else {
        detail = await tx.otaProfile.findFirst({
          where: { userId: id },
          select: { name: true },
        });
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
                detail?.name!,
                env.VITE_PUBLIC_URL,
                user.role === "Mahasiswa" ? "ma" : "ota",
              )
            : registrasiRejectedEmail(
                detail?.name!,
                "https://wa.me/6285624654990",
                user.role === "Mahasiswa" ? "ma" : "ota",
              ),
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    const subscription = await prisma.pushSubscription.findFirst({
      where: { userId: user.id },
    });

    if (subscription) {
      const { endpoint } = subscription;
      const { p256dh, auth } = subscription.keys as { p256dh: string; auth: string };

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
    const account = await prisma.user.findUnique({
      where: { id },
    });

    if (!account) {
      return c.json(
        {
          success: false,
          message: "Akun tidak ditemukan",
          error: {},
        },
        404,
      );
    }

    return c.json(
      {
        success: true,
        message: "Berhasil mengambil status pendaftaran",
        body: { status: account.applicationStatus },
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
    const account = await prisma.user.findUnique({
      where: { id },
    });

    if (!account) {
      return c.json(
        {
          success: false,
          message: "Akun tidak ditemukan",
          error: {},
        },
        404,
      );
    }

    return c.json(
      {
        success: true,
        message: "Berhasil mengambil status verifikasi",
        body: { status: account.verificationStatus },
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
    const account = await prisma.user.findUnique({
      where: { id },
    });

    if (!account) {
      return c.json(
        {
          success: false,
          message: "Akun tidak ditemukan",
          error: {},
        },
        404,
      );
    }

    if (account?.role !== "Mahasiswa") {
      return c.json(
        {
          success: false,
          message: "Forbidden",
          error: {},
        },
        403,
      );
    }

    const mahasiswaProfile = await prisma.mahasiswaProfile.findFirst({
      where: { userId: id },
      select: { dueNextUpdateAt: true },
    });

    if (!mahasiswaProfile) {
      return c.json(
        {
          success: false,
          message: "Profil mahasiswa tidak ditemukan",
          error: {},
        },
        404,
      );
    }

    // Return true if current date is 30 days before dueNextUpdateAt
    const currentDate = new Date();
    const dueDate = new Date(mahasiswaProfile.dueNextUpdateAt);
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
