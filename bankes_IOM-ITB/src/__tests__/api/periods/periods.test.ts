import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    period: {
      findMany: vi.fn(),
    },
  },
}));

import { GET } from "@/app/api/periods/route";

describe("GET /api/periods", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("200 — returns normalised period list", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.period.findMany).mockResolvedValue([
      {
        id: 1,
        period: "2024/2025",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2025-01-01"),
        isCurrent: true,
        isOpen: true,
      },
    ]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].period_id).toBe(1);
    expect(data[0].period).toBe("2024/2025");
    expect(data[0].is_current).toBe(true);
    expect(data[0].is_open).toBe(true);
  });

  test("200 — returns empty list when no periods exist", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.period.findMany).mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(0);
  });

  test("500 — returns error on database failure", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.period.findMany).mockRejectedValue(
      new Error("DB connection failed"),
    );

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe("Error fetching periods");
  });
});
