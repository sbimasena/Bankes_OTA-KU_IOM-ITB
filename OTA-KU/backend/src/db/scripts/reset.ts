import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import { fileURLToPath } from "url";

import { db } from "../drizzle.js";
import {
  accountMahasiswaDetailTable,
  accountOtaDetailTable,
  accountTable,
  connectionTable,
} from "../schema.js";
import { seed } from "./seed.js";

export async function resetDatabase() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  try {
    await db.transaction(async (tx) => {
      console.log("Starting database reset...");

      // 1. Clear all tables in reverse order of dependencies
      console.log("Clearing existing data...");

      // First delete connections (which depend on both mahasiswa and ota)
      await tx.delete(connectionTable);

      // Then delete detail tables
      await tx.delete(accountMahasiswaDetailTable);
      await tx.delete(accountOtaDetailTable);

      // Finally delete accounts
      await tx.delete(accountTable);

      console.log("Database cleared successfully");

      // 2. Run migrations to ensure schema is up to date
      console.log("Running migrations...");
      await migrate(tx, {
        migrationsFolder: path.resolve(__dirname, "../migrations"),
      }).then(() => {
        console.log("Migrations completed successfully");
      });
    });

    await seed();

    console.log("Database reset completed successfully!");
  } catch (error) {
    console.error("Error resetting database:", error);
  } finally {
    // Close the database connection
    console.log("Closing database connection...");
  }
}
