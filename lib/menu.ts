export type MeasurementType = "litres" | "plates" | "packs" | "pcs"

export interface MenuVariant {
  name: string
  price: string
  numericPrice: number
  measurement?: string
  measurementType?: MeasurementType
}

export interface MenuExtraItem {
  id: string
  name: string
  price: number
  imageUrl?: string
}

export interface MenuExtraGroup {
  id: string
  name: string
  description?: string
  isGlobal?: boolean
  minSelections?: number
  maxSelections?: number
  items: MenuExtraItem[]
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  basePrice: number
  image: string
  tags: string[]
  dietary?: string[]
  allergens?: string[]
  cookingMethod?: string[]
  mealType?: string[]
  nutritionalHighlights?: string[]
  variants?: MenuVariant[]
  serving?: string
  serves?: string
  measurement?: string
  measurementType?: MeasurementType
  specialOffer?: string
  rating?: number
  prepTime?: string
  difficulty?: "Easy" | "Medium" | "Hard"
  spiceLevel?: 1 | 2 | 3 | 4 | 5
  origin?: string
  isFeatured?: boolean
  extraGroups?: MenuExtraGroup[]
}

export interface MenuCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  items: MenuItem[]
}

export function getInitialMenuVariant(item: MenuItem): MenuVariant | null {
  return item.variants && item.variants.length > 0 ? item.variants[0] : null
}

export function getMenuItemHref(itemId: string): string {
  return `/menu/${itemId}`
}
