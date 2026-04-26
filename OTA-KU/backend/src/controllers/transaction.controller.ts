import { addMonths, setDate } from "date-fns";
import nodemailer from "nodemailer";

import { env } from "../config/env.config.js";
import { prisma } from "../db/prisma.js";
import { transferMahasiswaEmail } from "../lib/email/transfer-mahasiswa.js";
import { uploadFileToMinio } from "../lib/file-upload-minio.js";
import { sendNotification } from "../lib/web-push.js";
import {
  acceptTransferStatusRoute,
  detailTransactionRoute,
  listTransactionAdminRoute,
  listTransactionOTARoute,
  listTransactionVerificationAdminRoute,
  uploadReceiptRoute,
  verifyTransactionAccRoute,
  verifyTransactionRejectRoute,
} from "../routes/transaction.route.js";
import { SubscriptionSchema } from "../zod/push.js";
import {
  AcceptTransferStatusSchema,
  DetailTransactionParams,
  TransactionListAdminQuerySchema,
  TransactionListOTAQuerySchema,
  TransactionListVerificationAdminQuerySchema,
  UploadReceiptSchema,
  VerifyTransactionAcceptSchema,
  VerifyTransactionRejectSchema,
} from "../zod/transaction.js";
import { createAuthRouter } from "./router-factory.js";

export const transactionProtectedRouter = createAuthRouter();

const LIST_PAGE_SIZE = 6;

