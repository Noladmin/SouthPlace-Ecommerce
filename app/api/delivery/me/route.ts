import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyDeliverySessionToken } from "@/lib/services/delivery-service"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("delivery-access")?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const verified = verifyDeliverySessionToken(token)
    if (!verified.valid || !verified.assignmentId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id: verified.assignmentId },
      include: {
        order: {
          include: {
            items: {
              include: {
                extras: true,
              },
            },
          },
        },
        rider: true,
      },
    })

    if (!assignment || !assignment.isActive) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: assignment })
  } catch (error) {
    console.error("Delivery me error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
