import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { emailService } from "@/lib/services/email-service"
import { smsService } from "@/lib/services/sms-service"
import { invoiceService } from "@/lib/services/invoice-service"
import { stripe } from "@/lib/stripe"
import { z } from "zod"

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Validation schema for order confirmation
const orderConfirmationSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  orderData: z.object({
    customerName: z.string().min(1, "Customer name is required"),
    customerEmail: z.string().email("Invalid email address"),
    customerPhone: z.string().min(10, "Phone number must be at least 10 characters"),
    deliveryAddress: z.string().min(1, "Delivery address is required"),
    deliveryCity: z.string().min(1, "Delivery city is required"),
    specialInstructions: z.string().optional(),
    deliveryMethod: z.enum(["standard", "express"]),
    paymentMethod: z.enum(["stripe"]),
    customerId: z.string().optional(),
    items: z.array(z.object({
      id: z.string(),
      name: z.string(),
      price: z.number().positive(),
      quantity: z.number().positive(),
      variant: z.string().optional(),
      variantPrice: z.number().optional(),
      measurement: z.number().optional(),
      measurementType: z.string().optional(),
      extras: z.array(z.object({
        id: z.string().optional(),
        name: z.string(),
        price: z.number().min(0),
        quantity: z.number().optional(),
        groupName: z.string().optional(),
      })).optional(),
    })).min(1, "At least one item is required"),
    subtotal: z.number().positive(),
    deliveryFee: z.number().min(0),
    vatRate: z.number().min(0).optional(),
    vatAmount: z.number().min(0).optional(),
    total: z.number().positive(),
  }),
})

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `TB-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = orderConfirmationSchema.parse(body)

    const { paymentIntentId, orderData } = validatedData

    // Retrieve Stripe PaymentIntent to enrich records and emails (receipt URL, amounts, etc.)
    let receiptUrl: string | undefined
    let intentCurrency: string | undefined
    let intentAmount: number | undefined
    try {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
      intentCurrency = (intent as any).currency
      intentAmount = typeof (intent as any).amount === 'number' ? (intent as any).amount / 100 : undefined
      let latestChargeId: string | undefined = typeof (intent as any).latest_charge === 'string' ? (intent as any).latest_charge : undefined
      if (!latestChargeId) {
        const chargeList = await stripe.charges.list({ payment_intent: paymentIntentId, limit: 1 })
        latestChargeId = chargeList.data?.[0]?.id
      }
      if (latestChargeId) {
        const charge = await stripe.charges.retrieve(latestChargeId)
        receiptUrl = (charge as any)?.receipt_url || undefined
      }
    } catch (e) {
      console.warn("Unable to retrieve PaymentIntent details:", e)
    }

    // Create the actual order in database
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
        deliveryCity: orderData.deliveryCity,
        specialInstructions: orderData.specialInstructions || null,
        deliveryMethod: orderData.deliveryMethod === "express" ? "EXPRESS" : "STANDARD",
        paymentMethod: "STRIPE",
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        vatRate: orderData.vatRate || 0,
        vatAmount: orderData.vatAmount || 0,
        total: orderData.total,
        status: "PENDING", // Set as received; admin will confirm
        paymentStatus: "PAID",
        paymentIntentId: paymentIntentId,
        paidAt: new Date(),
        customerId: orderData.customerId || null,
        whatsappSent: false,
      },
    })

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentIntentId: paymentIntentId,
        amount: orderData.total,
        currency: intentCurrency || "ngn",
        status: "PAID",
        paymentMethod: "stripe",
        gateway: "stripe",
        gatewayResponse: {
          paymentIntentId,
          amount: intentAmount ?? orderData.total,
          currency: intentCurrency || "ngn",
          receiptUrl,
        },
        processedAt: new Date(),
      },
    })

    // Create order items
    await Promise.all(
      orderData.items.map(async (item) => {
        const orderItem = await prisma.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: null,
            itemName: item.name,
            quantity: item.quantity,
            price: item.variantPrice || item.price,
            variantName: item.variant || null,
            measurement: (typeof item.measurement === 'number' ? String(item.measurement) : (item.measurement ?? null)) as any,
            measurementType: item.measurementType || null,
          },
        })

        if (item.extras && item.extras.length) {
          await prisma.orderItemExtra.createMany({
            data: item.extras.map((ex) => ({
              orderItemId: orderItem.id,
              extraItemId: ex.id || null,
              name: ex.name,
              price: ex.price,
              quantity: ex.quantity || 1,
            })),
          })
        }

        return orderItem
      })
    )

    const orderItemsWithExtras = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { extras: true },
    })

    // Prepare order data for emails
    const emailOrderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      deliveryAddress: `${order.deliveryAddress}, ${order.deliveryCity}`,
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || undefined,
      paymentIntentId: paymentIntentId,
      receiptUrl: receiptUrl,
      subtotal: parseFloat(order.subtotal.toString()),
      deliveryFee: parseFloat(order.deliveryFee.toString()),
      vatRate: parseFloat(order.vatRate.toString()),
      vatAmount: parseFloat(order.vatAmount.toString()),
      total: parseFloat(order.total.toString()),
      items: orderItemsWithExtras.map(item => ({
        name: item.itemName,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
        variant: item.variantName || undefined,
        extras: (item.extras || []).map(ex => ({
          name: ex.name,
          price: parseFloat(ex.price.toString()),
          quantity: ex.quantity,
        }))
      })),
      estimatedDelivery: order.deliveryMethod === 'EXPRESS' ? '30-45 minutes' : '45-60 minutes'
    }

    // Send admin notification (async, don't wait for it)
    emailService.sendNewOrderNotification(emailOrderData).catch(error => {
      console.error("Failed to send admin notification:", error)
    })

    // Send admin SMS notification (async, don't wait for it)
    smsService.sendNewOrderNotification(emailOrderData).catch(error => {
      console.error("Failed to send admin SMS notification:", error)
    })

    // Generate PDF invoice and send customer confirmation email (async, don't wait for it)
    Promise.all([
      // Generate PDF invoice
      invoiceService.generateInvoice(emailOrderData).catch(error => {
        console.error("Failed to generate invoice:", error)
        return null
      }),
      // Send confirmation email
      emailService.sendOrderConfirmation(emailOrderData).catch(error => {
        console.error("Failed to send confirmation email:", error)
        return null
      })
    ]).then(([invoiceBuffer, emailResult]) => {
      if (invoiceBuffer && emailResult?.success) {
        console.log(`Invoice generated and confirmation email sent for order ${order.orderNumber}`)
      } else {
        console.warn(`Order ${order.orderNumber}: Invoice generation or email sending had issues`)
      }
    }).catch(error => {
      console.error(`Failed to process order ${order.orderNumber} completion:`, error)
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Order confirmed successfully",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Order confirmation error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
