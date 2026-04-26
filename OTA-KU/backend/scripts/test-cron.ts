/**
 * Script untuk manual trigger WhatsApp H-3 reminder cron.
 * Jalankan dari dalam container: docker exec -it iom-ota-backend npx tsx scripts/test-cron.ts whatsapp
 */

import { runWhatsAppReminder3Days } from "../src/cron/daily-cron.js";

async function run() {
  console.log("[test-cron] Firing WhatsApp H-3 reminder...");
  await runWhatsAppReminder3Days();
  console.log("[test-cron] Done.");
  process.exit(0);
}

run().catch((err) => {
  console.error("[test-cron] Error:", err);
  process.exit(1);
});
