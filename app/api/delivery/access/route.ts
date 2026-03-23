import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { resolveAssignmentByAccessToken, signDeliverySessionToken } from "@/lib/services/delivery-service"

const accessSchema = z.object({
  token: z.string().min(20),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = accessSchema.parse(body)
    const assignment = await resolveAssignmentByAccessToken(validated.token)

    if (!assignment) {
      return NextResponse.json({ success: false, error: "Invalid or expired delivery link" }, { status: 401 })
    }

    const sessionToken = signDeliverySessionToken(assignment.id)
    const response = NextResponse.json({
      success: true,
      data: {
        assignmentId: assignment.id,
        orderNumber: assignment.order.orderNumber,
      },
    })

    response.cookies.set("delivery-access", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("Delivery access error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
