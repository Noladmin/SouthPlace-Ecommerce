import { NextRequest, NextResponse } from "next/server"
import { stripe, formatAmountForStripe } from "@/lib/stripe"
import { verifyAuth } from "@/lib/services/auth-service"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    // Try to verify customer authentication, but don't require it for checkout
    const authResult = await verifyAuth(request)
    console.log("Payment intent - Auth result:", authResult)
    
    // For checkout, we allow unauthenticated users but prefer authenticated ones
    const customerId = authResult.success ? authResult.userId : null

    const body = await request.json()
    const { amount, currency = 'ngn', metadata = {} } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      )
    }

    const configuredMinNgn = Number(process.env.STRIPE_MIN_AMOUNT_NGN || "1000")
    if (currency.toLowerCase() === "ngn" && amount < configuredMinNgn) {
      return NextResponse.json(
        {
          success: false,
          code: "amount_too_small",
          error: `Stripe is only available for orders from ₦${configuredMinNgn.toFixed(2)} on this account.`,
        },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount),
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerId: customerId || 'guest',
        ...metadata,
      },
    })

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error: any) {
    const code = error?.code || error?.raw?.code
    const message = error?.message || "Failed to create payment intent"
    if (code === "amount_too_small") {
      return NextResponse.json(
        {
          success: false,
          code,
          error: "Stripe minimum amount not reached for this currency/account. Use Paystack or increase order total.",
          details: message,
        },
        { status: 400 }
      )
    }

    console.error("Error creating payment intent:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create payment intent", details: message },
      { status: 500 }
    )
  }
} 
