import { env } from "../config/env.config.js";

interface SendWhatsAppOptions {
  to: string;
  message: string;
  clientReference?: string;
  idempotencyKey: string;
}

export async function sendWhatsApp(options: SendWhatsAppOptions): Promise<void> {
  if (!env.WHATSAPP_API_URL || !env.WHATSAPP_API_KEY) {
    console.warn("[whatsapp] WHATSAPP_API_URL or WHATSAPP_API_KEY not set, skipping.");
    return;
  }

  const body: Record<string, string> = {
    to: options.to,
    message: options.message,
  };
  if (options.clientReference) {
    body.client_reference = options.clientReference;
  }

  try {
    const res = await fetch(`${env.WHATSAPP_API_URL}/api/v1/messages/whatsapp`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.WHATSAPP_API_KEY}`,
        "Idempotency-Key": options.idempotencyKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[whatsapp] Failed to send to ${options.to}: ${res.status} ${text}`);
    } else {
      console.log(`[whatsapp] Queued message to ${options.to} (ref: ${options.clientReference})`);
    }
  } catch (err) {
    console.error(`[whatsapp] Network error sending to ${options.to}:`, err);
  }
}
