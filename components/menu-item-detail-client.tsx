"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Clock3, Droplets, Flame, Globe2, Hash, Heart, Leaf, Package, ShieldAlert, ShoppingBag, Sparkles, Star, Users, Utensils } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import AddToCartModal from "@/components/add-to-cart-modal"
import { useToast } from "@/hooks/use-toast"
import { addToCart, getMeasurementIcon } from "@/lib/cart-utils"
import { cn } from "@/lib/utils"
import { MenuItem, MenuVariant, getInitialMenuVariant } from "@/lib/menu"

const renderMeasurementIcon = (measurementType?: string) => {
  const iconName = getMeasurementIcon(measurementType)
  const iconProps = { className: "h-4 w-4" }

  switch (iconName) {
    case "Droplets":
      return <Droplets {...iconProps} />
    case "Utensils":
      return <Utensils {...iconProps} />
    case "Package":
      return <Package {...iconProps} />
    case "Hash":
      return <Hash {...iconProps} />
    default:
      return <Utensils {...iconProps} />
  }
}

interface MenuItemDetailClientProps {
  item: MenuItem
  categoryName?: string
}

function getSpiceLevelLabel(level?: number): string | null {
  if (!level) return null
  if (level <= 2) return "Mild"
  if (level === 3) return "Medium"
  if (level === 4) return "Hot"
  return "Very hot"
}

