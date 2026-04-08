import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { allowRateLimit } from "@/lib/services/rate-limit"
import { hashPassword } from "@/lib/services/password-service"

export const dynamic = "force-dynamic"
export const revalidate = 0

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "Reset code must be 6 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
}).refine((value) => value.password === value.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const rl = allowRateLimit(request, "customer-reset-password", 10 * 60 * 1000, 5)
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many reset attempts. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const input = resetPasswordSchema.parse(body)
    const normalizedEmail = input.email.toLowerCase()

    const customer = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    })

    if (!customer || !customer.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset code" },
        { status: 401 }
      )
    }

    const token = await prisma.customerPasswordResetToken.findFirst({
      where: {
        customerId: customer.id,
        code: input.otp,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!token) {
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
      prisma.customerPasswordResetToken.update({
        where: { id: token.id },
        data: { isUsed: true },
      }),
      prisma.customerPasswordResetToken.updateMany({
        where: {
          customerId: customer.id,
          isUsed: false,
        },
        data: { isUsed: true },
      }),
      prisma.customer.update({
        where: { id: customer.id },
        data: {
          password: passwordResult.hash,
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

    console.error("Customer reset password error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
