import bcrypt from "bcrypt";

import { prisma } from "../db/prisma.js";
import { changePasswordRoute } from "../routes/password.route.js";
import { ChangePasswordRequestSchema } from "../zod/password.js";
import { createAuthRouter, createRouter } from "./router-factory.js";

export const passwordRouter = createRouter();
export const passwordProtectedRouter = createAuthRouter();

passwordProtectedRouter.openapi(changePasswordRoute, async (c) => {
  const { id } = c.req.param();
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  if (user.id !== id || user.provider === "azure") {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: {},
      },
      400,
    );
  }

  const zodParseResult = ChangePasswordRequestSchema.parse(data);
  const { password } = zodParseResult;

  try {
    // Hash the password before storing it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return c.json(
      {
        success: true,
        message: "Change password successful",
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});
