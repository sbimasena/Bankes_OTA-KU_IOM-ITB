import { serve } from "@hono/node-server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import app from "../src/app.js";
import { startServer } from "../src/index.js";

// Mock the serve function
vi.mock("@hono/node-server", () => ({
  serve: vi.fn(),
}));

describe("Server Initialization", () => {
  const mockServe = vi.mocked(serve);
  const mockConsole = vi.spyOn(console, "log");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should start server with correct configuration", () => {
    // Call your server initialization code
    startServer(); // You'll need to export this from your server file

    expect(mockServe).toHaveBeenCalledTimes(1);
    expect(mockServe).toHaveBeenCalledWith(
      {
        fetch: app.fetch,
        port: 3000,
      },
      expect.any(Function), // Callback function
    );
  });

  test("should log server start message", () => {
    startServer();

    // Get the callback function passed to serve
    const serveCallback = mockServe.mock.calls[0][1]!;

    // Simulate the callback being called
    serveCallback({ port: 3000, address: "127.0.0.1", family: "IPv4" });

    expect(mockConsole).toHaveBeenCalledWith(
      "Server is running on http://localhost:3000",
    );
  });

  test("should use correct port from environment", () => {
    process.env.BACKEND_PORT = "4000";
    startServer();

    expect(mockServe).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 4000,
      }),
      expect.any(Function),
    );

    // Clean up
    delete process.env.BACKEND_PORT;
  });
});
