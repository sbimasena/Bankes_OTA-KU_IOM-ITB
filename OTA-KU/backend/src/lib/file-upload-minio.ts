import { Client } from "minio";
import { v4 as uuid } from "uuid";

import { env } from "../config/env.config.js";
import { prisma } from "../db/prisma.js";
import type { StudentFileType } from "@prisma/client";

export const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

const BUCKET_NAME = "documents-bucket";

/**
 * Uploads a File object to MinIO.
 * If `file` is already a string URL, returns it as-is (no re-upload).
 * Returns null if file is undefined.
 */
export async function uploadFileToMinio(
  file: File | string | undefined,
): Promise<{ secure_url: string; fileName: string } | null> {
  if (!file) return null;

  // Already a URL — pass through
  if (typeof file === "string") return { secure_url: file, fileName: "" };

  const fileId = uuid();
  const ext = file.name.split(".").pop() ?? "bin";
  const fileName = `${fileId}.${ext}`;

  const fileArrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(fileArrayBuffer);

  await minioClient.putObject(BUCKET_NAME, fileName, fileBuffer, fileBuffer.length, {
    "Content-Type": file.type || "application/octet-stream",
  });

  const fileUrl = `http://${env.MINIO_PUBLIC_HOST}:${env.MINIO_PUBLIC_PORT}/${BUCKET_NAME}/${fileName}`;
  return { secure_url: fileUrl, fileName };
}

/**
 * Uploads a file to MinIO and upserts the StudentFile record.
 * If file is a string (existing URL), skips upload but upserts the URL.
 * If file is undefined, does nothing and returns the existing URL (or null).
 */
export async function upsertStudentFile(
  userId: string,
  fileType: StudentFileType,
  file: File | string | undefined,
): Promise<string | null> {
  if (!file) return null;

  let fileUrl: string;
  let fileName: string;

  if (typeof file === "string") {
    fileUrl = file;
    fileName = file.split("/").pop() ?? "";
  } else {
    const result = await uploadFileToMinio(file);
    if (!result) return null;

    // Remove old MinIO object if it exists
    const existing = await prisma.studentFile.findUnique({
      where: { userId_type: { userId, type: fileType } },
    });
    if (existing?.fileName) {
      try {
        await minioClient.removeObject(BUCKET_NAME, existing.fileName);
      } catch {
        // Non-fatal — log and continue
        console.warn(`Could not remove old MinIO object: ${existing.fileName}`);
      }
    }

    fileUrl = result.secure_url;
    fileName = result.fileName;
  }

  await prisma.studentFile.upsert({
    where: { userId_type: { userId, type: fileType } },
    create: { userId, fileUrl, fileName, type: fileType },
    update: { fileUrl, fileName },
  });

  return fileUrl;
}

/**
 * Reads all StudentFiles for a user and returns them keyed by their legacy
 * OTA field names (file, kk, ktm, …) so existing response shapes stay intact.
 */
export function extractFilesFromStudentFiles(
  studentFiles: Array<{ type: string; fileUrl: string }>,
): Record<string, string | null> {
  const map: Record<string, string> = {};
  for (const f of studentFiles) {
    map[f.type] = f.fileUrl;
  }
  return {
    file: map["Profile_Photo"] ?? null,
    kk: map["KK"] ?? null,
    ktm: map["KTM"] ?? null,
    waliRecommendationLetter: map["Wali_Recommendation_Letter"] ?? null,
    transcript: map["Transcript"] ?? null,
    salaryReport: map["Salary_Report"] ?? null,
    pbb: map["PBB"] ?? null,
    electricityBill: map["Electricity_Bill"] ?? null,
    ditmawaRecommendationLetter: map["Ditmawa_Recommendation_Letter"] ?? null,
  };
}
