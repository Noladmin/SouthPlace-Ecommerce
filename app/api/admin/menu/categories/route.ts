import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/auth-service"
import { z } from "zod"

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Schema for creating/updating categories
const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const categories = await prisma.menuCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error("Error fetching menu categories:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    // Check if category with same name already exists
    const existingCategory = await prisma.menuCategory.findFirst({
      where: { name: validatedData.name }
    })

    if (existingCategory) {
      return NextResponse.json({ success: false, error: "Category with this name already exists" }, { status: 400 })
    }

    const category = await prisma.menuCategory.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        icon: validatedData.icon
      }
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 })
    }
    console.error("Error creating menu category:", error)
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 })
  }
} 