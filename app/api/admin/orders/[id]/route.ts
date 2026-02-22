import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/services/jwt-service"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { emailService } from "@/lib/services/email-service"
import type { OrderStatus } from "@/lib/types"

// Validation schema for order updates
const updateOrderSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
  whatsappSent: z.boolean().optional(),
})

// Helper function to verify admin authentication
const verifyAdminAuth = async (request: NextRequest) => {
  const token = request.cookies.get("admin-token")?.value
  
  if (!token) {
    return { success: false, message: "No token provided", status: 401 }
  }

  const tokenResult = verifyToken(token)
  if (!tokenResult.valid || !tokenResult.payload) {
    return { success: false, message: "Invalid token", status: 401 }
  }

  const admin = await prisma.admin.findUnique({
    where: { id: tokenResult.payload.id },
  })

  if (!admin || !admin.isActive) {
    return { success: false, message: "Admin not found or inactive", status: 401 }
  }

  return { success: true, admin }
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

    // Update order
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: validatedData.status,
        whatsappSent: validatedData.whatsappSent,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            menuItem: true,
            extras: true,
          },
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

    if (validatedData.status === "DELIVERED") {
      emailService.sendOrderDelivered(orderData).catch(error => {
        console.error("Failed to send delivered email:", error)
      })
    } else {
      emailService.sendOrderStatusUpdate(orderData, validatedData.status).catch(error => {
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
