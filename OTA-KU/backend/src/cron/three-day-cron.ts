import { TZDate } from "@date-fns/tz";
import { CronJob } from "cron";
import nodemailer from "nodemailer";

import { env } from "../config/env.config.js";
import { prisma } from "../db/prisma.js";
import { registrationEmailToBankesAdmin } from "../lib/email/pendaftaran.js";
import { terminationEmail } from "../lib/email/termination.js";
import { verifikasiPembayaranOtaEmail } from "../lib/email/verifikasi-pembayaran-ota.js";

export const everyThreeDaysCron = new CronJob(
  "0 0 * * *",
  async () => {
    const timezone = "Asia/Jakarta";
    const now = new Date();
    const jakartaTime = new TZDate(now, timezone);

    const startDate = new TZDate("2025-01-01 00:00:00", timezone);
    const diffInDays = Math.floor(
      (jakartaTime.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays % 3 === 0) {
      console.log(
        "3-day interval cron job running at",
        jakartaTime.toISOString(),
      );

      // Task 1: [BE] Notif email & web ada pendaftaran MA/OTA yang masuk dan perlu diverifikasi
      {
        const adminUsers = await prisma.user.findMany({
          where: { role: { in: ["Admin", "Bankes"] } },
          include: { AdminProfile: true },
        });
        const adminEmails = adminUsers
          .filter((u) => u.AdminProfile)
          .map((u) => ({ email: u.email, name: u.AdminProfile!.name }));

        const [pendingMACount, pendingOtaCount] = await Promise.all([
          prisma.user.count({
            where: {
              role: "Mahasiswa",
              applicationStatus: { in: ["pending", "reapply"] },
            },
          }),
          prisma.user.count({
            where: {
              role: "OrangTuaAsuh",
              applicationStatus: { in: ["pending", "reapply"] },
            },
          }),
        ]);

        const pendingApplicationsMA = { count: pendingMACount };
        const pendingApplicationsOta = { count: pendingOtaCount };

        if (
          pendingApplicationsMA.count > 0 ||
          pendingApplicationsOta.count > 0
        ) {
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
            adminEmails.map(async (admin) => {
              try {
                await transporter.sendMail({
                  from: env.EMAIL_FROM,
                  to:
                    env.NODE_ENV !== "production"
                      ? env.TEST_EMAIL
                      : admin.email,
                  subject:
                    "Pengingat Verifikasi Pendaftaran Mahasiswa dan Orang Tua Asuh",
                  html: registrationEmailToBankesAdmin(
                    admin.name,
                    pendingApplicationsMA.count.toString(),
                    pendingApplicationsOta.count.toString(),
                    env.VITE_PUBLIC_URL + "/verifikasi-akun",
                  ),
                });
                console.log(`Email sent to ${admin.email}`);
              } catch (error) {
                console.error("Error sending email to admin:", error);
              }
            }),
          );
        }
      }

      // Task 2: [BE] Notif terdapat req terminasi dari MA/OTA
      {
        const adminUsers = await prisma.user.findMany({
          where: { role: { in: ["Admin", "Bankes"] } },
          include: { AdminProfile: true },
        });
        const adminEmails = adminUsers
          .filter((u) => u.AdminProfile)
          .map((u) => ({ email: u.email, name: u.AdminProfile!.name }));

        const [pendingTermMACount, pendingTermOtaCount] = await Promise.all([
          prisma.connection.count({ where: { requestTerminateMahasiswa: true } }),
          prisma.connection.count({ where: { requestTerminateOta: true } }),
        ]);

        const pendingTerminationRequestsMA = { count: pendingTermMACount };
        const pendingTerminationRequestsOta = { count: pendingTermOtaCount };

        if (
          pendingTerminationRequestsMA.count > 0 ||
          pendingTerminationRequestsOta.count > 0
        ) {
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
            adminEmails.map(async (admin) => {
              try {
                await transporter.sendMail({
                  from: env.EMAIL_FROM,
                  to: admin.email,
                  subject: "Pengingat Permintaan Terminasi",
                  html: terminationEmail(
                    admin.name,
                    pendingTerminationRequestsMA.count.toString(),
                    pendingTerminationRequestsOta.count.toString(),
                    env.VITE_PUBLIC_URL + "/daftar-terminasi",
                  ),
                });
                console.log(`Email sent to ${admin.email}`);
              } catch (error) {
                console.error("Error sending email to admin:", error);
              }
            }),
          );
        }
      }

      // Task 3: [BE] Notif reminder untuk verifikasi tagihan
      {
        const adminUsers = await prisma.user.findMany({
          where: { role: { in: ["Admin", "Bankes"] } },
          include: { AdminProfile: true },
        });
        const adminEmails = adminUsers
          .filter((u) => u.AdminProfile)
          .map((u) => ({ email: u.email, name: u.AdminProfile!.name }));

        const [pendingTransOtaCount, pendingTransMaCount] = await Promise.all([
          prisma.transaction.count({ where: { transactionStatus: "pending" } }),
          prisma.transaction.count({ where: { transferStatus: "unpaid" } }),
        ]);

        const pendingTransactionOta = { count: pendingTransOtaCount };
        const pendingTransactionMa = { count: pendingTransMaCount };

        if (pendingTransactionOta.count > 0 || pendingTransactionMa.count > 0) {
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
            adminEmails.map(async (admin) => {
              try {
                await transporter.sendMail({
                  from: env.EMAIL_FROM,
                  to: admin.email,
                  subject: "Pengingat Verifikasi Tagihan",
                  html: verifikasiPembayaranOtaEmail(
                    admin.name,
                    pendingTransactionOta.count.toString(),
                    pendingTransactionMa.count.toString(),
                    env.VITE_PUBLIC_URL + "/daftar-tagihan",
                    env.VITE_PUBLIC_URL + "/daftar-transfer-mahasiswa",
                  ),
                });
                console.log(`Email sent to ${admin.email}`);
              } catch (error) {
                console.error("Error sending email to admin:", error);
              }
            }),
          );
        }
      }
    }
  },
  null,
  true,
  "Asia/Jakarta",
);
