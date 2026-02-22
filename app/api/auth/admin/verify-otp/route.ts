import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { generateToken } from "@/lib/services/jwt-service"
import { allowRateLimit } from "@/lib/services/rate-limit"

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Validation schema for OTP verification
const otpVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
})

// simple in-memory lock map (email → until timestamp)
const lockouts = new Map<string, number>()

export async function POST(request: NextRequest) {
  try {
    // Check lockout
    const bodyRaw = await request.clone().json().catch(() => null)
    const maybeEmail = bodyRaw?.email as string | undefined
    const now = Date.now()
    if (maybeEmail && lockouts.has(maybeEmail) && now < (lockouts.get(maybeEmail) || 0)) {
      return NextResponse.json(
        { success: false, error: "Too many failed attempts. Please try again later." },
        { status: 429 }
      )
    }

    // Rate limit: 5 OTP verifications per 10 minutes per IP
    const rl = allowRateLimit(request, 'admin-verify-otp', 10 * 60 * 1000, 5)
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, otp } = otpVerificationSchema.parse(body)

    // Find admin user by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!admin) {
      lockouts.set(email, now + 2 * 60 * 1000) // brief lockout
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Check if OTP matches and is not expired
    const otpRecord = await prisma.oTPCode.findFirst({
      where: {
        adminId: admin.id,
        code: otp,
        type: "LOGIN",
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!otpRecord) {
      lockouts.set(email, now + 2 * 60 * 1000)
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP" },
        { status: 401 }
      )
    }

    // Mark OTP as used and update last login
    await Promise.all([
      prisma.oTPCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      }),
      prisma.admin.update({
        where: { id: admin.id },
        data: { lastLogin: new Date() },
      }),
    ])

    // Generate JWT token
    const tokenResult = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin,
      phone: admin.phone,
      twoFactorEnabled: admin.twoFactorEnabled,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    })

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    })

    if (tokenResult.success && tokenResult.token) {
      console.log("Setting admin token cookie:", tokenResult.token.substring(0, 20) + "...")
      response.cookies.set("admin-token", tokenResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      })
    } else {
      console.error("Failed to generate token:", tokenResult)
    }

    return response

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data" },
        { status: 400 }
      )
    }

    console.error("Admin OTP verification error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 