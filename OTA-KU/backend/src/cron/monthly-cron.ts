import { TZDate } from "@date-fns/tz";
import { CronJob } from "cron";
import { addMonths, getMonth, getYear } from "date-fns";

import { prisma } from "../db/prisma.js";

// Runs at midnight on the 1st day of every month in Jakarta time
export const monthlyCron = new CronJob(
  "0 0 1 * *",
  async () => {
    // Get current time in Jakarta timezone
    const nowJakarta = new TZDate(new Date(), "Asia/Jakarta");
    console.log("Monthly cron job running at", nowJakarta.toISOString());

    // Generate transactions for unpaid connections every month (S-B-5-36)
    // Decrement paidFor if paidFor > 0
    await prisma.connection.updateMany({
      where: { paidFor: { gt: 0 } },
      data: { paidFor: { decrement: 1 } },
    });

    const unpaidConnections = await prisma.connection.findMany({
      where: { paidFor: 0 },
      include: {
        MahasiswaProfile: true,
        OtaProfile: true,
      },
    });

    // Get next month in Jakarta timezone
    const nextMonth = addMonths(nowJakarta, 1);
    const nextMonthYear = getYear(nextMonth);
    const nextMonthIndex = getMonth(nextMonth); // 0-based (0 = January)

    // Create transactions for next month
    const transactions = unpaidConnections.map((conn) => {
      // Create due date in Jakarta timezone (midnight on the transfer date)
      // transferDate is the day of month (1-28)
      const dueDateJakarta = new TZDate(
        new Date(nextMonthYear, nextMonthIndex, conn.OtaProfile.transferDate),
        "Asia/Jakarta",
      );

      return {
        mahasiswaId: conn.mahasiswaId,
        otaId: conn.otaId,
        bill: conn.MahasiswaProfile.bill,
        dueDate: dueDateJakarta, // TZDate automatically converts to UTC when stored
      };
    });

    if (transactions.length > 0) {
      await prisma.transaction.createMany({ data: transactions });
    }

    console.log(
      `Inserted ${transactions.length} transaction(s) for next month.`,
    );
  },
  null,
  true,
  "Asia/Jakarta",
);
