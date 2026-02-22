import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/services/jwt-service"
import { z } from "zod"

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

const reviewSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  menuItemId: z.string().optional(),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().max(500, "Comment must be less than 500 characters").optional(),
})

// GET - Get reviews for a menu item
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const menuItemId = searchParams.get("menuItemId")
    const orderId = searchParams.get("orderId")

    if (!menuItemId && !orderId) {
      return NextResponse.json(
        { success: false, message: "menuItemId or orderId is required" },
        { status: 400 }
      )
    }

    const where: any = { isPublic: true }
    
    if (menuItemId) {
      where.menuItemId = menuItemId
    }
    
    if (orderId) {
      where.orderId = orderId
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        customer: true,
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
    console.error("Get reviews error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyCustomerAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.status }
      )
    }

    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    // Check if order exists and belongs to customer
    const order = await prisma.order.findFirst({
      where: {
        id: validatedData.orderId,
        customerId: authResult.customer!.id,
        status: "DELIVERED", // Only allow reviews for delivered orders
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found or not eligible for review" },
        { status: 404 }
      )
    }

    // Check if review already exists for this order
    const existingReview = await prisma.review.findUnique({
      where: { orderId: validatedData.orderId },
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: "Review already exists for this order" },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        orderId: validatedData.orderId,
        customerId: authResult.customer!.id,
        menuItemId: validatedData.menuItemId,
        rating: validatedData.rating,
        comment: validatedData.comment,
        isPublic: true,
      },
      include: {
        customer: true,
        menuItem: {
          select: {
            name: true,
          },
        },
      },
    })

    // Update menu item average rating if menuItemId is provided
    if (validatedData.menuItemId) {
      const menuItemReviews = await prisma.review.findMany({
        where: { menuItemId: validatedData.menuItemId },
      })

      const averageRating = menuItemReviews.reduce((sum, r) => sum + r.rating, 0) / menuItemReviews.length

      await prisma.menuItem.update({
        where: { id: validatedData.menuItemId },
        data: { rating: averageRating },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Create review error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 