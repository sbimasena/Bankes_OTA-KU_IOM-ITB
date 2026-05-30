import { describe, expect, test } from "vitest";

import drizzleConfig from "../drizzle.config.js";

describe("Drizzle Kit Configuration", () => {
  test("should have correct structure", () => {
    expect(drizzleConfig).toMatchObject({
      dialect: "postgresql",
      schema: expect.any(String),
      out: expect.any(String),
      dbCredentials: {
        url: expect.any(String),
        ssl: expect.any(Boolean),
      },
    });
  });
});
