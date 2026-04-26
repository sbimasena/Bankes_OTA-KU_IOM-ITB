import { PrismaClient } from "../../generated/prisma";
import { seedUsers } from "./users";
import { seedOtaProfiles } from "./ota-profiles";
import { seedPeriods } from "./periods";
import { seedConnections } from "./connections";
import { seedTestimonials } from "./testimonials";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting unified database seed...\n");

  // 1. Users + MahasiswaProfiles (shared — Bankes & OTA)
  await seedUsers(prisma);

  // 2. OTA Donor profiles
  await seedOtaProfiles(prisma);

  // 3. Periods, BankesStatus, Questions (Bankes-specific)
  await seedPeriods(prisma);

  // 4. OTA Connections + Transactions (OTA-specific)
  await seedConnections(prisma);

  // 5. OTA Testimonials
  await seedTestimonials(prisma);

  console.log("\n✅ All seeds completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
