import { TZDate } from "@date-fns/tz";
import { CronJob } from "cron";
import { addDays, startOfDay } from "date-fns";
import nodemailer from "nodemailer";

import { env } from "../config/env.config.js";
import { prisma } from "../db/prisma.js";
import { deadlineTransaksiEmail } from "../lib/email/deadline-transaksi.js";
import { mahasiswaOutdatedEmail } from "../lib/email/mahasiswa-outdated.js";
import { mahasiswaReapplyEmail } from "../lib/email/mahasiswa-reapply.js";
import { sendWhatsApp } from "../lib/whatsapp.js";

export const dailyReminder30DaysCron = new CronJob(
  "0 0 * * *",
  async () => {
    // Get current time in Jakarta timezone
    const now = new TZDate(new Date(), "Asia/Jakarta");

    // Get 30 days from now, then normalize to start of day
    const targetDate = addDays(now, 30);
    const target = new TZDate(startOfDay(targetDate), "Asia/Jakarta");

    // Get start of next day (exclusive upper bound)
    const targetEnd = new TZDate(addDays(target, 1), "Asia/Jakarta");

    console.log(
      "Transaction cron job running for dueDate between",
      target.toISOString(),
      "and",
      targetEnd.toISOString(),
    );

    // Get all mahasiswa accounts that have exactly 30 days left before their due date
    const dueMahasiswaProfiles = await prisma.mahasiswaProfile.findMany({
      where: {
        dueNextUpdateAt: { gte: target, lt: targetEnd },
      },
      include: { User: true },
    });

    console.log(
      "Mahasiswa accounts due in 30 days:",
      dueMahasiswaProfiles.length,
    );

    if (dueMahasiswaProfiles.length > 0) {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        secure: true,
        port: 465,
        auth: {
          user: env.EMAIL,
          pass: env.EMAIL_PASSWORD,
        },
      });

      try {
        await transporter.verify();
        console.log("SMTP Server is ready");
      } catch (error) {
        console.error("SMTP Server verification failed:", error);
        return;
      }

      await Promise.all(
        dueMahasiswaProfiles.map(async (profile) => {
          try {
            await transporter.sendMail({
              from: env.EMAIL_FROM,
              to:
                env.NODE_ENV !== "production"
                  ? env.TEST_EMAIL
                  : profile.User.email,
              subject: "Pengingat Perpanjangan Bantuan Orang Tua Asuh",
              html: mahasiswaReapplyEmail(
                profile.name!,
                profile.updatedAt.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }),
                profile.dueNextUpdateAt.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }),
                "30",
                env.VITE_PUBLIC_URL + "/profile",
              ),
            });
          } catch (error) {
            console.error(
              `Error sending email to ${profile.User.email}:`,
              error,
            );
          }
        }),
      );
    }
  },
  null,
  true,
  "Asia/Jakarta",
);

export const dailyReminder14DaysCron = new CronJob(
  "0 0 * * *",
  async () => {
    // Get current time in Jakarta timezone
    const now = new TZDate(new Date(), "Asia/Jakarta");

    // Get 14 days from now, then normalize to start of day
    const targetDate = addDays(now, 14);
    const target = new TZDate(startOfDay(targetDate), "Asia/Jakarta");

    // Get start of next day (exclusive upper bound)
    const targetEnd = new TZDate(addDays(target, 1), "Asia/Jakarta");

    console.log(
      "Transaction cron job running for dueDate between",
      target.toISOString(),
      "and",
      targetEnd.toISOString(),
    );

    // Get all mahasiswa accounts that have exactly 14 days left before their due date
    const dueMahasiswaProfiles = await prisma.mahasiswaProfile.findMany({
      where: {
        dueNextUpdateAt: { gte: target, lt: targetEnd },
      },
      include: { User: true },
    });

    console.log(
      "Mahasiswa accounts due in 14 days:",
      dueMahasiswaProfiles.length,
    );

    if (dueMahasiswaProfiles.length > 0) {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        secure: true,
        port: 465,
        auth: {
          user: env.EMAIL,
          pass: env.EMAIL_PASSWORD,
        },
      });

      try {
        await transporter.verify();
        console.log("SMTP Server is ready");
      } catch (error) {
        console.error("SMTP Server verification failed:", error);
        return;
      }

      await Promise.all(
        dueMahasiswaProfiles.map(async (profile) => {
          try {
            await transporter.sendMail({
              from: env.EMAIL_FROM,
              to:
                env.NODE_ENV !== "production"
                  ? env.TEST_EMAIL
                  : profile.User.email,
              subject: "Pengingat Perpanjangan Bantuan Orang Tua Asuh",
              html: mahasiswaReapplyEmail(
                profile.name!,
                profile.updatedAt.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }),
                profile.dueNextUpdateAt.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }),
                "14",
                env.VITE_PUBLIC_URL + "/profile",
              ),
            });
          } catch (error) {
            console.error(
              `Error sending email to ${profile.User.email}:`,
              error,
            );
          }
        }),
      );
    }
  },
  null,
  true,
  "Asia/Jakarta",
);

