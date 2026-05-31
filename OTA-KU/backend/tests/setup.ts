import { hash } from "bcrypt";
import { afterAll, beforeAll } from "vitest";

import { db } from "../src/db/drizzle.js";
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

let originalData: {
  accounts: any[];
  mahasiswaDetails: any[];
  otaDetails: any[];
  adminDetails: any[];
  connections: any[];
  transactions: any[];
  otps: any[];
  temporaryPasswords: any[];
  pushSubscriptions: any[];
};

beforeAll(async () => {
  console.log("Backup all data before each tests...");
  originalData = {
    accounts: await db.select().from(accountTable),
    mahasiswaDetails: await db.select().from(accountMahasiswaDetailTable),
    otaDetails: await db.select().from(accountOtaDetailTable),
    adminDetails: await db
      .select()
      .from(accountAdminDetailTable),
    connections: await db.select().from(connectionTable),
    transactions: await db.select().from(transactionTable),
    otps: await db.select().from(otpTable),
    temporaryPasswords: await db.select().from(temporaryPasswordTable),
    pushSubscriptions: await db.select().from(pushSubscriptionTable),
  };

  await db.transaction(async (tx) => {
    // Clear all tables
    await tx.delete(connectionTable);
    await tx.delete(accountAdminDetailTable);
    await tx.delete(accountOtaDetailTable);
    await tx.delete(accountMahasiswaDetailTable);
    await tx.delete(accountTable);
    await tx.delete(transactionTable);
    await tx.delete(otpTable);
    await tx.delete(temporaryPasswordTable);
    await tx.delete(pushSubscriptionTable);
  });

  console.log("Seeding database before each tests...");
  const hashedUsers = await Promise.all(
    testUsers.map(async (user) => ({
      ...user,
      password: await hash(user.password, 10),
    })),
  );
  await db.insert(accountTable).values(hashedUsers).onConflictDoNothing();
  await db.insert(otpTable).values(otpDatas).onConflictDoNothing();
});

afterAll(async () => {
  console.log("Cleaning up database after each tests...");
  await db.transaction(async (tx) => {
    // Clear all tables
    await tx.delete(connectionTable);
    await tx.delete(accountAdminDetailTable);
    await tx.delete(accountOtaDetailTable);
    await tx.delete(accountMahasiswaDetailTable);
    await tx.delete(accountTable);
    await tx.delete(transactionTable);
    await tx.delete(otpTable);
    await tx.delete(temporaryPasswordTable);
    await tx.delete(pushSubscriptionTable);

    // Reinsert original data
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
    if (originalData.connections.length > 0) {
      await tx.insert(connectionTable).values(originalData.connections);
    }
    if (originalData.transactions.length > 0) {
      await tx.insert(transactionTable).values(originalData.transactions);
    }
    if (originalData.otps.length > 0) {
      await tx.insert(otpTable).values(originalData.otps);
    }
    if (originalData.temporaryPasswords.length > 0) {
      await tx
        .insert(temporaryPasswordTable)
        .values(originalData.temporaryPasswords);
    }
    if (originalData.pushSubscriptions.length > 0) {
      await tx
        .insert(pushSubscriptionTable)
        .values(originalData.pushSubscriptions);
    }
  });

  console.log("Database cleaned up and original data restored.");
});
