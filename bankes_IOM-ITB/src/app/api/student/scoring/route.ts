import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

// Fetch student by period and passed for interview
// api for penilaian "fetchStudentByPeriod()"
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const allowedRoles = ["Pengurus_IOM"];

  if (!session?.user?.id || !allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const periodId = parseInt(searchParams.get("periodId") || "", 10);

  if (!periodId || isNaN(periodId)) {
    return NextResponse.json(
      { success: false, error: "Invalid or missing periodId" },
      { status: 400 }
    );
  }

  try {
    
    const studentData = await prisma.bankesStatus.findMany({
      where: {
        periodId,
        passIOM: true,
      },
      select: {
        userId: true,
        periodId: true,
        MahasiswaProfile: {
          select: {
            nim: true,
            User: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: studentData });
  } catch (error) {
    console.error("Error fetching students and files:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
