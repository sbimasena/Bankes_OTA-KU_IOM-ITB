import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: Statistic
 *   description: Endpoints related to statistical reports
 *
 * /api/statistic/pass-students-all-period:
 *   get:
 *     summary: Get total students who passed IOM and Ditmawa with amount > 0, grouped by period
 *     tags:
 *       - Statistic
 *     responses:
 *       '200':
 *         description: Successfully retrieved passed student counts grouped by period
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
 *                       period:
 *                         type: string
 *                         example: "2024/2025"
 *                       student_count:
 *                         type: integer
 *                         example: 42
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
 *       '500':
 *         description: Internal server error
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
 *                   example: Server Error
 */

export async function GET() {
  try {
    const data = await prisma.bankesStatus.groupBy({
      by: ['periodId'],
      where: {
        passIOM: true,
        passDitmawa: true,
        amount: {
          gt: 0,
        },
      },
      _count: {
        userId: true,
      },
    });

    const periodIds = data.map((d) => d.periodId);

    const periods = await prisma.period.findMany({
      where: {
        id: {
          in: periodIds,
        },
      },
      select: {
        id: true,
        period: true,
      },
    });

    const periodMap = new Map(periods.map((p) => [p.id, p.period]));

    const result = data.map((item) => ({
      period: periodMap.get(item.periodId) ?? 'Unknown',
      student_count: item._count.userId,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching pass students:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}