transactionProtectedRouter.openapi(listTransactionOTARoute, async (c) => {
  const user = c.var.user;
  const zodParseResult = TransactionListOTAQuerySchema.parse(c.req.query());
  const { year, month } = zodParseResult;

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya OTA yang dapat mengakses list ini",
        },
      },
      403,
    );
  }

  try {
    const dueDateFilter = month
      ? { gte: new Date(year ?? 2000, month - 1, 1), lt: new Date(year ?? 2000, month, 1) }
      : year
        ? { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) }
        : undefined;

    const [transactions, allTransactions, groupMemberTxs, allGroupMemberTxs] = await Promise.all([
      prisma.transaction.findMany({
        where: { otaId: user.id, ...(dueDateFilter ? { dueDate: dueDateFilter } : {}) },
        include: { MahasiswaProfile: true },
      }),
      prisma.transaction.findMany({
        where: { otaId: user.id },
        select: { dueDate: true },
      }),
      prisma.groupMemberTransaction.findMany({
        where: {
          otaId: user.id,
          ...(dueDateFilter ? { GroupTransaction: { dueDate: dueDateFilter } } : {}),
        },
        include: {
          GroupTransaction: {
            include: { Mahasiswa: true },
          },
        },
      }),
      prisma.groupMemberTransaction.findMany({
        where: { otaId: user.id },
        include: { GroupTransaction: { select: { dueDate: true } } },
      }),
    ]);

    const allYears = [
      ...allTransactions.map((t) => t.dueDate.getFullYear()),
      ...allGroupMemberTxs.map((t) => t.GroupTransaction.dueDate.getFullYear()),
    ];
    const years = [...new Set(allYears)].sort((a, b) => b - a);

    const data = [
      ...transactions.map((t) => ({
        id: t.id,
        mahasiswa_id: t.mahasiswaId,
        name: t.MahasiswaProfile?.name ?? "",
        nim: t.MahasiswaProfile?.nim ?? "",
        bill: t.bill,
        amount_paid: t.amountPaid,
        paid_at: t.paidAt?.toISOString() ?? "",
        created_at: t.createdAt.toISOString(),
        due_date: t.dueDate.toISOString(),
        status: t.transactionStatus as "unpaid" | "pending" | "paid",
        receipt: t.transactionReceipt ?? "",
        rejection_note: t.rejectionNote ?? "",
        paid_for: t.paidFor ?? 0,
      })),
      ...groupMemberTxs.map((t) => ({
        id: t.id,
        mahasiswa_id: t.GroupTransaction.mahasiswaId,
        name: t.GroupTransaction.Mahasiswa.name ?? "",
        nim: t.GroupTransaction.Mahasiswa.nim,
        bill: t.expectedAmount,
        amount_paid: t.amountPaid,
        paid_at: t.paidAt?.toISOString() ?? "",
        created_at: t.createdAt.toISOString(),
        due_date: t.GroupTransaction.dueDate.toISOString(),
        status: t.paymentStatus as "unpaid" | "pending" | "paid",
        receipt: t.transactionReceipt ?? "",
        rejection_note: t.rejectionNote ?? "",
        paid_for: 0,
      })),
    ];

    const totalBill = data.reduce((sum, t) => sum + t.bill, 0);

    return c.json(
      {
        success: true,
        message: "Daftar transaction untuk OTA berhasil diambil",
        body: { data, years, totalBill },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching mahasiswa list:", error);
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

transactionProtectedRouter.openapi(listTransactionAdminRoute, async (c) => {
  const user = c.var.user;
  const zodParseResult = TransactionListAdminQuerySchema.parse(c.req.query());
  const { month, status, year, page } = zodParseResult;

  if (
    user.type !== "admin" &&
    user.type !== "pengurus" &&
    user.type !== "bankes"
  ) {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message:
            "Hanya admin, bankes, atau pengurus yang dapat mengakses list ini",
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

    // Build where clause — month filtering done in JS since Prisma has no
    // built-in month extraction that works portably across all DBs without raw SQL
    const where: any = {};

    if (status) {
      where.transactionStatus = status;
    }

    if (year) {
      where.dueDate = {
        ...(where.dueDate ?? {}),
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      };
    }

    const allRows = await prisma.transaction.findMany({
      where,
      include: {
        MahasiswaProfile: true,
        OtaProfile: { include: { User: true } },
      },
    });

    // Filter by month name in JS (mirrors ILIKE 'Month' logic from Drizzle)
    const monthNames = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december",
    ];

    const filtered = month
      ? allRows.filter((t) => {
          const monthName = monthNames[t.dueDate.getMonth()];
          return monthName.includes(month.toLowerCase());
        })
      : allRows;

    const totalData = filtered.length;
    const paginated = filtered.slice(offset, offset + LIST_PAGE_SIZE);

    return c.json(
      {
        success: true,
        message: "Daftar transaction untuk Admin berhasil diambil",
        body: {
          data: paginated.map((transaction) => ({
            id: transaction.id,
            mahasiswa_id: transaction.mahasiswaId,
            ota_id: transaction.otaId,
            name_ma: transaction.MahasiswaProfile?.name ?? "",
            nim_ma: transaction.MahasiswaProfile?.nim,
            name_ota: transaction.OtaProfile?.name,
            number_ota: transaction.OtaProfile?.User?.phoneNumber ?? "",
            bill: transaction.bill,
            amount_paid: transaction.amountPaid,
            paid_at: transaction.paidAt ?? "",
            due_date: transaction.dueDate,
            status: transaction.transactionStatus,
            transferStatus: transaction.transferStatus,
            receipt: transaction.transactionReceipt ?? "",
            createdAt: transaction.createdAt,
            paid_for: transaction.paidFor ?? 0,
          })),
          totalData,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching mahasiswa list:", error);
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

transactionProtectedRouter.openapi(
  listTransactionVerificationAdminRoute,
  async (c) => {
    const user = c.var.user;
    const zodParseResult = TransactionListVerificationAdminQuerySchema.parse(
      c.req.query(),
    );
    const { month, q, year, page } = zodParseResult;

    if (
      user.type !== "admin" &&
      user.type !== "pengurus" &&
      user.type !== "bankes"
    ) {
      return c.json(
        {
          success: false,
          message: "Forbidden",
          error: {
            code: "Forbidden",
            message:
              "Hanya admin, bankes, atau pengurus yang dapat mengakses list ini",
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

      // Build base where clause for date filters
      const where: any = {};

      if (year) {
        where.dueDate = {
          ...(where.dueDate ?? {}),
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        };
      }

      // Fetch all transactions with OTA and mahasiswa details
      const [allTransactions, allForYears] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: {
            OtaProfile: { include: { User: true } },
            MahasiswaProfile: true,
          },
        }),
        prisma.transaction.findMany({
          select: { dueDate: true },
        }),
      ]);

      // Extract distinct years
      const years = [
        ...new Set(allForYears.map((t) => t.dueDate.getFullYear())),
      ].sort((a, b) => b - a);

      // Filter by month (JS, mirrors EXTRACT(MONTH) = month logic)
      const monthFiltered = month
        ? allTransactions.filter((t) => t.dueDate.getMonth() + 1 === month)
        : allTransactions;

      // Filter by OTA name (mirrors ILIKE %q%)
      const qFiltered = q
        ? monthFiltered.filter((t) =>
            t.OtaProfile?.name?.toLowerCase().includes(q.toLowerCase()),
          )
        : monthFiltered;

      // Group transactions by OTA
      const groupedByOta = qFiltered.reduce(
        (acc: { [key: string]: any }, transaction) => {
          const otaId = transaction.otaId;

          if (!acc[otaId]) {
            acc[otaId] = {
              ota_id: otaId,
              name_ota: transaction.OtaProfile?.name,
              number_ota: transaction.OtaProfile?.User?.phoneNumber ?? "",
              totalBill: 0,
              transactions: [],
            };
          }

          acc[otaId].totalBill += transaction.bill;
          acc[otaId].transactions.push({
            id: transaction.id,
            mahasiswa_id: transaction.mahasiswaId,
            name_ma: transaction.MahasiswaProfile?.name ?? "",
            nim_ma: transaction.MahasiswaProfile?.nim,
            paidAt: transaction.paidAt?.toISOString() ?? "",
            dueDate: transaction.dueDate.toISOString(),
            bill: transaction.bill,
            receipt: transaction.transactionReceipt ?? "",
            rejectionNote: transaction.rejectionNote ?? "",
            transactionStatus: transaction.transactionStatus,
          });

          return acc;
        },
        {} as { [key: string]: any },
      );

      // Convert to array and apply pagination
      const otaGroups = Object.values(groupedByOta);
      const totalData = otaGroups.length;
      const paginatedData = otaGroups.slice(offset, offset + LIST_PAGE_SIZE);

      return c.json(
        {
          success: true,
          message: "Daftar transaction untuk verifikasi Admin berhasil diambil",
          body: {
            data: paginatedData,
            totalData,
            years,
          },
        },
        200,
      );
    } catch (error) {
      console.error("Error fetching transaction verification list:", error);
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

transactionProtectedRouter.openapi(detailTransactionRoute, async (c) => {
  const user = c.var.user;
  const { id, page } = DetailTransactionParams.parse(c.req.param());

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya OTA yang dapat mengakses detail ini",
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

    const mahasiswa = await prisma.mahasiswaProfile.findFirst({
      where: { userId: id },
      select: { name: true, nim: true, faculty: true, major: true },
    });

    if (!mahasiswa) {
      return c.json(
        {
          success: false,
          message: "Mahasiswa tidak ditemukan",
          error: {},
        },
        404,
      );
    }

    const [detailTransaction, totalData] = await Promise.all([
      prisma.transaction.findMany({
        where: { mahasiswaId: id },
        select: {
          bill: true,
          amountPaid: true,
          dueDate: true,
          transactionStatus: true,
          transactionReceipt: true,
        },
        skip: offset,
        take: LIST_PAGE_SIZE,
      }),
      prisma.transaction.count({ where: { mahasiswaId: id } }),
    ]);

    return c.json(
      {
        success: true,
        message: "Detail transaction berhasil diambil",
        body: {
          nama_ma: mahasiswa.name ?? "Nama tidak tersedia",
          nim_ma: mahasiswa.nim,
          fakultas: mahasiswa.faculty ?? "Fakultas tidak tersedia",
          jurusan: mahasiswa.major ?? "Jurusan tidak tersedia",
          data: detailTransaction.map((tx) => ({
            tagihan: tx.bill,
            pembayaran: tx.amountPaid,
            due_date: tx.dueDate,
            status_bayar: tx.transactionStatus,
            bukti_bayar: tx.transactionReceipt ?? "",
          })),
          totalData,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching detail transaction:", error);
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

transactionProtectedRouter.openapi(uploadReceiptRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  // Parse using the UploadReceiptSchema
  const zodParseResult = UploadReceiptSchema.parse(data);
  const { ids, paidFor, receipt } = zodParseResult;

  if (user.type !== "ota") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya OTA yang dapat mengakses detail ini",
        },
      },
      403,
    );
  }

  try {
    const receiptResult = await uploadFileToMinio(receipt);
    const receiptUrl = receiptResult?.secure_url ?? "";

    await prisma.$transaction(async (tx) => {
      await tx.transaction.updateMany({
        where: {
          mahasiswaId: { in: ids },
          otaId: user.id,
        },
        data: {
          transactionReceipt: receiptUrl,
          transactionStatus: "pending",
        },
      });

      await tx.connection.updateMany({
        where: {
          mahasiswaId: { in: ids },
          otaId: user.id,
        },
        data: { paidFor },
      });

      await tx.transaction.updateMany({
        where: {
          mahasiswaId: { in: ids },
          otaId: user.id,
        },
        data: { paidFor },
      });
    });

    return c.json(
      {
        success: true,
        message: "Berhasil melakukan upload bukti pembayaran dari OTA.",
        body: {
          bukti_bayar: receiptUrl,
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

transactionProtectedRouter.openapi(verifyTransactionAccRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());
  const zodParseResult = VerifyTransactionAcceptSchema.parse(data);
  const { ids, otaId } = zodParseResult;

  if (user.type !== "bankes" && user.type !== "admin") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message:
            "Hanya admin atau bankes yang dapat menerima validasi transaksi",
        },
      },
      403,
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get the transactions to be accepted
      const updatedRows = await tx.transaction.findMany({
        where: { id: { in: ids } },
      });

      const currentDate = new Date();

      // Update each transaction individually (amountPaid = bill per row)
      await Promise.all(
        updatedRows.map((updatedRow) =>
          tx.transaction.update({
            where: { id: updatedRow.id },
            data: {
              transactionStatus: "paid",
              transactionReceipt: "",
              amountPaid: updatedRow.bill,
              paidAt: currentDate,
            },
          }),
        ),
      );

      const mahasiswaIds = updatedRows.map((row) => row.mahasiswaId);

      // Decrement paidFor on connections and collect updated values
      const connectionRows = await tx.connection.findMany({
        where: {
          mahasiswaId: { in: mahasiswaIds },
          otaId,
        },
      });

      const updatedConnectionRows = await Promise.all(
        connectionRows.map((row) =>
          tx.connection.update({
            where: { mahasiswaId_otaId: { mahasiswaId: row.mahasiswaId, otaId: row.otaId } },
            data: { paidFor: { decrement: 1 } },
          }),
        ),
      );

      // Build new transactions for remaining paidFor months
      const allTransactionsToInsert: any[] = [];

      for (const row of updatedConnectionRows) {
        if (row.paidFor >= 1) {
          const correspondingTransaction = updatedRows.find(
            (updatedRow) =>
              updatedRow.mahasiswaId === row.mahasiswaId &&
              updatedRow.otaId === row.otaId,
          );

          if (correspondingTransaction) {
            for (let i = 1; i <= row.paidFor; i++) {
              allTransactionsToInsert.push({
                mahasiswaId: row.mahasiswaId,
                otaId: row.otaId,
                bill: correspondingTransaction.bill,
                amountPaid: correspondingTransaction.bill,
                dueDate: setDate(
                  addMonths(correspondingTransaction.dueDate, i),
                  1,
                ),
                transactionStatus: "paid" as const,
                transactionReceipt: "",
                paidAt: currentDate,
              });
            }
          }
        }
      }

      // Batch insert all new transactions
      if (allTransactionsToInsert.length > 0) {
        await tx.transaction.createMany({ data: allTransactionsToInsert });
      }

      return updatedRows.reduce((total, row) => total + (row.bill ?? 0), 0);
    });

    return c.json(
      {
        success: true,
        message: "Berhasil melakukan penerimaan verifikasi pembayaran",
        body: {
          ids: ids,
          otaId: otaId,
          amountPaid: result,
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

transactionProtectedRouter.openapi(verifyTransactionRejectRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());
  const zodParseResult = VerifyTransactionRejectSchema.parse(data);
  const { ids, otaId, amountPaid, rejectionNote } = zodParseResult;

  if (user.type !== "bankes" && user.type !== "admin") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message:
            "Hanya admin atau bankes yang bisa menolak validasi transaksi",
        },
      },
      403,
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existingTransactions = await tx.transaction.findMany({
        where: { id: { in: ids } },
      });

      let amountAvailable = amountPaid;

      for (const transaction of existingTransactions) {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            transactionStatus: "unpaid",
            transactionReceipt: "",
            rejectionNote: rejectionNote,
            amountPaid: amountAvailable > 0 ? transaction.bill : 0,
          },
        });

        await tx.connection.updateMany({
          where: {
            mahasiswaId: transaction.mahasiswaId,
            otaId,
          },
          data: { paidFor: 0 },
        });

        await tx.transaction.updateMany({
          where: {
            mahasiswaId: transaction.mahasiswaId,
            otaId,
          },
          data: { paidFor: 0 },
        });

        amountAvailable -= transaction.bill;
      }
    });

    return c.json(
      {
        success: true,
        message: "Berhasil melakukan penolakan verifikasi pembayaran",
        body: {
          ids: ids,
          otaId: otaId,
          rejectionNote: rejectionNote,
          amountPaid: amountPaid,
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

transactionProtectedRouter.openapi(acceptTransferStatusRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());
  const zodParseResult = AcceptTransferStatusSchema.parse(data);
  const { id } = zodParseResult;

  if (user.type !== "bankes" && user.type !== "admin") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message:
            "Hanya admin atau bankes yang dapat mengubah transfer status",
        },
      },
      403,
    );
  }

  try {
    await prisma.transaction.update({
      where: { id },
      data: { transferStatus: "paid" },
    });

    const transferData = await prisma.transaction.findFirst({
      where: { id },
      include: {
        MahasiswaProfile: { include: { User: true } },
        OtaProfile: true,
      },
    });

    // Send Mail
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

    if (transferData) {
      const namaMA = transferData.MahasiswaProfile?.name ?? "";
      const namaOTA = transferData.OtaProfile?.name ?? "";
      const nominal = transferData.bill.toLocaleString("id-ID");
      const emailMA = transferData.MahasiswaProfile?.User?.email ?? "";

      await transporter
        .sendMail({
          from: env.EMAIL,
          to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : emailMA,
          subject: "Transfer Bantuan Asuh",
          html: transferMahasiswaEmail(
            namaMA,
            namaOTA,
            nominal,
            new Date()
              .toLocaleString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
              .replace(".", ":"),
          ),
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        });
    }

    // Send Push Notif
    if (transferData?.mahasiswaId) {
      const subscription = await prisma.pushSubscription.findFirst({
        where: { userId: transferData.mahasiswaId },
      });

      if (subscription) {
        const { endpoint, keys } = subscription;
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
          title: "Transfer Bantuan Asuh",
          body: `Pemberitahuan transfer bantuan asuh telah dikirim`,
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

    // JSON return
    return c.json(
      {
        success: true,
        message: "Berhasil melakukan penerimaan transfer status",
        body: {
          id: id,
          status: "paid" as const,
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
