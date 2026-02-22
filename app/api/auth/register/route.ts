import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import argon2 from "argon2"
import { z } from "zod"
import { emailService } from "@/lib/services/email-service"
import { createErrorResponse } from "@/lib/services/error-handler"

export const dynamic = 'force-dynamic'
export const revalidate = 0

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().optional(),
  city: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: validatedData.email.toLowerCase() }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await argon2.hash(validatedData.password)

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email.toLowerCase(),
        phone: validatedData.phone,
        password: hashedPassword,
        address: validatedData.address || null,
        city: validatedData.city || null,
        isActive: true,
      }
    })

    // Send welcome email (async, don't wait for it)
    emailService.sendWelcomeEmail({
      name: `${customer.firstName} ${customer.lastName}`.trim(),
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
    }).catch(error => {
      console.error("Failed to send welcome email:", error)
    })

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
      }
    })
  } catch (error) {
    console.error("Registration error:", error)
    const errorResponse = createErrorResponse(error)
    return NextResponse.json(
      { success: false, error: errorResponse.error },
      { status: errorResponse.statusCode }
    )
  }
} 
