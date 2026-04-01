import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import fs from "fs";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import path from "path";
import { fileURLToPath } from "url";

import { env } from "./config/env.config.js";
import { apiRouter } from "./controllers/api.controller.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  fs.readFileSync(path.join(dirname, "../package.json"), "utf-8"),
);

const app = new OpenAPIHono();

// Middlewares
app.use(logger());
app.use(secureHeaders());
app.use("*", requestId());

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  
  console.error("Unexpected Error:", err);

  return c.json(
    {
      success: false,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    },
    500
  );
});

app.use(
  "/api/*",
  cors({
    credentials: true,
    origin: env.ALLOWED_ORIGINS,
  }),
);

app.use(
  "/api/*",
  csrf({
    origin: env.ALLOWED_ORIGINS,
  }),
);

// Base routes
app.get("/", (c) => c.json({ message: "Server runs successfully" }));
app.get("/health", (c) =>
  c.json(
    {
      success: true,
      message: "Server is running",
      body: { message: "Server is running" },
    },
    200,
  ),
);

// API routes
app.route("/api", apiRouter);

// OpenAPI documentation
app.doc("/doc", {
  openapi: "3.1.0",
  info: {
    version: packageJson.version,
    title: packageJson.name,
  },
});

app.use("/swagger", swaggerUI({ url: "/doc" }));

export default app;
