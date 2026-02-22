import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/services/jwt-service"
import { prisma } from "@/lib/db"

// Helper function to verify customer authentication
const verifyCustomerAuth = async (request: NextRequest) => {
  const token = request.cookies.get("customer-token")?.value

  if (!token) {
    return { success: false, message: "No token provided", status: 401 }
  }

  const tokenResult = verifyToken(token)
  if (!tokenResult.valid || !tokenResult.payload) {
    return { success: false, message: "Invalid token", status: 401 }
  }

  const customer = await prisma.customer.findUnique({
    where: { id: tokenResult.payload.id },
  })

  if (!customer || !customer.isActive) {
    return { success: false, message: "Customer not found or inactive", status: 401 }
  }

  return { success: true, customer }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyCustomerAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.status }
      )
    }

    // Get customer's reviews
    const reviews = await prisma.review.findMany({
      where: {
        customerId: authResult.customer!.id,
      },
      include: {
        menuItem: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: reviews,
    })

  } catch (error) {
    console.error("Get customer reviews error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 