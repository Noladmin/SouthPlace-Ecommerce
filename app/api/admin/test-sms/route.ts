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

    // Test Twilio configuration
    const connectionTest = await smsService.testConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        { success: false, error: "Twilio configuration error", details: connectionTest.error },
        { status: 500 }
      )
    }

    // Send test SMS
    const testMessage = `🧪 South Place SMS Test\n\n✅ Twilio SMS system is working correctly!\n\nThis is a test SMS sent from the South Place admin system.\n\nTest Details:\n• Sent at: ${new Date().toLocaleString()}\n• From: ${process.env.TWILIO_PHONE_NUMBER || "Not configured"}\n• To: ${testPhone}\n• Status: Configuration Valid\n\nYou can now receive order notifications via SMS.`
    
    const testResult = await smsService.sendSMS(testPhone, testMessage)

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: "Test SMS sent successfully",
        messageSid: testResult.messageSid
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

