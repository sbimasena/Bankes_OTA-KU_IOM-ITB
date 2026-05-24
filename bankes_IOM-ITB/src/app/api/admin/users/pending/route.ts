import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

/**
 * GET /api/admin/users/pending
 * 
 * Admin-only endpoint to get list of pending Guest users waiting for approval
 */
export async function GET(req: Request) {
  try {
    // Check admin session
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Get all Guest users (pending approval)
    const pendingUsers = await prisma.user.findMany({
      where: {
        role: "Guest",
        oid: null  // No Keycloak account yet
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    console.log(`[Admin Pending] Found ${pendingUsers.length} pending users`);

    return NextResponse.json({
      success: true,
      total: pendingUsers.length,
      users: pendingUsers,
      availableRoles: ["Mahasiswa", "Pengurus_IOM", "Pewawancara"]
    }, { status: 200 });

  } catch (error) {
    console.error("[Admin Pending] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: "Failed to fetch pending users",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
