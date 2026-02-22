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
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create payment intent" },
      { status: 500 }
    )
  }
} 
