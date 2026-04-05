import { StudentFileType } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/file-types:
 *   get:
 *     tags:
 *       - Files
 *     summary: Get all available file types
 *     description: Returns the list of file types from the StudentFileType enum.
 *     responses:
 *       200:
 *         description: A list of file types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: Transkrip Nilai
 *                   key:
 *                     type: string
 *                     example: Transkrip_Nilai
 */
export async function GET() {
  try {
    const fileTypes = (Object.values(StudentFileType) as string[]).map((key) => ({
        title: key.replace(/_/g, " "),
        key,
    }));

    return NextResponse.json(
      { success: true, data: fileTypes },
      { status: 200 }
    );
  } catch (error) {
      console.error("Error fetching students and files:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch data" },
        { status: 500 }
      );
  }
}
