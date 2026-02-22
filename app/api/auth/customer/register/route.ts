import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/services/password-service"
import { z } from "zod"

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: "Customer with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashResult = await hashPassword(validatedData.password)
    if (!hashResult.success) {
      return NextResponse.json(
        { success: false, message: "Failed to hash password" },
        { status: 500 }
      )
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email.toLowerCase(),
        password: hashResult.hash!,
        phone: validatedData.phone,
        isActive: true,
        emailVerified: false,
      },
    })

    // Remove password from response
    const { password, ...customerWithoutPassword } = customer

    return NextResponse.json({
      success: true,
      message: "Customer registered successfully",
      data: customerWithoutPassword,
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Customer registration error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 