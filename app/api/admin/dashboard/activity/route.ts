import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/auth-service"

export const dynamic = 'force-dynamic'
export const revalidate = 0

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return `${diff} seconds ago`
  const m = Math.floor(diff / 60); if (m < 60) return `${m} minutes ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h} hours ago`
  const d = Math.floor(h / 24); return `${d} days ago`
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request)
    if (!auth.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))

    const [orders, menu, customers] = await Promise.all([
      prisma.order.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: { orderNumber: true, createdAt: true, total: true }
      }),
      prisma.menuItem.findMany({
        take: 50,
        orderBy: { updatedAt: 'desc' },
        select: { name: true, updatedAt: true }
      }),
      prisma.customer.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: { email: true, createdAt: true }
      })
    ])

    type Item = { title: string; description: string; timeAgo: string; icon?: string; timestamp: number }
    const items: Item[] = []

    orders.forEach(o => items.push({
      title: 'New order received',
      description: `Order #${o.orderNumber} · ₦${Number(o.total).toFixed(2)}`,
      timeAgo: timeAgo(o.createdAt),
      icon: '🧾',
      timestamp: o.createdAt.getTime(),
    }))

    menu.forEach(m => items.push({
      title: 'Menu item updated',
      description: `${m.name} updated`,
      timeAgo: timeAgo(m.updatedAt),
      icon: '🍽️',
      timestamp: m.updatedAt.getTime(),
    }))

    customers.forEach(c => items.push({
      title: 'New customer registered',
      description: c.email,
      timeAgo: timeAgo(c.createdAt),
      icon: '👤',
      timestamp: c.createdAt.getTime(),
    }))

    items.sort((a, b) => b.timestamp - a.timestamp)

    const start = (page - 1) * limit
    const paged = items.slice(start, start + limit).map(({ timestamp, ...rest }) => rest)

    return NextResponse.json({
      success: true,
      data: paged,
      pagination: {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit)
      }
    })
  } catch (error) {
    console.error('Activity fetch error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
} 