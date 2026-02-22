import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/auth-service"
import { z } from "zod"

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Schema for updating menu item
const updateMenuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  basePrice: z.number().positive("Base price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dietary: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  cookingMethod: z.array(z.string()).optional(),
  mealType: z.array(z.string()).optional(),
  nutritionalHighlights: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  prepTime: z.string().optional(),
  difficulty: z.string().optional(),
  spiceLevel: z.number().min(1).max(5).optional(),
  origin: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  extraGroupIds: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        extraGroups: {
          include: {
            extraGroup: true
          }
        }
      }
    })

    if (!menuItem) {
      return NextResponse.json({ success: false, error: "Menu item not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: menuItem })
  } catch (error) {
    console.error("Error fetching menu item:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch menu item" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateMenuItemSchema.parse(body)

    const { id } = await context.params

    // Check if category exists
    const category = await prisma.menuCategory.findUnique({
      where: { id: validatedData.categoryId }
    })

    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 400 })
    }

    const updatedMenuItem = await prisma.$transaction(async (tx) => {
      const updated = await tx.menuItem.update({
        where: { id },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          basePrice: validatedData.basePrice,
          categoryId: validatedData.categoryId,
          imageUrl: validatedData.imageUrl,
          tags: validatedData.tags,
          dietary: validatedData.dietary,
          allergens: validatedData.allergens,
          cookingMethod: validatedData.cookingMethod,
          mealType: validatedData.mealType,
          nutritionalHighlights: validatedData.nutritionalHighlights,
          rating: validatedData.rating,
          prepTime: validatedData.prepTime,
          difficulty: validatedData.difficulty,
          spiceLevel: validatedData.spiceLevel,
          origin: validatedData.origin,
          isActive: validatedData.isActive,
          isFeatured: validatedData.isFeatured,
          updatedAt: new Date()
        },
      })

      if (validatedData.extraGroupIds) {
        await tx.menuItemExtraGroup.deleteMany({ where: { menuItemId: id } })
        if (validatedData.extraGroupIds.length) {
          await tx.menuItemExtraGroup.createMany({
            data: validatedData.extraGroupIds.map((gid) => ({ menuItemId: id, extraGroupId: gid })),
          })
        }
      }

      return tx.menuItem.findUnique({
        where: { id },
        include: {
          category: true,
          extraGroups: {
            include: {
              extraGroup: true
            }
          }
        }
      })
    })

    return NextResponse.json({ success: true, data: updatedMenuItem })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldLabels: Record<string, string> = {
        name: "Name",
        description: "Description",
        basePrice: "Base Price",
        imageUrl: "Image",
        rating: "Rating",
        prepTime: "Preparation Time",
        difficulty: "Difficulty",
        spiceLevel: "Spice Level",
        categoryId: "Category",
      }
      const first = error.issues[0]
      const path = (first.path || []).join(".")
      const label = fieldLabels[path] || (path ? path : "Request")
      let message = first.message
      // @ts-ignore
      if (first.code === "invalid_type") {
        // @ts-ignore
        if (first.expected === "number") message = `Please enter a valid number for ${label}`
        else message = `${label} is invalid`
      }
      if (message.toLowerCase().includes("required")) message = `${label} is required`
      return NextResponse.json({ success: false, error: message, details: error.issues }, { status: 400 })
    }
    console.error("Error updating menu item:", error)
    return NextResponse.json({ success: false, error: "Failed to update menu item" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    await prisma.menuItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: "Menu item deleted successfully" })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json({ success: false, error: "Failed to delete menu item" }, { status: 500 })
  }
} 
