import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAuth } from "@/lib/services/auth-service"
import { createErrorResponse } from "@/lib/services/error-handler"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.customer.findUnique({
      where: { id: authResult.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        isActive: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        name: `${user.firstName} ${user.lastName}`.trim()
      }
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    const errorResponse = createErrorResponse(error)
    return NextResponse.json(
      { success: false, error: errorResponse.error },
      { status: errorResponse.statusCode }
    )
  }
} 
