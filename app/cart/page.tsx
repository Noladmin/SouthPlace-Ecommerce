"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "@/lib/motion"
import { ShoppingBag, Plus, Minus, Trash2, ArrowLeft, Gift, Utensils, Droplets, Package, Hash, Ruler } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCart, updateCartItemQuantity, removeFromCart, getCartTotals, getMeasurementIcon, type CartItem } from "@/lib/cart-utils"

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

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load cart on mount and listen for updates
    const updateCart = () => {
      setCart(getCart())
      setIsLoading(false)
    }

    updateCart()

    const handleCartUpdate = () => updateCart()
    window.addEventListener('cartUpdated', handleCartUpdate)

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tastyBowlsCart') {
        updateCart()
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const getExtrasKey = (item: CartItem) => {
    return item.extras && item.extras.length
      ? item.extras.map(e => `${e.id}`).sort().join("|")
      : ""
  }

  const handleUpdateQuantity = (id: string, newQuantity: number, variant?: string, extrasKey?: string) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(id, variant, extrasKey)
    } else {
      updateCartItemQuantity(id, newQuantity, variant, extrasKey)
    }
  }

  const handleRemoveFromCart = (id: string, variant?: string, extrasKey?: string) => {
    removeFromCart(id, variant, extrasKey)
  }

  const { subtotal, itemCount } = getCartTotals(cart)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-orange-100/30 pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link href="/menu" className="inline-flex items-center rounded-md px-1 text-gray-700 hover:text-orange-700 hover:bg-orange-50 mb-4 sm:mb-6 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Continue Shopping</span>
          </Link>
          <div className="relative overflow-hidden rounded-3xl border border-orange-100/70 bg-gradient-to-br from-white via-orange-50/60 to-orange-100/40 p-6 sm:p-8 shadow-2xl">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />
            <div className="absolute -left-28 bottom-0 h-56 w-56 rounded-full bg-orange-300/20 blur-3xl" />
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Your Cart</h1>
                <p className="text-sm text-gray-600">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/order" className="inline-flex items-center justify-center rounded-xl border-2 border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50 transition-colors">
                  Quick Order
                </Link>
                <Link href="/menu" className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-black shadow-lg hover:bg-orange-500 transition-colors">
                  Browse Menu
                </Link>
              </div>
            </div>
          </div>
        </div>

        {itemCount === 0 ? (
          // Empty Cart State - Professional 2025 design
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100">
              <ShoppingBag className="h-12 w-12 text-orange-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add items to your cart to continue</p>
            <Button asChild size="lg" className="rounded-xl bg-orange-600 hover:bg-orange-500 text-black px-8 py-6 text-base font-semibold shadow-lg">
              <Link href="/menu">
                Browse Menu
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items - Professional 2025 design */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.map((item) => {
                  const uniqueKey = item.variant ? `${item.id}-${item.variant}` : `${item.id}`
                  const itemPrice = item.variantPrice || item.price
                  const extrasKey = getExtrasKey(item)
                  const extrasTotal = (item.extras || []).reduce((sum, ex) => sum + ex.price, 0)
                  const itemTotal = (itemPrice + extrasTotal) * item.quantity
                  
                  return (
                    <motion.div
                      key={uniqueKey}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white rounded-2xl border border-orange-100 p-4 hover:shadow-lg transition-all"
                    >
                      <div className="flex gap-4">
                        {/* Item Image - Professional square */}
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Item Details - Professional layout */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm text-gray-900 mb-0.5 leading-tight">{item.name}</h3>
                              {item.variant && (
                                <p className="text-xs text-gray-500">
                                  {item.variant}
                                  {item.measurement && ` • ${item.measurement}`}
                                </p>
                              )}
                              {item.extras && item.extras.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Extras: {item.extras.map(ex => ex.name).join(", ")}
                                </p>
                              )}
                            </div>
                            
                            {/* Remove button */}
                            <button
                              onClick={() => handleRemoveFromCart(item.id, item.variant, extrasKey)}
                              className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          
                          {/* Bottom: Price and Quantity - Professional layout */}
                          <div className="flex items-center justify-between">
                            <p className="text-base font-semibold text-gray-900">₦{itemTotal.toFixed(2)}</p>
                            
                            {/* Quantity Controls - Professional design */}
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
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Order Summary - Professional 2025 design (Bolt/Hubtel style) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-orange-100 p-5 sticky top-24 shadow-lg">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Summary</h2>
                
                <div className="space-y-2.5 mb-4 pb-4 border-b border-orange-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">₦{subtotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="mb-5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">₦{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-xl py-4 text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-black shadow-lg"
                >
                  <Link href="/checkout" className="flex items-center justify-center">
                    Proceed to Checkout
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
