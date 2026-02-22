"use client"

import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "@/lib/motion"
import { ChevronRight, ChevronLeft, Star, Clock, Users, Heart, ShoppingCart, Eye, Utensils, Droplets, Package, Hash, Ruler, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { addToCart, getMeasurementIcon } from "@/lib/cart-utils"
import AddToCartModal from "@/components/add-to-cart-modal"
// Define types for menu items from API
type MeasurementType = 'litres' | 'plates' | 'packs' | 'pcs'
interface MenuVariant { name: string; price: string; numericPrice: number; measurement?: string; measurementType?: MeasurementType }
interface MenuItem { id: string; name: string; description: string; price: string; basePrice: number; image: string; tags: string[]; dietary?: string[]; allergens?: string[]; cookingMethod?: string[]; mealType?: string[]; nutritionalHighlights?: string[]; variants?: MenuVariant[]; serving?: string; serves?: string; measurement?: string; measurementType?: MeasurementType; specialOffer?: string; rating?: number; prepTime?: string; difficulty?: 'Easy' | 'Medium' | 'Hard'; spiceLevel?: 1 | 2 | 3 | 4 | 5; origin?: string; isFeatured?: boolean; extraGroups?: Array<{ id: string; name: string; description?: string; isGlobal?: boolean; minSelections?: number; maxSelections?: number; items: Array<{ id: string; name: string; price: number; imageUrl?: string }> }> }

// Skeleton Loading Component
function FeaturedDishesSkeleton() {
  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl overflow-hidden">
      <div className="relative overflow-hidden px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Image Section Skeleton */}
          <div className="relative">
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <div className="w-full h-full bg-gray-200 animate-pulse"></div>
              
              {/* Floating badges skeleton */}
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                <div className="h-8 w-20 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-300 rounded-full animate-pulse"></div>
              </div>

              {/* Favorite button skeleton */}
              <div className="absolute top-6 right-6 w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
            </div>

            {/* Thumbnail navigation skeleton */}
            <div className="flex justify-center mt-6 gap-3">
              {[...Array(7)].map((_, index) => (
                <div
                  key={index}
                  className="w-16 h-16 rounded-lg bg-gray-200 animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Content Section Skeleton */}
          <div className="space-y-6">
            <div>
              <div className="h-12 w-3/4 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
              <div className="h-1 w-24 bg-gray-200 animate-pulse rounded-full mb-6"></div>
            </div>

            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-4/5 bg-gray-200 animate-pulse rounded"></div>
            </div>

            {/* Price and actions skeleton */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl">
              <div>
                <div className="h-12 w-24 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-3 w-20 bg-gray-200 animate-pulse rounded mt-2"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-12 w-32 bg-gray-200 animate-pulse rounded-full"></div>
                <div className="h-12 w-36 bg-gray-200 animate-pulse rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Skeleton */}
      <div className="text-center pb-12 px-6">
        <div className="bg-gray-200 rounded-3xl p-8 animate-pulse">
          <div className="h-8 w-48 bg-gray-300 rounded mx-auto mb-4"></div>
          <div className="h-4 w-64 bg-gray-300 rounded mx-auto mb-6"></div>
          <div className="h-12 w-40 bg-gray-300 rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  )
}

// Helper function to render measurement icon
const renderMeasurementIcon = (measurementType?: string) => {
  const iconName = getMeasurementIcon(measurementType)
  const iconProps = { className: "h-3 w-3" }
  
  switch (iconName) {
    case 'Droplets':
      return <Droplets {...iconProps} />
    case 'Utensils':
      return <Utensils {...iconProps} />
    case 'Package':
      return <Package {...iconProps} />
    case 'Hash':
      return <Hash {...iconProps} />
    default:
      return <Ruler {...iconProps} />
  }
}

// Helper function to get tag icon - consistent with menu page
const getTagIcon = () => {
  return <Tag className="h-3 w-3" />
}

// Main Featured Dishes Component
function FeaturedDishesContent() {
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<MenuVariant | null>(null)
  const [selectedExtras, setSelectedExtras] = useState<Record<string, string[]>>({})
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const [addedItem, setAddedItem] = useState<{ id: string; name: string; image: string; price: number; quantity: number; variant?: string } | null>(null)
  const [featuredDishes, setFeaturedDishes] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch featured dishes from API
  useEffect(() => {
    const fetchFeaturedDishes = async () => {
      try {
        const response = await fetch('/api/menu')
        if (response.ok) {
          const data = await response.json()
          // Get featured dishes (items with isFeatured = true)
          const allItems = data.data.flatMap((category: any) => category.items)
          let featured = allItems.filter((item: MenuItem) => item.isFeatured || (item.rating && item.rating >= 4.5))
          // Fallback: if none explicitly featured/high-rated, take the latest few with images
          if (featured.length === 0) {
            featured = allItems
              .filter((item: MenuItem) => !!item.image)
              .slice(0, 6)
          }
          setFeaturedDishes(featured.slice(0, 6)) // Limit to 6 featured dishes
        } else {
          console.error('Failed to fetch featured dishes')
        }
      } catch (error) {
        console.error('Error fetching featured dishes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedDishes()
  }, [])

  const toggleFavorite = (dishId: string) => {
    setFavorites(prev => 
      prev.includes(dishId) 
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId]
    )
  }

  const handleAddToCart = (dish: MenuItem, variant?: MenuVariant) => {
    const selectedVar = variant || selectedVariant || undefined
    const price = selectedVar ? selectedVar.numericPrice || parseFloat(selectedVar.price.replace(/[^0-9.]/g, '')) : dish.basePrice

    const extrasForCart = (dish.extraGroups || []).flatMap(group => {
      const selectedIds = selectedExtras[group.id] || []
      return group.items
        .filter(ex => selectedIds.includes(ex.id))
        .map(ex => ({
          id: ex.id,
          name: ex.name,
          price: ex.price,
          groupName: group.name,
        }))
    })

    for (const group of dish.extraGroups || []) {
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
      id: dish.id,
      name: dish.name,
      price: price,
      quantity: 1,
      image: dish.image,
      variant: selectedVar?.name,
      variantPrice: selectedVar ? selectedVar.numericPrice || parseFloat(selectedVar.price.replace(/[^0-9.]/g, '')) : undefined,
      measurement: selectedVar?.measurement || dish.measurement,
      measurementType: selectedVar?.measurementType || dish.measurementType,
      extras: extrasForCart,
    })
    
    // Show add to cart modal
    setAddedItem({
      id: dish.id,
      name: dish.name,
      image: dish.image,
      price: price,
      quantity: 1,
      variant: selectedVar?.name
    })
    setShowAddToCartModal(true)
    
    // Close modal if open
    if (selectedDish) {
      setSelectedDish(null)
      setSelectedVariant(null)
      setSelectedExtras({})
    }
  }

  const toggleExtraSelection = (groupId: string, extraId: string, maxSelections?: number) => {
    setSelectedExtras((prev) => {
      const current = prev[groupId] || []
      const isSelected = current.includes(extraId)
      if (isSelected) {
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

  // Show skeleton while loading
  if (isLoading) {
    return <FeaturedDishesSkeleton />
  }

  // Graceful fallback when there are no featured dishes (e.g., API failure)
  if (!featuredDishes || featuredDishes.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h3 className="text-xl sm:text-2xl font-semibold">No featured dishes available</h3>
          <p className="text-gray-600 mt-2">Please check back later.</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Clean Grid Layout - Like Hubtel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {featuredDishes.map((dish, index) => (
          <motion.div
            key={dish.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl overflow-hidden cursor-pointer relative group w-full aspect-square"
          >
            {/* Image with overlay - All content on overlay */}
            <div className="relative w-full h-full">
              <Image
                src={dish.image || "/placeholder.svg"}
                alt={dish.name}
                fill
                className="object-cover"
              />
              {/* Overlay gradient - Clean and organized */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
              
              {/* All content organized on overlay - Bolt Food style */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5">
                {/* Top section - Tags if available */}
                {(dish.tags ?? []).length > 0 && (
                  <div className="flex gap-2 mb-auto">
                    <span className="bg-white/90 text-gray-900 text-xs font-medium px-2.5 py-1 rounded-full">
                      {dish.tags[0]}
                    </span>
                  </div>
                )}
                
                {/* Bottom section - All content organized */}
                <div className="space-y-3">
                  {/* Name and Description */}
                  <div>
                    <h3 className="text-white font-semibold text-lg sm:text-xl mb-1.5 drop-shadow-lg leading-tight">{dish.name}</h3>
                    <p className="text-white/90 text-sm line-clamp-2 drop-shadow leading-snug">{dish.description}</p>
                  </div>
                  
                  {/* Price and Add button - Clean organization */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/20">
                    <div>
                      <span className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">{dish.price}</span>
                      {dish.serves && (
                        <p className="text-white/80 text-xs mt-0.5">Serves {dish.serves}</p>
                      )}
                    </div>
                    
                    {/* Small Add to Cart card - Bolt Food style */}
                    <button
                      onClick={() => {
                        if (dish.variants && dish.variants.length > 0) {
                          setSelectedDish(dish)
                          setSelectedVariant(dish.variants[0])
                          setSelectedExtras({})
                        } else if (dish.extraGroups && dish.extraGroups.length > 0) {
                          setSelectedDish(dish)
                          setSelectedVariant(null)
                          setSelectedExtras({})
                        } else {
                          handleAddToCart(dish)
                        }
                      }}
                      className="group inline-flex h-11 w-11 items-center justify-center rounded-md border border-orange-500 bg-orange-500 text-black hover:bg-black hover:border-black transition-all duration-200 shadow-sm flex-shrink-0"
                    >
                      <ShoppingCart className="h-5 w-5 text-black group-hover:text-orange-400 transition-colors duration-200" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA removed per request */}

      {/* Dish Details Modal */}
      {selectedDish && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto mx-4 border border-gray-100 shadow-xl"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold leading-tight flex-1 mr-4">{selectedDish.name}</h2>
              <button
                onClick={() => {
                  setSelectedDish(null)
                  setSelectedVariant(null)
                  setSelectedExtras({})
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
              <Image
                src={selectedDish.image}
                alt={selectedDish.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">
                    {selectedVariant ? selectedVariant.price : selectedDish.price}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedDish.tags.map((tag: string) => (
                    <Badge key={tag} className="bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium flex items-center gap-1.5 hover:bg-slate-200 transition-colors">
                      {getTagIcon()}
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedDish.specialOffer && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <span className="text-orange-700 font-medium">Special: {selectedDish.specialOffer}</span>
                </div>
              )}

              <p className="text-gray-700 text-lg leading-relaxed">
                {selectedDish.description}
              </p>

              {selectedDish.variants && selectedDish.variants.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg mb-3">Choose Your Option:</h4>
                  <div className="grid gap-3">
                    {selectedDish.variants.map((variant: MenuVariant, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariant(variant)}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          selectedVariant?.name === variant.name
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedVariant?.name === variant.name
                              ? 'border-primary bg-primary'
                              : 'border-gray-300'
                          }`}>
                            {selectedVariant?.name === variant.name && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <div>
                            <span className="font-medium">{variant.name}</span>
                            {variant.measurement && (
                              <span className="text-sm text-gray-500 block flex items-center gap-1">
                                <span>{renderMeasurementIcon(variant.measurementType)}</span>
                                {variant.measurement}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-primary">{variant.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedDish.extraGroups && selectedDish.extraGroups.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Extras</h4>
                  {selectedDish.extraGroups.map((group) => (
                    <div key={group.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{group.name}</p>
                          {group.description && (
                            <p className="text-xs text-gray-500">{group.description}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Min {group.minSelections || 0} / Max {group.maxSelections === 0 ? "∞" : group.maxSelections}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        {group.items.map((extra) => {
                          const selected = (selectedExtras[group.id] || []).includes(extra.id)
                          return (
                            <label key={extra.id} className={cn(
                              "flex items-center justify-between gap-3 rounded-md border px-3 py-2",
                              selected ? "border-orange-200 bg-orange-50/60" : "border-gray-100"
                            )}>
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleExtraSelection(group.id, extra.id, group.maxSelections)}
                                />
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                                  <Image
                                    src={extra.imageUrl || "/placeholder.jpg"}
                                    alt={extra.name}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                </div>
                                <span className="truncate text-sm text-gray-800">{extra.name}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-700">₦{extra.price.toFixed(2)}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-6">
                <Button 
                  onClick={() => handleAddToCart(selectedDish!, selectedVariant || undefined)}
                  className="w-full rounded-lg text-lg py-4 bg-orange-500 hover:bg-orange-400 text-black border border-orange-500 shadow-lg shadow-orange-500/20"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => toggleFavorite(selectedDish.id)}
                  className="w-full rounded-lg py-3 flex items-center justify-center gap-2 border-2 border-gray-900 bg-gray-900 text-white hover:bg-gray-800 hover:border-gray-800"
                >
                  <Heart className={`h-5 w-5 ${
                    favorites.includes(selectedDish.id) 
                      ? 'text-red-400 fill-current' 
                      : 'text-white'
                  }`} />
                  {favorites.includes(selectedDish.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}


      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => {
          setShowAddToCartModal(false)
          setAddedItem(null)
        }}
        item={addedItem}
      />
    </motion.div>
  )
}

// Main Export with Suspense and Dynamic Loading
export default function FeaturedDishes() {
  return (
    <Suspense fallback={<FeaturedDishesSkeleton />}>
      <FeaturedDishesContent />
    </Suspense>
  )
}

// Also export the skeleton for use in other components if needed
export { FeaturedDishesSkeleton }
