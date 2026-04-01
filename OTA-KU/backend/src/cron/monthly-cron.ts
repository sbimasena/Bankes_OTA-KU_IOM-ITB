import { TZDate } from "@date-fns/tz";
import { CronJob } from "cron";
import { addMonths, getMonth, getYear } from "date-fns";
import { eq, gt, sql } from "drizzle-orm";

import { db } from "../db/drizzle.js";
import {
  accountMahasiswaDetailTable,
  accountOtaDetailTable,
  connectionTable,
  transactionTable,
} from "../db/schema.js";

// Runs at midnight on the 1st day of every month in Jakarta time
export const monthlyCron = new CronJob(
  "0 0 1 * *",
  async () => {
    // Get current time in Jakarta timezone
    const nowJakarta = new TZDate(new Date(), "Asia/Jakarta");
    console.log("Monthly cron job running at", nowJakarta.toISOString());

    // Generate transactions for unpaid connections every month (S-B-5-36)
    await db.transaction(async (tx) => {
      // Decrement paidFor if paidFor > 0
      await tx
        .update(connectionTable)
        .set({
          paidFor: sql`${connectionTable.paidFor} - 1`,
        })
        .where(gt(connectionTable.paidFor, 0));

      const unpaidConnections = await tx
        .select({
          mahasiswaId: connectionTable.mahasiswaId,
          otaId: connectionTable.otaId,
          bill: accountMahasiswaDetailTable.bill,
          dueDate: accountOtaDetailTable.transferDate,
        })
        .from(connectionTable)
        .innerJoin(
          accountMahasiswaDetailTable,
          eq(
            connectionTable.mahasiswaId,
            accountMahasiswaDetailTable.accountId,
          ),
        )
        .innerJoin(
          accountOtaDetailTable,
          eq(connectionTable.otaId, accountOtaDetailTable.accountId),
        )
        .where(eq(connectionTable.paidFor, 0));

      // Get next month in Jakarta timezone
      const nextMonth = addMonths(nowJakarta, 1);
      const nextMonthYear = getYear(nextMonth);
      const nextMonthIndex = getMonth(nextMonth); // 0-based (0 = January)

      // Step 4: Create transactions for next month
      const transactions = unpaidConnections.map((conn) => {
        // Create due date in Jakarta timezone (midnight on the transfer date)
        // transferDate is the day of month (1-28)
        const dueDateJakarta = new TZDate(
          new Date(nextMonthYear, nextMonthIndex, conn.dueDate),
          "Asia/Jakarta",
        );

        return {
          mahasiswaId: conn.mahasiswaId,
          otaId: conn.otaId,
          bill: conn.bill,
          dueDate: dueDateJakarta, // TZDate automatically converts to UTC when stored
        };
      });

      if (transactions.length > 0) {
        await tx.insert(transactionTable).values(transactions);
      }

      console.log(
        `Inserted ${transactions.length} transaction(s) for next month.`,
      );
    });
  },
  null,
  true,
  "Asia/Jakarta",
);
