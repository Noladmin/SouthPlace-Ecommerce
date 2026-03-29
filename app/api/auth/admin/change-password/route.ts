import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/auth-service"
import { hashPassword } from "@/lib/services/password-service"

export const dynamic = "force-dynamic"
export const revalidate = 0

const changePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
}).refine((value) => value.password === value.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request)
    if (!auth.success || !auth.admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const input = changePasswordSchema.parse(body)

    const passwordResult = await hashPassword(input.password)
    if (!passwordResult.success || !passwordResult.hash) {
      return NextResponse.json(
        { success: false, error: passwordResult.error || "Failed to set password" },
        { status: 400 }
      )
    }

    await prisma.admin.update({
      where: { id: auth.admin.id },
      data: {
        password: passwordResult.hash,
        mustChangePassword: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      )
    }

    console.error("Admin change password error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update password" },
      { status: 500 }
    )
  }
}
