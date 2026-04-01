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
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  EMAIL: z.string().email(),
  EMAIL_FROM: z.string(),
  EMAIL_PASSWORD: z.string(),
  VAPID_MAILTO: z.string().email(),
  VAPID_PUBLIC_KEY: z.string(),
  VAPID_PRIVATE_KEY: z.string(),
  TEST_EMAIL: z.string().email(),
});

const result = EnvSchema.safeParse(process.env);
if (!result.success) {
  console.error("Invalid environment variables: ");
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
