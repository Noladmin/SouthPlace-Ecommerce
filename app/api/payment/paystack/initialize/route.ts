import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { initializePaystackTransaction, getPaystackPublicKey } from "@/lib/paystack"

export const dynamic = "force-dynamic"
export const revalidate = 0

const schema = z.object({
  amount: z.number().positive(),
  email: z.string().email(),
  currency: z.string().optional(),
  callbackUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = schema.parse(body)

    const initialized = await initializePaystackTransaction({
      amount: validated.amount,
      email: validated.email,
      currency: validated.currency || "NGN",
      callbackUrl: validated.callbackUrl,
      metadata: validated.metadata || {},
    })

    return NextResponse.json({
      success: true,
      publicKey: getPaystackPublicKey(),
      reference: initialized?.data?.reference,
      accessCode: initialized?.data?.access_code,
      authorizationUrl: initialized?.data?.authorization_url,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to initialize Paystack payment" },
      { status: 500 }
    )
  }
}
