import { PrismaClient, TestimonialStatus } from "../../generated/prisma";

type SeedTestimonial = {
  mahasiswaEmail: string;
  content: string;
  imageUrls: string[];
  status: TestimonialStatus;
  isActive: boolean;
};

export async function seedTestimonials(prisma: PrismaClient) {
  console.log("Seeding testimonials...");

  const admin = await prisma.user.findFirst({
    where: { role: "Admin" },
    select: { id: true },
  });

  const now = new Date();

  const rows: SeedTestimonial[] = [
    {
      mahasiswaEmail: "13599101@mahasiswa.itb.ac.id",
      content:
        "Bantuan OTA sangat meringankan biaya kuliah dan kebutuhan harian saya. Saya jadi bisa lebih fokus belajar dan menyelesaikan tugas akhir tepat waktu.",
      imageUrls: [
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
      ],
      status: "shown",
      isActive: true,
    },
    {
      mahasiswaEmail: "13299102@mahasiswa.itb.ac.id",
      content:
        "Program ini membantu saya menjaga stabilitas biaya hidup di Bandung. Dukungan finansial dan perhatian dari OTA memberi motivasi besar untuk terus berprestasi.",
      imageUrls: [
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
      ],
      status: "shown",
      isActive: true,
    },
    {
      mahasiswaEmail: "13199103@mahasiswa.itb.ac.id",
      content:
        "Saya sangat terbantu dalam memenuhi kebutuhan praktikum yang cukup tinggi. Bantuan ini membuat saya tetap percaya diri untuk menuntaskan studi.",
      imageUrls: [],
      status: "not_shown",
      isActive: false,
    },
    {
      mahasiswaEmail: "15199106@mahasiswa.itb.ac.id",
      content:
        "Terima kasih kepada OTA yang sudah konsisten mendukung saya. Saya bisa mempertahankan IPK dengan baik karena beban finansial berkurang signifikan.",
      imageUrls: [
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
      ],
      status: "shown",
      isActive: true,
    },
    {
      mahasiswaEmail: "12099107@mahasiswa.itb.ac.id",
      content:
        "Bantuan ini sangat berarti untuk keberlanjutan studi saya. Saya berharap bisa membalas kebaikan ini dengan kontribusi nyata setelah lulus.",
      imageUrls: [],
      status: "not_shown",
      isActive: false,
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

    const acceptedConnection = await prisma.connection.findFirst({
      where: {
        mahasiswaId: user.id,
        connectionStatus: "accepted",
      },
      orderBy: { updatedAt: "desc" },
      select: { otaId: true },
    });

    if (!acceptedConnection) {
      continue;
    }

    await prisma.testimonial.upsert({
      where: {
        mahasiswaId: user.id,
      },
      update: {
        otaId: acceptedConnection.otaId,
        content: row.content,
        imageUrls: row.imageUrls,
        status: row.status,
        isActive: row.isActive,
      },
      create: {
        mahasiswaId: user.id,
        otaId: acceptedConnection.otaId,
        content: row.content,
        imageUrls: row.imageUrls,
        status: row.status,
        isActive: row.isActive,
      },
    });
  }

  console.log("✅ Testimonials seeded");
}
