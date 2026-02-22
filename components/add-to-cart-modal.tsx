"use client"

import { motion, AnimatePresence } from "@/lib/motion"
import Image from "next/image"
import Link from "next/link"
import { X, ShoppingBag, CheckCircle2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCart, updateCartItemQuantity } from "@/lib/cart-utils"
import { useEffect, useState } from "react"

interface AddToCartModalProps {
  isOpen: boolean
  onClose: () => void
  item: {
    id: string
    name: string
    image: string
    price: number
    quantity: number
    variant?: string
  } | null
}

export default function AddToCartModal({ isOpen, onClose, item }: AddToCartModalProps) {
  const [cart, setCart] = useState(getCart())

  useEffect(() => {
    if (isOpen && item) {
      setCart(getCart())
    }
  }, [isOpen, item])

  if (!isOpen || !item) return null

  const cartItem = cart.find(
    (ci) => ci.id === item.id && (ci.variant || '') === (item.variant || '')
  )

  const currentQuantity = cartItem?.quantity || item.quantity

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity <= 0) {
      onClose()
      return
    }
    updateCartItemQuantity(item.id, newQuantity, item.variant)
    setCart(getCart())
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && item && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal - Centered with proper constraints */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="max-w-xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="px-6 py-5 flex items-start justify-between border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-md bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold text-lg leading-none">Added to cart</h3>
                    <p className="text-gray-500 text-sm mt-1 truncate">{item.name}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-gray-700" />
                </button>
              </div>

              {/* Item Details */}
              <div className="p-6">
                <div className="grid grid-cols-[96px_1fr] gap-4 mb-5">
                  <div className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-base mb-1 truncate">{item.name}</h4>
                    {item.variant && (
                      <p className="text-sm text-gray-500 mb-2">{item.variant}</p>
                    )}
                    <p className="text-2xl font-bold text-gray-900">₦{item.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">Unit price</p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md border border-gray-100 mb-5">
                  <span className="text-sm font-medium text-gray-700">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdateQuantity(currentQuantity - 1)}
                      className="w-10 h-10 rounded-md border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="w-12 text-center font-semibold text-gray-900">{currentQuantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(currentQuantity + 1)}
                      className="w-10 h-10 rounded-md border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 mb-5 border-y border-gray-100">
                  <span className="text-sm text-gray-600">Line total</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ₦{(item.price * currentQuantity).toFixed(2)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <Button
                    asChild
                    className="w-full py-6 text-base font-semibold bg-gray-900 hover:bg-gray-800 text-white border border-gray-900"
                  >
                    <Link href="/cart" onClick={onClose}>
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      View Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full py-3 border-2 border-orange-500 bg-orange-500 text-black hover:bg-orange-400 hover:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 transition-all"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
