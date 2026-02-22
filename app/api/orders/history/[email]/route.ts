import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Validation schema for email
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params
    const decodedEmail = decodeURIComponent(email)
    
    // Validate email
    const validatedEmail = emailSchema.parse({ email: decodedEmail })

    // Find orders by email
    const orders = await prisma.order.findMany({
      where: { 
        customerEmail: validatedEmail.email.toLowerCase(),
      },
      include: {
        items: {
          include: {
            menuItem: true,
            extras: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Return order history (without sensitive information)
    const orderHistory = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      deliveryMethod: order.deliveryMethod,
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
    }))

    return NextResponse.json({
      success: true,
      data: {
        email: validatedEmail.email,
        orders: orderHistory,
        totalOrders: orderHistory.length,
      },
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      )
    }

    console.error("Order history error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 
