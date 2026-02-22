import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/db"
import { getPaystackSecretKey } from "@/lib/paystack"

export const dynamic = "force-dynamic"
export const revalidate = 0

function verifyPaystackSignature(rawBody: string, signature: string, secret: string) {
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex")
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
  } catch {
    return false
  }
}

async function handleChargeSuccess(eventData: any) {
  const reference = String(eventData?.reference || "").trim()
  if (!reference) return

  const paidAt = eventData?.paid_at ? new Date(eventData.paid_at) : new Date()
  const processedAt = Number.isNaN(paidAt.getTime()) ? new Date() : paidAt

  await prisma.payment.updateMany({
    where: { paymentIntentId: reference },
    data: {
      status: "PAID",
      gateway: "paystack",
      paymentMethod: "paystack",
      processedAt,
      gatewayResponse: eventData,
    },
  })

  await prisma.order.updateMany({
    where: { paymentIntentId: reference },
    data: {
      paymentStatus: "PAID",
      paidAt: processedAt,
    },
  })
}

async function handleChargeFailed(eventData: any) {
  const reference = String(eventData?.reference || "").trim()
  if (!reference) return

  await prisma.payment.updateMany({
    where: { paymentIntentId: reference },
    data: {
      status: "FAILED",
      gateway: "paystack",
      paymentMethod: "paystack",
      gatewayResponse: eventData,
    },
  })

  await prisma.order.updateMany({
    where: { paymentIntentId: reference },
    data: {
      paymentStatus: "FAILED",
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const secret = getPaystackSecretKey()
    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Paystack secret key is not configured" },
        { status: 500 }
      )
    }

    const signature = request.headers.get("x-paystack-signature")
    if (!signature) {
      return NextResponse.json({ success: false, error: "Missing x-paystack-signature header" }, { status: 400 })
    }

    const rawBody = await request.text()
    if (!verifyPaystackSignature(rawBody, signature, secret)) {
      return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 400 })
    }

    const payload = JSON.parse(rawBody)
    const event = String(payload?.event || "")
    const data = payload?.data

    switch (event) {
      case "charge.success":
        await handleChargeSuccess(data)
        break
      case "charge.failed":
        await handleChargeFailed(data)
        break
      default:
        // Accept but ignore unsupported events
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Paystack webhook error:", error)
    return NextResponse.json({ success: false, error: "Webhook handler failed" }, { status: 500 })
  }
}

