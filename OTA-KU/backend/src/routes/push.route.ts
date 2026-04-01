import { createRoute } from "@hono/zod-openapi";

import { AuthorizationErrorResponse } from "../types/response.js";
import {
  CreatePushSubscriptionParamsSchema,
  CreatePushSubscriptionResponseSchema,
  CreatePushSubscriptionSchema,
  DeletePushSubscriptionErrorResponseSchema,
  DeletePushSubscriptionParamsSchema,
  DeletePushSubscriptionResponseSchema,
  GetPushSubscriptionErrorResponseSchema,
  GetPushSubscriptionParamsSchema,
  GetPushSubscriptionResponseSchema,
  NotificationBatchDataSchema,
  NotificationDataErrorResponseSchema,
  NotificationDataParamsSchema,
  NotificationDataResponseSchema,
  NotificationDataSchema,
} from "../zod/push.js";
import { InternalServerErrorResponse } from "../zod/response.js";

export const getPushSubscription = createRoute({
  operationId: "getPushSubscription",
  tags: ["Push Subscription"],
  method: "get",
  path: "/get/{id}",
  description: "Get a push subscription.",
  request: {
    params: GetPushSubscriptionParamsSchema,
  },
  responses: {
    200: {
      description: "Successful push subscription retrieval.",
      content: {
        "application/json": { schema: GetPushSubscriptionResponseSchema },
      },
    },
    400: {
      description: "Bad request - missing fields.",
      content: {
        "application/json": { schema: GetPushSubscriptionErrorResponseSchema },
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

export const createPushSubscription = createRoute({
  operationId: "createPushSubscription",
  tags: ["Push Subscription"],
  method: "post",
  path: "/create/{id}",
  description: "Create a push subscription.",
  request: {
    params: CreatePushSubscriptionParamsSchema,
    body: {
      content: {
        "multipart/form-data": {
          schema: CreatePushSubscriptionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful push subscription creation.",
      content: {
        "application/json": { schema: CreatePushSubscriptionResponseSchema },
      },
    },
    400: {
      description: "Bad request - missing fields.",
      content: {
        "application/json": { schema: CreatePushSubscriptionResponseSchema },
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

export const deletePushSubscription = createRoute({
  operationId: "deletePushSubscription",
  tags: ["Push Subscription"],
  method: "delete",
  path: "/delete/{id}",
  description: "Delete a push subscription.",
  request: {
    params: DeletePushSubscriptionParamsSchema,
  },
  responses: {
    200: {
      description: "Successful push subscription deletion.",
      content: {
        "application/json": { schema: DeletePushSubscriptionResponseSchema },
      },
    },
    400: {
      description: "Bad request - missing fields.",
      content: {
        "application/json": {
          schema: DeletePushSubscriptionErrorResponseSchema,
        },
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

export const sendPushNotification = createRoute({
  operationId: "sendPushNotification",
  tags: ["Push Subscription"],
  method: "post",
  path: "/send/{id}",
  description: "Send a push notification.",
  request: {
    params: NotificationDataParamsSchema,
    body: {
      content: {
        "multipart/form-data": {
          schema: NotificationDataSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful push notification sent.",
      content: {
        "application/json": { schema: NotificationDataResponseSchema },
      },
    },
    400: {
      description: "Bad request - missing fields.",
      content: {
        "application/json": { schema: NotificationDataErrorResponseSchema },
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

export const sendBatchPushNotification = createRoute({
  operationId: "sendBatchPushNotification",
  tags: ["Push Subscription"],
  method: "post",
  path: "/send/batch/{id}",
  description: "Send a batch push notification.",
  request: {
    params: NotificationDataParamsSchema,
    body: {
      content: {
        "multipart/form-data": {
          schema: NotificationBatchDataSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Successful batch push notification sent.",
      content: {
        "application/json": { schema: NotificationDataResponseSchema },
      },
    },
    400: {
      description: "Bad request - missing fields.",
      content: {
        "application/json": { schema: NotificationDataErrorResponseSchema },
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
