import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/dashboard/iom-welfare/status-breakdown
 * 
 * Mengambil breakdown status mahasiswa bantuan kesejahteraan:
 * - Breakdown per status (diterima, ditolak, pending)
 * - Breakdown per tahap (Ditmawa, IOM, Interview)
 * - Detail list mahasiswa per status (dengan pagination)
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
            statusBreakdown: [],
            stageBreakdown: [],
            details: [],
          },
        },
        { status: 200 }
      );
    }

    // 1. Get all status data untuk periode ini
    const allStatus = await prisma.bankesStatus.findMany({
      where: {
        periodId: currentPeriod.id,
      },
      include: {
        MahasiswaProfile: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // 2. Count breakdown per status
    const statusBreakdown = [
      {
        status: "Diterima Seluruhnya",
        count: allStatus.filter(
          (s) => s.passDitmawa && s.passIOM && s.passInterview
        ).length,
        color: "#10b981",
      },
      {
        status: "Lulus IOM (Menunggu Interview)",
        count: allStatus.filter((s) => s.passIOM && !s.passInterview).length,
        color: "#f59e0b",
      },
      {
        status: "Ditolak",
        count: allStatus.filter((s) => !s.passDitmawa || !s.passIOM).length,
        color: "#ef4444",
      },
    ];

    // 3. Count breakdown per tahap
    const stageBreakdown = [
      {
        stage: "Lulus Ditmawa",
        count: allStatus.filter((s) => s.passDitmawa).length,
        percentage: Math.round(
          (allStatus.filter((s) => s.passDitmawa).length / allStatus.length) *
            100
        ),
      },
      {
        stage: "Lulus IOM",
        count: allStatus.filter((s) => s.passIOM).length,
        percentage: Math.round(
          (allStatus.filter((s) => s.passIOM).length / allStatus.length) * 100
        ),
      },
      {
        stage: "Lulus Interview",
        count: allStatus.filter((s) => s.passInterview).length,
        percentage: Math.round(
          (allStatus.filter((s) => s.passInterview).length /
            allStatus.length) *
            100
        ),
      },
    ];

    // 4. Detail list dengan kategori
    const details = {
      accepted: allStatus
        .filter((s) => s.passDitmawa && s.passIOM && s.passInterview)
        .map((s) => ({
          nim: s.MahasiswaProfile?.nim,
          name: s.MahasiswaProfile?.User?.name,
          email: s.MahasiswaProfile?.User?.email,
          fund: s.amount,
          status: "Diterima",
        }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")),

      pending: allStatus
        .filter((s) => s.passIOM && !s.passInterview)
        .map((s) => ({
          nim: s.MahasiswaProfile?.nim,
          name: s.MahasiswaProfile?.User?.name,
          email: s.MahasiswaProfile?.User?.email,
          fund: s.amount,
          status: "Pending Interview",
        }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")),

      rejected: allStatus
        .filter((s) => !s.passDitmawa || !s.passIOM)
        .map((s) => ({
          nim: s.MahasiswaProfile?.nim,
          name: s.MahasiswaProfile?.User?.name,
          email: s.MahasiswaProfile?.User?.email,
          fund: s.amount,
          status: "Ditolak",
        }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          statusBreakdown,
          stageBreakdown,
          details,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dashboard Status Breakdown Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch status breakdown" },
      { status: 500 }
    );
  }
}
