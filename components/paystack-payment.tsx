"use client"

import { useState } from "react"

interface PaystackPaymentProps {
  amount: number
  email: string
  orderId?: string | null
  customerName?: string
  onSuccess: (reference: string) => void
  onError?: (message: string) => void
}

export default function PaystackPayment({
  amount,
  email,
  orderId,
  customerName,
  onError,
}: PaystackPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
    try {
      setError(null)
      setIsLoading(true)

      const res = await fetch("/api/payment/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          email,
          currency: "NGN",
          callbackUrl: `${window.location.origin}/checkout`,
          metadata: {
            orderId: orderId || "temp",
            customerName: customerName || "",
          },
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to initialize Paystack payment")
      }

      const authorizationUrl = data?.authorizationUrl
      if (!authorizationUrl) {
        throw new Error("Paystack initialization did not return an authorization URL.")
      }

      window.location.href = authorizationUrl
    } catch (e: any) {
      const message = e?.message || "Unable to start Paystack payment"
      setError(message)
      onError?.(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      <button
        type="button"
        onClick={handlePay}
        disabled={isLoading}
        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        {isLoading ? "Redirecting to Paystack..." : "Pay with Paystack"}
      </button>
    </div>
  )
}

