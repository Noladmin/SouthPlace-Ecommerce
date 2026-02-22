import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/services/jwt-service"
import { prisma } from "@/lib/db"

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

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.status }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get("format") || "csv"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const status = searchParams.get("status")

    // Build where clause
    const where: any = {}
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }
    
    if (status && status !== "ALL") {
      where.status = status
    }

    // Get orders with items
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            extras: true,
          },
        },
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    if (format === "json") {
      return NextResponse.json({
        success: true,
        data: orders,
        total: orders.length,
      })
    }

    // Generate CSV
    const csvHeaders = [
      "Order Number",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Delivery Address",
      "Delivery City",
      "Delivery Method",
      "Payment Method",
      "Status",
      "Subtotal",
      "Delivery Fee",
      "VAT Rate",
      "VAT Amount",
      "Total",
      "Items",
      "Special Instructions",
      "Order Date",
      "Last Updated",
    ]

    const csvRows = orders.map(order => [
      order.orderNumber,
      order.customerName,
      order.customerEmail || "",
      order.customerPhone,
      order.deliveryAddress,
      order.deliveryCity,
      order.deliveryMethod,
      order.paymentMethod,
      order.status,
      order.subtotal.toString(),
      order.deliveryFee.toString(),
      (order as any).vatRate?.toString?.() || "0",
      (order as any).vatAmount?.toString?.() || "0",
      order.total.toString(),
      order.items.map((item: any) => {
        const extras = item.extras && item.extras.length
          ? ` + extras: ${item.extras.map((ex: any) => ex.name).join(", ")}`
          : ""
        return `${item.itemName} (${item.quantity}x)${extras}`
      }).join("; "),
      order.specialInstructions || "",
      order.createdAt.toISOString(),
      order.updatedAt.toISOString(),
    ])

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })

  } catch (error) {
    console.error("Order export error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 
