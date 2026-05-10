import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateSsoRole } from "@/lib/sso";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

type ApproveRequest = {
  userId: string;
  role: "Mahasiswa" | "Pewawancara" | "Pengurus_IOM";
};

/**
 * POST /api/admin/users/approve
 * 
 * Admin-only endpoint to approve a registered user and create their Keycloak account
 * 
 * Flow:
 * 1. Verify admin session
 * 2. Find local user (Guest)
 * 3. Call SSO API to create Keycloak account
 * 4. Update local user: set oid, provider, role, verificationStatus
 * 5. Return success
 */
export async function POST(req: Request) {
  try {
    // Check admin session
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "Admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { userId, role } = (await req.json()) as ApproveRequest;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 }
      );
    }

    console.log(`[Admin Approve] Processing user ${userId} with role ${role}`);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.oid) {
      return NextResponse.json(
        { error: "User does not have a Keycloak account yet" },
        { status: 400 }
      );
    }

    if (user.verificationStatus === "verified") {
      return NextResponse.json(
        { error: "User already approved" },
        { status: 400 }
      );
    }

    console.log(`[Admin Approve] Updating Keycloak role for ${user.email}`);

    await updateSsoRole({
      keycloakUserId: user.oid,
      role: roleToKeycloak(role),
    });

    console.log(`[Admin Approve] Keycloak role updated`);

    // Update local user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role as any,
        verificationStatus: "verified" as any
      }
    });

    console.log(`[Admin Approve] Local user updated`);

    return NextResponse.json({
      success: true,
      message: `User ${user.email} approved sebagai ${role} dan Keycloak account berhasil dibuat`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        oid: updatedUser.oid
      }
    }, { status: 200 });

  } catch (error) {
    console.error("[Admin Approve] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: "Failed to approve user",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

/**
 * Map local role to Keycloak role
 */
function roleToKeycloak(localRole: string): string {
  const mapping: Record<string, string> = {
    "Mahasiswa": "mahasiswa",
    "Pewawancara": "volunteer-pewawancara",
    "OrangTuaAsuh": "orang-tua-asuh",
    "Pengurus_IOM": "pengurus-bidang-1",
    "Admin": "admin",
    "Bankes": "bankes"
  };
  return mapping[localRole] || "mahasiswa";
}
