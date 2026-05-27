import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/dashboard/iom-welfare/trends
 * 
 * Mengambil tren data bantuan kesejahteraan:
 * - Tren pendaftaran per minggu/bulan
 * - Tren pembayaran per minggu/bulan
 * - Tren kelulusan per tahap
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
            registrationTrend: [],
            paymentTrend: [],
            passageTrend: [],
          },
        },
        { status: 200 }
      );
    }

    // 1. Tren Pendaftaran - Get all BankesStatus and group by week
    let registrationTrend: Array<{ week: string; count: number }> = [];
    try {
      const registrationData = await prisma.bankesStatus.findMany({
        where: {
          periodId: currentPeriod.id,
        },
        select: {
          MahasiswaProfile: {
            select: {
              createdAt: true,
            },
          },
        },
        orderBy: {
          MahasiswaProfile: {
            createdAt: "asc",
          },
        },
      });

      // Group by week
      const registrationByWeek: Record<string, number> = {};
      registrationData.forEach((item) => {
        const date = new Date(item.MahasiswaProfile.createdAt);
        // Get week number
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];

        registrationByWeek[weekKey] = (registrationByWeek[weekKey] || 0) + 1;
      });

      registrationTrend = Object.entries(registrationByWeek).map(([week, count]) => ({
        week,
        count,
      }));
    } catch (error) {
      console.error("Registration trend error:", error);
    }

    // 2. Tren Pembayaran - Get all paid transactions and group by week
    let paymentTrend: Array<{ week: string; count: number; totalAmount: number }> = [];
    try {
      const paymentData = await prisma.transaction.findMany({
        where: {
          transactionStatus: "paid",
          paidAt: {
            not: null,
          },
        },
        select: {
          paidAt: true,
          amountPaid: true,
        },
        orderBy: {
          paidAt: "asc",
        },
      });

      // Group by week
      const paymentByWeek: Record<string, { count: number; totalAmount: number }> = {};
      paymentData.forEach((item) => {
        if (!item.paidAt) return;

        const date = new Date(item.paidAt);
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];

        if (!paymentByWeek[weekKey]) {
          paymentByWeek[weekKey] = { count: 0, totalAmount: 0 };
        }
        paymentByWeek[weekKey].count += 1;
        paymentByWeek[weekKey].totalAmount += item.amountPaid;
      });

      paymentTrend = Object.entries(paymentByWeek).map(([week, data]) => ({
        week,
        count: data.count,
        totalAmount: data.totalAmount,
      }));
    } catch (error) {
      console.error("Payment trend error:", error);
    }

    // 3. Tren Kelulusan per tahap
    let passageTrend = [
      { stage: "Ditmawa", passed: 0 },
      { stage: "IOM", passed: 0 },
      { stage: "Interview", passed: 0 },
    ];

    try {
      const passageData = await prisma.bankesStatus.findMany({
        where: {
          periodId: currentPeriod.id,
        },
        select: {
          passDitmawa: true,
          passIOM: true,
          passInterview: true,
        },
      });

      const ditmawaCount = passageData.filter((p) => p.passDitmawa).length;
      const iomCount = passageData.filter((p) => p.passDitmawa && p.passIOM).length;
      const interviewCount = passageData.filter(
        (p) => p.passDitmawa && p.passIOM && p.passInterview
      ).length;

      passageTrend = [
        { stage: "Ditmawa", passed: ditmawaCount },
        { stage: "IOM", passed: iomCount },
        { stage: "Interview", passed: interviewCount },
      ];
    } catch (error) {
      console.error("Passage trend error:", error);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          registrationTrend,
          paymentTrend,
          passageTrend,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dashboard Trends Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}
