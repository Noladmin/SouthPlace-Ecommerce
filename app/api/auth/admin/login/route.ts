import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { generateOTPCode, sendEmailOTP } from "@/lib/services/otp-service"
import { verifyPassword } from "@/lib/services/password-service"
import { generateToken } from "@/lib/services/jwt-service"
import { allowRateLimit } from "@/lib/services/rate-limit"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Validation schema for admin login
const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per 10 minutes per IP
    const rl = allowRateLimit(request, 'admin-login', 10 * 60 * 1000, 5)
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Please try again later." },
        { status: 429 }
      )
    }
    const body = await request.json()
    const { email, password } = adminLoginSchema.parse(body)

    // Find admin user by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Verify password
    const passwordResult = await verifyPassword(admin.password, password)
    if (!passwordResult.isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Check if admin is active
    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, error: "Account is deactivated" },
        { status: 403 }
      )
    }

    // Generate OTP
    const otp = generateOTPCode()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Invalidate existing OTP codes
    await prisma.oTPCode.updateMany({
      where: {
        adminId: admin.id,
        type: "LOGIN",
        isUsed: false,
      },
      data: { isUsed: true },
    })

    // Store OTP in database
    await prisma.oTPCode.create({
      data: {
        adminId: admin.id,
        code: otp,
        type: "LOGIN",
        expiresAt: otpExpiry,
      },
    })

    // Send OTP via email - must succeed for login to proceed
    try {
      const sendResult = await sendEmailOTP(admin.email, otp, "LOGIN")
      if (!sendResult.success) {
        console.error("Failed to send OTP email:", sendResult)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to send OTP email. Please check your email configuration or contact support."
          },
          { status: 500 }
        )
      }
    } catch (emailError: any) {
      console.error("Failed to send OTP email:", emailError)
      return NextResponse.json(
        {
          success: false,
          error: emailError?.message?.includes("authentication")
            ? "Email service authentication failed. Please check your SMTP credentials."
            : "Failed to send OTP email. Please check your email configuration."
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
      data: {
        email: admin.email,
        requiresOTP: true,
      },
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data" },
        { status: 400 }
      )
    }

    console.error("Admin login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? String(error) : "An unexpected error occurred"
      },
      { status: 500 }
    )
  }
} 