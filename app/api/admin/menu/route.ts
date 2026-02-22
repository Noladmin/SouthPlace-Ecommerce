import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/services/jwt-service"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import type { MenuItemFormData } from "@/lib/types"

// Validation schemas
const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  basePrice: z.number().positive("Price must be positive"),
  // Accept either absolute URL or relative public path (e.g., /uploads/menu/xyz.jpg)
  imageUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dietary: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  cookingMethod: z.array(z.string()).optional(),
  mealType: z.array(z.string()).optional(),
  nutritionalHighlights: z.array(z.string()).optional(),
  variants: z.array(z.object({
    name: z.string(),
    price: z.string(),
    numericPrice: z.number(),
    measurement: z.string().optional(),
    measurementType: z.string().optional(),
  })).optional(),
  serving: z.string().optional(),
  serves: z.string().optional(),
  measurement: z.string().optional(),
  measurementType: z.string().optional(),
  specialOffer: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  prepTime: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  spiceLevel: z.number().min(1).max(5).optional(),
  origin: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().optional(),
  extraGroupIds: z.array(z.string()).optional(),
})

// Helper function to verify admin authentication
const verifyAdminAuth = async (request: NextRequest) => {
  const token = request.cookies.get("admin-token")?.value
  
  if (!token) {
    return { success: false, message: "No token provided", status: 401 }
  }

  const tokenResult = verifyToken(token)
  if (!tokenResult.valid || !tokenResult.payload) {
    return { success: false, message: "Invalid token", status: 401 }
  }

  const admin = await prisma.admin.findUnique({
    where: { id: tokenResult.payload.id },
  })

  if (!admin || !admin.isActive) {
    return { success: false, message: "Admin not found or inactive", status: 401 }
  }

  return { success: true, admin }
}

// GET - Fetch menu items with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const status = searchParams.get("status") || ""

    const where: Prisma.MenuItemWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      where.categoryId = category
    }

    if (status === "active") {
      where.isActive = true
    } else if (status === "inactive") {
      where.isActive = false
    }

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: {
          category: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.menuItem.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new menu item
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.status }
      )
    }

    const body = await request.json()
    const validatedData = menuItemSchema.parse(body)

    const menuItem = await prisma.menuItem.create({
      data: {
        ...validatedData,
        tags: validatedData.tags ? validatedData.tags : undefined,
        dietary: validatedData.dietary ? validatedData.dietary : undefined,
        allergens: validatedData.allergens ? validatedData.allergens : undefined,
        cookingMethod: validatedData.cookingMethod ? validatedData.cookingMethod : undefined,
        mealType: validatedData.mealType ? validatedData.mealType : undefined,
        nutritionalHighlights: validatedData.nutritionalHighlights ? validatedData.nutritionalHighlights : undefined,
        variants: validatedData.variants ? validatedData.variants : undefined,
        extraGroups: validatedData.extraGroupIds && validatedData.extraGroupIds.length
          ? {
              create: validatedData.extraGroupIds.map((id) => ({ extraGroupId: id }))
            }
          : undefined,
      },
      include: {
        category: true,
        extraGroups: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: menuItem,
      message: "Menu item created successfully",
    }, { status: 201 })
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
      // Friendly messages for common cases
      // @ts-ignore - zod error fields
      if (first.code === "invalid_type") {
        // @ts-ignore
        if (first.expected === "number") message = `Please enter a valid number for ${label}`
        // @ts-ignore
        else if (first.expected === "string") message = `${label} is required`
      }
      if (message.toLowerCase().includes("required")) {
        message = `${label} is required`
      }
      return NextResponse.json(
        { success: false, error: message, details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating menu item:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 
