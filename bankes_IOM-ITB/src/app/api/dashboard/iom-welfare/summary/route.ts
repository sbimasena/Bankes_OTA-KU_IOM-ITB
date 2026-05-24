import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/dashboard/iom-welfare/summary
 * 
 * Mengambil ringkasan statistik bantuan kesejahteraan untuk periode saat ini
 * - Total mahasiswa terdaftar
 * - Mahasiswa yang lulus (Ditmawa, IOM, Interview)
 * - Total dana yang dialokasikan
 * - Total dana yang sudah ditransfer
 * - Status pembayaran breakdown
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

    // Hanya Pengurus_IOM atau Admin yang bisa akses
    if (session.user.role !== "Pengurus_IOM" && session.user.role !== "Admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Dapatkan periode saat ini
    const currentPeriod = await prisma.period.findFirst({
      where: {
        isCurrent: true,
      },
    });

    if (!currentPeriod) {
      return NextResponse.json(
        {
          success: true,
          data: {
            period: null,
            totalRegistered: 0,
            totalPassed: 0,
            totalPassedDitmawa: 0,
            totalPassedIOM: 0,
            totalPassedInterview: 0,
            totalRejected: 0,
            totalPending: 0,
            totalFundAllocated: 0,
            totalFundTransferred: 0,
            totalFundPending: 0,
            transferredPercentage: 0,
          },
        },
        { status: 200 }
      );
    }

    // 1. Total mahasiswa terdaftar di periode ini
    const totalRegistered = await prisma.bankesStatus.count({
      where: {
        periodId: currentPeriod.id,
      },
    });

    // 2. Total mahasiswa yang lulus setiap tahap
    const passedStats = await prisma.bankesStatus.count({
      where: {
        periodId: currentPeriod.id,
        passDitmawa: true,
        passIOM: true,
        passInterview: true,
      },
    });

    const passedDitmawa = await prisma.bankesStatus.count({
      where: {
        periodId: currentPeriod.id,
        passDitmawa: true,
      },
    });

    const passedIOM = await prisma.bankesStatus.count({
      where: {
        periodId: currentPeriod.id,
        passIOM: true,
      },
    });

    const passedInterview = await prisma.bankesStatus.count({
      where: {
        periodId: currentPeriod.id,
        passInterview: true,
      },
    });

    // 3. Total ditolak & pending
    const rejectedOrPending = await prisma.bankesStatus.findMany({
      where: {
        periodId: currentPeriod.id,
      },
      select: {
        passDitmawa: true,
        passIOM: true,
        passInterview: true,
      },
    });

    const totalRejected = rejectedOrPending.filter(
      (stat) => !stat.passDitmawa || !stat.passIOM
    ).length;

    const totalPending = rejectedOrPending.filter(
      (stat) => stat.passIOM && !stat.passInterview
    ).length;

    // 4. Dana yang dialokasikan
    const fundAllocated = await prisma.bankesStatus.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        periodId: currentPeriod.id,
        passInterview: true,
        amount: {
          not: null,
        },
      },
    });
    const totalFundAllocated = fundAllocated._sum.amount || 0;

    // 5. Dana yang sudah ditransfer (Transaction dengan status paid)
    const fundTransferred = await prisma.transaction.aggregate({
      _sum: {
        amountPaid: true,
      },
      where: {
        transactionStatus: "paid",
      },
    });
    const totalFundTransferred = fundTransferred._sum.amountPaid || 0;

    // 6. Dana yang pending
    const fundPending = await prisma.transaction.aggregate({
      _sum: {
        bill: true,
      },
      where: {
        transactionStatus: {
          in: ["pending", "unpaid"],
        },
      },
    });
    const totalFundPending = fundPending._sum.bill || totalFundAllocated - totalFundTransferred;

    const transferredPercentage =
      totalFundAllocated > 0
        ? Math.round((totalFundTransferred / totalFundAllocated) * 100)
        : 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          period: {
            id: currentPeriod.id,
            period: currentPeriod.period,
            startDate: currentPeriod.startDate,
            endDate: currentPeriod.endDate,
          },
          totalRegistered,
          totalPassed: passedStats,
          totalPassedDitmawa: passedDitmawa,
          totalPassedIOM: passedIOM,
          totalPassedInterview: passedInterview,
          totalRejected,
          totalPending,
          totalFundAllocated: Number(totalFundAllocated),
          totalFundTransferred: Number(totalFundTransferred),
          totalFundPending: Number(totalFundPending),
          transferredPercentage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
