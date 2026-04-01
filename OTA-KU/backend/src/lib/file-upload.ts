import type { UploadApiResponse } from "cloudinary";
import { v4 as uuid } from "uuid";
import cloudinary from "./cloudinary.js";

/**
 * Detects file type based on file object
 * @param file The file to detect
 * @returns The detected file type ("image" or "pdf")
 */
function detectFileType(file: File): "image" | "pdf" {
  if (file.type.startsWith("image/")) {
    return "image";
  } else if (file.type === "application/pdf") {
    return "pdf";
  }
  
  // Default to PDF if type can't be determined from MIME type
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".pdf")) {
    return "pdf";
  }
  
  // Otherwise, assume it's an image
  return "image";
}

/**
 * Uploads a file (image or PDF) to Cloudinary
 * @param file The file to upload
 * @returns The Cloudinary upload response
 */
export async function uploadFileToCloudinary(
  file: File | string | undefined
): Promise<UploadApiResponse | { secure_url: string }> {
  // If file is a string (URL), return it as is
  if (typeof file === 'string') {
    return { secure_url: file };
  }
 
  // If file is undefined, throw an error
  if (!file) {
    throw new Error("No file provided");
  }
 
  // Generate UUID for the file
  const fileUuid = uuid();
  
  // Detect file type
  const fileType = detectFileType(file);
  
  // Prepare file for upload
  const fileBuffer = await file.arrayBuffer();
  const fileBase64 = Buffer.from(fileBuffer).toString("base64");
  
  // Set appropriate file extension and content type
  const fileExtension = fileType === "pdf" ? "pdf" : file.name.split('.').pop() || "jpg";
  const contentType = fileType === "pdf" ? "application/pdf" : file.type || "image/jpeg";
  
  // Create data URI
  const base64DataUri = `data:${contentType};base64,${fileBase64}`;
  
  // Upload to Cloudinary with appropriate settings
  const result = await cloudinary.uploader.upload(base64DataUri, {
    folder: fileType === "pdf" ? "receipts/pdf" : "receipts/images",
    public_id: `${fileUuid}.${fileExtension}`,
    resource_type: fileType === "pdf" ? "raw" : "image",
  });
  
  return result;
}

/**
 * Legacy function that uploads only PDFs to Cloudinary
 * @deprecated Use uploadFileToCloudinary instead
 */
export async function uploadPdfToCloudinary(
  file: File | string | undefined
): Promise<UploadApiResponse | { secure_url: string }> {
  return uploadFileToCloudinary(file);
}

/**
 * Legacy function that uploads only images to Cloudinary
 * @deprecated Use uploadFileToCloudinary instead
 */
export async function uploadImageToCloudinary(
  file: File | string | undefined
): Promise<UploadApiResponse | { secure_url: string }> {
  return uploadFileToCloudinary(file);
}