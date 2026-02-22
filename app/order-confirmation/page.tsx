"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, ArrowRight } from "lucide-react"

interface LastOrder {
  orderNumber?: string
  total?: number
  status?: string
  items?: any[]
  deliveryInfo?: any
  paymentInfo?: any
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const params = useSearchParams()
  const orderId = params.get("orderId")
  const [order, setOrder] = useState<LastOrder | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lastOrder")
      if (stored) setOrder(JSON.parse(stored))
    } catch {}
  }, [])

  const headline = useMemo(() => {
    if (order?.orderNumber) return `Order ${order.orderNumber} confirmed!`
    return "Order confirmed!"
  }, [order])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center">
        <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2 font-display">{headline}</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order{order?.deliveryInfo?.firstName ? `, ${order.deliveryInfo.firstName}` : ""}. We’ve received your payment and are getting your order ready.
        </p>
        {order?.total != null && (
          <p className="text-gray-800 font-medium mb-2">Total paid: ₦{order.total.toFixed(2)}</p>
        )}
        {orderId && (
          <p className="text-gray-500 text-sm mb-6">Reference: {orderId}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark shadow-lg shadow-primary/20 transition-colors">
            Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/order-history" className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-3 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors">
            View Orders
          </Link>
        </div>
      </div>
    </div>
  )
}
