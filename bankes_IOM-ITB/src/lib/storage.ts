import { Client } from "minio";

export type StorageDomain = "ota" | "bankes";

export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "new-bucket";

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: Number(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "",
  secretKey: process.env.MINIO_SECRET_KEY || "",
});

export const getStoragePrefix = (domain: StorageDomain) => `${domain}/`;

export const buildObjectKey = (domain: StorageDomain, studentId: number, fileName: string) =>
  `${getStoragePrefix(domain)}${studentId}/${fileName}`;

export const getPublicFileUrl = (objectKey: string) => {
  const publicUrl = process.env.MINIO_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl.replace(/\/$/, "")}/${BUCKET_NAME}/${objectKey}`;
  }

  const protocol = process.env.MINIO_USE_SSL === "true" ? "https" : "http";
  const host = process.env.MINIO_PUBLIC_HOST || process.env.MINIO_ENDPOINT || "localhost";
  const port = process.env.MINIO_PUBLIC_PORT || process.env.MINIO_PORT || "9000";

  return `${protocol}://${host}:${port}/${BUCKET_NAME}/${objectKey}`;
};