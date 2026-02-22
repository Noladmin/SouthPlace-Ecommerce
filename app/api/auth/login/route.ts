import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import argon2 from "argon2"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { createErrorResponse } from "@/lib/services/error-handler"

export const dynamic = 'force-dynamic'
export const revalidate = 0

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Find customer by email
    const customer = await prisma.customer.findUnique({
      where: { email: validatedData.email.toLowerCase() }
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await argon2.verify(customer.password, validatedData.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Check if account is active
    if (!customer.isActive) {
      return NextResponse.json(
        { success: false, error: "Account is deactivated. Please contact support." },
        { status: 403 }
      )
    }

    // Update last login
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLogin: new Date() }
    })

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: customer.id, 
        email: customer.email,
        role: 'customer'
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
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

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    const errorResponse = createErrorResponse(error)
    return NextResponse.json(
      { success: false, error: errorResponse.error },
      { status: errorResponse.statusCode }
    )
  }
} 
