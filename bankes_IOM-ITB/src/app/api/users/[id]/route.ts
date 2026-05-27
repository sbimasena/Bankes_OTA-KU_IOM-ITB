// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';
import { deleteSsoAccount } from '@/lib/sso';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 *
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user by ID
 *     description: Permanently delete a user by their ID (Admin only)
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid user ID"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Error deleting user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error deleting user"
 *
 *   patch:
 *     tags: [Users]
 *     summary: Promote user role to Pengurus_IOM
 *     description: Updates a user's role to "Pengurus_IOM" (Admin only)
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to promote
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User role updated successfully"
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid user ID"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Error updating role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating user role"
 */


export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "Admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const userId = (await context.params).id;

  if (!userId) {
    return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { oid: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Hapus dari Keycloak dulu agar tidak ada ghost account yang blokir re-registrasi
    let ssoWarning: string | undefined;
    if (user.oid) {
      try {
        await deleteSsoAccount({ keycloakUserId: user.oid });
      } catch (ssoError) {
        console.error("Failed to delete Keycloak account:", ssoError);
        ssoWarning = `Akun berhasil dihapus dari database, tapi gagal dihapus dari Keycloak (oid: ${user.oid}). Hapus manual di Keycloak Admin Console.`;
      }
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: "User deleted successfully",
      ...(ssoWarning && { warning: ssoWarning }),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Error deleting user" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "Admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const userId = (await context.params).id;

  if (!userId) {
    return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 });
  }

  const body = await req.json();
  const { role } = body;
  if (!role || !["Mahasiswa", "Pengurus_IOM", "Pewawancara"].includes(role)) {
    return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // For Guest users (not approved yet), use /api/admin/users/approve endpoint instead
    if (user.role === "Guest" && !user.oid) {
      return NextResponse.json({ 
        success: false, 
        error: "Guest users must be approved via /api/admin/users/approve endpoint first" 
      }, { status: 400 });
    }

    // Update role di DB lokal only
    // Note: Keycloak role is set during initial approval via /api/admin/users/approve
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });

    return NextResponse.json({ 
      success: true,
      message: "User role updated successfully (local database only). To change Keycloak role, use admin approval flow.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        provider: updatedUser.provider
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Error updating user role" },
      { status: 500 }
    );
  }
}