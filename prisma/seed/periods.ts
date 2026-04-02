import { PrismaClient } from "../../generated/prisma";

export async function seedPeriods(prisma: PrismaClient) {
  console.log("Seeding periods and Bankes questions...");

  // ── Periode seleksi IOM ────────────────────────────────────────────────────
  const period1 = await prisma.period.upsert({
    where: { id: 1 },
    update: {},
    create: {
      period: "Periode 1 – 2024/2025",
      startDate: new Date("2025-04-01T08:00:00Z"),
      endDate: new Date("2025-04-30T17:00:00Z"),
      isCurrent: false,
      isOpen: false,
    },
  });

  const period2 = await prisma.period.upsert({
    where: { id: 2 },
    update: {},
    create: {
      period: "Periode 2 – 2025/2026",
      startDate: new Date("2025-09-01T08:00:00Z"),
      endDate: new Date("2025-09-30T17:00:00Z"),
      isCurrent: true,
      isOpen: true,
    },
  });

  console.log("✅ Periods seeded");

  // ── Bank soal wawancara ────────────────────────────────────────────────────
  const questions = [
    "Ceritakan tentang diri kamu dan mengapa kamu membutuhkan beasiswa ini.",
    "Apa rencana kamu setelah lulus dari ITB?",
    "Bagaimana kamu mengelola waktu antara kuliah, organisasi, dan kehidupan sehari-hari?",
    "Apa pencapaian akademik atau non-akademik yang paling kamu banggakan?",
    "Bagaimana kondisi finansial keluarga kamu dan bagaimana itu mempengaruhi studi kamu?",
  ];

  for (const q of questions) {
    await prisma.question.create({ data: { question: q } });
  }

  console.log("✅ Questions seeded");

  // ── BankesStatus untuk mahasiswa yang accepted ────────────────────────────
  const acceptedMahasiswaEmails = [
    "13599101@mahasiswa.itb.ac.id",
    "13299102@mahasiswa.itb.ac.id",
    "13199103@mahasiswa.itb.ac.id",
    "15199106@mahasiswa.itb.ac.id",
    "12099107@mahasiswa.itb.ac.id",
    "15499108@mahasiswa.itb.ac.id",
    "13199112@mahasiswa.itb.ac.id",
    "13099113@mahasiswa.itb.ac.id",
    "10199114@mahasiswa.itb.ac.id",
    "15299115@mahasiswa.itb.ac.id",
    "10399117@mahasiswa.itb.ac.id",
    "13599118@mahasiswa.itb.ac.id",
  ];

  const pendingEmails = [
    "15099104@mahasiswa.itb.ac.id",
    "15099109@mahasiswa.itb.ac.id",
    "15499110@mahasiswa.itb.ac.id",
    "19099116@mahasiswa.itb.ac.id",
  ];

  // Ambil userId untuk semua mahasiswa di atas
  for (const email of acceptedMahasiswaEmails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) continue;

    // Cek apakah sudah ada status
    const existingStatus = await prisma.bankesStatus.findUnique({
      where: { userId_periodId: { userId: user.id, periodId: period1.id } },
    });
    if (existingStatus) continue;

    await prisma.bankesStatus.create({
      data: {
        userId: user.id,
        periodId: period1.id,
        passDitmawa: true,
        passIOM: true,
        passInterview: true,
        amount: 500000,
      },
    });
  }

  for (const email of pendingEmails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) continue;

    const existingStatus = await prisma.bankesStatus.findUnique({
      where: { userId_periodId: { userId: user.id, periodId: period2.id } },
    });
    if (existingStatus) continue;

    await prisma.bankesStatus.create({
      data: {
        userId: user.id,
        periodId: period2.id,
        passDitmawa: true,
        passIOM: false,
        passInterview: false,
        amount: null,
      },
    });
  }

  console.log("✅ BankesStatus seeded");

  return { period1, period2 };
}
