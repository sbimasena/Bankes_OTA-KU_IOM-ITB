import { prisma } from "../db/prisma.js";
import { sendNotification } from "../lib/web-push.js";
import {
  createPushSubscription,
  deletePushSubscription,
  getPushSubscription,
  sendPushNotification,
} from "../routes/push.route.js";
import {
  CreatePushSubscriptionSchema,
  NotificationDataSchema,
  SubscriptionSchema,
} from "../zod/push.js";
import { createAuthRouter, createRouter } from "./router-factory.js";

export const pushRouter = createRouter();
export const pushProtectedRouter = createAuthRouter();

pushProtectedRouter.openapi(getPushSubscription, async (c) => {
  const { id } = c.req.param();
  const user = c.var.user;

  if (user.id !== id) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: {},
      },
      400,
    );
  }

  try {
    const subscription = await prisma.pushSubscription.findFirst({
      where: { userId: id },
    });

    if (!subscription) {
      return c.json(
        {
          success: true,
          message: "Subscription not found",
          body: {
            isSubscribed: false,
          },
        },
        200,
      );
    }

    return c.json(
      {
        success: true,
        message: "Subscription retrieved successfully",
        body: {
          isSubscribed: true,
        },
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

pushProtectedRouter.openapi(createPushSubscription, async (c) => {
  const { id } = c.req.param();
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  if (user.id !== id) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: {},
      },
      400,
    );
  }

  const zodParseResult = CreatePushSubscriptionSchema.parse(data);
  const { auth, endpoint, p256dh } = zodParseResult;

  const keys = {
    p256dh,
    auth,
  };

  try {
    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: { userId: id, endpoint },
      },
      create: {
        userId: id,
        endpoint,
        keys: keys as any,
      },
      update: {
        keys: keys as any,
      },
    });

    return c.json(
      {
        success: true,
        message: "Push subscription created successfully",
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

pushProtectedRouter.openapi(deletePushSubscription, async (c) => {
  const { id } = c.req.param();
  const user = c.var.user;

  if (user.id !== id) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: {},
      },
      400,
    );
  }

  try {
    await prisma.pushSubscription.deleteMany({
      where: { userId: id },
    });

    return c.json(
      {
        success: true,
        message: "Push subscription deleted successfully",
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

pushProtectedRouter.openapi(sendPushNotification, async (c) => {
  const { id } = c.req.param();
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  if (user.id !== id) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: {},
      },
      400,
    );
  }

  const zodParseResult = NotificationDataSchema.parse(data);
  const { title, body: notificationBody, userId, actions } = zodParseResult;

  if (user.id === userId) {
    return c.json(
      {
        success: false,
        message: "Cannot send notification to self",
        error: {},
      },
      400,
    );
  }

  try {
    const subscription = await prisma.pushSubscription.findFirst({
      where: { userId },
    });

    if (!subscription) {
      return c.json(
        {
          success: false,
          message: "Subscription not found",
          error: {},
        },
        400,
      );
    }

    const { endpoint } = subscription;
    const { p256dh, auth } = subscription.keys as { p256dh: string; auth: string };

    const validatedData = SubscriptionSchema.parse({
      endpoint,
      p256dh,
      auth,
    });

    const pushSubscription = {
      endpoint: validatedData.endpoint,
      keys: {
        p256dh: validatedData.p256dh,
        auth: validatedData.auth,
      },
    };

    const notificationData = {
      title,
      body: notificationBody,
      actions,
    };

    await sendNotification(pushSubscription, notificationData);

    return c.json(
      {
        success: true,
        message: "Push notification sent successfully",
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
