import { NextRequest, NextResponse } from "next/server"
import { verifyToken, extractTokenFromHeader } from "@/lib/services/jwt-service"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Extract token from cookie
    const token = request.cookies.get("admin-token")?.value

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

    // Get admin user from database
    const admin = await prisma.admin.findUnique({
      where: { id: tokenResult.payload.id },
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, message: "Admin not found or inactive" },
        { status: 401 }
      )
    }

    // Return admin user data
    const user = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin,
      phone: admin.phone,
      twoFactorEnabled: admin.twoFactorEnabled,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    }

    return NextResponse.json({
      success: true,
      user,
    })

  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 