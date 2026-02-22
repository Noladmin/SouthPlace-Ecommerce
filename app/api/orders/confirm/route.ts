import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { emailService } from "@/lib/services/email-service"
import { smsService } from "@/lib/services/sms-service"
import { invoiceService } from "@/lib/services/invoice-service"
import { stripe } from "@/lib/stripe"
import { verifyPaystackTransaction } from "@/lib/paystack"
import { z } from "zod"

export const dynamic = "force-dynamic"
export const revalidate = 0

const orderConfirmationSchema = z.object({
  paymentProvider: z.enum(["stripe", "paystack"]),
  paymentReference: z.string().min(1, "Payment reference is required"),
  orderData: z.object({
    customerName: z.string().min(1, "Customer name is required"),
    customerEmail: z.string().email("Invalid email address"),
    customerPhone: z.string().min(10, "Phone number must be at least 10 characters"),
    deliveryAddress: z.string().min(1, "Delivery address is required"),
    deliveryCity: z.string().min(1, "Delivery city is required"),
    specialInstructions: z.string().optional(),
    deliveryMethod: z.enum(["standard", "express"]),
    paymentMethod: z.enum(["stripe", "paystack"]),
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

const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `TB-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = orderConfirmationSchema.parse(body)
    const { paymentProvider, paymentReference, orderData } = validatedData

    if (paymentProvider !== orderData.paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Payment method mismatch" },
        { status: 400 }
      )
    }

    let receiptUrl: string | undefined
    let verifiedCurrency = "ngn"
    let verifiedAmount = orderData.total
    let paidAt = new Date()
    let gatewayResponse: any = {}

    if (paymentProvider === "stripe") {
      const intent = await stripe.paymentIntents.retrieve(paymentReference)
      const status = String((intent as any)?.status || "").toLowerCase()
      if (status !== "succeeded") {
        return NextResponse.json(
          { success: false, error: `Stripe payment not completed. Status: ${status || "unknown"}` },
          { status: 400 }
        )
      }

      verifiedCurrency = String((intent as any).currency || "ngn").toLowerCase()
      verifiedAmount = typeof (intent as any).amount === "number" ? (intent as any).amount / 100 : orderData.total

      let latestChargeId: string | undefined =
        typeof (intent as any).latest_charge === "string" ? (intent as any).latest_charge : undefined
      if (!latestChargeId) {
        const chargeList = await stripe.charges.list({ payment_intent: paymentReference, limit: 1 })
        latestChargeId = chargeList.data?.[0]?.id
      }
      if (latestChargeId) {
        const charge = await stripe.charges.retrieve(latestChargeId)
        receiptUrl = (charge as any)?.receipt_url || undefined
      }

      gatewayResponse = {
        provider: "stripe",
        paymentIntent: intent,
        receiptUrl,
      }
    } else {
      const verified = await verifyPaystackTransaction(paymentReference)
      const tx = verified?.data
      const status = String(tx?.status || "").toLowerCase()
      if (status !== "success") {
        return NextResponse.json(
          { success: false, error: `Paystack payment not completed. Status: ${tx?.status || "unknown"}` },
          { status: 400 }
        )
      }

      verifiedCurrency = String(tx?.currency || "NGN").toLowerCase()
      verifiedAmount = typeof tx?.amount === "number" ? tx.amount / 100 : orderData.total

      if (tx?.paid_at) {
        const txPaidAt = new Date(tx.paid_at)
        if (!Number.isNaN(txPaidAt.getTime())) paidAt = txPaidAt
      }

      gatewayResponse = {
        provider: "paystack",
        transaction: tx,
      }
    }

    if (Number(verifiedAmount.toFixed(2)) !== Number(orderData.total.toFixed(2))) {
      return NextResponse.json(
        { success: false, error: "Verified payment amount does not match order total" },
        { status: 400 }
      )
    }

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
        paymentMethod: paymentProvider.toUpperCase(),
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        vatRate: orderData.vatRate || 0,
        vatAmount: orderData.vatAmount || 0,
        total: orderData.total,
        status: "PENDING",
        paymentStatus: "PAID",
        paymentIntentId: paymentReference,
        paidAt,
        customerId: orderData.customerId || null,
        whatsappSent: false,
      },
    })

    await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentIntentId: paymentReference,
        amount: orderData.total,
        currency: verifiedCurrency || "ngn",
        status: "PAID",
        paymentMethod: paymentProvider,
        gateway: paymentProvider,
        gatewayResponse,
        processedAt: paidAt,
      },
    })

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
            measurement: (typeof item.measurement === "number"
              ? String(item.measurement)
              : (item.measurement ?? null)) as any,
            measurementType: item.measurementType || null,
          },
        })

        if (item.extras?.length) {
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
      })
    )

    const orderItemsWithExtras = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { extras: true },
    })

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
      paymentIntentId: paymentReference,
      receiptUrl,
      subtotal: parseFloat(order.subtotal.toString()),
      deliveryFee: parseFloat(order.deliveryFee.toString()),
      vatRate: parseFloat(order.vatRate.toString()),
      vatAmount: parseFloat(order.vatAmount.toString()),
      total: parseFloat(order.total.toString()),
      items: orderItemsWithExtras.map((item) => ({
        name: item.itemName,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
        variant: item.variantName || undefined,
        extras: (item.extras || []).map((ex) => ({
          name: ex.name,
          price: parseFloat(ex.price.toString()),
          quantity: ex.quantity,
        })),
      })),
      estimatedDelivery: order.deliveryMethod === "EXPRESS" ? "30-45 minutes" : "45-60 minutes",
    }

    emailService.sendNewOrderNotification(emailOrderData).catch((error) => {
      console.error("Failed to send admin notification:", error)
    })
    smsService.sendNewOrderNotification(emailOrderData).catch((error) => {
      console.error("Failed to send admin SMS notification:", error)
    })

    Promise.all([
      invoiceService.generateInvoice(emailOrderData).catch((error) => {
        console.error("Failed to generate invoice:", error)
        return null
      }),
      emailService.sendOrderConfirmation(emailOrderData).catch((error) => {
        console.error("Failed to send confirmation email:", error)
        return null
      }),
    ])
      .then(([invoiceBuffer, emailResult]) => {
        if (invoiceBuffer && emailResult?.success) {
          console.log(`Invoice generated and confirmation email sent for order ${order.orderNumber}`)
        } else {
          console.warn(`Order ${order.orderNumber}: Invoice generation or email sending had issues`)
        }
      })
      .catch((error) => {
        console.error(`Failed to process order ${order.orderNumber} completion:`, error)
      })

    return NextResponse.json(
      {
        success: true,
        message: "Order confirmed successfully",
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Order confirmation error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

