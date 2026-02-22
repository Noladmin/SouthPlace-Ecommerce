import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Order number is required" },
        { status: 400 }
      )
    }

    // Find order by order number
    const order = await prisma.order.findUnique({
      where: { orderNumber },
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

    // Return order details (without sensitive information)
    const orderDetails = {
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      deliveryMethod: order.deliveryMethod,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      vatRate: (order as any).vatRate || 0,
      vatAmount: (order as any).vatAmount || 0,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        name: item.itemName,
        quantity: item.quantity,
        unitPrice: item.price,
        extras: (item.extras || []).map(ex => ({
          name: ex.name,
          price: ex.price,
          quantity: ex.quantity,
        })),
        totalPrice: (parseFloat(item.price.toString()) + (item.extras || []).reduce((sum, ex) => sum + parseFloat(ex.price.toString()), 0)) * item.quantity,
        variant: item.variantName,
      })),
    }

    return NextResponse.json({
      success: true,
      data: orderDetails,
    })

  } catch (error) {
    console.error("Order tracking error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 
