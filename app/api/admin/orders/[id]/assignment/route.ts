import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/admin-auth"
import { sendAssignmentAccessLink, sendDeliveryCodeNotifications } from "@/lib/services/delivery-service"

const assignmentSchema = z.discriminatedUnion("assignmentType", [
  z.object({
    assignmentType: z.literal("INTERNAL"),
    riderId: z.string().min(1),
    notes: z.string().optional(),
  }),
  z.object({
    assignmentType: z.literal("THIRD_PARTY"),
    riderName: z.string().min(2),
    riderPhone: z.string().min(7),
    riderEmail: z.string().email(),
  }),
])

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    const { id } = await params
    const body = await request.json()
    const validated = assignmentSchema.parse(body)

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        activeDeliveryAssignment: true,
      },
    })

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    if (!["WAITING_FOR_PICKUP", "READY", "PICKED_UP", "OUT_FOR_DELIVERY"].includes(order.status)) {
      return NextResponse.json({
        success: false,
        error: "You can only assign riders after the order is ready for pickup.",
      }, { status: 400 })
    }

    const assignment = await prisma.$transaction(async (tx) => {
      await tx.deliveryAssignment.updateMany({
        where: { orderId: id, isActive: true },
        data: { isActive: false, status: "CANCELLED" },
      })

      let riderData: Record<string, any> = {}
      if (validated.assignmentType === "INTERNAL") {
        const rider = await tx.rider.findUnique({ where: { id: validated.riderId } })
        if (!rider || !rider.isActive) {
          throw new Error("Selected rider is unavailable")
        }
        riderData = {
          riderId: rider.id,
          riderName: rider.name,
          riderPhone: rider.phone,
          riderEmail: rider.email,
          vehicleInfo: rider.vehicleInfo,
          notes: validated.notes,
        }
      } else {
        riderData = {
          riderName: validated.riderName,
          riderPhone: validated.riderPhone,
          riderEmail: validated.riderEmail,
        }
      }

      const createdAssignment = await tx.deliveryAssignment.create({
        data: {
          orderId: id,
          assignedByAdminId: authResult.admin.id,
          assignmentType: validated.assignmentType,
          ...riderData,
        },
        include: {
          order: true,
          rider: true,
          assignedByAdmin: true,
          verificationCodes: true,
        },
      })

      await tx.order.update({
        where: { id },
        data: {
          activeDeliveryAssignmentId: createdAssignment.id,
          status: order.status === "READY" ? "WAITING_FOR_PICKUP" : order.status,
          waitingForPickupAt: order.status === "READY" ? new Date() : undefined,
        },
      })

      return createdAssignment
    })

    await Promise.allSettled([
      sendDeliveryCodeNotifications({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
      }),
      assignment.riderPhone || assignment.riderEmail ? sendAssignmentAccessLink(assignment as any) : Promise.resolve(null),
    ])

    const refreshedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { menuItem: true, extras: true } },
        customer: true,
        activeDeliveryAssignment: true,
        deliveryAssignments: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: refreshedOrder,
      message: "Delivery assignment created successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("Error creating delivery assignment:", error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 })
  }
}
