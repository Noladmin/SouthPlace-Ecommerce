import { NextRequest, NextResponse } from "next/server"
import { prisma, retryDatabaseOperation } from "@/lib/db"

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function extrasTablesExist(): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('extra_groups', 'menu_item_extra_groups', 'extra_items')
    `
    const names = new Set(rows.map((r) => r.tablename))
    return names.has("extra_groups") && names.has("menu_item_extra_groups") && names.has("extra_items")
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const tags = searchParams.get("tags")

    const where: any = {
      isActive: true
    }

    // Filter by category
    if (category) {
      where.categoryId = category
    }

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filter by tags (if tags are stored as JSON array)
    if (tags) {
      const tagArray = tags.split(',')
      where.tags = {
        array_contains: tagArray
      }
    }

    const menuItems = await retryDatabaseOperation(async () => {
      return prisma.menuItem.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    })

    // Keep menu endpoint available even if extras tables are not migrated yet.
    let globalExtras: any[] = []
    let itemExtraGroupsByMenuItemId = new Map<string, any[]>()
    if (await extrasTablesExist()) {
      try {
        const [global, itemLinks] = await Promise.all([
          prisma.extraGroup.findMany({
            where: { isActive: true, isGlobal: true },
            include: {
              items: {
                where: { isActive: true },
                orderBy: { name: "asc" },
              },
            },
            orderBy: { createdAt: "asc" },
          }),
          prisma.menuItemExtraGroup.findMany({
            where: {
              menuItemId: { in: menuItems.map((m) => m.id) }
            },
            include: {
              extraGroup: {
                include: {
                  items: {
                    where: { isActive: true },
                    orderBy: { name: "asc" },
                  },
                },
              },
            },
          })
        ])

        globalExtras = global
        itemExtraGroupsByMenuItemId = itemLinks.reduce((acc, link) => {
          const arr = acc.get(link.menuItemId) || []
          if (link.extraGroup?.isActive) arr.push(link.extraGroup)
          acc.set(link.menuItemId, arr)
          return acc
        }, new Map<string, any[]>())
      } catch (extrasError) {
        console.warn("Extras data unavailable for /api/menu, continuing without extras:", extrasError)
      }
    }

    // Group items by category
    const categories = await prisma.menuCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    const menuData = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || "",
      icon: "🍽️", // Default icon
      color: "from-orange-400 to-red-500", // Default color
      items: menuItems
        .filter(item => item.categoryId === category.id)
        .map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: `₦${parseFloat(item.basePrice.toString()).toFixed(2)}`,
          basePrice: parseFloat(item.basePrice.toString()),
          image: item.imageUrl || "/assets/placeholder.jpg",
          isFeatured: item.isFeatured,
          tags: item.tags ? (Array.isArray(item.tags) ? item.tags : []) : [],
          dietary: item.dietary ? (Array.isArray(item.dietary) ? item.dietary : []) : [],
          allergens: item.allergens ? (Array.isArray(item.allergens) ? item.allergens : []) : [],
          cookingMethod: item.cookingMethod ? (Array.isArray(item.cookingMethod) ? item.cookingMethod : []) : [],
          mealType: item.mealType ? (Array.isArray(item.mealType) ? item.mealType : []) : [],
          nutritionalHighlights: item.nutritionalHighlights ? (Array.isArray(item.nutritionalHighlights) ? item.nutritionalHighlights : []) : [],
          rating: item.rating ? parseFloat(item.rating.toString()) : undefined,
          prepTime: item.prepTime || undefined,
          difficulty: item.difficulty || undefined,
          spiceLevel: item.spiceLevel ? parseInt(item.spiceLevel.toString()) : undefined,
          variants: item.variants ? (Array.isArray(item.variants) ? item.variants.map((v: any) => ({
            name: v.name,
            price: `₦${parseFloat(v.price.toString()).toFixed(2)}`,
            numericPrice: parseFloat(v.price.toString()),
            measurement: v.measurement,
            measurementType: v.measurementType
          })) : []) : [],
          extraGroups: (() => {
            const itemGroups = itemExtraGroupsByMenuItemId.get(item.id) || []
            const allGroups = [...globalExtras, ...itemGroups]
            const unique = new Map<string, any>()
            allGroups.forEach((g: any) => {
              if (!unique.has(g.id)) unique.set(g.id, g)
            })
            return Array.from(unique.values()).map((g: any) => ({
              id: g.id,
              name: g.name,
              description: g.description || undefined,
              isGlobal: g.isGlobal,
              minSelections: g.minSelections,
              maxSelections: g.maxSelections,
              items: (g.items || []).map((it: any) => ({
                id: it.id,
                name: it.name,
                price: parseFloat(it.price.toString()),
                imageUrl: it.imageUrl || undefined,
              }))
            }))
          })()
        }))
    }))

    return NextResponse.json({
      success: true,
      data: menuData
    })
  } catch (error) {
    console.error("Error fetching menu:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch menu",
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
} 
