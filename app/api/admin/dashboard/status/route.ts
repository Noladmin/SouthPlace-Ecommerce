import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/auth-service"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request)
    if (!auth.success) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const [pending, confirmed, preparing, ready, outForDelivery, delivered, cancelled] = await Promise.all([
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.order.count({ where: { status: 'PREPARING' } }),
      prisma.order.count({ where: { status: 'READY' } }),
      prisma.order.count({ where: { status: 'OUT_FOR_DELIVERY' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
    ])

    return NextResponse.json({
      success: true,
      data: { pending, confirmed, preparing, ready, outForDelivery, delivered, cancelled }
    })
  } catch (error) {
    console.error('Status breakdown error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
} 