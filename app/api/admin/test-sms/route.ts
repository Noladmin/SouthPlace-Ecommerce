import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/services/auth-service"
import { smsService } from "@/lib/services/sms-service"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { testPhone } = body

    if (!testPhone) {
      return NextResponse.json(
        { success: false, error: "Test phone number is required" },
        { status: 400 }
      )
    }

    // Test SMS gateway configuration
    const connectionTest = await smsService.testConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        { success: false, error: "SMS gateway configuration error", details: connectionTest.error },
        { status: 500 }
      )
    }

    // Send test SMS
    const fromLabel = process.env.TERMII_SENDER_ID || process.env.SMS_SENDER_ID || "N-Alert"
    const testMessage = `SouthtownPlace SMS Test\nGateway connection successful.\nSent: ${new Date().toLocaleString()}\nFrom: ${fromLabel}\nTo: ${testPhone}\nStatus: OK`
    
    const testResult = await smsService.sendSMS(testPhone, testMessage)

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: "Test SMS sent successfully",
        messageSid: testResult.messageSid,
        provider: testResult.provider,
      })
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to send test SMS", details: testResult.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("SMS test error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
