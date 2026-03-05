"use client"

import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ShoppingBag, Plus, Minus, ChefHat, Utensils, Gift, Eye, Heart, ShoppingCart, Droplets, Package, Hash, Ruler, Tag } from "lucide-react"
import AddToCartModal from "@/components/add-to-cart-modal"
// Define types for menu items
interface MenuVariant {
  name: string
  price: string
  numericPrice: number
  measurement?: string
  measurementType?: 'litres' | 'plates' | 'packs' | 'pcs'
}

interface MenuItem {
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
  measurementType?: 'litres' | 'plates' | 'packs' | 'pcs'
  specialOffer?: string
  rating?: number
  prepTime?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  spiceLevel?: 1 | 2 | 3 | 4 | 5
  origin?: string
  extraGroups?: Array<{
    id: string
    name: string
    description?: string
    isGlobal?: boolean
    minSelections?: number
    maxSelections?: number
    items: Array<{ id: string; name: string; price: number; imageUrl?: string }>
  }>
}
import { getCart, addToCart, updateCartItemQuantity, removeFromCart, getCartTotals, getMeasurementIcon } from "@/lib/cart-utils"
import { OrderSkeleton } from "@/components/OrderSkeleton"

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

function OrderContent() {
  const { toast } = useToast()
  const [activeCategory, setActiveCategory] = useState("all")
  const [menuCategories, setMenuCategories] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<MenuVariant | null>(null)
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load cart on mount and listen for updates
    const updateCart = () => {
      setCart(getCart())
    }
    
    updateCart()
    
    const handleCartUpdate = () => updateCart()
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  useEffect(() => {
    // Fetch menu data from API
    const fetchMenuData = async () => {
      try {
        const response = await fetch('/api/menu')
        const data = await response.json().catch(() => null)
        if (response.ok && data?.success !== false) {
          setMenuCategories(data?.data || [])
        } else {
          console.error('Failed to fetch menu data', {
            status: response.status,
            statusText: response.statusText,
            error: data?.error || data?.details || null,
          })
          setMenuCategories([])
        }
      } catch (error) {
        console.error('Error fetching menu data:', error)
        setMenuCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuData()
  }, [])

  useEffect(() => {
    if (menuCategories.length === 0) return
    const hasActive = menuCategories.some((category) => category.id === activeCategory)
    if (!hasActive) {
      setActiveCategory(menuCategories[0].id)
    }
  }, [menuCategories, activeCategory])

  const handleAddToCart = (item: MenuItem, variant?: MenuVariant) => {
    const selectedVar = variant || selectedVariant || undefined

    const extrasForCart = (item.extraGroups || []).flatMap(group => {
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
      price: selectedVar ? selectedVar.numericPrice : item.basePrice,
      quantity: 1,
      image: item.image,
      variant: selectedVar?.name,
      variantPrice: selectedVar ? selectedVar.numericPrice : undefined,
      measurement: selectedVar?.measurement || item.measurement,
      measurementType: selectedVar?.measurementType || item.measurementType,
      extras: extrasForCart,
    })

    setAddedItem({
      id: item.id,
      name: item.name,
      image: item.image,
      price: selectedVar ? selectedVar.numericPrice : item.basePrice,
      quantity: 1,
      variant: selectedVar?.name,
      extras: extrasForCart,
    })
    setShowAddToCartModal(true)
    
    // Close modal if open
    if (selectedItem) {
      setSelectedItem(null)
      setSelectedVariant(null)
      setSelectedExtras({})
    }
  }

  const viewDetails = (item: MenuItem) => {
    setSelectedItem(item)
    setSelectedExtras({})
    // Reset selectedVariant and only set it if the item has variants
    if (item.variants && item.variants.length > 0) {
      setSelectedVariant(item.variants[0])
    } else {
      setSelectedVariant(null) // Important: Reset to null for items without variants
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

  const getExtrasKey = (item: any) => {
    return item.extras && item.extras.length
      ? item.extras.map((e: any) => `${e.id}`).sort().join("|")
      : ""
  }

  const handleUpdateQuantity = (id: string, newQuantity: number, variant?: string, extrasKey?: string) => {
    updateCartItemQuantity(id, newQuantity, variant, extrasKey)
  }

  const handleRemoveFromCart = (id: string, variant?: string, extrasKey?: string) => {
    removeFromCart(id, variant, extrasKey)
  }

  const { subtotal, itemCount } = getCartTotals(cart)
  const currentCategory = menuCategories.find(cat => cat.id === activeCategory)

  if (isLoading) {
    return null // Suspense will handle the loading state
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-orange-100/30 pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quick Order</h1>
            <p className="text-sm text-gray-600 mt-1">Choose items and checkout fast.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/menu" className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50 transition-colors">
              Browse Full Menu
            </Link>
            <Link href="/cart" className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-500 transition-colors">
              Review Cart
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Categories and Menu Items */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Category Navigation */}
            <div className="mb-6">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
              {menuCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                      "shrink-0 rounded-full px-5 py-2.5 text-sm font-medium border-2 transition-all",
                    activeCategory === category.id
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                    <span>{category.name}</span>
                    <span className={cn(
                        "text-xs",
                      activeCategory === category.id
                          ? "text-white/90"
                          : "text-gray-500"
                    )}>{category.items.length}</span>
                  </div>
                </button>
              ))}
            </div>
            </div>

            {/* Menu Items */}
            
              {menuCategories
                .filter((category) => category.id === activeCategory)
                .map((category) => (
                  <div 
                    key={category.id}
                  >
                    <div className="mb-10">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center">
                          <span className="text-2xl">{category.icon}</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                          <p className="text-sm text-gray-500">{category.items.length} item{category.items.length === 1 ? "" : "s"}</p>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 sm:gap-6">
                        {category.items.map((item: MenuItem) => (
                          <div
                            key={item.id}
                            className="bg-white/95 rounded-3xl overflow-hidden border border-orange-100/60 shadow-md shadow-orange-100/30 hover:shadow-lg hover:shadow-orange-200/30 transition-all flex flex-col md:flex-row group"
                          >
                            <div className="relative h-56 md:h-auto md:w-64 overflow-hidden">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                              {item.tags.slice(0, 2).map((tag: string, idx: number) => (
                                <Badge 
                                  key={idx}
                                  className="absolute top-4 left-4 bg-white/90 text-gray-900 border-0 text-xs font-semibold px-3 py-1 shadow-md"
                                  style={{ top: `${16 + idx * 36}px` }}
                                >
                                  {getTagIcon()}
                                  <span className="ml-1.5">{tag}</span>
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between bg-gradient-to-b from-white to-orange-50/20">
                              <div>
                                <div className="flex items-start justify-between mb-3 gap-3">
                                  <h3 className="text-xl sm:text-2xl font-bold leading-tight text-gray-900">{item.name}</h3>
                                  <span className="text-2xl sm:text-3xl font-bold text-orange-600 ml-2">₦{item.basePrice.toFixed(2)}</span>
                                </div>
                                <p className="text-gray-600 text-sm sm:text-base mb-5 leading-relaxed line-clamp-2">{item.description}</p>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                                <Button 
                                  onClick={() => viewDetails(item)}
                                  size="lg"
                                  className="w-full sm:flex-1 rounded-xl px-6 py-5 text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white shadow-sm group/btn"
                                >
                                  <Plus className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                                  <span>Customize</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => viewDetails(item)}
                                  className="w-full sm:w-auto rounded-xl px-6 py-5 border border-gray-900 bg-gray-900 text-white hover:bg-gray-800 hover:text-white group/view"
                                >
                                  <Eye className="h-5 w-5 group-hover/view:scale-110 transition-transform" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            
          </div>

          {/* Cart Sidebar - Mobile optimized */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div 
              className="bg-white rounded-2xl border border-orange-100 p-5 sticky top-20 lg:top-24 mb-4 lg:mb-0 shadow-lg"
            >
              {/* Cart Header - Mobile optimized */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-orange-700" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Your Order</h2>
                    <p className="text-gray-600 text-sm">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                <div className="lg:hidden">
                  <Link href="/cart">
                    <Button variant="outline" size="sm" className="text-xs rounded-lg border-orange-200 text-orange-700 hover:bg-orange-50">
                      View Cart
                    </Button>
                  </Link>
                </div>
              </div>

              {itemCount === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-orange-300" />
                  </div>
                  <p className="text-gray-700 font-semibold mb-1">Your cart is empty</p>
                  <p className="text-gray-500 text-sm">Add items to continue</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-3 mb-5 max-h-96 overflow-y-auto pr-1">
                    {cart.map((item) => {
                      const extrasKey = getExtrasKey(item)
                      const uniqueKey = item.variant ? `${item.id}-${item.variant}-${extrasKey}` : `${item.id}-${extrasKey}`
                      const itemPrice = item.variantPrice || item.price
                      const extrasTotal = (item.extras || []).reduce((sum: number, ex: any) => sum + ex.price, 0)
                      const lineTotal = (itemPrice + extrasTotal) * item.quantity
                      
                      return (
                        <div
                          key={uniqueKey}
                          className="rounded-xl border border-orange-100 bg-white p-3"
                        >
                          <div className="mb-3">
                            <h4 className="font-medium text-sm leading-tight text-gray-900">
                              {item.name}
                              {item.variant && (
                                <span className="text-gray-500 text-xs font-medium block flex items-center gap-1 mt-1">
                                  {item.variant}
                                  {item.measurement && (
                                    <>
                                      <span className="ml-1">{renderMeasurementIcon(item.measurementType)}</span>
                                      <span>{item.measurement}</span>
                                    </>
                                  )}
                                </span>
                              )}
                            </h4>
                            <p className="text-sm font-semibold text-gray-900 mt-1">₦{lineTotal.toFixed(2)}</p>
                            {item.extras && item.extras.length > 0 && (
                              <p className="text-xs text-gray-600 mt-1">Extras: {item.extras.map((ex: any) => ex.name).join(", ")}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                            <div className="flex items-center gap-0.5 bg-orange-50 rounded-xl border border-orange-100">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.variant, extrasKey)}
                                className="w-8 h-8 rounded-xl hover:bg-white active:bg-orange-100 transition-colors flex items-center justify-center"
                              >
                                <Minus className="h-3.5 w-3.5 text-gray-600" />
                              </button>
                              <span className="w-8 text-center font-medium text-gray-900 text-sm">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.variant, extrasKey)}
                                className="w-8 h-8 rounded-xl hover:bg-white active:bg-orange-100 transition-colors flex items-center justify-center"
                              >
                                <Plus className="h-3.5 w-3.5 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Cart Total */}
                  <div className="border-t border-orange-100 pt-4 mb-5">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <span className="text-base font-semibold text-gray-900">₦{subtotal.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500">Delivery fee calculated at checkout</p>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    asChild
                    size="lg"
                    className="w-full rounded-xl py-4 text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-black shadow-lg"
                  >
                    <Link href="/checkout" className="flex items-center justify-center gap-2.5">
                      <ShoppingCart className="h-5 w-5" />
                      Proceed to Checkout
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div
            className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-100"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-4xl font-bold text-orange-600">{selectedItem.name}</h2>
              <button
                onClick={() => {
                  setSelectedItem(null)
                  setSelectedVariant(null)
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="relative h-80 mb-8 rounded-3xl overflow-hidden shadow-xl">
              <Image
                src={selectedItem.image || "/placeholder.svg"}
                alt={selectedItem.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-bold text-orange-600">
                  ₦{selectedVariant ? selectedVariant.numericPrice.toFixed(2) : selectedItem.basePrice.toFixed(2)}
                </span>
                <div className="flex flex-wrap gap-2 justify-end">
                  {selectedItem.tags.map((tag: string) => (
                    <Badge key={tag} className="bg-orange-50 text-orange-700 border border-orange-200 text-sm font-semibold px-3 py-1.5 flex items-center gap-1.5 hover:bg-orange-100 transition-colors rounded-xl">
                      {getTagIcon()}
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">
                {selectedItem.description}
              </p>

              {selectedItem.measurement && !selectedItem.variants && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="text-blue-700 font-medium flex items-center gap-2">
                    {renderMeasurementIcon(selectedItem.measurementType)}
                    {selectedItem.measurement}
                  </span>
                </div>
              )}

              {selectedItem.variants && selectedItem.variants.length > 0 && (
                <div>
                  <h4 className="font-bold text-xl mb-4 text-gray-900">Choose Your Size:</h4>
                  <div className="grid gap-4">
                    {selectedItem.variants.map((variant: MenuVariant, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariant(variant)}
                        className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                          selectedVariant?.name === variant.name
                            ? 'border-orange-500 bg-orange-50 shadow-xl'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedVariant?.name === variant.name
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedVariant?.name === variant.name && (
                              <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div className="text-left">
                            <span className="font-bold text-lg text-gray-900">{variant.name}</span>
                            {variant.measurement && (
                              <span className="text-sm text-gray-600 font-medium flex items-center gap-1.5 mt-1">
                                <span>{renderMeasurementIcon(variant.measurementType)}</span>
                                {variant.measurement}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-2xl text-orange-600">₦{variant.numericPrice.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.extraGroups && selectedItem.extraGroups.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-xl text-gray-900">Extras</h4>
                  {selectedItem.extraGroups.map((group) => (
                    <div key={group.id} className="rounded-2xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{group.name}</p>
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
                              "flex items-center justify-between gap-3 rounded-xl border px-3 py-2",
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
                              <span className="text-sm font-semibold text-gray-700">₦{extra.price.toFixed(2)}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <Button 
                  onClick={() => handleAddToCart(selectedItem, selectedVariant || undefined)}
                  className="flex-1 rounded-2xl text-lg py-7 font-bold shadow-2xl bg-orange-600 hover:bg-orange-500 text-black border-0 group"
                >
                  <Plus className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Add to Cart {selectedVariant && `- ${selectedVariant.name}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => {
          setShowAddToCartModal(false)
          setAddedItem(null)
        }}
        item={addedItem}
      />
    </div>
  )
}

export default function OrderPage() {
  return (
    <Suspense fallback={<OrderSkeleton />}>
      <OrderContent />
    </Suspense>
  )
}
