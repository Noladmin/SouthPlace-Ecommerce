import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/auth-service"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request)
    if (!auth.success) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const [pending, confirmed, preparing, waitingForPickup, readyLegacy, pickedUp, outForDelivery, delivered, cancelled, deliveryFailed] = await Promise.all([
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.order.count({ where: { status: 'PREPARING' } }),
      prisma.order.count({ where: { status: 'WAITING_FOR_PICKUP' } }),
      prisma.order.count({ where: { status: 'READY' } }),
      prisma.order.count({ where: { status: 'PICKED_UP' } }),
      prisma.order.count({ where: { status: 'OUT_FOR_DELIVERY' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.count({ where: { status: 'DELIVERY_FAILED' } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        pending,
        confirmed,
        preparing,
        ready: waitingForPickup + readyLegacy,
        waitingForPickup,
        pickedUp,
        outForDelivery,
        delivered,
        cancelled,
        deliveryFailed,
      }
    })
  } catch (error) {
    console.error('Status breakdown error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
} 
