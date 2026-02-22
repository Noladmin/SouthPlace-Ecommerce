import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"
import { emailService } from "@/lib/services/email-service"
import { headers } from "next/headers"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: any

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break
      
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  const { id: paymentIntentId, amount, currency, metadata } = paymentIntent
  
  console.log(`Payment succeeded: ${paymentIntentId}`)
  
  // Find order by paymentIntentId
  const order = await prisma.order.findFirst({
    where: { paymentIntentId },
    include: { items: { include: { extras: true } }, customer: true }
  })
  
  if (!order) {
    console.warn(`Order not found for payment intent: ${paymentIntentId}`)
    return
  }
  
  // Update order payment status if not already marked as paid
  if (order.paymentStatus !== 'PAID') {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date()
      }
    })
    
    // Update payment record
    await prisma.payment.updateMany({
      where: { paymentIntentId },
      data: {
        status: 'PAID',
        processedAt: new Date()
      }
    })
    
    console.log(`Order ${order.orderNumber} marked as paid`)
  }
  
  // Re-send confirmation email if needed (e.g., if webhook fired before order creation)
  if (order.customerEmail && order.paymentStatus === 'PAID') {
    try {
      const emailData = {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        deliveryAddress: `${order.deliveryAddress}, ${order.deliveryCity}`,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentIntentId: paymentIntentId,
        subtotal: parseFloat(order.subtotal.toString()),
        deliveryFee: parseFloat(order.deliveryFee.toString()),
        vatRate: parseFloat((order as any).vatRate?.toString?.() || "0"),
        vatAmount: parseFloat((order as any).vatAmount?.toString?.() || "0"),
        total: parseFloat(order.total.toString()),
        items: order.items.map(item => ({
          name: item.itemName,
          quantity: item.quantity,
          price: parseFloat(item.price.toString()),
          variant: item.variantName || undefined,
          extras: (item.extras || []).map((ex: any) => ({
            name: ex.name,
            price: parseFloat(ex.price.toString()),
            quantity: ex.quantity,
          }))
        })),
        estimatedDelivery: order.deliveryMethod === 'EXPRESS' ? '30-45 minutes' : '45-60 minutes'
      }
      
      await emailService.sendOrderConfirmation(emailData)
      console.log(`Confirmation email re-sent for order ${order.orderNumber}`)
    } catch (error) {
      console.error(`Failed to re-send confirmation email for order ${order.orderNumber}:`, error)
    }
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const { payment_intent: paymentIntentId, metadata } = session
  
  if (paymentIntentId) {
    // Handle via payment intent webhook instead
    return
  }
  
  console.log(`Checkout session completed: ${session.id}`)
  // Handle direct checkout session completion if needed
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  const { id: paymentIntentId, last_payment_error } = paymentIntent
  
  console.log(`Payment failed: ${paymentIntentId}`)
  
  // Find order and update status
  const order = await prisma.order.findFirst({
    where: { paymentIntentId }
  })
  
  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'FAILED'
      }
    })
    
    await prisma.payment.updateMany({
      where: { paymentIntentId },
      data: {
        status: 'FAILED'
      }
    })
    
    console.log(`Order ${order.orderNumber} marked as payment failed`)
  }
}
