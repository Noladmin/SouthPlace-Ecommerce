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

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth(request)
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error || "Unauthorized" }, { status: 401 })
  }

  const groups = await prisma.extraGroup.findMany({
    include: {
      items: {
        orderBy: { name: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ success: true, data: groups })
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminAuth(request)
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error || "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = extraGroupSchema.parse(body)

    const group = await prisma.extraGroup.create({
      data: {
        name: validated.name,
        description: validated.description || null,
        isGlobal: validated.isGlobal,
        minSelections: validated.minSelections,
        maxSelections: validated.maxSelections,
        isActive: validated.isActive,
        items: validated.items && validated.items.length
          ? {
              create: validated.items.map((item) => ({
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl?.trim() || null,
                isActive: item.isActive ?? true,
              })),
            }
          : undefined,
      },
      include: { items: true },
    })

    return NextResponse.json({ success: true, data: group }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("Extras group create error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
