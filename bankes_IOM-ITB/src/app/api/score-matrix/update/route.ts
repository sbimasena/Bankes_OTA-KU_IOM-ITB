import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/score-matrix/update:
 *   post:
 *     summary: Update or create multiple score matrix entries for a student and period
 *     tags:
 *       - ScoreMatrix
 *     description: |
 *       Accepts an array of ScoreMatrixEntry objects.  
 *       For each entry, if a record exists with the same (student_id, period_id, question_id), it will be updated.  
 *       Otherwise, a new record will be created.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/ScoreMatrixEntry'
 *     responses:
 *       200:
 *         description: Successfully updated or created scores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Scores updated successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScoreMatrix'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing fields in one of the entries"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function POST(request: NextRequest) {
  try {
    const scoreEntries = await request.json();

    if (!Array.isArray(scoreEntries)) {
      return NextResponse.json(
        { message: "Invalid input: expected an array" },
        { status: 400 }
      );
    }

    for (const entry of scoreEntries) {
      const {
        userId,
        periodId,
        questionId,
        scoreCategory,
        comment,
      } = entry;

      if (
        typeof userId !== "string" ||
        typeof periodId !== "number" ||
        typeof questionId !== "number" ||
        !["KURANG", "CUKUP", "BAIK"].includes(scoreCategory)
      ) {
        return NextResponse.json(
          { message: "Invalid or missing fields in one of the entries" },
          { status: 400 }
        );
      }
    }

    const results = await Promise.all(
      scoreEntries.map((entry) =>
        prisma.scoreMatrix.upsert({
          where: {
            userId_periodId_questionId: {
              userId: entry.userId,
              periodId: entry.periodId,
              questionId: entry.questionId,
            },
          },
          update: {
            scoreCategory: entry.scoreCategory,
            comment: entry.comment || "",
          },
          create: {
            userId: entry.userId,
            periodId: entry.periodId,
            questionId: entry.questionId,
            scoreCategory: entry.scoreCategory,
            comment: entry.comment || "",
          },
        })
      )
    );

    return NextResponse.json(
      { message: "Scores updated successfully", data: results },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating score matrix:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}