"use client"

import { useState } from "react"
import { motion } from "@/lib/motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import AdminLayout from "@/components/admin-layout"
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function EmailSettingsPage() {
  const [testEmail, setTestEmail] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    details?: string
  } | null>(null)
  const { toast } = useToast()

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive"
      })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ testEmail: testEmail.trim() })
      })

      const result = await response.json()

      if (response.ok) {
        setTestResult({
          success: true,
          message: result.message,
          details: result.messageId
        })
        toast({
          title: "Success",
          description: "Test email sent successfully!",
        })
      } else {
        setTestResult({
          success: false,
          message: result.error,
          details: result.details
        })
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Email test error:", error)
      setTestResult({
        success: false,
        message: "Failed to send test email",
        details: "Network error"
      })
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive"
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Settings</h1>
            <p className="text-gray-600">
              Test and configure email notifications for orders and customer communications
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Email Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Configuration
                </CardTitle>
                <CardDescription>
                  Current email service settings and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">SMTP Host</Label>
                    <p className="font-medium">
                      {process.env.NEXT_PUBLIC_SMTP_HOST || 'smtp.gmail.com'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">SMTP Port</Label>
                    <p className="font-medium">
                      {process.env.NEXT_PUBLIC_SMTP_PORT || '587'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">From Email</Label>
                    <p className="font-medium">
                      {process.env.NEXT_PUBLIC_SMTP_USER || 'Not configured'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Admin Email</Label>
                    <p className="font-medium">
                      {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@southplacecatering.com'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Email Service Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Email Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Test Email Configuration
                </CardTitle>
                <CardDescription>
                  Send a test email to verify your configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testEmail">Test Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="Enter email address to test"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleTestEmail}
                  disabled={isTesting || !testEmail.trim()}
                  className="w-full"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Test Email...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Test Email
                    </>
                  )}
                </Button>

                {testResult && (
                  <div className={`p-4 rounded-lg border ${
                    testResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {testResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          testResult.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {testResult.message}
                        </p>
                        {testResult.details && (
                          <p className={`text-sm mt-1 ${
                            testResult.success ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {testResult.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Email Templates Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Automated emails sent by the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">🆕 New Order Notification</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Sent to admin when a new order is placed
                  </p>
                  <Badge variant="secondary">Admin Only</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">✅ Order Confirmation</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Sent to customer after order placement
                  </p>
                  <Badge variant="secondary">Customer</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">🎉 Welcome Email</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Sent to new customers upon registration
                  </p>
                  <Badge variant="secondary">Customer</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Required Environment Variables</CardTitle>
              <CardDescription>
                Configure these variables in your .env.local file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                <div className="space-y-2">
                  <div><span className="text-blue-600">SMTP_HOST</span>=smtp.gmail.com</div>
                  <div><span className="text-blue-600">SMTP_PORT</span>=587</div>
                  <div><span className="text-blue-600">SMTP_USER</span>=your-email@gmail.com</div>
                  <div><span className="text-blue-600">SMTP_PASS</span>=your-app-password</div>
                  <div><span className="text-blue-600">ADMIN_EMAIL</span>=admin@southplacecatering.com</div>
                  <div><span className="text-blue-600">NEXT_PUBLIC_APP_URL</span>=http://localhost:3000</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                <strong>Note:</strong> For Gmail, you'll need to use an App Password instead of your regular password.
                Enable 2-factor authentication and generate an App Password in your Google Account settings.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  )
} 
