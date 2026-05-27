import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  context: { params: { period_id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "Admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const periodId = parseInt(context.params.period_id, 10);
    if (isNaN(periodId)) {
      return NextResponse.json({ message: "Invalid period ID" }, { status: 400 });
    }

    const period = await prisma.period.findUnique({ where: { id: periodId } });
    if (!period) {
      return NextResponse.json({ message: "Period not found" }, { status: 404 });
    }

    if (period.isCurrent || period.isOpen) {
      return NextResponse.json(
        { message: "Tidak dapat menghapus periode yang sedang aktif atau terbuka" },
        { status: 400 }
      );
    }

    const hasData = await prisma.bankesStatus.findFirst({ where: { periodId } });
    if (hasData) {
      return NextResponse.json(
        { message: "Tidak dapat menghapus periode yang sudah memiliki data mahasiswa" },
        { status: 400 }
      );
    }

    await prisma.period.delete({ where: { id: periodId } });

    return NextResponse.json({ message: "Period deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error deleting period" }, { status: 500 });
  }
}