// Runs daily at midnight (00:00) Jakarta time - 7 days before due date reminder
export const dailyReminder7DaysCron = new CronJob(
  "0 0 * * *",
  async () => {
    // Get current time in Jakarta timezone
    const now = new TZDate(new Date(), "Asia/Jakarta");

    // Get 7 days from now, then normalize to start of day
    const targetDate = addDays(now, 7);
    const target = new TZDate(startOfDay(targetDate), "Asia/Jakarta");

    // Get start of next day (exclusive upper bound)
    const targetEnd = new TZDate(addDays(target, 1), "Asia/Jakarta");

    console.log(
      "Transaction cron job running for dueDate between",
      target.toISOString(),
      "and",
      targetEnd.toISOString(),
    );

    const dueTransactions = await prisma.transaction.findMany({
      where: {
        dueDate: { gte: target, lt: targetEnd },
        Connection: { paidFor: 0 },
      },
      include: { OtaProfile: { include: { User: true } } },
    });

    console.log("Transactions due in 7 days:", dueTransactions.length);

    if (dueTransactions.length > 0) {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        secure: true,
        port: 465,
        auth: {
          user: env.EMAIL,
          pass: env.EMAIL_PASSWORD,
        },
      });

      try {
        await transporter.verify();
        console.log("SMTP Server is ready");
      } catch (error) {
        console.error("SMTP Server verification failed:", error);
        return;
      }

      await Promise.all(
        dueTransactions.map(async (transaction) => {
          const email = transaction.OtaProfile?.User?.email;
          try {
            await transporter.sendMail({
              from: env.EMAIL_FROM,
              to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : email,
              subject: "Pengingat Pembayaran Bantuan Orang Tua Asuh",
              html: deadlineTransaksiEmail(
                transaction.bill,
                transaction.dueDate.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }),
                7,
                env.VITE_PUBLIC_URL + "/status-transaksi",
              ),
            });
            console.log(`Email sent to ${email}`);
          } catch (error) {
            console.error(`Error sending email to ${email}:`, error);
          }
        }),
      );
    }

    // Get all mahasiswa accounts that have exactly 7 days left before their due date
    const dueMahasiswaProfiles = await prisma.mahasiswaProfile.findMany({
      where: {
        dueNextUpdateAt: { gte: target, lt: targetEnd },
      },
      include: { User: true },
    });

    console.log(
      "Mahasiswa accounts due in 7 days:",
      dueMahasiswaProfiles.length,
    );

    if (dueMahasiswaProfiles.length > 0) {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        secure: true,
        port: 465,
        auth: {
          user: env.EMAIL,
          pass: env.EMAIL_PASSWORD,
        },
      });

      try {
        await transporter.verify();
        console.log("SMTP Server is ready");
      } catch (error) {
        console.error("SMTP Server verification failed:", error);
        return;
      }

      await Promise.all(
        dueMahasiswaProfiles.map(async (profile) => {
          try {
            await transporter.sendMail({
              from: env.EMAIL_FROM,
              to:
                env.NODE_ENV !== "production"
                  ? env.TEST_EMAIL
                  : profile.User.email,
              subject: "Pengingat Perpanjangan Bantuan Orang Tua Asuh",
              html: mahasiswaReapplyEmail(
                profile.name!,
                profile.updatedAt.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }),
                profile.dueNextUpdateAt.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }),
                "7",
                env.VITE_PUBLIC_URL + "/profile",
              ),
            });
          } catch (error) {
            console.error(
              `Error sending email to ${profile.User.email}:`,
              error,
            );
          }
        }),
      );
    }
  },
  null,
  true,
  "Asia/Jakarta",
);

