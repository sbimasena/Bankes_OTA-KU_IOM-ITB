import { z } from "zod";

import { PasswordSchema } from "./atomic";

export const ChangePasswordSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password gagal",
    path: ["confirmPassword"],
  });
