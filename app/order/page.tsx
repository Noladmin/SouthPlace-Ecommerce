"use client"

import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ShoppingBag, Plus, Minus, ChefHat, Utensils, Gift, Eye, Heart, ShoppingCart, Droplets, Package, Hash, Ruler, Tag } from "lucide-react"
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
    items: Array<{ id: string; name: string; price: number }>
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
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState("all")
  const [menuCategories, setMenuCategories] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<MenuVariant | null>(null)
  const [selectedExtras, setSelectedExtras] = useState<Record<string, string[]>>({})
  const [showAddedToast, setShowAddedToast] = useState(false)
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
        alert(`Please select at least ${min} option(s) for ${group.name}.`)
        return
      }
      if (max > 0 && selectedIds.length > max) {
        alert(`Please select no more than ${max} option(s) for ${group.name}.`)
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
    
    // Show toast notification
    setShowAddedToast(true)
    setTimeout(() => setShowAddedToast(false), 3000)
    
    // Close modal if open
    if (selectedItem) {
      setSelectedItem(null)
      setSelectedVariant(null)
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
        alert(`You can select up to ${maxSelections} option(s) for this group.`)
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
    <div 
      className="pt-24 pb-16 bg-gradient-to-br from-orange-50 via-white to-amber-50/30 min-h-screen"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div
          className="max-w-5xl mx-auto mb-16"
        >
          <div className="relative overflow-hidden rounded-3xl border border-orange-100/70 bg-gradient-to-br from-white via-orange-50/60 to-orange-100/40 p-6 sm:p-10 shadow-2xl">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />
            <div className="absolute -left-28 bottom-0 h-56 w-56 rounded-full bg-orange-300/20 blur-3xl" />
            <div className="relative z-10 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-600/10 px-4 py-1.5 text-sm font-semibold text-orange-700 border border-orange-200">
                🍽️ Order Now
              </span>
              <h1 className="mt-4 text-4xl md:text-6xl font-bold font-display text-gray-900">
                Fast, Easy Ordering
              </h1>
              <p className="mt-3 text-lg md:text-xl text-gray-700">
                Browse, add to cart, and checkout in minutes. Delivery or pickup, your choice.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/menu" className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-3 text-black font-semibold shadow-lg hover:bg-orange-500 transition-colors">
                  Browse Full Menu
                </Link>
                <Link href="/cart" className="inline-flex items-center justify-center rounded-xl border-2 border-orange-200 bg-white px-6 py-3 text-orange-700 font-semibold hover:bg-orange-50 transition-colors">
                  Review Cart
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                {[
                  { title: "1. Choose", body: "Pick dishes and sizes you love." },
                  { title: "2. Customize", body: "Adjust quantities and add notes." },
                  { title: "3. Checkout", body: "Fast payment, delivery or pickup." },
                ].map((step) => (
                  <div key={step.title} className="rounded-2xl border border-orange-100 bg-white/80 px-4 py-3 shadow-sm">
                    <p className="text-sm font-semibold text-orange-700">{step.title}</p>
                    <p className="text-sm text-gray-600">{step.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Categories and Menu Items */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Category Navigation */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10">
              {menuCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "px-6 py-3 rounded-2xl border-2 text-base font-semibold transition-all shadow-lg",
                    activeCategory === category.id
                      ? "bg-orange-600 text-white border-transparent shadow-orange-200"
                      : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:shadow-xl"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-bold",
                      activeCategory === category.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    )}>{category.items.length}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Menu Items */}
            
              {menuCategories
                .filter((category) => category.id === activeCategory)
                .map((category) => (
                  <div 
                    key={category.id}
                  >
                    <div className="mb-10">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                          <span className="text-3xl">{category.icon}</span>
                        </div>
                        <div>
                          <h2 className="text-4xl font-bold font-display text-orange-600">{category.name}</h2>
                          <div className={`h-1.5 w-20 bg-orange-600 rounded-full mt-3`}></div>
                        </div>
                      </div>
                      
                      <div className="grid gap-6">
                        {category.items.map((item: MenuItem) => (
                          <div
                            key={item.id}
                            className="bg-white rounded-3xl overflow-hidden border-2 border-gray-100 shadow-xl hover:shadow-2xl hover:border-orange-200 transition-all flex flex-col md:flex-row group"
                          >
                            <div className="relative h-64 md:h-auto md:w-80 overflow-hidden">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              {item.tags.slice(0, 2).map((tag: string, idx: number) => (
                                <Badge 
                                  key={idx}
                                  className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-900 border-0 text-xs font-semibold px-3 py-1.5 shadow-lg"
                                  style={{ top: `${16 + idx * 36}px` }}
                                >
                                  {getTagIcon()}
                                  <span className="ml-1.5">{tag}</span>
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="p-8 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between mb-4">
                                  <h3 className="text-2xl font-bold leading-tight text-gray-900">{item.name}</h3>
                                  <span className="text-3xl font-bold text-orange-600 ml-4">₦{item.basePrice.toFixed(2)}</span>
                                </div>
                                <p className="text-gray-600 text-base mb-6 leading-relaxed">{item.description}</p>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                                <Button 
                                  onClick={() => {
                                    if (item.variants && item.variants.length > 0) {
                                      viewDetails(item)
                                    } else {
                                      handleAddToCart(item)
                                    }
                                  }} 
                                  size="lg"
                                  className="w-full sm:flex-1 rounded-xl px-6 py-6 text-base font-semibold bg-orange-600 hover:bg-orange-500 text-black shadow-xl group/btn"
                                >
                                  <Plus className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                                  <span>{item.variants && item.variants.length > 0 ? 'Choose Size' : 'Add to Cart'}</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => viewDetails(item)}
                                  className="w-full sm:w-auto rounded-xl px-6 py-6 border-2 hover:border-orange-300 hover:bg-orange-50 group/view"
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
              className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8 sticky top-20 lg:top-24 border-2 border-gray-100 mb-4 lg:mb-0"
            >
              {/* Cart Header - Mobile optimized */}
              <div className="flex items-center justify-between mb-6 lg:mb-8">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <ShoppingBag className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold font-display text-gray-900">Your Order</h2>
                    <p className="text-orange-600 text-sm lg:text-base font-semibold">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                <div className="lg:hidden">
                  <Link href="/cart">
                    <Button variant="outline" size="sm" className="text-xs border-2 rounded-xl">
                      View Cart
                    </Button>
                  </Link>
                </div>
              </div>

              {itemCount === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-semibold text-lg mb-2">Your cart is empty</p>
                  <p className="text-gray-500 text-sm">Add some delicious items to get started</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-8 max-h-96 overflow-y-auto pr-2">
                    {cart.map((item) => {
                      // Create unique key that includes variant
                      const uniqueKey = item.variant ? `${item.id}-${item.variant}` : `${item.id}`
                      const itemPrice = item.variantPrice || item.price
                      const extrasKey = getExtrasKey(item)
                      const extrasTotal = (item.extras || []).reduce((sum: number, ex: any) => sum + ex.price, 0)
                      
                      return (
                        <div
                          key={uniqueKey}
                          className="flex items-center justify-between p-5 bg-orange-50 rounded-2xl border-2 border-orange-100 hover:shadow-lg transition-all"
                        >
                          <div className="flex-1 mr-4">
                            <h4 className="font-bold text-base leading-tight text-gray-900">
                              {item.name}
                              {item.variant && (
                                <span className="text-gray-600 text-sm font-medium block flex items-center gap-1 mt-1">
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
                            <p className="text-orange-600 font-bold text-lg mt-1">₦{itemPrice.toFixed(2)}</p>
                            {item.extras && item.extras.length > 0 && (
                              <p className="text-xs text-gray-600 mt-1">Extras: {item.extras.map((ex: any) => ex.name).join(", ")}</p>
                            )}
                          </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.variant, extrasKey)}
                            className="w-9 h-9 rounded-xl border-2 hover:border-orange-300 hover:bg-orange-50"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center font-bold text-lg text-gray-900">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.variant, extrasKey)}
                            className="w-9 h-9 rounded-xl border-2 hover:border-orange-300 hover:bg-orange-50"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Cart Total */}
                  <div className="border-t-2 border-gray-200 pt-6 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-600">Subtotal:</span>
                      <span className="text-2xl font-bold text-gray-900">₦{subtotal.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Delivery fee calculated at checkout</p>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    asChild
                    size="lg"
                    className="w-full rounded-2xl py-7 text-lg font-bold shadow-2xl transition-all duration-300 bg-orange-600 hover:bg-orange-500 text-black border-0"
                  >
                    <a
                      href="/checkout"
                      className="flex items-center justify-center gap-3"
                    >
                      <ShoppingCart className="h-6 w-6" />
                      Proceed to Checkout
                    </a>
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
                            <label key={extra.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleExtraSelection(group.id, extra.id, group.maxSelections)}
                                />
                                <span className="text-sm text-gray-800">{extra.name}</span>
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

      {/* Toast Notification */}
      {showAddedToast && (
        <div className="fixed bottom-8 right-8 z-[101]">
          <div
            className="bg-orange-600 text-black px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white"
          >
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-lg">Added to cart!</span>
              <p className="text-white/90 text-sm">Item added successfully</p>
            </div>
          </div>
        </div>
      )}
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
