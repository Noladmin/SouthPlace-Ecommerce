import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/auth-service"

export const dynamic = 'force-dynamic'
export const revalidate = 0

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x }
function endOfDay(d: Date) { const x = new Date(d); x.setHours(23,59,59,999); return x }

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request)
    if (!auth.success) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const days = Math.min(60, Math.max(7, parseInt(searchParams.get('days') || '7')))

    const points: Array<{ date: string; orders: number; revenue: number }> = []
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(); day.setDate(day.getDate() - i)
      const s = startOfDay(day); const e = endOfDay(day)
      const [count, sumAgg] = await Promise.all([
        prisma.order.count({ where: { createdAt: { gte: s, lte: e } } }),
        prisma.order.aggregate({ where: { createdAt: { gte: s, lte: e }, status: { not: 'CANCELLED' } }, _sum: { total: true } })
      ])
      points.push({ date: s.toISOString().slice(0,10), orders: count, revenue: Number(sumAgg._sum.total || 0) })
    }

    return NextResponse.json({ success: true, data: points })
  } catch (error) {
    console.error('Trends error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
} 