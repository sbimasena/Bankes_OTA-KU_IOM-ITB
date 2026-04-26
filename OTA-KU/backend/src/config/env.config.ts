import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  BACKEND_PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  ALLOWED_ORIGINS: z
    .string()
    .default('["http://localhost:5173"]')
    .transform((value) => JSON.parse(value))
    .pipe(z.array(z.string().url())),
  JWT_SECRET: z.string(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  AZURE_CLIENT_ID: z.string(),
  AZURE_CLIENT_SECRET: z.string(),
  VITE_PUBLIC_URL: z.string().url(),
  MINIO_ENDPOINT: z.string().default("minio"),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  MINIO_ACCESS_KEY: z.string().default("minioadmin"),
  MINIO_SECRET_KEY: z.string().default("minioadmin"),
  MINIO_PUBLIC_HOST: z.string().default("localhost"),
  MINIO_PUBLIC_PORT: z.coerce.number().default(9000),
  EMAIL: z.string().email(),
  EMAIL_FROM: z.string(),
  EMAIL_PASSWORD: z.string(),
  VAPID_MAILTO: z.string().email(),
  VAPID_PUBLIC_KEY: z.string(),
  VAPID_PRIVATE_KEY: z.string(),
  TEST_EMAIL: z.string().email(),
  PAYMENT_PROVIDER: z.enum(["none", "midtrans"]).default("none"),
  MIDTRANS_SERVER_KEY: z.string().default(""),
  MIDTRANS_CLIENT_KEY: z.string().default(""),
  MIDTRANS_MERCHANT_ID: z.string().default(""),
  MIDTRANS_IS_PRODUCTION: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  WHATSAPP_API_URL: z.string().url().optional(),
  WHATSAPP_API_KEY: z.string().optional(),
});

const result = EnvSchema.safeParse(process.env);
if (!result.success) {
  console.error("Invalid environment variables: ");
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
