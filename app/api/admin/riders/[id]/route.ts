import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/admin-auth"

const riderUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
  email: z.string().email().optional().or(z.literal("")).transform((value) => value || undefined),
  vehicleInfo: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.message }, { status: authResult.status })
    }

    const { id } = await params
    const body = await request.json()
    const validated = riderUpdateSchema.parse(body)

    const rider = await prisma.rider.update({
      where: { id },
      data: validated,
    })

    return NextResponse.json({ success: true, data: rider, message: "Rider updated successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("Error updating rider:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
