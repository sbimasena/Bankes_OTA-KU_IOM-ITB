import { env } from "../config/env.config.js";
import {
  dailyReminder7DaysCron,
  dailyReminder14DaysCron,
  dailyReminder30DaysCron,
  dailyReminderCron,
  dailyReminder3DaysWhatsAppCron,
} from "./daily-cron.js";
import { monthlyCron } from "./monthly-cron.js";
import { everyThreeDaysCron } from "./three-day-cron.js";

export function setupCronJobs() {
  // if (env.NODE_ENV === "production") {
    
  // }
  dailyReminderCron.start();
  dailyReminder7DaysCron.start();
  dailyReminder14DaysCron.start();
  dailyReminder30DaysCron.start();
  dailyReminder3DaysWhatsAppCron.start();
  everyThreeDaysCron.start();
  monthlyCron.start();
}
