import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/auth-service"

export const dynamic = 'force-dynamic'
export const revalidate = 0

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x }

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request)
    if (!auth.success) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const days = Math.min(60, Math.max(7, parseInt(searchParams.get('days') || '30')))
    const since = startOfDay(new Date()); since.setDate(since.getDate() - days)

    // Fetch recent order items within range (filter by related order.createdAt)
    const rows = await prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: since } } },
      select: { itemName: true, quantity: true, price: true, orderId: true, order: { select: { createdAt: true } } },
      orderBy: { order: { createdAt: 'desc' } },
      take: 2000, // safety cap
    })

    // Aggregate per item
    const map = new Map<string, { name: string; ordersSet: Set<string>; quantity: number; revenue: number }>()
    for (const r of rows) {
      const key = r.itemName
      if (!map.has(key)) map.set(key, { name: key, ordersSet: new Set<string>(), quantity: 0, revenue: 0 })
      const acc = map.get(key)!
      acc.ordersSet.add(r.orderId)
      acc.quantity += Number(r.quantity || 0)
      // Revenue: price * quantity
      const priceNum = Number(r.price || 0)
      acc.revenue += priceNum * Number(r.quantity || 0)
    }

    const list = Array.from(map.values()).map(v => ({
      name: v.name,
      orders: v.ordersSet.size,
      quantity: v.quantity,
      revenue: v.revenue,
    }))
    list.sort((a, b) => b.quantity - a.quantity)

    return NextResponse.json({ success: true, data: list.slice(0, 10) })
  } catch (error) {
    console.error('Top items error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
} 