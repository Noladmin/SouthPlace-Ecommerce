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

    // Get date range from query params (default to last 30 days)
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get("days") || "30")
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get orders in date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        items: true,
      },
    })

    // Calculate analytics
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Status breakdown
    const statusBreakdown = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Daily revenue for chart
    const dailyRevenue = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + parseFloat(order.total.toString())
      return acc
    }, {} as Record<string, number>)

    // Top selling items
    const itemSales = orders.reduce((acc, order) => {
      order.items.forEach(item => {
        const key = item.itemName
        if (!acc[key]) {
          acc[key] = { name: key, quantity: 0, revenue: 0 }
        }
        acc[key].quantity += item.quantity
        acc[key].revenue += parseFloat(item.price.toString()) * item.quantity
      })
      return acc
    }, {} as Record<string, { name: string; quantity: number; revenue: number }>)

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    // Delivery method breakdown
    const deliveryBreakdown = orders.reduce((acc, order) => {
      acc[order.deliveryMethod] = (acc[order.deliveryMethod] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Payment method breakdown
    const paymentBreakdown = orders.reduce((acc, order) => {
      acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Recent orders (last 10)
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          take: 3, // Only include first 3 items for preview
        },
      },
    })

    // Growth metrics (compare with previous period)
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - days)
    
    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    })

    const previousRevenue = previousOrders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0)
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
    const orderGrowth = previousOrders.length > 0 ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalRevenue,
          averageOrderValue,
          revenueGrowth,
          orderGrowth,
        },
        statusBreakdown,
        dailyRevenue,
        topSellingItems,
        deliveryBreakdown,
        paymentBreakdown,
        recentOrders,
        dateRange: {
          start: startDate.toISOString(),
          end: new Date().toISOString(),
          days,
        },
      },
    })

  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 