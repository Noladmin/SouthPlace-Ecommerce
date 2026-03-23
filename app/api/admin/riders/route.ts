import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/admin-auth"

const riderSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal("")).transform((value) => value || undefined),
  vehicleInfo: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    const riders = await prisma.rider.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    })

    return NextResponse.json({ success: true, data: riders })
  } catch (error) {
    console.error("Error fetching riders:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    const body = await request.json()
    const validated = riderSchema.parse(body)

    const rider = await prisma.rider.create({
      data: {
        name: validated.name,
        phone: validated.phone,
        email: validated.email,
        vehicleInfo: validated.vehicleInfo,
        notes: validated.notes,
        isActive: validated.isActive ?? true,
      },
    })

    return NextResponse.json({ success: true, data: rider, message: "Rider created successfully" }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("Error creating rider:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
