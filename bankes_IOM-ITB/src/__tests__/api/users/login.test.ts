import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn().mockReturnValue("test-jwt-token"),
  },
}));

import { POST } from "@/app/api/users/login/route";

const mockUser = {
  id: "test-uuid-1234",
  email: "admin@example.com",
  password: "$2b$10$hashedpassword",
  name: "Admin Test",
  role: "Admin" as const,
  phoneNumber: null,
  provider: "credentials" as const,
  verificationStatus: "verified" as const,
  applicationStatus: "accepted" as const,
  oid: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const makeRequest = (body: Record<string, unknown>) =>
  new Request("http://localhost/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/users/login", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("400 — missing email returns field error", async () => {
    const res = await POST(makeRequest({ password: "Password123!" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.email).toBe("Email is required");
  });

  test("400 — missing password returns field error", async () => {
    const res = await POST(makeRequest({ email: "admin@example.com" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.password).toBe("Password is required");
  });

  test("400 — wrong password returns generalError", async () => {
    const { prisma } = await import("@/lib/prisma");
    const bcrypt = (await import("bcryptjs")).default;

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const res = await POST(
      makeRequest({ email: "admin@example.com", password: "wrongpass" }),
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.generalError).toBe("Email or Password is incorrect");
  });

  test("400 — user not found returns generalError", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await POST(
      makeRequest({ email: "nobody@example.com", password: "Password123!" }),
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.generalError).toBe("Email or Password is incorrect");
  });

  test("200 — valid credentials return user without password", async () => {
    const { prisma } = await import("@/lib/prisma");
    const bcrypt = (await import("bcryptjs")).default;

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const res = await POST(
      makeRequest({ email: "admin@example.com", password: "Password123!" }),
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe("admin@example.com");
    expect(data.user.password).toBeUndefined();
  });

  test("500 — database error returns 500", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.user.findUnique).mockRejectedValue(
      new Error("DB connection failed"),
    );

    const res = await POST(
      makeRequest({ email: "admin@example.com", password: "Password123!" }),
    );

    expect(res.status).toBe(500);
  });
});
