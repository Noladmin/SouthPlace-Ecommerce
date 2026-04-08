import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { allowRateLimit } from "@/lib/services/rate-limit"
import { calculateOTPExpiry, generateOTPCode, sendEmailOTP } from "@/lib/services/otp-service"

export const dynamic = "force-dynamic"
export const revalidate = 0

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: NextRequest) {
  try {
    const rl = allowRateLimit(request, "admin-forgot-password", 10 * 60 * 1000, 3)
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many reset requests. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)
    const normalizedEmail = email.toLowerCase()

    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    })

    // Avoid exposing whether an admin account exists for the supplied email.
    if (!admin || !admin.isActive) {
      return NextResponse.json({
        success: true,
        message: "If that admin account exists, a reset code has been sent to the email address.",
      })
    }

    await prisma.oTPCode.updateMany({
      where: {
        adminId: admin.id,
        type: "PASSWORD_RESET",
        isUsed: false,
      },
      data: { isUsed: true },
    })

    const otp = generateOTPCode()

    await prisma.oTPCode.create({
      data: {
        adminId: admin.id,
        code: otp,
        type: "PASSWORD_RESET",
        expiresAt: calculateOTPExpiry(),
      },
    })

    const sendResult = await sendEmailOTP(admin.email, otp, "PASSWORD_RESET")
    if (!sendResult.success) {
      console.error("Failed to send admin password reset OTP:", sendResult)
      return NextResponse.json(
        { success: false, error: "Failed to send reset code. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "If that admin account exists, a reset code has been sent to the email address.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      )
    }

    console.error("Admin forgot password error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process password reset request" },
      { status: 500 }
    )
  }
}
