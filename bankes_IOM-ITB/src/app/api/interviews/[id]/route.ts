import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

/**
 * NOTE: The old Interview aggregate model no longer exists in the unified schema.
 * InterviewSlots are now standalone records. These endpoints have been updated
 * to operate directly on InterviewSlot records.
 */

// GET /api/interviews/[id] - Get a single slot by ID (replaces interview lookup)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "Pengurus_IOM") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const slotId = Number(params.id);
    if (isNaN(slotId)) {
      return NextResponse.json(
        { success: false, error: "Invalid slot ID" },
        { status: 400 }
      );
    }

    const slot = await prisma.interviewSlot.findUnique({
      where: { id: slotId },
      include: {
        Participants: true,
        Notes: true,
      },
    });

    if (!slot) {
      return NextResponse.json(
        { success: false, error: "Slot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: slot,
    });
  } catch (error) {
    console.error("Error fetching slot:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch slot" },
      { status: 500 }
    );
  }
}

// DELETE /api/interviews/[id] - Delete a slot
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "Pengurus_IOM") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const slotId = Number(params.id);
    if (isNaN(slotId)) {
      return NextResponse.json(
        { success: false, error: "Invalid slot ID" },
        { status: 400 }
      );
    }

    const existingSlot = await prisma.interviewSlot.findUnique({
      where: { id: slotId },
    });

    if (!existingSlot) {
      return NextResponse.json(
        { success: false, error: "Slot not found" },
        { status: 404 }
      );
    }

    if (existingSlot.createdById !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.interviewSlot.delete({
      where: { id: slotId },
    });

    return NextResponse.json({
      success: true,
      message: "Slot deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete slot" },
      { status: 500 }
    );
  }
}
