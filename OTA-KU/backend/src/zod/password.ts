import { z } from "@hono/zod-openapi";

import { PasswordSchema } from "./atomic.js";

export const ChangePasswordRequestSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password gagal",
    path: ["confirmPassword"],
  })
  .openapi({
    description: "Request body for changing password",
    example: {
      password: "newpassword123",
      confirmPassword: "newpassword123",
    },
  });

export const SuccessfulChangePasswordResponse = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: "Change password successful" }),
});

export const InvalidChangePasswordResponse = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "Invalid credentials" }),
  error: z.object({}),
});
