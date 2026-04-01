import { createRoute, z } from "@hono/zod-openapi";
import {
  ChangePasswordRequestSchema,
  InvalidChangePasswordResponse,
  SuccessfulChangePasswordResponse,
} from "../zod/password.js";
import { InternalServerErrorResponse } from "../zod/response.js";
import { AuthorizationErrorResponse } from "../types/response.js";

export const changePasswordRoute = createRoute({
  operationId: "changePassword",
  tags: ["Password"],
  method: "post",
  path: "/change/{id}",
  description: "Change password.",
  request: {
    params: z.object({
      id: z.string().openapi({
        param: {
          name: "id",
          in: "path",
          required: true,
          description: "User ID",
        },
      }),
    }),
    body: {
      content: {
        "multipart/form-data": {
          schema: ChangePasswordRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful change password.",
      content: {
        "application/json": { schema: SuccessfulChangePasswordResponse },
      },
    },
    400: {
      description: "Bad request - missing fields.",
      content: {
        "application/json": { schema: InvalidChangePasswordResponse },
      },
    },
    401: AuthorizationErrorResponse,
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});