import { NextRequest, NextResponse } from "next/server";
import { StudentFileType, PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { v4 as uuidv4 } from "uuid";
import { buildObjectKey, BUCKET_NAME, getPublicFileUrl, minioClient } from "@/lib/storage";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     tags:
 *       - Files
 *     summary: Upload one or more files for a student
 *     description: Authenticated students can upload files. Existing files of the same type will be replaced.
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: One or more files to upload
 *               documentTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Corresponding document types for each file (e.g., CV, TRANSKRIP)
 *     responses:
 *       '200':
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fileName:
 *                         type: string
 *                       fileUrl:
 *                         type: string
 *                       documentType:
 *                         type: string
 *       '400':
 *         description: No files provided or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized (session missing or invalid)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Upload failed due to server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const studentId = session.user.id;
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const documentTypes = formData.getAll("documentTypes") as string[];

    if (!files.length) {
      return NextResponse.json({ success: false, error: "No files provided" }, { status: 400 });
    }

    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
    }

    const uploadedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const documentType = documentTypes[i];

      if (!documentType || !Object.values(StudentFileType).includes(documentType as StudentFileType)) {
        return NextResponse.json(
          { success: false, error: `Invalid document type for ${file.name}.` },
          { status: 400 }
        );
      }

      const validMimeTypes = ["image/png", "image/jpeg", "application/pdf"];
      if (!validMimeTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid file type for ${file.name}. Only PNG, JPG, and PDF are allowed.` },
          { status: 400 }
        );
      }

      const normalizedOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const objectFileName = `${uuidv4()}-${normalizedOriginalName}`;
      const objectKey = buildObjectKey("ota", studentId, objectFileName);

      const fileArrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(fileArrayBuffer);

      await minioClient.putObject(BUCKET_NAME, objectKey, fileBuffer, fileBuffer.length, {
        'Content-Type': file.type,
        'X-Document-Type': documentType,
      });

      const fileUrl = getPublicFileUrl(objectKey);

      const existingFile = await prisma.studentFile.findFirst({
        where: {
          userId: studentId,
          type: documentType as StudentFileType,
        },
      });

      if (existingFile) {
        const existingFileName = existingFile.fileName;

        try {
          await minioClient.removeObject(BUCKET_NAME, existingFileName);
          console.log(`Removed existing file from MinIO: ${existingFileName}`);
        } catch (error) {
          console.error("Error removing file from MinIO:", error);
          throw new Error("Failed to remove existing file from MinIO");
        }

        await prisma.studentFile.update({
          where: { id: existingFile.id },
          data: {
            fileUrl: fileUrl,
            fileName: objectKey,
          },
        });
      } else {
        await prisma.studentFile.create({
          data: {
            fileUrl: fileUrl,
            fileName: objectKey,
            type: documentType as StudentFileType,
            MahasiswaProfile: { connect: { userId: studentId } },
          },
        });
      }

      uploadedFiles.push({
        fileName: objectKey,
        fileUrl,
        documentType,
      });
    }

    return NextResponse.json({ success: true, files: uploadedFiles });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
