"use client"

import { useEffect, useMemo, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"

interface StripePaymentProps {
  amount: number
  orderId?: string | null
  onSuccess: (paymentIntentId: string) => void
  onError?: (message: string) => void
}

export default function StripePayment(props: StripePaymentProps) {
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
  const stripePromise = useMemo(() => (pk ? loadStripe(pk) : null), [pk])
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const createIntent = async () => {
      try {
        setIsCreating(true)
        setInitError(null)
        if (!pk) throw new Error("Stripe publishable key missing (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)")
        const res = await fetch("/api/payment/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: props.amount, currency: "gbp", metadata: { orderId: props.orderId || "temp" } }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to create payment intent")
        setClientSecret(data.clientSecret)
      } catch (e: any) {
        const msg = e.message || "Unable to initialize payment"
        setInitError(msg)
        props.onError?.(msg)
      } finally {
        setIsCreating(false)
      }
    }
    createIntent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.amount, pk])

  if (initError) return <div className="text-red-600 text-sm">{initError}</div>
  if (!clientSecret || !stripePromise) return <div>Loading secure payment form…</div>

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
      <PaymentForm {...props} />
    </Elements>
  )
}

function PaymentForm({ onSuccess, onError }: StripePaymentProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canSubmit, setCanSubmit] = useState(false)

  const handleSubmit = async () => {
    try {
      if (!stripe || !elements) throw new Error("Stripe is not ready")
      setIsSubmitting(true)
      setError(null)

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      })

      if (error) throw new Error(error.message || "Payment failed")
      const id = paymentIntent?.id
      if (!id) throw new Error("No payment intent returned")
      onSuccess(id)
    } catch (e: any) {
      const msg = e.message || "Payment error"
      setError(msg)
      onError?.(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium mb-2">Card details</div>
        <PaymentElement 
          onReady={() => setReady(true)} 
          onChange={(event: any) => {
            if (typeof event?.complete === 'boolean') setCanSubmit(event.complete)
          }}
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {ready && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!stripe || !elements || isSubmitting || !canSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {isSubmitting ? "Processing..." : "Pay Now"}
        </button>
      )}
    </div>
  )
}