// Runs daily at midnight (00:00) Jakarta time - 1 day before due date reminder
export const dailyReminderCron = new CronJob(
  "0 0 * * *",
  async () => {
    // Get current time in Jakarta timezone
    const now = new TZDate(new Date(), "Asia/Jakarta");

    // Get 1 day from now (tomorrow), then normalize to start of day
    const targetDate = addDays(now, 1);
    const target = new TZDate(startOfDay(targetDate), "Asia/Jakarta");

    // Get start of next day (exclusive upper bound)
    const targetEnd = new TZDate(addDays(target, 1), "Asia/Jakarta");

    console.log(
      "Final reminder cron job running for dueDate between",
      target.toISOString(),
      "and",
      targetEnd.toISOString(),
    );

    const dueTransactions = await prisma.transaction.findMany({
      where: {
        dueDate: { gte: target, lt: targetEnd },
        Connection: { paidFor: 0 },
      },
      include: { OtaProfile: { include: { User: true } } },
    });

    console.log("Transactions due tomorrow:", dueTransactions.length);

    if (dueTransactions.length > 0) {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        secure: true,
        port: 465,
        auth: {
          user: env.EMAIL,
          pass: env.EMAIL_PASSWORD,
        },
      });

      try {
        await transporter.verify();
        console.log("SMTP Server is ready");
      } catch (error) {
        console.error("SMTP Server verification failed:", error);
        return;
      }

      // Send final reminder emails
      await Promise.all(
        dueTransactions.map(async (transaction) => {
          const email = transaction.OtaProfile?.User?.email;
          try {
            await transporter.sendMail({
              from: env.EMAIL_FROM,
              to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : email,
              subject: "Pengingat Pembayaran Bantuan Orang Tua Asuh",
              html: deadlineTransaksiEmail(
                transaction.bill,
                transaction.dueDate.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }),
                1, // 1 day remaining
                env.VITE_PUBLIC_URL + "/status-transaksi",
              ),
            });
            console.log(`Final reminder email sent to ${email}`);
          } catch (error) {
            console.error(
              `Error sending final reminder email to ${email}:`,
              error,
            );
          }
        }),
      );
    }

    // Get all mahasiswa accounts that have exactly 1 day left before their due date
    const dueMahasiswaProfiles = await prisma.mahasiswaProfile.findMany({
      where: {
        dueNextUpdateAt: { gte: target, lt: targetEnd },
      },
      include: { User: true },
    });

    console.log(
      "Mahasiswa accounts due in 1 day:",
      dueMahasiswaProfiles.length,
    );

    if (dueMahasiswaProfiles.length > 0) {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        secure: true,
        port: 465,
        auth: {
          user: env.EMAIL,
          pass: env.EMAIL_PASSWORD,
        },
      });

      try {
        await transporter.verify();
        console.log("SMTP Server is ready");
      } catch (error) {
        console.error("SMTP Server verification failed:", error);
        return;
      }

      await Promise.all(
        dueMahasiswaProfiles.map(async (profile) => {
          try {
            await transporter.sendMail({
              from: env.EMAIL_FROM,
              to:
                env.NODE_ENV !== "production"
                  ? env.TEST_EMAIL
                  : profile.User.email,
              subject: "Pengingat Perpanjangan Bantuan Orang Tua Asuh",
              html: mahasiswaReapplyEmail(
                profile.name!,
                profile.updatedAt.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }),
                profile.dueNextUpdateAt.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }),
                "1",
                env.VITE_PUBLIC_URL + "/profile",
              ),
            });
          } catch (error) {
            console.error(
              `Error sending email to ${profile.User.email}:`,
              error,
            );
          }
        }),
      );
    }

    // Get all mahasiswa that are outdated
    const outdatedProfiles = await prisma.mahasiswaProfile.findMany({
      where: { dueNextUpdateAt: { lt: now } },
      include: { User: true },
    });

    console.log("Mahasiswa accounts outdated:", outdatedProfiles.length);

    if (outdatedProfiles.length > 0) {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        secure: true,
        port: 465,
        auth: {
          user: env.EMAIL,
          pass: env.EMAIL_PASSWORD,
        },
      });

      try {
        await transporter.verify();
        console.log("SMTP Server is ready");
      } catch (error) {
        console.error("SMTP Server verification failed:", error);
        return;
      }

      await Promise.all(
        outdatedProfiles.map(async (profile) => {
          try {
            await transporter.sendMail({
              from: env.EMAIL_FROM,
              to:
                env.NODE_ENV !== "production"
                  ? env.TEST_EMAIL
                  : profile.User.email,
              subject: "Pemberitahuan Pemberhentian Bantuan Orang Tua Asuh",
              html: mahasiswaOutdatedEmail(
                profile.name!,
                profile.updatedAt.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }),
                profile.dueNextUpdateAt.toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }),
                env.VITE_PUBLIC_URL,
              ),
            });
          } catch (error) {
            console.error(
              `Error sending email to ${profile.User.email}:`,
              error,
            );
          }
        }),
      );
    }
  },
  null,
  true,
  "Asia/Jakarta",
);

