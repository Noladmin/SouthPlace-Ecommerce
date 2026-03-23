import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { verifyDeliverySessionToken, verifyDeliveryCode } from "@/lib/services/delivery-service"
import { emailService } from "@/lib/services/email-service"

const actionSchema = z.object({
  action: z.enum(["PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"]),
  code: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("delivery-access")?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const verified = verifyDeliverySessionToken(token)
    const { id } = await params
    if (!verified.valid || verified.assignmentId !== id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = actionSchema.parse(body)

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id },
      include: { order: true },
    })

    if (!assignment || !assignment.isActive) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 })
    }

    if (validated.action === "DELIVERED") {
      if (!validated.code) {
        return NextResponse.json({ success: false, error: "Delivery code is required" }, { status: 400 })
      }

      const codeResult = await verifyDeliveryCode(assignment.orderId, validated.code)
      if (!codeResult.valid) {
        return NextResponse.json({ success: false, error: codeResult.message }, { status: 400 })
      }
    }

    const now = new Date()
    const assignmentData =
      validated.action === "PICKED_UP"
        ? { status: "PICKED_UP" as const, pickedUpAt: now }
        : validated.action === "OUT_FOR_DELIVERY"
          ? { status: "OUT_FOR_DELIVERY" as const, outForDeliveryAt: now }
          : { status: "DELIVERED" as const, deliveredAt: now, isActive: false }

    const orderStatus =
      validated.action === "PICKED_UP"
        ? "PICKED_UP"
        : validated.action === "OUT_FOR_DELIVERY"
          ? "OUT_FOR_DELIVERY"
          : "DELIVERED"

    const updated = await prisma.$transaction(async (tx) => {
      const updatedAssignment = await tx.deliveryAssignment.update({
        where: { id },
        data: assignmentData,
        include: {
          order: {
            include: {
              items: { include: { extras: true } },
            },
          },
          rider: true,
        },
      })

      await tx.order.update({
        where: { id: assignment.orderId },
        data: {
          status: orderStatus,
          activeDeliveryAssignmentId: validated.action === "DELIVERED" ? null : id,
          pickedUpAt: validated.action === "PICKED_UP" ? now : undefined,
          outForDeliveryAt: validated.action === "OUT_FOR_DELIVERY" ? now : undefined,
          deliveredAt: validated.action === "DELIVERED" ? now : undefined,
        },
      })

      return updatedAssignment
    })

    if (validated.action === "DELIVERED" && assignment.order.customerEmail) {
      emailService.sendOrderDelivered({
        orderNumber: assignment.order.orderNumber,
        customerName: assignment.order.customerName,
        customerEmail: assignment.order.customerEmail,
        deliveryAddress: `${assignment.order.deliveryAddress}, ${assignment.order.deliveryCity}`,
        createdAt: assignment.order.createdAt,
        paymentMethod: assignment.order.paymentMethod,
        total: Number(assignment.order.total),
        subtotal: Number(assignment.order.subtotal),
        deliveryFee: Number(assignment.order.deliveryFee),
      }).catch((error) => {
        console.error("Failed to send delivered email:", error)
      })
    }

    return NextResponse.json({ success: true, data: updated, message: "Delivery updated successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("Delivery action error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
