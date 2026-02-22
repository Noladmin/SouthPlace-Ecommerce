import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { invoiceService } from "@/lib/services/invoice-service"
import { verifyAuth } from "@/lib/services/auth-service"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    // Verify authentication (customer or admin)
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const orderId = id

    // Fetch order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            extras: true,
          },
        },
        customer: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Check if user has access to this order
    const isAdmin = authResult.userId && order.customerId === authResult.userId // Simplified check for now
    const isOrderOwner = order.customerId === authResult.userId
    
    if (!isAdmin && !isOrderOwner) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Prepare order data for invoice
    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      deliveryAddress: `${order.deliveryAddress}, ${order.deliveryCity}`,
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || undefined,
      paymentIntentId: order.paymentIntentId || undefined,
      subtotal: parseFloat(order.subtotal.toString()),
      deliveryFee: parseFloat(order.deliveryFee.toString()),
      vatRate: parseFloat((order as any).vatRate?.toString?.() || "0"),
      vatAmount: parseFloat((order as any).vatAmount?.toString?.() || "0"),
      total: parseFloat(order.total.toString()),
      items: order.items.map(item => ({
        name: item.itemName,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
        variant: item.variantName || undefined,
        extras: (item.extras || []).map((ex: any) => ({
          name: ex.name,
          price: parseFloat(ex.price.toString()),
          quantity: ex.quantity,
        }))
      })),
      estimatedDelivery: order.deliveryMethod === 'EXPRESS' ? '30-45 minutes' : '45-60 minutes'
    }

    // Generate PDF invoice
    const invoiceBuffer = await invoiceService.generateInvoice(orderData)
    const filename = `invoice-${order.orderNumber}.pdf`

    // Return PDF as downloadable file
    return new NextResponse(invoiceBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': invoiceBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error("Invoice generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    )
  }
}