export async function runWhatsAppReminder3Days() {
    const now = new TZDate(new Date(), "Asia/Jakarta");

    const targetDate = addDays(now, 3);
    const target = new TZDate(startOfDay(targetDate), "Asia/Jakarta");
    const targetEnd = new TZDate(addDays(target, 1), "Asia/Jakarta");

    console.log(
      "[whatsapp-cron] Running H-3 payment reminder for dueDate between",
      target.toISOString(),
      "and",
      targetEnd.toISOString(),
    );

    const dueTransactions = await prisma.transaction.findMany({
      where: {
        dueDate: { gte: target, lt: targetEnd },
        transactionStatus: "unpaid",
      },
      include: {
        OtaProfile: {
          include: { User: true },
        },
        MahasiswaProfile: true,
      },
    });

    console.log("[whatsapp-cron] Transactions due in 3 days:", dueTransactions.length);

    await Promise.all(
      dueTransactions.map(async (transaction) => {
        const phoneNumber = transaction.OtaProfile?.User?.phoneNumber;
        const otaName = transaction.OtaProfile?.name ?? "Orang Tua Asuh";
        const mahasiswaName = transaction.MahasiswaProfile?.name ?? "mahasiswa asuh";

        if (!phoneNumber) {
          console.warn(
            `[whatsapp-cron] OTA ${transaction.otaId} has no phone number, skipping.`,
          );
          return;
        }

        const dueDateStr = transaction.dueDate.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const message =
          `Yth. ${otaName},\n\n` +
          `Ini adalah pengingat bahwa tagihan pembayaran bantuan untuk ${mahasiswaName} ` +
          `sebesar Rp${transaction.bill.toLocaleString("id-ID")} akan jatuh tempo pada ${dueDateStr} ` +
          `(3 hari lagi).\n\n` +
          `Mohon segera lakukan pembayaran melalui platform OTA-KU.\n\nTerima kasih.`;

        await sendWhatsApp({
          to: phoneNumber,
          message,
          clientReference: `trx-ota-${transaction.id}`,
          idempotencyKey: `payment-reminder-${transaction.id}`,
        });
      }),
    );
}

// Runs daily at midnight (00:00) Jakarta time - 3 days before payment due date
export const dailyReminder3DaysWhatsAppCron = new CronJob(
  "0 0 * * *",
  runWhatsAppReminder3Days,
  null,
  true,
  "Asia/Jakarta",
);
