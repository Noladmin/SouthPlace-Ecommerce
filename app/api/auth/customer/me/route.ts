import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/services/jwt-service"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Extract token from cookie
    const token = request.cookies.get("customer-token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      )
    }

    // Verify token
    const tokenResult = verifyToken(token)
    if (!tokenResult.valid || !tokenResult.payload) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      )
    }

    // Get customer from database
    const customer = await prisma.customer.findUnique({
      where: { id: tokenResult.payload.id },
    })

    if (!customer || !customer.isActive) {
      return NextResponse.json(
        { success: false, message: "Customer not found or inactive" },
        { status: 401 }
      )
    }

    // Return customer data (without password)
    const user = {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      isActive: customer.isActive,
      emailVerified: customer.emailVerified,
      lastLogin: customer.lastLogin,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }

    return NextResponse.json({
      success: true,
      user,
    })

  } catch (error) {
    console.error("Customer auth check error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 
