import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/services/auth-service"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { customerId: auth.userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error("Get customer orders error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
} 