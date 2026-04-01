import { serve } from "@hono/node-server";

import app from "./app.js";
import { env } from "./config/env.config.js";
import { setupCronJobs } from "./cron/setup.js";

export function startServer(port = process.env.BACKEND_PORT || 3000) {
  return serve(
    {
      fetch: app.fetch,
      port: Number(port),
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    },
  );
}

// Only start server if not in test environment
if (env.NODE_ENV !== "test") {
  setupCronJobs();
  startServer();
}
