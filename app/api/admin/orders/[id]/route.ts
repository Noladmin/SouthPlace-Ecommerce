import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { emailService } from "@/lib/services/email-service"
import type { OrderStatus } from "@/lib/types"
import { verifyAdminAuth } from "@/lib/services/admin-auth"

// Validation schema for order updates
const updateOrderSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PREPARING", "WAITING_FOR_PICKUP", "PICKED_UP", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "DELIVERY_FAILED", "CANCELLED"]),
  whatsappSent: z.boolean().optional(),
})

const STATUS_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["WAITING_FOR_PICKUP", "READY", "CANCELLED"],
  READY: ["WAITING_FOR_PICKUP", "CANCELLED"],
  WAITING_FOR_PICKUP: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["OUT_FOR_DELIVERY", "DELIVERY_FAILED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "DELIVERY_FAILED"],
  DELIVERY_FAILED: ["WAITING_FOR_PICKUP", "CANCELLED"],
}

const buildStatusTimestampUpdate = (status: OrderStatus) => {
  const now = new Date()
  switch (status) {
    case "CONFIRMED":
      return { confirmedAt: now }
    case "PREPARING":
      return { preparingAt: now }
    case "WAITING_FOR_PICKUP":
      return { waitingForPickupAt: now }
    case "PICKED_UP":
      return { pickedUpAt: now }
    case "OUT_FOR_DELIVERY":
      return { outForDeliveryAt: now }
    case "DELIVERED":
      return { deliveredAt: now }
    case "DELIVERY_FAILED":
      return { deliveryFailedAt: now }
    case "CANCELLED":
      return { cancelledAt: now }
    default:
      return {}
  }
}

// GET - Fetch single order with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.status }
      )
    }

    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
            extras: true,
          },
        },
        customer: true,
        activeDeliveryAssignment: true,
        deliveryAssignments: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.status }
      )
    }

    const { id } = await params
    
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateOrderSchema.parse(body)
    const requestedStatus = validatedData.status === "READY" ? "WAITING_FOR_PICKUP" : validatedData.status

    if (existingOrder.status !== requestedStatus) {
      const allowedTransitions = STATUS_TRANSITIONS[existingOrder.status as OrderStatus] || []
      if (!allowedTransitions.includes(requestedStatus)) {
        return NextResponse.json(
          { success: false, error: `Invalid status transition from ${existingOrder.status} to ${requestedStatus}` },
          { status: 400 }
        )
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: requestedStatus,
        whatsappSent: validatedData.whatsappSent,
        ...buildStatusTimestampUpdate(requestedStatus),
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            menuItem: true,
            extras: true,
          },
        },
        customer: true,
        activeDeliveryAssignment: true,
        deliveryAssignments: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    // Send status update email (async, don't wait for it)
    const orderData = {
      orderNumber: existingOrder.orderNumber,
      customerName: existingOrder.customerName,
      customerEmail: existingOrder.customerEmail,
      deliveryAddress: `${existingOrder.deliveryAddress}, ${existingOrder.deliveryCity}`,
      createdAt: existingOrder.createdAt,
      paymentMethod: existingOrder.paymentMethod,
      total: parseFloat(existingOrder.total.toString()),
      subtotal: parseFloat((existingOrder as any).subtotal?.toString?.() || existingOrder.total.toString()),
      deliveryFee: parseFloat((existingOrder as any).deliveryFee?.toString?.() || "0"),
    }

    if (requestedStatus === "DELIVERED") {
      emailService.sendOrderDelivered(orderData).catch(error => {
        console.error("Failed to send delivered email:", error)
      })
    } else {
      emailService.sendOrderStatusUpdate(orderData, requestedStatus).catch(error => {
        console.error("Failed to send status update email:", error)
      })
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: "Order updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating order:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 
