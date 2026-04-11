import { prisma, retryDatabaseOperation } from "@/lib/db"
import type { MenuCategory } from "@/lib/menu"

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

interface PublicMenuOptions {
  category?: string | null
  search?: string | null
  tags?: string | null
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : []
}

function getDifficulty(value: unknown): "Easy" | "Medium" | "Hard" | undefined {
  return value === "Easy" || value === "Medium" || value === "Hard" ? value : undefined
}

function getSpiceLevel(value: unknown): 1 | 2 | 3 | 4 | 5 | undefined {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5 ? value : undefined
}

export async function getPublicMenuData(options: PublicMenuOptions = {}): Promise<MenuCategory[]> {
  const { category, search, tags } = options

  const where: any = {
    isActive: true,
  }

  if (category) {
    where.categoryId = category
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  if (tags) {
    where.tags = {
      array_contains: tags.split(","),
    }
  }

  const menuItems = await retryDatabaseOperation(async () =>
    prisma.menuItem.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  )

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
            menuItemId: { in: menuItems.map((m) => m.id) },
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
        }),
      ])

      globalExtras = global
      itemExtraGroupsByMenuItemId = itemLinks.reduce((acc, link) => {
        const groups = acc.get(link.menuItemId) || []
        if (link.extraGroup?.isActive) groups.push(link.extraGroup)
        acc.set(link.menuItemId, groups)
        return acc
      }, new Map<string, any[]>())
    } catch (extrasError) {
      console.warn("Extras data unavailable for public menu, continuing without extras:", extrasError)
    }
  }

  const categories = await prisma.menuCategory.findMany({
    orderBy: {
      name: "asc",
    },
  })

  return categories.map((menuCategory) => ({
    id: menuCategory.id,
    name: menuCategory.name,
    description: menuCategory.description || "",
    icon: "🍽️",
    color: "from-orange-400 to-red-500",
    items: menuItems
      .filter((item) => item.categoryId === menuCategory.id)
      .map((item) => {
        const itemGroups = itemExtraGroupsByMenuItemId.get(item.id) || []
        const allGroups = [...globalExtras, ...itemGroups]
        const uniqueGroups = new Map<string, any>()

        allGroups.forEach((group: any) => {
          if (!uniqueGroups.has(group.id)) uniqueGroups.set(group.id, group)
        })

        return {
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: `₦${parseFloat(item.basePrice.toString()).toFixed(2)}`,
          basePrice: parseFloat(item.basePrice.toString()),
          image: item.imageUrl || "/assets/placeholder.jpg",
          isFeatured: item.isFeatured,
          tags: getStringArray(item.tags),
          dietary: getStringArray(item.dietary),
          allergens: getStringArray(item.allergens),
          cookingMethod: getStringArray(item.cookingMethod),
          mealType: getStringArray(item.mealType),
          nutritionalHighlights: getStringArray(item.nutritionalHighlights),
          rating: item.rating ? parseFloat(item.rating.toString()) : undefined,
          prepTime: item.prepTime || undefined,
          difficulty: getDifficulty(item.difficulty),
          spiceLevel: getSpiceLevel(item.spiceLevel ? parseInt(item.spiceLevel.toString()) : undefined),
          variants: item.variants
            ? Array.isArray(item.variants)
              ? item.variants.map((variant: any) => ({
                  name: variant.name,
                  price: `₦${parseFloat(variant.price.toString()).toFixed(2)}`,
                  numericPrice: parseFloat(variant.price.toString()),
                  measurement: variant.measurement,
                  measurementType: variant.measurementType,
                }))
              : []
            : [],
          extraGroups: Array.from(uniqueGroups.values()).map((group: any) => ({
            id: group.id,
            name: group.name,
            description: group.description || undefined,
            isGlobal: group.isGlobal,
            minSelections: group.minSelections,
            maxSelections: group.maxSelections,
            items: (group.items || []).map((extraItem: any) => ({
              id: extraItem.id,
              name: extraItem.name,
              price: parseFloat(extraItem.price.toString()),
              imageUrl: extraItem.imageUrl || undefined,
            })),
          })),
        }
      }),
  }))
}
