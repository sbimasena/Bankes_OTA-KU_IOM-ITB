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

    // Get next month in Jakarta timezone
    const nextMonth = addMonths(nowJakarta, 1);
    const nextMonthYear = getYear(nextMonth);
    const nextMonthIndex = getMonth(nextMonth); // 0-based (0 = January)

    // ── Individual connections ───────────────────────────────────────────────

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

    const transactions = unpaidConnections.map((conn) => {
      const dueDateJakarta = new TZDate(
        new Date(nextMonthYear, nextMonthIndex, conn.OtaProfile.transferDate),
        "Asia/Jakarta",
      );
      return {
        mahasiswaId: conn.mahasiswaId,
        otaId: conn.otaId,
        bill: conn.MahasiswaProfile.bill,
        dueDate: dueDateJakarta,
      };
    });

    if (transactions.length > 0) {
      await prisma.transaction.createMany({ data: transactions });
    }

    console.log(`Inserted ${transactions.length} individual transaction(s) for next month.`);

    // ── Group connections ────────────────────────────────────────────────────

    const activeGroupConnections = await prisma.groupConnection.findMany({
      where: { connectionStatus: "accepted" },
      include: {
        Group: { select: { transferDate: true } },
        MemberContributions: { select: { otaId: true, amount: true } },
      },
    });

    let groupTxCount = 0;

    for (const conn of activeGroupConnections) {
      if (conn.MemberContributions.length === 0) continue;

      const transferDay = conn.Group.transferDate ?? 1;
      const dueDateJakarta = new TZDate(
        new Date(nextMonthYear, nextMonthIndex, transferDay),
        "Asia/Jakarta",
      );
      const totalBill = conn.MemberContributions.reduce((s, c) => s + c.amount, 0);

      // Skip if a GroupTransaction for this connection+month already exists
      const existing = await prisma.groupTransaction.findFirst({
        where: {
          groupConnectionId: conn.id,
          dueDate: {
            gte: new Date(nextMonthYear, nextMonthIndex, 1),
            lt: new Date(nextMonthYear, nextMonthIndex + 1, 1),
          },
        },
      });
      if (existing) continue;

      await prisma.$transaction(async (tx) => {
        const groupTx = await tx.groupTransaction.create({
          data: {
            mahasiswaId: conn.mahasiswaId,
            groupId: conn.groupId,
            groupConnectionId: conn.id,
            bill: totalBill,
            dueDate: dueDateJakarta,
          },
        });

        await tx.groupMemberTransaction.createMany({
          data: conn.MemberContributions.map((c) => ({
            groupTransactionId: groupTx.id,
            otaId: c.otaId,
            expectedAmount: c.amount,
          })),
        });

        groupTxCount++;
      });
    }

    console.log(`Inserted ${groupTxCount} group transaction(s) for next month.`);
  },
  null,
  true,
  "Asia/Jakarta",
);
