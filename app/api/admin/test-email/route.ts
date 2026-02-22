import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/services/auth-service"
import { emailService } from "@/lib/services/email-service"

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
    const { testEmail } = body

    if (!testEmail) {
      return NextResponse.json(
        { success: false, error: "Test email address is required" },
        { status: 400 }
      )
    }

    // Test email configuration
    const connectionTest = await emailService.testConnection()
    if (!connectionTest.success) {
      return NextResponse.json(
        { success: false, error: "Email configuration error", details: connectionTest.error },
        { status: 500 }
      )
    }

    // Send test email
    const testResult = await emailService.sendEmail(
      testEmail,
      "🧪 South Place Email Test",
      `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Test</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a, #22c55e); color: white; padding: 20px; text-align: center; border-radius: 8px; }
            .content { background: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 8px; }
            .success { color: #16a34a; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧪 Email Test Successful</h1>
            </div>
            <div class="content">
              <p class="success">✅ South Place email system is working correctly!</p>
              <p>This is a test email sent from the South Place admin system.</p>
              <p><strong>Test Details:</strong></p>
              <ul>
                <li>Sent at: ${new Date().toLocaleString()}</li>
                <li>From: ${process.env.SMTP_USER}</li>
                <li>To: ${testEmail}</li>
                <li>Status: Configuration Valid</li>
              </ul>
              <p>You can now receive order notifications and send emails to customers.</p>
            </div>
          </div>
        </body>
        </html>
      `
    )

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully",
        messageId: testResult.messageId
      })
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to send test email", details: testResult.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Email test error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 
