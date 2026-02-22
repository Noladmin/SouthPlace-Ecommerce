import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: undefined as any,
})

export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100)
}
