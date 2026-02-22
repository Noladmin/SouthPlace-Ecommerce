import { NextRequest, NextResponse } from "next/server"
import { verifyPaystackTransaction } from "@/lib/paystack"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get("reference")
    if (!reference) {
      return NextResponse.json({ success: false, error: "Missing reference" }, { status: 400 })
    }

    const result = await verifyPaystackTransaction(reference)
    return NextResponse.json({ success: true, data: result?.data || null })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to verify Paystack payment" },
      { status: 500 }
    )
  }
}

