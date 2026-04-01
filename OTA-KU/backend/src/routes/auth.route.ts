import { createRoute } from "@hono/zod-openapi";

import { AuthorizationErrorResponse } from "../types/response.js";
import {
  BadRequestLoginResponse,
  BadRequestOAuthLoginResponse,
  BadRequestOTPVerificationResponse,
  BadRequestRegisResponse,
  ForgotPasswordResponse,
  ForgotPasswordSchema,
  InvalidLoginResponse,
  InvalidRegisResponse,
  LogoutSuccessfulResponse,
  OTPVerificationRequestSchema,
  SuccessfulLoginResponse,
  SuccessfulOTPVerificationResponse,
  SuccessfulRegisResponse,
  UserAuthenticatedResponse,
  UserLoginRequestSchema,
  UserOAuthLoginRequestSchema,
  UserRegisRequestSchema,
} from "../zod/auth.js";
import { InternalServerErrorResponse } from "../zod/response.js";

export const loginRoute = createRoute({
  operationId: "login",
  tags: ["Auth"],
  method: "post",
  path: "/login",
  description: "Authenticates a user and returns a JWT token.",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: UserLoginRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful login.",
      content: {
        "application/json": { schema: SuccessfulLoginResponse },
      },
    },
    400: {
      description: "Bad request - missing fields.",
      content: {
        "application/json": { schema: BadRequestLoginResponse },
      },
    },
    401: {
      description: "Invalid credentials.",
      content: {
        "application/json": { schema: InvalidLoginResponse },
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

export const regisRoute = createRoute({
  operationId: "regis",
  tags: ["Auth"],
  method: "post",
  path: "/register",
  description: "Registers a new user and returns a JWT token.",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: UserRegisRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful registration",
      content: {
        "application/json": { schema: SuccessfulRegisResponse },
      },
    },
    400: {
      description: "Bad request (e.g., missing fields).",
      content: {
        "application/json": { schema: BadRequestRegisResponse },
      },
    },
    401: {
      description: "Invalid credentials.",
      content: {
        "application/json": { schema: InvalidRegisResponse },
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

export const verifRoute = createRoute({
  operationId: "verif",
  tags: ["Auth"],
  method: "get",
  path: "/verify",
  description: "Verifies if the user is authenticated by checking the JWT.",
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": { schema: UserAuthenticatedResponse },
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

export const logoutRoute = createRoute({
  operationId: "logout",
  tags: ["Auth"],
  method: "post",
  path: "/logout",
  description: "Logs out the user by clearing the JWT cookie.",
  responses: {
    200: {
      description: "Successful logout.",
      content: {
        "application/json": { schema: LogoutSuccessfulResponse },
      },
    },
    401: AuthorizationErrorResponse,
    500: {
      description: "Internal server error.",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const oauthRoute = createRoute({
  operationId: "oauth",
  tags: ["Auth"],
  method: "post",
  path: "/oauth",
  description: "Authenticates a user using Azure OAuth2.",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: UserOAuthLoginRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful login.",
      content: {
        "application/json": { schema: SuccessfulLoginResponse },
      },
    },
    400: {
      description: "Bad request - missing fields.",
      content: {
        "application/json": { schema: BadRequestOAuthLoginResponse },
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

export const otpRoute = createRoute({
  operationId: "otp",
  tags: ["Auth"],
  method: "post",
  path: "/otp",
  description: "Authenticates a user using OTP.",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: OTPVerificationRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Valid OTP.",
      content: {
        "application/json": { schema: SuccessfulOTPVerificationResponse },
      },
    },
    400: {
      description: "Invalid OTP.",
      content: {
        "application/json": { schema: BadRequestOTPVerificationResponse },
      },
    },
    401: {
      description: "Account is already verified.",
      content: {
        "application/json": { schema: BadRequestOTPVerificationResponse },
      },
    },
    404: {
      description: "Invalid OTP.",
      content: {
        "application/json": { schema: BadRequestOTPVerificationResponse },
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

export const forgotPasswordRoute = createRoute({
  operationId: "forgotPassword",
  tags: ["Auth"],
  method: "post",
  path: "/forgot-password",
  description: "Sends a password reset email to the user.",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: ForgotPasswordSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Password reset email sent.",
      content: {
        "application/json": { schema: ForgotPasswordResponse },
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
