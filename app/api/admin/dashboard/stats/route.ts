import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/auth-service"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request)
    if (!auth.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Today's date range
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(startOfDay)
    endOfDay.setDate(endOfDay.getDate() + 1)

    const [
      totalOrders,
      totalRevenueAgg,
      totalCustomers,
      totalMenuItems,
      pendingOrders,
      todayOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      prisma.customer.count(),
      prisma.menuItem.count({ where: { isActive: true } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { createdAt: { gte: startOfDay, lt: endOfDay } } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenueAgg._sum.total || 0,
        totalCustomers,
        totalMenuItems,
        pendingOrders,
        todayOrders,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
} 