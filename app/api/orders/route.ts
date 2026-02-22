import { NextRequest, NextResponse } from "next/server"
import { prisma, retryDatabaseOperation } from "@/lib/db"
import { z } from "zod"
import { emailService } from "@/lib/services/email-service"
import { smsService } from "@/lib/services/sms-service"

// Validation schema for order submission
const orderSubmissionSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 characters"),
  deliveryAddress: z.string().min(5, "Delivery address is required"),
  deliveryCity: z.string().min(2, "City is required"),
  specialInstructions: z.string().optional(),
  deliveryMethod: z.enum(["standard", "express", "STANDARD", "EXPRESS"]).transform(val => val.toLowerCase()),
  paymentMethod: z.enum(["cash", "card", "online", "stripe", "paystack", "CASH", "CARD", "ONLINE", "STRIPE", "PAYSTACK"]).transform(val => val.toLowerCase()),
  items: z.array(z.object({
    id: z.union([z.string(), z.number()]).transform(val => String(val)),
    name: z.string(),
    price: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).refine(val => val > 0, "Price must be positive"),
    quantity: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val, 10) : val).refine(val => val > 0, "Quantity must be positive"),
    variant: z.string().optional(),
    variantPrice: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).optional(),
    measurement: z.string().optional(),
    measurementType: z.string().optional(),
    extras: z.array(z.object({
      id: z.string().optional(),
      name: z.string(),
      price: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).refine(val => val >= 0, "Extra price must be non-negative"),
      quantity: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val, 10) : val).optional(),
      groupName: z.string().optional(),
    })).optional(),
  })),
  subtotal: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).refine(val => val > 0, "Subtotal must be positive"),
  deliveryFee: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).refine(val => val >= 0, "Delivery fee must be non-negative"),
  vatRate: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).optional(),
  vatAmount: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).optional(),
  total: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseFloat(val) : val).refine(val => val > 0, "Total must be positive"),
})

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `TB${timestamp}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    let validatedData
    try {
      validatedData = orderSubmissionSchema.parse(body)
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error("Validation errors:", validationError.issues)
        return NextResponse.json({
          success: false,
          error: "Validation error",
          details: validationError.issues.map(err => `${err.path.join('.')}: ${err.message}`)
        }, { status: 400 })
      }
      throw validationError
    }

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create order in database with retry logic
    const order = await retryDatabaseOperation(async () => {
      return await prisma.order.create({
        data: {
          orderNumber,
          customerName: validatedData.customerName,
          customerEmail: validatedData.customerEmail,
          customerPhone: validatedData.customerPhone,
          deliveryAddress: validatedData.deliveryAddress,
          deliveryCity: validatedData.deliveryCity,
          specialInstructions: validatedData.specialInstructions || "",
          deliveryMethod: validatedData.deliveryMethod === "express" ? "EXPRESS" : "STANDARD",
          paymentMethod: validatedData.paymentMethod === "stripe" ? "STRIPE" : validatedData.paymentMethod.toUpperCase(),
          subtotal: validatedData.subtotal,
          deliveryFee: validatedData.deliveryFee,
          vatRate: validatedData.vatRate || 0,
          vatAmount: validatedData.vatAmount || 0,
          total: validatedData.total,
          status: "PENDING",
          whatsappSent: false,
        },
      })
    })

    // Create order items with retry logic
    await retryDatabaseOperation(async () => {
      return await Promise.all(
        validatedData.items.map(async (item) => {
          const orderItem = await prisma.orderItem.create({
            data: {
              orderId: order.id,
              menuItemId: null, // Don't link to menu items for now to avoid foreign key issues
              itemName: item.name,
              quantity: item.quantity,
              price: item.variantPrice || item.price,
              variantName: item.variant || null,
              measurement: item.measurement || null,
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
              }))
            })
          }

          return orderItem
        })
      )
    })

    const orderItemsWithExtras = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { extras: true },
    })

    // Prepare order data for emails
    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      deliveryAddress: `${order.deliveryAddress}, ${order.deliveryCity}`,
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || undefined,
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
    emailService.sendNewOrderNotification(orderData).catch(error => {
      console.error("Failed to send admin notification:", error)
    })

    // Send admin SMS notification (async, don't wait for it)
    smsService.sendNewOrderNotification(orderData).catch(error => {
      console.error("Failed to send admin SMS notification:", error)
    })

    // Send customer confirmation email (async, don't wait for it)
    emailService.sendOrderConfirmation(orderData).catch(error => {
      console.error("Failed to send confirmation email:", error)
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Order submitted successfully",
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
      },
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Order submission error:", error)
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes("Can't reach database server")) {
      return NextResponse.json(
        { success: false, error: "Database connection error. Please try again in a moment." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 
