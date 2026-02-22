import { NextRequest, NextResponse } from "next/server"
import { authenticateAdmin } from "@/lib/services/auth-service"
import { generateToken } from "@/lib/services/jwt-service"
import type { LoginRequest } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      )
    }

    // Authenticate admin
    const authResult = await authenticateAdmin({ email, password })

    if (!authResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: authResult.message,
          requiresOTP: authResult.requiresOTP 
        },
        { status: 401 }
      )
    }

    // Generate JWT token
    const tokenResult = generateToken(authResult.user!)
    if (!tokenResult.success) {
      return NextResponse.json(
        { success: false, message: "Failed to generate token" },
        { status: 500 }
      )
    }

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { 
        success: true, 
        message: "Login successful",
        user: authResult.user 
      },
      { status: 200 }
    )

    response.cookies.set("admin-token", tokenResult.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response

  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 