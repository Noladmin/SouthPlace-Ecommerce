import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/services/jwt-service"
import { z } from "zod"

export const dynamic = 'force-dynamic'
export const revalidate = 0

const addressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(5),
  address: z.string().min(3),
  city: z.string().min(2),
})

async function getCustomerFromRequest(request: NextRequest) {
  const token = request.cookies.get("customer-token")?.value
  if (!token) return null
  const tokenResult = verifyToken(token)
  if (!tokenResult.valid || !tokenResult.payload) return null
  const customer = await prisma.customer.findUnique({ where: { id: tokenResult.payload.id } })
  return customer
}

export async function GET(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request)
    if (!customer) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({
      success: true,
      data: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
      }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch address" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request)
    if (!customer) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const data = addressSchema.parse(body)

    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
      }
    })

    return NextResponse.json({ success: true, data: { id: updated.id } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation error", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to save address" }, { status: 500 })
  }
}


