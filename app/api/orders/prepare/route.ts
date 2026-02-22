import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Validation schema for order preparation (no DB writes here)
const orderPreparationSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 characters"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  deliveryCity: z.string().min(1, "Delivery city is required"),
  specialInstructions: z.string().optional(),
  deliveryMethod: z.enum(["standard", "express"]).transform(v => v.toUpperCase()),
  paymentMethod: z.enum(["stripe"]).transform(v => v.toLowerCase()),
  customerId: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().positive(),
    variant: z.string().optional(),
    variantPrice: z.number().optional(),
    measurement: z.number().optional(),
    measurementType: z.string().optional(),
    extras: z.array(z.object({
      id: z.string().optional(),
      name: z.string(),
      price: z.number().min(0),
      quantity: z.number().optional(),
      groupName: z.string().optional(),
    })).optional(),
  })).min(1, "At least one item is required"),
  subtotal: z.number().positive(),
  deliveryFee: z.number().min(0),
  vatRate: z.number().min(0).optional(),
  vatAmount: z.number().min(0).optional(),
  total: z.number().positive(),
})

const generateTempOrderNumber = () => {
  const ts = Date.now().toString().slice(-8)
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `TB-TEMP-${ts}-${rand}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    let validated
    try {
      validated = orderPreparationSchema.parse(body)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: "Validation error", details: err.issues.map(e => `${e.path.join('.')}: ${e.message}`) },
          { status: 400 }
        )
      }
      throw err
    }

    const vatAmount = Number((validated.vatAmount || 0).toFixed(2))
    // Basic cross-check: subtotal + deliveryFee + vatAmount should roughly equal total
    const computedTotal = Number((validated.subtotal + validated.deliveryFee + vatAmount).toFixed(2))
    const providedTotal = Number(validated.total.toFixed(2))
    if (computedTotal !== providedTotal) {
      return NextResponse.json(
        { success: false, error: "Invalid totals: subtotal + deliveryFee + VAT must equal total" },
        { status: 400 }
      )
    }

    // Return a temporary order number for the client to proceed to payment step
    const tempOrderNumber = generateTempOrderNumber()

    return NextResponse.json({
      success: true,
      message: "Order prepared",
      data: { tempOrderNumber },
    })
  } catch (error) {
    console.error("Order preparation error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
