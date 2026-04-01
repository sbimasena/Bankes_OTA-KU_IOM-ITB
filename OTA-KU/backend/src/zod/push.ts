import { z } from "@hono/zod-openapi";

export const SubscriptionSchema = z
  .object({
    endpoint: z.string().url().openapi({
      example: "https://fcm.googleapis.com/fcm/send/eQ-gK1x...",
      description: "The endpoint URL to send push notifications to.",
    }),
    p256dh: z.string().openapi({
      example: "BOrK1Vs8vS6O...long-base64-key...",
      description: "The user's public key for the push subscription.",
    }),
    auth: z.string().openapi({
      example: "OvUeHG3qRxE...",
      description: "Authentication secret for the push subscription.",
    }),
  })
  .openapi("SubscriptionSchema");

// Get Push Subscription
export const GetPushSubscriptionParamsSchema = z.object({
  id: z.string().openapi({
    example: "3762d870-158e-4832-804c-f0be220d40c0",
    description: "Unique account ID",
  }),
});

export const GetPushSubscriptionResponseSchema = z.object({
  success: z.boolean().openapi({
    example: true,
    description: "Indicates if the subscription was retrieved successfully.",
  }),
  message: z.string().openapi({
    example: "Subscription retrieved successfully.",
    description: "Message indicating the result of the operation.",
  }),
  body: z.object({
    isSubscribed: z.boolean().openapi({
      example: true,
      description: "Indicates if the user is subscribed to push notifications.",
    }),
  }),
});

export const GetPushSubscriptionErrorResponseSchema = z.object({
  success: z.boolean().openapi({
    example: false,
    description: "Indicates if the subscription retrieval failed.",
  }),
  message: z.string().openapi({
    example: "Subscription not found.",
    description: "Message indicating the result of the operation.",
  }),
  error: z.object({}).openapi({
    example: {},
    description: "Error details if any.",
  }),
});

// Create Push Subscription
export const CreatePushSubscriptionSchema = SubscriptionSchema.openapi(
  "CreatePushSubscriptionSchema",
);

export const CreatePushSubscriptionParamsSchema = z.object({
  id: z.string().openapi({
    example: "3762d870-158e-4832-804c-f0be220d40c0",
    description: "Unique account ID",
  }),
});

export const CreatePushSubscriptionResponseSchema = z.object({
  success: z.boolean().openapi({
    example: true,
    description: "Indicates if the subscription was created successfully.",
  }),
  message: z.string().openapi({
    example: "Subscription created successfully.",
    description: "Message indicating the result of the operation.",
  }),
});

// Delete Push Subscription
export const DeletePushSubscriptionParamsSchema = z.object({
  id: z.string().openapi({
    example: "3762d870-158e-4832-804c-f0be220d40c0",
    description: "Unique account ID",
  }),
});

export const DeletePushSubscriptionResponseSchema = z.object({
  success: z.boolean().openapi({
    example: true,
    description: "Indicates if the subscription was deleted successfully.",
  }),
  message: z.string().openapi({
    example: "Subscription deleted successfully.",
    description: "Message indicating the result of the operation.",
  }),
});

export const DeletePushSubscriptionErrorResponseSchema = z.object({
  success: z.boolean().openapi({
    example: false,
    description: "Indicates if the subscription deletion failed.",
  }),
  message: z.string().openapi({
    example: "Subscription not found.",
    description: "Message indicating the result of the operation.",
  }),
  error: z.object({}).openapi({
    example: {},
    description: "Error details if any.",
  }),
});

export const UpdatePushSubscriptionSchema = z
  .object({
    subscription: SubscriptionSchema,
  })
  .openapi("UpdatePushSubscriptionSchema");

const NotificationActionSchema = z
  .object({
    action: z.string().openapi({
      example: "open_app",
      description: "Identifier for the action.",
    }),
    title: z.string().openapi({
      example: "Open App",
      description: "Text displayed on the action button.",
    }),
    icon: z.string().url().optional().openapi({
      example: "https://example.com/icon.png",
      description: "Optional icon URL for the action.",
    }),
  })
  .openapi("NotificationAction");

// Send Push Notification
export const NotificationDataSchema = z
  .object({
    userId: z.string().openapi({
      example: "3762d870-158e-4832-804c-f0be220d40c0",
      description: "Unique account ID",
    }),
    title: z.string().openapi({
      example: "New Message",
      description: "Title of the notification.",
    }),
    body: z.string().openapi({
      example: "You have received a new message.",
      description: "Body content of the notification.",
    }),
    actions: z
      .array(NotificationActionSchema.optional())
      .optional()
      .openapi({
        example: [
          {
            action: "view",
            title: "View",
            icon: "https://example.com/view-icon.png",
          },
        ],
        description: "Optional actions available for the notification.",
      }),
  })
  .openapi("NotificationDataSchema");

export const NotificationBatchDataSchema = z
  .object({
    title: z.string().openapi({
      example: "System Update",
      description: "Title of the batch notification.",
    }),
    body: z.string().openapi({
      example: "All users will be logged out for maintenance at 12 AM.",
      description: "Body content of the batch notification.",
    }),
    actions: z
      .array(NotificationActionSchema.optional())
      .optional()
      .openapi({
        example: [
          {
            action: "acknowledge",
            title: "Acknowledge",
            icon: "https://example.com/ack-icon.png",
          },
        ],
        description: "Optional actions for the batch notification.",
      }),
  })
  .openapi("NotificationBatchDataSchema");

export const NotificationDataParamsSchema = z.object({
  id: z.string().openapi({
    example: "3762d870-158e-4832-804c-f0be220d40c0",
    description: "Unique account ID",
  }),
});

export const NotificationDataResponseSchema = z.object({
  success: z.boolean().openapi({
    example: true,
    description: "Indicates if the notification was sent successfully.",
  }),
  message: z.string().openapi({
    example: "Notification sent successfully.",
    description: "Message indicating the result of the operation.",
  }),
});

export const NotificationDataErrorResponseSchema = z.object({
  success: z.boolean().openapi({
    example: false,
    description: "Indicates if the notification sending failed.",
  }),
  message: z.string().openapi({
    example: "Failed to send notification.",
    description: "Message indicating the result of the operation.",
  }),
  error: z.object({}).openapi({
    example: {},
    description: "Error details if any.",
  }),
});
