import { and, eq } from "drizzle-orm";
import { describe, expect, test } from "vitest";

import drizzleConfig from "../drizzle.config.js";
import { db } from "../src/db/drizzle.js";
import {
  accountMahasiswaDetailTable,
  accountOtaDetailTable,
  accountTable,
  connectionTable,
} from "../src/db/schema.js";
import { resetDatabase } from "../src/db/scripts/reset.js";
import { seed } from "../src/db/scripts/seed.js";

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

describe("Database Seeding", () => {
  test("should seed all data correctly", async () => {
    await seed();

    // Verify admin account
    const admin = (
      await db
        .select()
        .from(accountTable)
        .where(eq(accountTable.email, "admin@example.com"))
    )[0];
    expect(admin).toBeDefined();
    expect(admin.type).toBe("admin");

    // Verify mahasiswa accounts
    const mahasiswa = (
      await db
        .select()
        .from(accountTable)
        .where(eq(accountTable.email, "13599101@mahasiswa.itb.ac.id"))
    )[0];
    expect(mahasiswa).toBeDefined();
    expect(mahasiswa.type).toBe("mahasiswa");

    // Verify OTA accounts
    const ota = (
      await db
        .select()
        .from(accountTable)
        .where(eq(accountTable.email, "ota1@example.com"))
    )[0];
    expect(ota).toBeDefined();
    expect(ota.type).toBe("ota");

    const otaDetails = await db.select().from(accountOtaDetailTable);
    expect(otaDetails.length).toBe(15);

    const mahasiswaDetails = await db
      .select()
      .from(accountMahasiswaDetailTable);
    expect(mahasiswaDetails.length).toBe(18);

    // Verify connections
    const connections = await db
      .select()
      .from(connectionTable)
      .where(
        and(
          eq(connectionTable.mahasiswaId, mahasiswa.id),
          eq(connectionTable.otaId, ota.id),
        ),
      );
    expect(connections).toBeDefined();
    expect(connections.length).toBe(1);
  });
});

describe("Database Reset", () => {
  test("should completely reset and reseed the database", async () => {
    // 2. Run the reset function
    await resetDatabase();

    // 3. Verify all tables were reset properly
    const accounts = await db.select().from(accountTable);
    expect(accounts.length).toBe(38); // admin + 2 bankes + 2 pengurus + 18 mahasiswa + 15 ota

    const mahasiswaDetails = await db
      .select()
      .from(accountMahasiswaDetailTable);
    expect(mahasiswaDetails.length).toBe(18);

    const otaDetails = await db.select().from(accountOtaDetailTable);
    expect(otaDetails.length).toBe(15);

    const connections = await db.select().from(connectionTable);
    expect(connections.length).toBe(4);
  });
});
