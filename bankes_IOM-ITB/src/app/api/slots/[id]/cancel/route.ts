import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();
/**
 * @swagger
 * paths:
 *   /api/slots/{id}/cancel:
 *     post:
 *       tags:
 *         - Slots
 *       summary: Cancel a booking for a specific slot
 *       security:
 *         - CookieAuth: []
 *       parameters:
 *         - name: id
 *           in: path
 *           description: Numeric ID of the interview slot to cancel
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         '200':
 *           description: Booking cancelled successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     const: true
 *                   data:
 *                     $ref: '#/components/schemas/InterviewSlot'
 *         '400':
 *           description: Invalid slot ID
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '401':
 *           description: Not authenticated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '403':
 *           description: Unauthorized to cancel this booking
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '404':
 *           description: Slot not found
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '500':
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 */
// POST /api/slots/[id]/cancel - Cancel a booking
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Await params
  ) {
    try {
      const session = await getServerSession(authOptions);
  
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
  
      const { id } = await params; // Await params before using id
      const slotId = Number(id);
      if (isNaN(slotId)) {
        return NextResponse.json(
          { success: false, error: "Invalid slot ID" },
          { status: 400 }
        );
      }
  
      // Check if slot exists
      const slot = await prisma.interviewSlot.findUnique({
        where: { id: slotId },
      });
  
      if (!slot) {
        return NextResponse.json(
          { success: false, error: "Slot not found" },
          { status: 404 }
        );
      }
  
      // Allow cancellation if:
      // 1. Student cancelling their own booking
      // 2. IOM staff who created the slot
      const userRole = session.user.role;
      const userId = session.user.id;

      if (userRole === "Mahasiswa") {
        // Student can only cancel if they booked it
        if (slot.studentId !== userId) {
          return NextResponse.json(
            { success: false, error: "Unauthorized to cancel this booking" },
            { status: 403 }
          );
        }
      } else if (userRole === "Pengurus_IOM") {
        // IOM staff can only cancel if they created the slot
        if (slot.createdById !== userId) {
          return NextResponse.json(
            { success: false, error: "Unauthorized to cancel this booking" },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: "Unauthorized role" },
          { status: 403 }
        );
      }

      // Cancel the booking
      const updatedSlot = await prisma.interviewSlot.update({
        where: { id: slotId },
        data: {
          studentId: null,
          bookedAt: null,
        },
      });

      // Delete the associated notes
      await prisma.interviewNote.deleteMany({
        where: {
          slotId: slotId,
          userId: slot.studentId as string
        },
      });
  
      return NextResponse.json({
        success: true,
        data: updatedSlot,
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      return NextResponse.json(
        { success: false, error: "Failed to cancel booking" },
        { status: 500 }
      );
    }
  }