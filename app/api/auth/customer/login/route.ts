import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyPassword } from "@/lib/services/password-service"
import { generateToken } from "@/lib/services/jwt-service"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    if (!customer || !customer.isActive) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Verify password
    const passwordValid = await verifyPassword(validatedData.password, customer.password)
    if (!passwordValid.isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLogin: new Date() },
    })

    // Generate JWT token
    const tokenResult = generateToken({
      id: customer.id,
      email: customer.email,
      name: `${customer.firstName} ${customer.lastName}`.trim(),
      role: "USER" as const,
      isActive: customer.isActive,
      lastLogin: customer.lastLogin,
    } as any)

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
        data: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
        },
      },
      { status: 200 }
    )

    response.cookies.set("customer-token", tokenResult.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    // Notify client about auth change
    try { (globalThis as any).postMessage?.('authChanged', '*') } catch {}
    return response

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Customer login error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 