export default function MenuItemDetailClient({ item, categoryName }: MenuItemDetailClientProps) {
  const { toast } = useToast()
  const [favorite, setFavorite] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<MenuVariant | null>(getInitialMenuVariant(item))
  const [selectedExtras, setSelectedExtras] = useState<Record<string, string[]>>({})
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const [addedItem, setAddedItem] = useState<{
    id: string
    name: string
    image: string
    price: number
    quantity: number
    variant?: string
    extras?: Array<{
      id: string
      name: string
      price: number
      groupName: string
    }>
  } | null>(null)

  const handleToggleExtra = (groupId: string, extraId: string, maxSelections?: number) => {
    setSelectedExtras((prev) => {
      const current = prev[groupId] || []
      const selected = current.includes(extraId)

      if (selected) {
        return { ...prev, [groupId]: current.filter((id) => id !== extraId) }
      }

      if (maxSelections && maxSelections > 0 && current.length >= maxSelections) {
        toast({
          title: "Selection Limit",
          description: `You can select up to ${maxSelections} option(s) for this group.`,
          variant: "destructive",
        })
        return prev
      }

      return { ...prev, [groupId]: [...current, extraId] }
    })
  }

  const handleAddToCart = () => {
    const price = selectedVariant?.numericPrice ?? item.basePrice
    const extrasForCart = (item.extraGroups || []).flatMap((group) => {
      const selectedIds = selectedExtras[group.id] || []
      return group.items
        .filter((extra) => selectedIds.includes(extra.id))
        .map((extra) => ({
          id: extra.id,
          name: extra.name,
          price: extra.price,
          groupName: group.name,
        }))
    })

    for (const group of item.extraGroups || []) {
      const selectedIds = selectedExtras[group.id] || []
      const min = group.minSelections || 0
      const max = group.maxSelections || 0

      if (selectedIds.length < min) {
        toast({
          title: "Selection Required",
          description: `Please select at least ${min} option(s) for ${group.name}.`,
          variant: "destructive",
        })
        return
      }

      if (max > 0 && selectedIds.length > max) {
        toast({
          title: "Selection Limit",
          description: `Please select no more than ${max} option(s) for ${group.name}.`,
          variant: "destructive",
        })
        return
      }
    }

    addToCart({
      id: item.id,
      name: item.name,
      price,
      quantity: 1,
      image: item.image,
      variant: selectedVariant?.name,
      variantPrice: selectedVariant?.numericPrice,
      measurement: selectedVariant?.measurement || item.measurement,
      measurementType: selectedVariant?.measurementType || item.measurementType,
      extras: extrasForCart,
    })

    setAddedItem({
      id: item.id,
      name: item.name,
      image: item.image,
      price,
      quantity: 1,
      variant: selectedVariant?.name,
      extras: extrasForCart,
    })
    setShowAddToCartModal(true)
  }

  const priceLabel = selectedVariant?.price || item.price
  const selectedMeasurement = selectedVariant?.measurement || item.measurement
  const selectedMeasurementType = selectedVariant?.measurementType || item.measurementType
  const spiceLevelLabel = getSpiceLevelLabel(item.spiceLevel)

  return (
    <>
      <section className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50/40 py-10 sm:py-14">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 md:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10 lg:px-12 xl:px-16">
          <div className="space-y-5">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to menu
            </Link>

            <div className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-xl shadow-orange-100/60">
              <div className="relative aspect-[4/3] w-full">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {categoryName ? (
                      <Badge className="rounded-full border-0 bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900">
                        {categoryName}
                      </Badge>
                    ) : null}
                    {item.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} className="rounded-full border-0 bg-orange-500/90 px-3 py-1 text-xs font-semibold text-white">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFavorite((current) => !current)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-md transition-colors hover:bg-white"
                    aria-label="Toggle favorite"
                  >
                    <Heart className={cn("h-5 w-5", favorite ? "fill-red-500 text-red-500" : "text-gray-900")} />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">Signature menu item</p>
                  <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{item.name}</h1>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-lg shadow-orange-100/50 sm:p-8">
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {item.rating ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700">
                    <Star className="h-4 w-4 fill-current" />
                    {item.rating.toFixed(1)}
                  </span>
                ) : null}
                {item.prepTime ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                    <Clock3 className="h-4 w-4" />
                    {item.prepTime}
                  </span>
                ) : null}
                {item.serves ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                    <Users className="h-4 w-4" />
                    Serves {item.serves}
                  </span>
                ) : null}
                {item.origin ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                    <Globe2 className="h-4 w-4" />
                    {item.origin}
                  </span>
                ) : null}
                {item.difficulty ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                    <Utensils className="h-4 w-4" />
                    {item.difficulty}
                  </span>
                ) : null}
                {spiceLevelLabel ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-700">
                    <Flame className="h-4 w-4" />
                    {spiceLevelLabel}
                  </span>
                ) : null}
                {selectedMeasurement ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                    {renderMeasurementIcon(selectedMeasurementType)}
                    {selectedMeasurement}
                  </span>
                ) : null}
                {item.serving ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                    <Package className="h-4 w-4" />
                    {item.serving}
                  </span>
                ) : null}
              </div>

              <p className="mt-5 text-base leading-8 text-gray-600 sm:text-lg">{item.description}</p>

              {item.specialOffer ? (
                <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-medium text-orange-800">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {item.specialOffer}
                  </span>
                </div>
              ) : null}

              {item.mealType && item.mealType.length > 0 ? (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">Meal type</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.mealType.map((entry) => (
                      <Badge key={entry} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-700">
                        {entry}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {(item.dietary && item.dietary.length > 0) || (item.cookingMethod && item.cookingMethod.length > 0) ? (
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {item.dietary && item.dietary.length > 0 ? (
                    <div className="rounded-2xl border border-gray-200 p-4">
                      <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
                        <Leaf className="h-4 w-4 text-green-600" />
                        Dietary
                      </h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.dietary.map((entry) => (
                          <Badge key={entry} className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700">
                            {entry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {item.cookingMethod && item.cookingMethod.length > 0 ? (
                    <div className="rounded-2xl border border-gray-200 p-4">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">Cooking method</h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.cookingMethod.map((entry) => (
                          <Badge key={entry} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-orange-700">
                            {entry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {item.nutritionalHighlights && item.nutritionalHighlights.length > 0 ? (
                <div className="mt-8 rounded-2xl border border-gray-200 p-4">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">Nutritional highlights</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.nutritionalHighlights.map((entry) => (
                      <Badge key={entry} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
                        {entry}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {item.allergens && item.allergens.length > 0 ? (
                <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-amber-800">
                    <ShieldAlert className="h-4 w-4" />
                    Allergens
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.allergens.map((entry) => (
                      <Badge key={entry} className="rounded-full border border-amber-300 bg-white px-3 py-1 text-amber-800">
                        {entry}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {item.variants && item.variants.length > 0 ? (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900">Choose an option</h2>
                  <div className="mt-4 grid gap-3">
                    {item.variants.map((variant) => (
                      <button
                        key={variant.name}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border p-4 text-left transition-all",
                          selectedVariant?.name === variant.name
                            ? "border-orange-500 bg-orange-50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-orange-300"
                        )}
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{variant.name}</p>
                          {variant.measurement ? (
                            <p className="mt-1 inline-flex items-center gap-2 text-sm text-gray-500">
                              {renderMeasurementIcon(variant.measurementType)}
                              {variant.measurement}
                            </p>
                          ) : null}
                        </div>
                        <span className="text-lg font-bold text-orange-600">{variant.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {item.extraGroups && item.extraGroups.length > 0 ? (
                <div className="mt-8 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Customize your order</h2>
                  {item.extraGroups.map((group) => (
                    <div key={group.id} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{group.name}</p>
                          {group.description ? (
                            <p className="mt-1 text-sm text-gray-500">{group.description}</p>
                          ) : null}
                        </div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Min {group.minSelections || 0} / Max {group.maxSelections === 0 ? "∞" : group.maxSelections}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-2">
                        {group.items.map((extra) => {
                          const selected = (selectedExtras[group.id] || []).includes(extra.id)

                          return (
                            <label
                              key={extra.id}
                              className={cn(
                                "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors",
                                selected ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"
                              )}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => handleToggleExtra(group.id, extra.id, group.maxSelections)}
                                />
                                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                  <Image
                                    src={extra.imageUrl || "/placeholder.jpg"}
                                    alt={extra.name}
                                    fill
                                    sizes="44px"
                                    className="object-cover"
                                  />
                                </div>
                                <span className="truncate text-sm font-medium text-gray-800">{extra.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-700">₦{extra.price.toFixed(2)}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="sticky bottom-4 rounded-[2rem] border border-gray-900 bg-gray-900 p-5 text-white shadow-2xl shadow-gray-900/20">
              <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Starting price</p>
                  <p className="mt-1 text-3xl font-bold">{priceLabel}</p>
                </div>
                <p className="max-w-[14rem] text-right text-sm text-white/70">
                  Final total updates when you choose a size or extras.
                </p>
              </div>

              <Button
                onClick={handleAddToCart}
                className="mt-4 h-14 w-full rounded-2xl bg-orange-500 text-base font-semibold text-black hover:bg-orange-400"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to cart
              </Button>
            </div>
          </div>
        </div>
      </section>

      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => {
          setShowAddToCartModal(false)
          setAddedItem(null)
        }}
        item={addedItem}
      />
    </>
  )
}
