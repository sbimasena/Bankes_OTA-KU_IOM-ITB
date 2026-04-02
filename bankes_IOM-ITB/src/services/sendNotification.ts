import { PrismaClient } from "@prisma/client";
import webPush from "web-push";

const prisma = new PrismaClient();

webPush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  url?: string // <- optional
) {
  if (!userId || !title || !body) {
    throw new Error("Missing required fields");
  }

  // Store in DB first
  const createdNotification = await prisma.notification.create({
    data: {
      userId,
      header: title,
      body,
      url,
      hasRead: false,
    },
  });

  // Get subscriptions
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  const payload = JSON.stringify({ title, body, url, notificationId: createdNotification.id });

  const notifications = subscriptions.map((sub) => {
    if (!sub.keys || typeof sub.keys !== "object") {
      console.error("Invalid keys format for subscription:", sub);
      return Promise.resolve(); // Skip invalid subscriptions
    }

    const pushSubscription: webPush.PushSubscription = {
      endpoint: sub.endpoint,
      keys: sub.keys as { p256dh: string; auth: string },
    };

    return webPush.sendNotification(pushSubscription, payload);
  });

  await Promise.all(notifications);
}
