import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/auth-service"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { id: authResult.admin?.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      }
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      admin
    })
  } catch (error) {
    console.error("Error fetching admin:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin" },
      { status: 500 }
    )
  }
} 