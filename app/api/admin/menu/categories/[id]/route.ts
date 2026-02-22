import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/auth-service"
import { z } from "zod"

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Schema for updating categories
const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z.string().optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)

    // Check if category exists
    const existingCategory = await prisma.menuCategory.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    // Check if another category with the same name exists (excluding current one)
    const duplicateCategory = await prisma.menuCategory.findFirst({
      where: {
        name: validatedData.name,
        id: { not: id }
      }
    })

    if (duplicateCategory) {
      return NextResponse.json({ success: false, error: "Category with this name already exists" }, { status: 400 })
    }

    const updatedCategory = await prisma.menuCategory.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        icon: validatedData.icon,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, data: updatedCategory })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 })
    }
    console.error("Error updating menu category:", error)
    return NextResponse.json({ success: false, error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if category exists
    const existingCategory = await prisma.menuCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    // Check if category has menu items
    if (existingCategory._count.items > 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Cannot delete category that contains menu items. Please move or delete the items first." 
      }, { status: 400 })
    }

    await prisma.menuCategory.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting menu category:", error)
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 })
  }
} 