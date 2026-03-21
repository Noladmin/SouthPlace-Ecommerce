import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/services/auth-service"
import { smsService } from "@/lib/services/sms-service"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const result = await smsService.getDeliveryReport(id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch delivery report", details: result.error, code: result.code },
        { status: result.statusCode || 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message || "Delivery report retrieved successfully",
      data: result.data,
      code: result.code,
    })
  } catch (error) {
    console.error("Delivery report fetch error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

