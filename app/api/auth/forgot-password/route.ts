import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { allowRateLimit } from "@/lib/services/rate-limit"
import { calculateOTPExpiry, generateOTPCode } from "@/lib/services/otp-service"
import { emailService } from "@/lib/services/email-service"

export const dynamic = "force-dynamic"
export const revalidate = 0

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: NextRequest) {
  try {
    const rl = allowRateLimit(request, "customer-forgot-password", 10 * 60 * 1000, 3)
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many reset requests. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)
    const normalizedEmail = email.toLowerCase()

    const customer = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    })

    if (!customer || !customer.isActive) {
      return NextResponse.json({
        success: true,
        message: "If that account exists, a reset code has been sent to the email address.",
      })
    }

    await prisma.customerPasswordResetToken.updateMany({
      where: {
        customerId: customer.id,
        isUsed: false,
      },
      data: { isUsed: true },
    })

    const code = generateOTPCode()

    await prisma.customerPasswordResetToken.create({
      data: {
        customerId: customer.id,
        code,
        expiresAt: calculateOTPExpiry(),
      },
    })

    const sendResult = await emailService.sendCustomerPasswordReset(customer.email, {
      firstName: customer.firstName,
      code,
    })

    if (!sendResult.success) {
      console.error("Failed to send customer password reset email:", sendResult)
      return NextResponse.json(
        { success: false, error: "Failed to send reset code. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "If that account exists, a reset code has been sent to the email address.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      )
    }

    console.error("Customer forgot password error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process password reset request" },
      { status: 500 }
    )
  }
}
