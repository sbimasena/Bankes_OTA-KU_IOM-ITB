import { createRoute } from "@hono/zod-openapi";

import { AuthorizationErrorResponse } from "../types/response.js";
import {
  BadRequestSendOtpResponse,
  EmailNotFoundResponseSchema,
  GetOtpExpiredDateNotFoundResponseSchema,
  GetOtpExpiredDateResponseSchema,
  GetOtpExpiredDateResponseSchemaError,
  SendOtpRequestSchema,
  SendOtpResponseSchema,
} from "../zod/otp.js";
import { InternalServerErrorResponse } from "../zod/response.js";

export const sendOtpRoute = createRoute({
  operationId: "sendOtp",
  tags: ["OTP"],
  method: "post",
  path: "/send",
  description: "Send OTP to the user's email.",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: SendOtpRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "OTP sent successfully.",
      content: {
        "application/json": {
          schema: SendOtpResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request - missing fields.",
      content: {
        "application/json": {
          schema: BadRequestSendOtpResponse,
        },
      },
    },
    401: AuthorizationErrorResponse,
    404: {
      description: "User not found.",
      content: {
        "application/json": {
          schema: EmailNotFoundResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const getOtpExpiredDateRoute = createRoute({
  operationId: "getOtpExpiredDate",
  tags: ["OTP"],
  method: "get",
  path: "/expired-date",
  description: "Get OTP expiration date.",
  responses: {
    200: {
      description: "OTP expiration date retrieved successfully.",
      content: {
        "application/json": {
          schema: GetOtpExpiredDateResponseSchema,
        },
      },
    },
    401: AuthorizationErrorResponse,
    404: {
      description: "OTP not found.",
      content: {
        "application/json": {
          schema: GetOtpExpiredDateNotFoundResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: GetOtpExpiredDateResponseSchemaError },
      },
    },
  },
});
