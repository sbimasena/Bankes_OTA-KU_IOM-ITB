import { TZDate } from "@date-fns/tz";
import { CronJob } from "cron";
import { addDays, startOfDay } from "date-fns";
import { and, eq, gte, lt } from "drizzle-orm";
import nodemailer from "nodemailer";

import { env } from "../config/env.config.js";
import { db } from "../db/drizzle.js";
import {
  accountMahasiswaDetailTable,
  accountTable,
  connectionTable,
  transactionTable,
} from "../db/schema.js";
import { deadlineTransaksiEmail } from "../lib/email/deadline-transaksi.js";
import { mahasiswaOutdatedEmail } from "../lib/email/mahasiswa-outdated.js";
import { mahasiswaReapplyEmail } from "../lib/email/mahasiswa-reapply.js";

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

    await db.transaction(async (tx) => {
      // Get all mahasiswa accounts that have exactly 30 days left before their due date
      const dueMahasiswaAccounts = await tx
        .select({
          email: accountTable.email,
          name: accountMahasiswaDetailTable.name,
          updatedAt: accountMahasiswaDetailTable.updatedAt,
          dueNextUpdateAt: accountMahasiswaDetailTable.dueNextUpdateAt,
        })
        .from(accountTable)
        .innerJoin(
          accountMahasiswaDetailTable,
          eq(accountTable.id, accountMahasiswaDetailTable.accountId),
        )
        .where(
          and(
            gte(accountMahasiswaDetailTable.dueNextUpdateAt, target),
            lt(accountMahasiswaDetailTable.dueNextUpdateAt, targetEnd),
          ),
        );

      console.log(
        "Mahasiswa accounts due in 30 days:",
        dueMahasiswaAccounts.length,
      );

      if (dueMahasiswaAccounts.length > 0) {
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
          dueMahasiswaAccounts.map(async (mahasiswa) => {
            try {
              await transporter.sendMail({
                from: env.EMAIL_FROM,
                to:
                  env.NODE_ENV !== "production"
                    ? env.TEST_EMAIL
                    : mahasiswa.email,
                subject: "Pengingat Perpanjangan Bantuan Orang Tua Asuh",
                html: mahasiswaReapplyEmail(
                  mahasiswa.name!,
                  mahasiswa.updatedAt.toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }),
                  mahasiswa.dueNextUpdateAt.toLocaleDateString("id-ID", {
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
                `Error sending email to ${mahasiswa.email}:`,
                error,
              );
            }
          }),
        );
      }
    });
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

    await db.transaction(async (tx) => {
      // Get all mahasiswa accounts that have exactly 14 days left before their due date
      const dueMahasiswaAccounts = await tx
        .select({
          email: accountTable.email,
          name: accountMahasiswaDetailTable.name,
          updatedAt: accountMahasiswaDetailTable.updatedAt,
          dueNextUpdateAt: accountMahasiswaDetailTable.dueNextUpdateAt,
        })
        .from(accountTable)
        .innerJoin(
          accountMahasiswaDetailTable,
          eq(accountTable.id, accountMahasiswaDetailTable.accountId),
        )
        .where(
          and(
            gte(accountMahasiswaDetailTable.dueNextUpdateAt, target),
            lt(accountMahasiswaDetailTable.dueNextUpdateAt, targetEnd),
          ),
        );

      console.log(
        "Mahasiswa accounts due in 14 days:",
        dueMahasiswaAccounts.length,
      );

      if (dueMahasiswaAccounts.length > 0) {
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
          dueMahasiswaAccounts.map(async (mahasiswa) => {
            try {
              await transporter.sendMail({
                from: env.EMAIL_FROM,
                to:
                  env.NODE_ENV !== "production"
                    ? env.TEST_EMAIL
                    : mahasiswa.email,
                subject: "Pengingat Perpanjangan Bantuan Orang Tua Asuh",
                html: mahasiswaReapplyEmail(
                  mahasiswa.name!,
                  mahasiswa.updatedAt.toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }),
                  mahasiswa.dueNextUpdateAt.toLocaleDateString("id-ID", {
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
                `Error sending email to ${mahasiswa.email}:`,
                error,
              );
            }
          }),
        );
      }
    });
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

    await db.transaction(async (tx) => {
      const dueTransactions = await tx
        .select({
          email: accountTable.email,
          bill: transactionTable.bill,
          dueDate: transactionTable.dueDate,
        })
        .from(transactionTable)
        .innerJoin(
          connectionTable,
          eq(transactionTable.otaId, connectionTable.otaId),
        )
        .innerJoin(accountTable, eq(transactionTable.otaId, accountTable.id))
        .where(
          and(
            gte(transactionTable.dueDate, target),
            lt(transactionTable.dueDate, targetEnd),
            eq(connectionTable.paidFor, 0),
          ),
        );

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
            try {
              await transporter.sendMail({
                from: env.EMAIL_FROM,
                to:
                  env.NODE_ENV !== "production"
                    ? env.TEST_EMAIL
                    : transaction.email,
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
              console.log(`Email sent to ${transaction.email}`);
            } catch (error) {
              console.error(
                `Error sending email to ${transaction.email}:`,
                error,
              );
            }
          }),
        );
      }
    });

    await db.transaction(async (tx) => {
      // Get all mahasiswa accounts that have exactly 7 days left before their due date
      const dueMahasiswaAccounts = await tx
        .select({
          email: accountTable.email,
          name: accountMahasiswaDetailTable.name,
          updatedAt: accountMahasiswaDetailTable.updatedAt,
          dueNextUpdateAt: accountMahasiswaDetailTable.dueNextUpdateAt,
        })
        .from(accountTable)
        .innerJoin(
          accountMahasiswaDetailTable,
          eq(accountTable.id, accountMahasiswaDetailTable.accountId),
        )
        .where(
          and(
            gte(accountMahasiswaDetailTable.dueNextUpdateAt, target),
            lt(accountMahasiswaDetailTable.dueNextUpdateAt, targetEnd),
          ),
        );

      console.log(
        "Mahasiswa accounts due in 7 days:",
        dueMahasiswaAccounts.length,
      );

      if (dueMahasiswaAccounts.length > 0) {
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
          dueMahasiswaAccounts.map(async (mahasiswa) => {
            try {
              await transporter.sendMail({
                from: env.EMAIL_FROM,
                to:
                  env.NODE_ENV !== "production"
                    ? env.TEST_EMAIL
                    : mahasiswa.email,
                subject: "Pengingat Perpanjangan Bantuan Orang Tua Asuh",
                html: mahasiswaReapplyEmail(
                  mahasiswa.name!,
                  mahasiswa.updatedAt.toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }),
                  mahasiswa.dueNextUpdateAt.toLocaleDateString("id-ID", {
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
                `Error sending email to ${mahasiswa.email}:`,
                error,
              );
            }
          }),
        );
      }
    });
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

    await db.transaction(async (tx) => {
      const dueTransactions = await tx
        .select({
          email: accountTable.email,
          bill: transactionTable.bill,
          dueDate: transactionTable.dueDate,
        })
        .from(transactionTable)
        .innerJoin(
          connectionTable,
          eq(transactionTable.otaId, connectionTable.otaId),
        )
        .innerJoin(accountTable, eq(transactionTable.otaId, accountTable.id))
        .where(
          and(
            gte(transactionTable.dueDate, target),
            lt(transactionTable.dueDate, targetEnd),
            eq(connectionTable.paidFor, 0),
          ),
        );

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
            try {
              await transporter.sendMail({
                from: env.EMAIL_FROM,
                to:
                  env.NODE_ENV !== "production"
                    ? env.TEST_EMAIL
                    : transaction.email,
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
              console.log(`Final reminder email sent to ${transaction.email}`);
            } catch (error) {
              console.error(
                `Error sending final reminder email to ${transaction.email}:`,
                error,
              );
            }
          }),
        );
      }
    });

    await db.transaction(async (tx) => {
      // Get all mahasiswa accounts that have exactly 1 day left before their due date
      const dueMahasiswaAccounts = await tx
        .select({
          email: accountTable.email,
          name: accountMahasiswaDetailTable.name,
          updatedAt: accountMahasiswaDetailTable.updatedAt,
          dueNextUpdateAt: accountMahasiswaDetailTable.dueNextUpdateAt,
        })
        .from(accountTable)
        .innerJoin(
          accountMahasiswaDetailTable,
          eq(accountTable.id, accountMahasiswaDetailTable.accountId),
        )
        .where(
          and(
            gte(accountMahasiswaDetailTable.dueNextUpdateAt, target),
            lt(accountMahasiswaDetailTable.dueNextUpdateAt, targetEnd),
          ),
        );

      console.log(
        "Mahasiswa accounts due in 1 day:",
        dueMahasiswaAccounts.length,
      );

      if (dueMahasiswaAccounts.length > 0) {
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
          dueMahasiswaAccounts.map(async (mahasiswa) => {
            try {
              await transporter.sendMail({
                from: env.EMAIL_FROM,
                to:
                  env.NODE_ENV !== "production"
                    ? env.TEST_EMAIL
                    : mahasiswa.email,
                subject: "Pengingat Perpanjangan Bantuan Orang Tua Asuh",
                html: mahasiswaReapplyEmail(
                  mahasiswa.name!,
                  mahasiswa.updatedAt.toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }),
                  mahasiswa.dueNextUpdateAt.toLocaleDateString("id-ID", {
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
                `Error sending email to ${mahasiswa.email}:`,
                error,
              );
            }
          }),
        );
      }
    });

    // Get all mahasiswa that are outdated
    await db.transaction(async (tx) => {
      const outdatedMahasiswa = await tx
        .select({
          email: accountTable.email,
          name: accountMahasiswaDetailTable.name,
          updatedAt: accountMahasiswaDetailTable.updatedAt,
          dueNextUpdateAt: accountMahasiswaDetailTable.dueNextUpdateAt,
        })
        .from(accountTable)
        .innerJoin(
          accountMahasiswaDetailTable,
          eq(accountTable.id, accountMahasiswaDetailTable.accountId),
        )
        .where(lt(accountMahasiswaDetailTable.dueNextUpdateAt, now));

      console.log("Mahasiswa accounts outdated:", outdatedMahasiswa.length);

      if (outdatedMahasiswa.length > 0) {
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
          outdatedMahasiswa.map(async (mahasiswa) => {
            try {
              await transporter.sendMail({
                from: env.EMAIL_FROM,
                to:
                  env.NODE_ENV !== "production"
                    ? env.TEST_EMAIL
                    : mahasiswa.email,
                subject: "Pemberitahuan Pemberhentian Bantuan Orang Tua Asuh",
                html: mahasiswaOutdatedEmail(
                  mahasiswa.name!,
                  mahasiswa.updatedAt.toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }),
                  mahasiswa.dueNextUpdateAt.toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }),
                  env.VITE_PUBLIC_URL,
                ),
              });
            } catch (error) {
              console.error(
                `Error sending email to ${mahasiswa.email}:`,
                error,
              );
            }
          }),
        );
      }
    });
  },
  null,
  true,
  "Asia/Jakarta",
);
