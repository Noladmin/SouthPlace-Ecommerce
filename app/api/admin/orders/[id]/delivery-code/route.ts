import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/admin-auth"
import { sendDeliveryCodeNotifications } from "@/lib/services/delivery-service"

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
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    await sendDeliveryCodeNotifications({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
    })

    return NextResponse.json({ success: true, message: "Delivery code sent successfully" })
  } catch (error) {
    console.error("Error sending delivery code:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
