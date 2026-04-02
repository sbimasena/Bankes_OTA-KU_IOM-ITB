import { PrismaClient } from "../../generated/prisma";
import { addMonths, setDate as setDateFn } from "date-fns";

export async function seedConnections(prisma: PrismaClient) {
  console.log("Seeding connections and transactions...");

  // Pasangan koneksi: mahasiswaEmail → otaEmail
  const connectionPairs = [
    { mahasiswaEmail: "13599101@mahasiswa.itb.ac.id", otaEmail: "ota1@example.com", transferDate: 5 },
    { mahasiswaEmail: "13299102@mahasiswa.itb.ac.id", otaEmail: "ota1@example.com", transferDate: 5 },
    { mahasiswaEmail: "13199103@mahasiswa.itb.ac.id", otaEmail: "ota2@example.com", transferDate: 10 },
    { mahasiswaEmail: "15199106@mahasiswa.itb.ac.id", otaEmail: "ota3@example.com", transferDate: 1 },
    { mahasiswaEmail: "12099107@mahasiswa.itb.ac.id", otaEmail: "ota4@example.com", transferDate: 15 },
    { mahasiswaEmail: "15499108@mahasiswa.itb.ac.id", otaEmail: "ota5@example.com", transferDate: 7 },
    { mahasiswaEmail: "13199112@mahasiswa.itb.ac.id", otaEmail: "ota8@example.com", transferDate: 12 },
    { mahasiswaEmail: "10199114@mahasiswa.itb.ac.id", otaEmail: "ota10@example.com", transferDate: 1 },
    // Pending connections
    { mahasiswaEmail: "15099104@mahasiswa.itb.ac.id", otaEmail: "ota6@example.com", transferDate: 20, status: "pending" as const },
    { mahasiswaEmail: "15099109@mahasiswa.itb.ac.id", otaEmail: "ota7@example.com", transferDate: 3, status: "pending" as const },
  ];

  const now = new Date();

  for (const pair of connectionPairs) {
    const mahasiswaUser = await prisma.user.findUnique({
      where: { email: pair.mahasiswaEmail },
      include: { MahasiswaProfile: true },
    });
    const otaUser = await prisma.user.findUnique({
      where: { email: pair.otaEmail },
      include: { OtaProfile: true },
    });

    if (!mahasiswaUser?.MahasiswaProfile || !otaUser?.OtaProfile) continue;

    const connectionStatus = pair.status ?? "accepted";
    const paidFor = connectionStatus === "accepted" ? 3 : 0;

    // Upsert connection
    const existing = await prisma.connection.findUnique({
      where: {
        mahasiswaId_otaId: {
          mahasiswaId: mahasiswaUser.id,
          otaId: otaUser.id,
        },
      },
    });
    if (existing) continue;

    await prisma.connection.create({
      data: {
        mahasiswaId: mahasiswaUser.id,
        otaId: otaUser.id,
        connectionStatus,
        paidFor,
      },
    });

    // Seed transaksi untuk accepted connections
    if (connectionStatus === "accepted") {
      const bill = otaUser.OtaProfile.funds;

      for (let month = 0; month < 3; month++) {
        const dueDate = setDateFn(addMonths(now, month), pair.transferDate);

        await prisma.transaction.create({
          data: {
            mahasiswaId: mahasiswaUser.id,
            otaId: otaUser.id,
            bill,
            amountPaid: bill,
            paidAt: month < 2 ? addMonths(now, month) : null,
            dueDate,
            transactionStatus: month < 2 ? "paid" : "unpaid",
            transferStatus: month < 2 ? "paid" : "unpaid",
            paidFor: month + 1,
          },
        });
      }
    }
  }

  console.log("✅ Connections and transactions seeded");
}
