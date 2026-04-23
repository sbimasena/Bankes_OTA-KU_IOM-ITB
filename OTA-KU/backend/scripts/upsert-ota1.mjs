import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "ota1@example.com";
  const phone = "628111222333";
  const hashed = await hash("Password123!", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      phoneNumber: phone,
      password: hashed,
      role: "OrangTuaAsuh",
      provider: "credentials",
      verificationStatus: "verified",
      applicationStatus: "accepted",
    },
    create: {
      email,
      phoneNumber: phone,
      password: hashed,
      role: "OrangTuaAsuh",
      provider: "credentials",
      verificationStatus: "verified",
      applicationStatus: "accepted",
    },
  });

  await prisma.otaProfile.upsert({
    where: { userId: user.id },
    update: {
      name: "OTA 1",
      job: "Wiraswasta",
      address: "Bandung",
      linkage: "none",
      funds: 1000000,
      maxCapacity: 3,
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      maxSemester: 8,
      transferDate: 1,
      criteria: "-",
      isDetailVisible: true,
      allowAdminSelection: true,
    },
    create: {
      userId: user.id,
      name: "OTA 1",
      job: "Wiraswasta",
      address: "Bandung",
      linkage: "none",
      funds: 1000000,
      maxCapacity: 3,
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      maxSemester: 8,
      transferDate: 1,
      criteria: "-",
      isDetailVisible: true,
      allowAdminSelection: true,
    },
  });

  console.log(`ota1 ready, userId=${user.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
