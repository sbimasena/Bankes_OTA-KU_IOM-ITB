import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/dashboard/mahasiswa
 *
 * Endpoint publik untuk kelompok lain yang membutuhkan data mahasiswa dari sistem Bankes.
 * Tidak memerlukan autentikasi — hanya mengembalikan data yang aman untuk dikonsumsi eksternal.
 *
 * Response JSON:
 * {
 *   "status": "success",
 *   "message": "Data berhasil diambil",
 *   "data": [
 *     {
 *       "id": "<uuid>",
 *       "nim": "13520001",
 *       "name": "Budi Santoso",
 *       "faculty": "STEI_K",
 *       "major": "Teknik_Informatika",
 *       "gpa": 3.85,
 *       "bankesStatus": "verified",
 *       "billAmount": 0,
 *       "applicationStatus": "pending"
 *     }
 *   ]
 * }
 */
export async function GET() {
  try {
    // Ambil semua mahasiswa yang sudah mengisi profil (minimal memiliki nim & name)
    const mahasiswaList = await prisma.mahasiswaProfile.findMany({
      where: {
        name: { not: null },
      },
      select: {
        userId: true,
        nim: true,
        name: true,
        faculty: true,
        major: true,
        gpa: true,
        bill: true,
        // Ambil verificationStatus dan applicationStatus dari tabel User (relasi)
        User: {
          select: {
            verificationStatus: true,
            applicationStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = mahasiswaList.map((m) => ({
      id: m.userId,
      nim: m.nim,
      name: m.name ?? "",
      faculty: m.faculty ?? null,   // e.g. "STEI_K"
      major: m.major ?? null,       // e.g. "Teknik_Informatika"
      gpa: m.gpa ? Number(m.gpa) : null,
      bankesStatus: m.User.verificationStatus,   // "verified" | "unverified"
      billAmount: m.bill,
      applicationStatus: m.User.applicationStatus, // "pending" | "accepted" | "rejected" | ...
    }));

    return NextResponse.json(
      {
        status: "success",
        message: "Data berhasil diambil",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[dashboard/mahasiswa] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Terjadi kesalahan pada server",
        data: [],
      },
      { status: 500 }
    );
  }
}
