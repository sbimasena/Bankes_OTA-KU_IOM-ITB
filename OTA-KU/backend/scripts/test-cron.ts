/**
 * Script untuk manual trigger semua cron handler.
 * Jalankan: npx tsx scripts/test-cron.ts [cron-name]
 *
 * Contoh:
 *   npx tsx scripts/test-cron.ts daily
 *   npx tsx scripts/test-cron.ts monthly
 *   npx tsx scripts/test-cron.ts three-day
 *   npx tsx scripts/test-cron.ts whatsapp
 *   npx tsx scripts/test-cron.ts all
 */

import {
  dailyReminderCron,
  dailyReminder7DaysCron,
  dailyReminder14DaysCron,
  dailyReminder30DaysCron,
  dailyReminder3DaysWhatsAppCron,
} from "../src/cron/daily-cron.js";
import { monthlyCron } from "../src/cron/monthly-cron.js";
import { everyThreeDaysCron } from "../src/cron/three-day-cron.js";

const target = process.argv[2] ?? "all";

async function run() {
  console.log(`[test-cron] Firing: ${target}`);

  if (target === "daily" || target === "all") {
    console.log("\n--- dailyReminderCron (H-1) ---");
    await dailyReminderCron.fireOnTick();

    console.log("\n--- dailyReminder7DaysCron (H-7) ---");
    await dailyReminder7DaysCron.fireOnTick();

    console.log("\n--- dailyReminder14DaysCron (H-14) ---");
    await dailyReminder14DaysCron.fireOnTick();

    console.log("\n--- dailyReminder30DaysCron (H-30) ---");
    await dailyReminder30DaysCron.fireOnTick();
  }

  if (target === "whatsapp" || target === "all") {
    console.log("\n--- dailyReminder3DaysWhatsAppCron (H-3 WA) ---");
    await dailyReminder3DaysWhatsAppCron.fireOnTick();
  }

  if (target === "three-day" || target === "all") {
    console.log("\n--- everyThreeDaysCron ---");
    await everyThreeDaysCron.fireOnTick();
  }

  if (target === "monthly" || target === "all") {
    console.log("\n--- monthlyCron ---");
    await monthlyCron.fireOnTick();
  }

  console.log("\n[test-cron] Done.");
  process.exit(0);
}

run().catch((err) => {
  console.error("[test-cron] Error:", err);
  process.exit(1);
});
