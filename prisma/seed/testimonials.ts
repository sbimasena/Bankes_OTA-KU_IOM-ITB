import { PrismaClient, TestimonialStatus } from "../../generated/prisma";

type SeedTestimonial = {
  mahasiswaEmail: string;
  periodLabelContains: string;
  content: string;
  imageUrls: string[];
  status: TestimonialStatus;
  isActive: boolean;
  reviewed: boolean;
  rejectedReason?: string;
};

export async function seedTestimonials(prisma: PrismaClient) {
  console.log("Seeding testimonials...");

  const admin = await prisma.user.findFirst({
    where: { role: "Admin" },
    select: { id: true },
  });

  const periods = await prisma.period.findMany({
    select: { id: true, period: true },
  });

  const now = new Date();

  const rows: SeedTestimonial[] = [
    {
      mahasiswaEmail: "13599101@mahasiswa.itb.ac.id",
      periodLabelContains: "2025/2026",
      content:
        "Bantuan OTA sangat meringankan biaya kuliah dan kebutuhan harian saya. Saya jadi bisa lebih fokus belajar dan menyelesaikan tugas akhir tepat waktu.",
      imageUrls: [
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
      ],
      status: "shown",
      isActive: true,
      reviewed: true,
    },
    {
      mahasiswaEmail: "13299102@mahasiswa.itb.ac.id",
      periodLabelContains: "2025/2026",
      content:
        "Program ini membantu saya menjaga stabilitas biaya hidup di Bandung. Dukungan finansial dan perhatian dari OTA memberi motivasi besar untuk terus berprestasi.",
      imageUrls: [
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
      ],
      status: "shown",
      isActive: true,
      reviewed: true,
    },
    {
      mahasiswaEmail: "13199103@mahasiswa.itb.ac.id",
      periodLabelContains: "2025/2026",
      content:
        "Saya sangat terbantu dalam memenuhi kebutuhan praktikum yang cukup tinggi. Bantuan ini membuat saya tetap percaya diri untuk menuntaskan studi.",
      imageUrls: [],
      status: "not_shown",
      isActive: false,
      reviewed: false,
    },
    {
      mahasiswaEmail: "15199106@mahasiswa.itb.ac.id",
      periodLabelContains: "2024/2025",
      content:
        "Terima kasih kepada OTA yang sudah konsisten mendukung saya. Saya bisa mempertahankan IPK dengan baik karena beban finansial berkurang signifikan.",
      imageUrls: [
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
      ],
      status: "shown",
      isActive: true,
      reviewed: true,
    },
    {
      mahasiswaEmail: "12099107@mahasiswa.itb.ac.id",
      periodLabelContains: "2024/2025",
      content:
        "Bantuan ini sangat berarti untuk keberlanjutan studi saya. Saya berharap bisa membalas kebaikan ini dengan kontribusi nyata setelah lulus.",
      imageUrls: [],
      status: "not_shown",
      isActive: false,
      reviewed: true,
      rejectedReason: "Perbaiki redaksi agar lebih spesifik terhadap pengalaman program.",
    },
  ];

  for (const row of rows) {
    const user = await prisma.user.findUnique({
      where: { email: row.mahasiswaEmail },
      select: { id: true },
    });

    if (!user) {
      continue;
    }

    const period = periods.find((item) => item.period.includes(row.periodLabelContains));
    if (!period) {
      continue;
    }

    await prisma.testimonial.upsert({
      where: {
        mahasiswaId_periodId: {
          mahasiswaId: user.id,
          periodId: period.id,
        },
      },
      update: {
        content: row.content,
        imageUrls: row.imageUrls,
        status: row.status,
        isActive: row.isActive,
        approvedById: row.reviewed ? admin?.id ?? null : null,
        approvedAt: row.reviewed && row.status === "shown" ? now : null,
        reviewedAt: row.reviewed ? now : null,
        rejectedReason: row.status === "not_shown" ? row.rejectedReason ?? null : null,
      },
      create: {
        mahasiswaId: user.id,
        periodId: period.id,
        content: row.content,
        imageUrls: row.imageUrls,
        status: row.status,
        isActive: row.isActive,
        approvedById: row.reviewed ? admin?.id ?? null : null,
        approvedAt: row.reviewed && row.status === "shown" ? now : null,
        reviewedAt: row.reviewed ? now : null,
        rejectedReason: row.status === "not_shown" ? row.rejectedReason ?? null : null,
      },
    });
  }

  console.log("✅ Testimonials seeded");
}
