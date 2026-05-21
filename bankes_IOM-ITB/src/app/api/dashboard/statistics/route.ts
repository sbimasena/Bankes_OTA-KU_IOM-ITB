import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/dashboard/statistics
 * 
 * Mengambil statistik lengkap dashboard Bankes:
 * - Total dana bantuan
 * - Total mahasiswa
 * - Total OTA
 * - Trend pendaftaran mahasiswa
 * - Trend pembayaran
 * - Status breakdown (aktif/tidak aktif, paid/unpaid)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 1. Total Dana Bantuan (sum dari BankesStatus amount yang tidak null)
    const totalDanaResult = await prisma.bankesStatus.aggregate({
      _sum: {
        amount: true,
      },
    });
    const totalDana = totalDanaResult._sum.amount || 0;

    // 2. Total Mahasiswa (count user dengan role Mahasiswa)
    const totalMahasiswa = await prisma.user.count({
      where: {
        role: "Mahasiswa",
      },
    });

    // 3. Total OTA (count OtaProfile)
    const totalOta = await prisma.otaProfile.count();

    // 4. Total Koneksi Aktif (Connection dengan status accepted)
    const totalAktifConnections = await prisma.connection.count({
      where: {
        connectionStatus: "accepted",
      },
    });

    // 5. Total Koneksi Tidak Aktif (Connection dengan status bukan accepted)
    const totalInaktifConnections = await prisma.connection.count({
      where: {
        connectionStatus: {
          not: "accepted",
        },
      },
    });

    // 6. Trend Pendaftaran Mahasiswa (last 12 bulan)
    const twoelveMonthsAgo = new Date();
    twoelveMonthsAgo.setMonth(twoelveMonthsAgo.getMonth() - 12);

    const registrationTrend = await prisma.user.groupBy({
      by: ["createdAt"],
      where: {
        role: "Mahasiswa",
        createdAt: {
          gte: twoelveMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by month
    const registrationTrendByMonth: Record<string, number> = {};
    registrationTrend.forEach((item: any) => {
      const date = new Date(item.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      registrationTrendByMonth[monthKey] =
        (registrationTrendByMonth[monthKey] || 0) + item._count.id;
    });

    const registrationTrendArray = Object.entries(registrationTrendByMonth).map(
      ([month, count]) => ({
        month,
        count,
      })
    );

    // 7. Trend Pembayaran (Transaction paid by month, last 12 bulan)
    const paymentTrend = await prisma.transaction.groupBy({
      by: ["paidAt"],
      where: {
        transactionStatus: "paid",
        paidAt: {
          gte: twoelveMonthsAgo,
          not: null,
        },
      },
      _sum: {
        amountPaid: true,
      },
      orderBy: {
        paidAt: "asc",
      },
    });

    // Group by month
    const paymentTrendByMonth: Record<string, { count: number; totalAmount: number }> = {};
    paymentTrend.forEach((item: any) => {
      if (item.paidAt) {
        const date = new Date(item.paidAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!paymentTrendByMonth[monthKey]) {
          paymentTrendByMonth[monthKey] = { count: 0, totalAmount: 0 };
        }
        paymentTrendByMonth[monthKey].count += 1;
        paymentTrendByMonth[monthKey].totalAmount +=
          item._sum.amountPaid || 0;
      }
    });

    const paymentTrendArray = Object.entries(paymentTrendByMonth).map(
      ([month, data]) => ({
        month,
        count: data.count,
        totalAmount: data.totalAmount,
      })
    );

    // 8. Status Breakdown - Paid vs Unpaid
    const paidTransactions = await prisma.transaction.count({
      where: {
        transactionStatus: "paid",
      },
    });

    const unpaidTransactions = await prisma.transaction.count({
      where: {
        transactionStatus: "unpaid",
      },
    });

    const pendingTransactions = await prisma.transaction.count({
      where: {
        transactionStatus: "pending",
      },
    });

    // 9. Student Status Breakdown - Aktif vs Tidak Aktif
    const activeStudents = await prisma.mahasiswaProfile.count({
      where: {
        mahasiswaStatus: "active",
      },
    });

    const inactiveStudents = await prisma.mahasiswaProfile.count({
      where: {
        mahasiswaStatus: "inactive",
      },
    });

    // 10. Total Pembayaran Terverifikasi (sum dari transaction dengan status paid)
    const totalPaymentResult = await prisma.transaction.aggregate({
      _sum: {
        amountPaid: true,
      },
      where: {
        transactionStatus: "paid",
      },
    });
    const totalPayment = totalPaymentResult._sum.amountPaid || 0;

    // 11. Top Mahasiswa dengan Koneksi (untuk additional insights)
    const topStudents = await prisma.connection.groupBy({
      by: ["mahasiswaId"],
      _count: {
        mahasiswaId: true,
      },
      orderBy: {
        _count: {
          mahasiswaId: "desc",
        },
      },
      take: 5,
    });

    const topStudentIds = topStudents.map((s) => s.mahasiswaId);
    const topStudentDetails = await prisma.mahasiswaProfile.findMany({
      where: {
        userId: {
          in: topStudentIds,
        },
      },
      select: {
        userId: true,
        nim: true,
        name: true,
      },
    });

    // 12. Summary stats
    const totalConnections = totalAktifConnections + totalInaktifConnections;

    return NextResponse.json(
      {
        success: true,
        data: {
          summary: {
            totalDana,
            totalMahasiswa,
            totalOta,
            totalConnections,
            totalPayment,
            activeConnections: totalAktifConnections,
            inactiveConnections: totalInaktifConnections,
          },
          status: {
            connection: {
              active: totalAktifConnections,
              inactive: totalInaktifConnections,
            },
            mahasiswa: {
              active: activeStudents,
              inactive: inactiveStudents,
            },
            transaction: {
              paid: paidTransactions,
              unpaid: unpaidTransactions,
              pending: pendingTransactions,
            },
          },
          trends: {
            registration: registrationTrendArray,
            payment: paymentTrendArray,
          },
          topStudents: topStudentDetails.map((s) => ({
            userId: s.userId,
            nim: s.nim,
            name: s.name || "Unknown",
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[dashboard/statistics] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
