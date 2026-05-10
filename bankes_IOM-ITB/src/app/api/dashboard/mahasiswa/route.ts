import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/dashboard/mahasiswa
 *
 * Endpoint publik untuk kelompok lain yang membutuhkan data mahasiswa dari sistem Bankes.
 * Tidak memerlukan autentikasi.
 *
 * Strategi query:
 *   - Query dari tabel `User` dengan role "Mahasiswa" (bukan dari MahasiswaProfile)
 *   - Sehingga semua akun mahasiswa tampil, meski belum mengisi profil lengkap
 *   - Data profil (nim, name, faculty, dll) diambil dari relasi MahasiswaProfile
 */
export async function GET() {
  try {
    const userList = await prisma.user.findMany({
      where: {
        role: "Mahasiswa",
      },
      select: {
        id: true,
        verificationStatus: true,
        applicationStatus: true,
        MahasiswaProfile: {
          select: {
            nim: true,
            name: true,
            faculty: true,
            major: true,
            gpa: true,
            bill: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = userList.map((u) => ({
      id: u.id,
      nim: u.MahasiswaProfile?.nim ?? "",
      name: u.MahasiswaProfile?.name ?? "",
      faculty: u.MahasiswaProfile?.faculty ?? null,
      major: u.MahasiswaProfile?.major ?? null,
      gpa: u.MahasiswaProfile?.gpa ? Number(u.MahasiswaProfile.gpa) : null,
      bankesStatus: u.verificationStatus,       // "verified" | "unverified"
      billAmount: u.MahasiswaProfile?.bill ?? 0,
      applicationStatus: u.applicationStatus,   // "pending" | "accepted" | ...
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
