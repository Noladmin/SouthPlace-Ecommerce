import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { allowRateLimit } from "@/lib/services/rate-limit"
import { hashPassword } from "@/lib/services/password-service"

export const dynamic = "force-dynamic"
export const revalidate = 0

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
}).refine((value) => value.password === value.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const rl = allowRateLimit(request, "admin-reset-password", 10 * 60 * 1000, 5)
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many reset attempts. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const input = resetPasswordSchema.parse(body)
    const normalizedEmail = input.email.toLowerCase()

    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset code" },
        { status: 401 }
      )
    }

    const otpRecord = await prisma.oTPCode.findFirst({
      where: {
        adminId: admin.id,
        code: input.otp,
        type: "PASSWORD_RESET",
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset code" },
        { status: 401 }
      )
    }

    const passwordResult = await hashPassword(input.password)
    if (!passwordResult.success || !passwordResult.hash) {
      return NextResponse.json(
        { success: false, error: passwordResult.error || "Failed to reset password" },
        { status: 400 }
      )
    }

    await prisma.$transaction([
      prisma.oTPCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      }),
      prisma.oTPCode.updateMany({
        where: {
          adminId: admin.id,
          type: "PASSWORD_RESET",
          isUsed: false,
        },
        data: { isUsed: true },
      }),
      prisma.admin.update({
        where: { id: admin.id },
        data: {
          password: passwordResult.hash,
          mustChangePassword: false,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now sign in with your new password.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      )
    }

    console.error("Admin reset password error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
