import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: Student
 *   description: Endpoints related to student profile
 *
 *  /api/students/total-students-all-period:
 *   get:
 *     summary: Get total students grouped by period
 *     tags:
 *       - Students
 *     responses:
 *       '200':
 *         description: Successful response with period and student count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       period_id:
 *                         type: integer
 *                         example: 1
 *                       period:
 *                         type: string
 *                         example: "2024/2025"
 *                       student_count:
 *                         type: integer
 *                         example: 123
 *       '401':
 *         description: Unauthorized request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await prisma.bankesStatus.groupBy({
    by: ['periodId'],
    _count: {
      userId: true,
    },
    orderBy: {
      periodId: 'asc',
    }
  });

  const periods = await prisma.period.findMany({
    where: {
      id: { in: result.map(r => r.periodId) }
    },
    select: {
      id: true,
      period: true
    }
  });

  const periodMap = Object.fromEntries(periods.map(p => [p.id, p.period]));

  const response = result.map(item => ({
    period_id: item.periodId,
    period: periodMap[item.periodId] || "Unknown",
    student_count: item._count.userId,
  }));

  return NextResponse.json({ success: true, data: response });
}