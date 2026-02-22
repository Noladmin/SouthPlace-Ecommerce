import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { verifyAdminAuth } from "@/lib/services/auth-service"

const extraItemSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  imageUrl: z.string().trim().optional(),
  isActive: z.boolean().optional(),
})

const extraGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isGlobal: z.boolean().default(false),
  minSelections: z.number().min(0).default(0),
  maxSelections: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  items: z.array(extraItemSchema).optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request)
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error || "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = extraGroupSchema.parse(body)
    const { id } = await params

    const updated = await prisma.$transaction(async (tx) => {
      const group = await tx.extraGroup.update({
        where: { id },
        data: {
          name: validated.name,
          description: validated.description || null,
          isGlobal: validated.isGlobal,
          minSelections: validated.minSelections,
          maxSelections: validated.maxSelections,
          isActive: validated.isActive,
        },
      })

      await tx.extraItem.deleteMany({ where: { groupId: id } })
      if (validated.items && validated.items.length) {
        await tx.extraItem.createMany({
          data: validated.items.map((item) => ({
            groupId: id,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl?.trim() || null,
            isActive: item.isActive ?? true,
          })),
        })
      }

      return tx.extraGroup.findUnique({
        where: { id },
        include: { items: true },
      })
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("Extras group update error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request)
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error || "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.extraGroup.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Extras group delete error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
