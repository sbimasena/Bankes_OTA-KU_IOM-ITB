import { PrismaClient } from "../../generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding admin account...\n");

  const adminPassword = await bcrypt.hash("Admin123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@itb.ac.id" },
    update: {},
    create: {
      email: "admin@itb.ac.id",
      password: adminPassword,
      name: "Admin",
      role: "Admin",
      verificationStatus: "verified",
      applicationStatus: "accepted",
      AdminProfile: { create: { name: "Admin" } },
    },
  });

  console.log("✅ Admin account seeded (admin@itb.ac.id / Admin123!)");
}

main()
  .catch((error) => {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });