import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/services/auth-service"
import { smsService } from "@/lib/services/sms-service"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const result = await smsService.listDeliveryReports({
      page: searchParams.get("page") || undefined,
      per_page: searchParams.get("per_page") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      message_id: searchParams.get("message_id") || undefined,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch delivery reports", details: result.error, code: result.code },
        { status: result.statusCode || 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message || "Delivery reports retrieved successfully",
      data: result.data,
      code: result.code,
    })
  } catch (error) {
    console.error("Delivery reports list error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

