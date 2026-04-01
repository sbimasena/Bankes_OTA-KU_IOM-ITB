import { addMonths, setDate } from "date-fns";
import { and, count, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
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
import { transferMahasiswaEmail } from "../lib/email/transfer-mahasiswa.js";
import { uploadFileToCloudinary } from "../lib/file-upload.js";
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
    const conditions = [eq(transactionTable.otaId, user.id)];

    if (year) {
      conditions.push(
        sql`EXTRACT(YEAR FROM ${transactionTable.dueDate}) = ${year}`,
      );
    }

    if (month) {
      conditions.push(
        sql`EXTRACT(MONTH FROM ${transactionTable.dueDate}) = ${month}`,
      );
    }

    const yearsQuery = db
      .selectDistinct({
        year: sql<number>`EXTRACT(YEAR FROM ${transactionTable.dueDate})`,
      })
      .from(transactionTable)
      .orderBy(sql`EXTRACT(YEAR FROM ${transactionTable.dueDate}) DESC`);

    const transactionOTAListQuery = db
      .select({
        id: transactionTable.id,
        mahasiswa_id: transactionTable.mahasiswaId,
        mahasiswa_name: accountMahasiswaDetailTable.name,
        mahasiswa_nim: accountMahasiswaDetailTable.nim,
        bill: transactionTable.bill,
        amount_paid: transactionTable.amountPaid,
        paid_at: transactionTable.paidAt,
        created_at: transactionTable.createdAt,
        due_date: transactionTable.dueDate,
        status: transactionTable.transactionStatus,
        receipt: transactionTable.transactionReceipt,
        rejection_note: transactionTable.rejectionNote,
        paid_for: transactionTable.paidFor,
      })
      .from(transactionTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(transactionTable.mahasiswaId, accountMahasiswaDetailTable.accountId),
      )
      .where(and(...conditions));

    const totalBillQuery = db
      .select({
        total: sql<number>`COALESCE(SUM(${transactionTable.bill}), 0)`,
      })
      .from(transactionTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(transactionTable.mahasiswaId, accountMahasiswaDetailTable.accountId),
      )
      .where(and(...conditions));

    const [transactionOTAList, years, totalBillValue] = await Promise.all([
      transactionOTAListQuery,
      yearsQuery,
      totalBillQuery,
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar transaction untuk OTA berhasil diambil",
        body: {
          data: transactionOTAList.map((transaction) => ({
            id: transaction.mahasiswa_id,
            mahasiswa_id: transaction.mahasiswa_id,
            name: transaction.mahasiswa_name ?? "",
            nim: transaction.mahasiswa_nim,
            bill: transaction.bill,
            amount_paid: transaction.amount_paid,
            paid_at: transaction.paid_at ?? "",
            created_at: transaction.created_at,
            due_date: transaction.due_date,
            status: transaction.status,
            receipt: transaction.receipt ?? "",
            rejection_note: transaction.rejection_note ?? "",
            paid_for: transaction.paid_for ?? 0,
          })),
          years: years.map((year) => year.year),
          totalBill: totalBillValue[0]?.total ?? 0,
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

    const conditions = [];

    if (status) {
      conditions.push(eq(transactionTable.transactionStatus, status));
    }

    if (month) {
      conditions.push(
        sql`TRIM(TO_CHAR(${transactionTable.dueDate}, 'Month')) ILIKE ${month}`,
      );
    }

    if (year) {
      conditions.push(
        sql`EXTRACT(YEAR FROM ${transactionTable.dueDate}) = ${year}`,
      );
    }

    const countsQuery = db
      .select({ count: count() })
      .from(transactionTable)
      .where(and(...conditions));

    const transactionAdminListQuery = db
      .select({
        id: transactionTable.id,
        mahasiswa_id: transactionTable.mahasiswaId,
        ota_id: transactionTable.otaId,
        mahasiswa_name: accountMahasiswaDetailTable.name,
        mahasiswa_nim: accountMahasiswaDetailTable.nim,
        ota_name: accountOtaDetailTable.name,
        ota_number: accountTable.phoneNumber,
        bill: transactionTable.bill,
        amount_paid: transactionTable.amountPaid,
        paid_at: transactionTable.paidAt,
        due_date: transactionTable.dueDate,
        status: transactionTable.transactionStatus,
        transferStatus: transactionTable.transferStatus,
        receipt: transactionTable.transactionReceipt,
        createdAt: transactionTable.createdAt,
        paid_for: transactionTable.paidFor,
      })
      .from(transactionTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(transactionTable.mahasiswaId, accountMahasiswaDetailTable.accountId),
      )
      .innerJoin(
        accountOtaDetailTable,
        eq(transactionTable.otaId, accountOtaDetailTable.accountId),
      )
      .innerJoin(accountTable, eq(transactionTable.otaId, accountTable.id))
      .where(and(...conditions))
      .limit(LIST_PAGE_SIZE)
      .offset(offset);

    const [transactionAdminList, counts] = await Promise.all([
      transactionAdminListQuery,
      countsQuery,
    ]);

    return c.json(
      {
        success: true,
        message: "Daftar transaction untuk Admin berhasil diambil",
        body: {
          data: transactionAdminList.map((transaction) => ({
            id: transaction.id,
            mahasiswa_id: transaction.mahasiswa_id,
            ota_id: transaction.ota_id,
            name_ma: transaction.mahasiswa_name ?? "",
            nim_ma: transaction.mahasiswa_nim,
            name_ota: transaction.ota_name,
            number_ota: transaction.ota_number ?? "",
            bill: transaction.bill,
            amount_paid: transaction.amount_paid,
            paid_at: transaction.paid_at ?? "",
            due_date: transaction.due_date,
            status: transaction.status,
            transferStatus: transaction.transferStatus,
            receipt: transaction.receipt ?? "",
            createdAt: transaction.createdAt,
            paid_for: transaction.paid_for ?? 0,
          })),
          totalData: counts[0].count,
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

      const conditions = [];

      if (q) {
        conditions.push(ilike(accountOtaDetailTable.name, `%${q}%`));
      }

      if (year) {
        conditions.push(
          sql`EXTRACT(YEAR FROM ${transactionTable.dueDate}) = ${year}`,
        );
      }

      if (month) {
        conditions.push(
          sql`EXTRACT(MONTH FROM ${transactionTable.dueDate}) = ${month}`,
        );
      }

      const yearsQuery = db
        .selectDistinct({
          year: sql<number>`EXTRACT(YEAR FROM ${transactionTable.dueDate})`,
        })
        .from(transactionTable)
        .orderBy(sql`EXTRACT(YEAR FROM ${transactionTable.dueDate}) DESC`);

      // Get all transactions with OTA and mahasiswa details
      const allTransactionsQuery = db
        .select({
          id: transactionTable.id,
          ota_id: transactionTable.otaId,
          name_ota: accountOtaDetailTable.name,
          number_ota: accountTable.phoneNumber,
          mahasiswa_id: transactionTable.mahasiswaId,
          name_ma: accountMahasiswaDetailTable.name,
          nim_ma: accountMahasiswaDetailTable.nim,
          paidAt: transactionTable.paidAt,
          dueDate: transactionTable.dueDate,
          bill: transactionTable.bill,
          receipt: transactionTable.transactionReceipt,
          rejectionNote: transactionTable.rejectionNote,
          transactionStatus: transactionTable.transactionStatus,
        })
        .from(transactionTable)
        .innerJoin(
          accountOtaDetailTable,
          eq(transactionTable.otaId, accountOtaDetailTable.accountId),
        )
        .innerJoin(
          accountMahasiswaDetailTable,
          eq(
            transactionTable.mahasiswaId,
            accountMahasiswaDetailTable.accountId,
          ),
        )
        .innerJoin(accountTable, eq(transactionTable.otaId, accountTable.id))
        .where(and(...conditions));

      const [allTransactions, years] = await Promise.all([
        allTransactionsQuery,
        yearsQuery,
      ]);

      // Group transactions by OTA
      const groupedByOta = allTransactions.reduce(
        (acc: { [key: string]: any }, transaction) => {
          const otaId = transaction.ota_id;

          if (!acc[otaId]) {
            acc[otaId] = {
              ota_id: otaId,
              name_ota: transaction.name_ota,
              number_ota: transaction.number_ota ?? "",
              totalBill: 0,
              transactions: [],
            };
          }

          acc[otaId].totalBill += transaction.bill;
          acc[otaId].transactions.push({
            id: transaction.id,
            mahasiswa_id: transaction.mahasiswa_id,
            name_ma: transaction.name_ma ?? "",
            nim_ma: transaction.nim_ma,
            paidAt: transaction.paidAt?.toISOString() ?? "",
            dueDate: transaction.dueDate.toISOString(),
            bill: transaction.bill,
            receipt: transaction.receipt ?? "",
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
            years: years.map((year) => year.year),
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

    const mahasiswa = await db
      .select({
        nama_ma: accountMahasiswaDetailTable.name,
        nim_ma: accountMahasiswaDetailTable.nim,
        fakultas: accountMahasiswaDetailTable.faculty,
        jurusan: accountMahasiswaDetailTable.major,
      })
      .from(accountMahasiswaDetailTable)
      .where(eq(accountMahasiswaDetailTable.accountId, id))
      .limit(1);

    if (mahasiswa.length === 0) {
      return c.json(
        {
          success: false,
          message: "Mahasiswa tidak ditemukan",
          error: {},
        },
        404,
      );
    }

    const countQuery = db
      .select({ count: count() })
      .from(transactionTable)
      .where(eq(transactionTable.mahasiswaId, id));

    const detailTransactionQuery = await db
      .select({
        tagihan: transactionTable.bill,
        pembayaran: transactionTable.amountPaid,
        due_date: transactionTable.dueDate,
        status_bayar: transactionTable.transactionStatus,
        bukti_bayar: transactionTable.transactionReceipt,
      })
      .from(transactionTable)
      .where(eq(transactionTable.mahasiswaId, id))
      .limit(LIST_PAGE_SIZE)
      .offset(offset);

    const [detailTransaction, counts] = await Promise.all([
      detailTransactionQuery,
      countQuery,
    ]);

    return c.json(
      {
        success: true,
        message: "Detail transaction berhasil diambil",
        body: {
          nama_ma: mahasiswa[0].nama_ma ?? "Nama tidak tersedia",
          nim_ma: mahasiswa[0].nim_ma,
          fakultas: mahasiswa[0].fakultas ?? "Fakultas tidak tersedia",
          jurusan: mahasiswa[0].jurusan ?? "Jurusan tidak tersedia",
          data: detailTransaction.map((tx) => ({
            ...tx,
            bukti_bayar: tx.bukti_bayar ?? "",
          })),
          totalData: counts[0].count,
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
    const receiptUrl = await uploadFileToCloudinary(receipt);

    await db.transaction(async (tx) => {
      await tx
        .update(transactionTable)
        .set({
          transactionReceipt: receiptUrl.secure_url,
          transactionStatus: "pending",
        })
        .where(
          and(
            inArray(transactionTable.mahasiswaId, ids),
            eq(transactionTable.otaId, user.id),
          ),
        );

      await tx
        .update(connectionTable)
        .set({ paidFor })
        .where(
          and(
            inArray(connectionTable.mahasiswaId, ids),
            eq(connectionTable.otaId, user.id),
          ),
        );

      await tx
        .update(transactionTable)
        .set({ paidFor })
        .where(
          and(
            inArray(transactionTable.mahasiswaId, ids),
            eq(transactionTable.otaId, user.id),
          ),
        );
    });

    return c.json(
      {
        success: true,
        message: "Berhasil melakukan upload bukti pembayaran dari OTA.",
        body: {
          bukti_bayar: receiptUrl.secure_url,
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
    const result = await db.transaction(async (tx) => {
      // Get the updated bill (amount paid)
      const updatedRows = await tx
        .select()
        .from(transactionTable)
        .where(inArray(transactionTable.id, ids));

      const currentDate = new Date();

      await Promise.all(
        updatedRows.map(async (updatedRow) => {
          return tx
            .update(transactionTable)
            .set({
              transactionStatus: "paid",
              transactionReceipt: "",
              amountPaid: updatedRow.bill,
              paidAt: currentDate,
            })
            .where(eq(transactionTable.id, updatedRow.id));
        }),
      );

      const mahasiswaIds = updatedRows.map((row) => row.mahasiswaId);

      const connectionRows = await tx
        .update(connectionTable)
        .set({ paidFor: sql`${connectionTable.paidFor} - 1` })
        .where(
          and(
            inArray(connectionTable.mahasiswaId, mahasiswaIds),
            eq(connectionTable.otaId, otaId),
          ),
        )
        .returning();

      // Process all connection rows and create batch insert data
      const allTransactionsToInsert = [];

      for (const row of connectionRows) {
        if (row.paidFor >= 1) {
          // Find the corresponding updated transaction for this mahasiswa and ota
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

      // Single batch insert for all transactions
      if (allTransactionsToInsert.length > 0) {
        await tx.insert(transactionTable).values(allTransactionsToInsert);
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
    await db.transaction(async (tx) => {
      const existingTransaction = await tx
        .select()
        .from(transactionTable)
        .where(inArray(transactionTable.id, ids));

      let amountAvailable = amountPaid;

      for (const transaction of existingTransaction) {
        await tx
          .update(transactionTable)
          .set({
            transactionStatus: "unpaid",
            transactionReceipt: "",
            rejectionNote: rejectionNote,
            amountPaid: amountAvailable > 0 ? transaction.bill : 0,
          })
          .where(eq(transactionTable.id, transaction.id));

        await tx
          .update(connectionTable)
          .set({ paidFor: 0 })
          .where(
            and(
              eq(connectionTable.mahasiswaId, transaction.mahasiswaId),
              eq(connectionTable.otaId, otaId),
            ),
          );

        await tx
          .update(transactionTable)
          .set({ paidFor: 0 })
          .where(
            and(
              eq(transactionTable.mahasiswaId, transaction.mahasiswaId),
              eq(transactionTable.otaId, otaId),
            ),
          );

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

  //   Get Data
  try {
    await db.transaction(async (tx) => {
      await tx
        .update(transactionTable)
        .set({ transferStatus: "paid" })
        .where(eq(transactionTable.id, id));
    });

    const transferData = await db
      .select({
        namaMA: accountMahasiswaDetailTable.name,
        namaOTA: accountOtaDetailTable.name,
        nominal: transactionTable.bill,
        emailMA: accountTable.email,
        idMA: transactionTable.mahasiswaId,
      })
      .from(transactionTable)
      .innerJoin(
        accountMahasiswaDetailTable,
        eq(transactionTable.mahasiswaId, accountMahasiswaDetailTable.accountId),
      )
      .innerJoin(
        accountOtaDetailTable,
        eq(transactionTable.otaId, accountOtaDetailTable.accountId),
      )
      .innerJoin(
        accountTable,
        eq(accountTable.id, transactionTable.mahasiswaId),
      )
      .where(eq(transactionTable.id, id))
      .limit(1);

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

    transferData.map(async (data) => {
      await transporter
        .sendMail({
          from: env.EMAIL,
          to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : data.emailMA,
          subject: "Transfer Bantuan Asuh",
          html: transferMahasiswaEmail(
            data.namaMA ?? "",
            data.namaOTA ?? "",
            data.nominal.toLocaleString("id-ID"),
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
    });

    // Send Push Notif
    const subscription = await db
      .select()
      .from(pushSubscriptionTable)
      .where(eq(pushSubscriptionTable.accountId, transferData[0].idMA));

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
