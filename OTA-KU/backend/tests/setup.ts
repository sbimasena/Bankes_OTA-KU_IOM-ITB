import { hash } from "bcrypt";
import { afterAll, beforeAll } from "vitest";

import { db } from "../src/db/drizzle.js";
import { prisma } from "../src/db/prisma.js";
import {
  accountAdminDetailTable,
  accountMahasiswaDetailTable,
  accountOtaDetailTable,
  accountTable,
  connectionTable,
  otpTable,
  pushSubscriptionTable,
  temporaryPasswordTable,
  transactionTable,
} from "../src/db/schema.js";
import { otpDatas, testUsers } from "./constants/user.js";

// auth.controller.ts uses Prisma for login (prisma.user.findFirst, prisma.temporaryPassword…).
// After `prisma db push --accept-data-loss` the conflicting tables (otp, temporary_password,
// push_subscription, connection, transaction) use Prisma's camelCase column names, so Drizzle
// SELECT queries on those tables would fail.  We therefore only backup/restore the four tables
// that are exclusive to Drizzle (account, account_*_detail).  The conflicting tables are cleared
// with plain DELETE (no column references) which works regardless of schema.

type PrismaRole = "Mahasiswa" | "OrangTuaAsuh" | "Admin" | "Bankes" | "Pengurus_IOM" | "Guest" | "Pewawancara";
const typeToRole = (type: string): PrismaRole => {
  const map: Record<string, PrismaRole> = {
    mahasiswa: "Mahasiswa",
    ota: "OrangTuaAsuh",
    admin: "Admin",
    bankes: "Bankes",
    pengurus: "Pengurus_IOM",
  };
  return map[type] ?? "Guest";
};

let originalData: {
  accounts: any[];
  mahasiswaDetails: any[];
  otaDetails: any[];
  adminDetails: any[];
};

beforeAll(async () => {
  console.log("Backup all data before each tests...");
  // Only backup Drizzle-exclusive tables — Prisma-managed tables (otp, temporary_password,
  // push_subscription, connection, transaction) use Prisma camelCase columns after db push,
  // so Drizzle SELECT on them would fail with "column does not exist".
  originalData = {
    accounts: await db.select().from(accountTable),
    mahasiswaDetails: await db.select().from(accountMahasiswaDetailTable),
    otaDetails: await db.select().from(accountOtaDetailTable),
    adminDetails: await db.select().from(accountAdminDetailTable),
  };

  // Clear all tables.
  // DELETE (no WHERE) works regardless of column-name schema, so we use Drizzle's delete
  // helpers for the conflicting tables — they generate "DELETE FROM <table>" with no column refs.
  await db.transaction(async (tx) => {
    await tx.delete(connectionTable);
    await tx.delete(transactionTable);
    await tx.delete(temporaryPasswordTable);
    await tx.delete(otpTable);
    await tx.delete(pushSubscriptionTable);
    await tx.delete(accountAdminDetailTable);
    await tx.delete(accountOtaDetailTable);
    await tx.delete(accountMahasiswaDetailTable);
    await tx.delete(accountTable);
  });
  // Prisma-exclusive tables — use prisma to clear (cascades handle children)
  await prisma.user.deleteMany();

  console.log("Seeding database before each tests...");
  const hashedUsers = await Promise.all(
    testUsers.map(async (user) => ({
      ...user,
      password: await hash(user.password, 10),
    })),
  );

  // Seed Drizzle's "account" table (used by Drizzle-based test helpers)
  await db.insert(accountTable).values(hashedUsers).onConflictDoNothing();

  // Seed Prisma's "users" table (used by auth.controller.ts via prisma.user.findFirst)
  for (const user of hashedUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        password: user.password,
        role: typeToRole(user.type),
        provider: user.provider as "credentials" | "azure" | "keycloak",
        verificationStatus: user.status as "verified" | "unverified",
      },
      update: {
        email: user.email,
        phoneNumber: user.phoneNumber,
        password: user.password,
        role: typeToRole(user.type),
        provider: user.provider as "credentials" | "azure" | "keycloak",
        verificationStatus: user.status as "verified" | "unverified",
      },
    });
  }

  // Seed Prisma's "otp" table (Prisma owns this table after db push; uses userId not account_id)
  for (const otp of otpDatas) {
    await prisma.oTP.upsert({
      where: { userId_code: { userId: otp.accountId, code: otp.code } },
      create: { userId: otp.accountId, code: otp.code, expiredAt: otp.expiredAt },
      update: { expiredAt: otp.expiredAt },
    });
  }
});

afterAll(async () => {
  console.log("Cleaning up database after each tests...");

  // Remove Prisma test data (cascade deletes mahasiswaProfile, otaProfile, otp, etc.)
  const testIds = testUsers.map((u) => u.id);
  await prisma.user.deleteMany({ where: { id: { in: testIds } } });
  // Clean up users that may have been created by register tests
  const registerEmails = ["user4@test.com", "user7@test.com"];
  await prisma.user.deleteMany({ where: { email: { in: registerEmails } } });

  await db.transaction(async (tx) => {
    // Clear all Drizzle-managed tables
    await tx.delete(connectionTable);
    await tx.delete(transactionTable);
    await tx.delete(temporaryPasswordTable);
    await tx.delete(otpTable);
    await tx.delete(pushSubscriptionTable);
    await tx.delete(accountAdminDetailTable);
    await tx.delete(accountOtaDetailTable);
    await tx.delete(accountMahasiswaDetailTable);
    await tx.delete(accountTable);

    // Restore original Drizzle-exclusive data
    if (originalData.accounts.length > 0) {
      await tx.insert(accountTable).values(originalData.accounts);
    }
    if (originalData.mahasiswaDetails.length > 0) {
      await tx
        .insert(accountMahasiswaDetailTable)
        .values(originalData.mahasiswaDetails);
    }
    if (originalData.otaDetails.length > 0) {
      await tx.insert(accountOtaDetailTable).values(originalData.otaDetails);
    }
    if (originalData.adminDetails.length > 0) {
      await tx
        .insert(accountAdminDetailTable)
        .values(originalData.adminDetails);
    }
  });

  console.log("Database cleaned up and original data restored.");
});
