"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "@/lib/motion"
import { ShoppingBag, X } from "lucide-react"
import { getCart, getCartTotals } from "@/lib/cart-utils"
import { Button } from "@/components/ui/button"

export default function MiniCart() {
  const [open, setOpen] = useState(true)
  const [pulse, setPulse] = useState(false)
  const [itemCount, setItemCount] = useState(0)
  const [subtotal, setSubtotal] = useState(0)

  const refresh = () => {
    const cart = getCart()
    const { itemCount, subtotal } = getCartTotals(cart)
    setItemCount(itemCount)
    setSubtotal(subtotal)
  }

  useEffect(() => {
    refresh()

    const onCartUpdated = () => {
      refresh()
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 600)
      return () => clearTimeout(t)
    }

    const onItemAdded = () => {
      setOpen(true)
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 800)
      return () => clearTimeout(t)
    }

    window.addEventListener("cartUpdated", onCartUpdated as any)
    window.addEventListener("cartItemAdded", onItemAdded as any)
    window.addEventListener("storage", (e) => {
      if (e.key === "tastyBowlsCart") refresh()
    })
    return () => {
      window.removeEventListener("cartUpdated", onCartUpdated as any)
      window.removeEventListener("cartItemAdded", onItemAdded as any)
    }
  }, [])

  if (itemCount === 0) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <motion.div
            animate={pulse ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-xl"
          >
            <div className="relative">
              <div className="rounded-md bg-gray-900 p-2 text-white">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                {itemCount}
              </span>
            </div>
            <div className="min-w-[140px]">
              <div className="text-xs text-gray-500">Subtotal</div>
              <div className="text-lg font-semibold">₦{subtotal.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="rounded-lg bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20">
                <Link href="/cart">View Cart</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-lg border-2 border-gray-200 hover:border-gray-300">
                <Link href="/checkout">Checkout</Link>
              </Button>
            </div>
            <button onClick={() => setOpen(false)} className="ml-1 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 