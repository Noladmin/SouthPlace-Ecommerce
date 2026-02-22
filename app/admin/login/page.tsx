"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "@/lib/motion"
import { Eye, EyeOff, Lock, Mail, Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface LoginForm {
  email: string
  password: string
}

interface OTPForm {
  otp: string
}

export default function AdminLoginPage() {
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  })
  const [otpForm, setOtpForm] = useState<OTPForm>({
    otp: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      })

      const result = await response.json()

      if (response.ok) {
        setUserEmail(loginForm.email)
        setShowOTP(true)
        toast({
          title: "OTP Sent",
          description: "Please check your email for the 6-digit OTP code.",
        })
      } else {
        let errorMessage = result.error || "Invalid credentials. Please try again."

        // Provide more specific error messages
        if (response.status === 401) {
          errorMessage = "Invalid email or password. Please check your credentials."
        } else if (response.status === 403) {
          errorMessage = "Account is deactivated. Please contact support."
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later."
        } else if (response.status === 0) {
          errorMessage = "Network error. Please check your connection."
        }

        console.log("Login error response:", { status: response.status, result })

        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otpForm.otp || otpForm.otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP code.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/admin/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          otp: otpForm.otp,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setIsRedirecting(true)
        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
        })
        // Keep loading state true while redirecting
        router.push("/admin/dashboard")
      } else {
        setIsLoading(false) // Only turn off loading on error
        let errorMessage = result.error || "Invalid OTP. Please try again."

        // Provide more specific error messages for OTP
        if (response.status === 401) {
          errorMessage = "Invalid or expired OTP. Please request a new one."
        } else if (response.status === 400) {
          errorMessage = "Invalid OTP format. Please enter 6 digits."
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later."
        }

        console.log("OTP error response:", { status: response.status, result })

        toast({
          title: "OTP Verification Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("OTP verification error:", error)
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setShowOTP(false)
    setOtpForm({ otp: "" })
    setUserEmail("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo/Brand Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="mx-auto w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-600/20">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">South Place Admin</h1>
        </motion.div>

        <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden backdrop-blur-sm bg-white/90">
          <CardHeader className="text-center pb-6 pt-8 px-8">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {showOTP ? "Verify Your Identity" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {showOTP
                ? "Please verify your identity to continue"
                : "Sign in to access the admin dashboard"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {!showOTP ? (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@southplacecatering.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="pl-12 h-12 rounded-xl border-gray-200 focus:border-orange-600 focus:ring-orange-600"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="pl-12 pr-12 h-12 rounded-xl border-gray-200 focus:border-orange-600 focus:ring-orange-600"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-black rounded-xl font-medium text-base shadow-lg shadow-orange-600/20 transition-all hover:shadow-xl hover:shadow-orange-600/30"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>


              </form>
            ) : (
              // OTP Form
              <form onSubmit={handleOTPVerification} className="space-y-5">
                <div className="text-center mb-6 p-4 bg-orange-50 rounded-xl">
                  <p className="text-sm text-gray-700">
                    Code sent to <span className="font-semibold text-orange-700">{userEmail}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otpForm.otp}
                    onChange={(e) => setOtpForm({ otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    className="text-center text-2xl tracking-[0.5em] h-14 rounded-xl border-gray-200 focus:border-orange-600 focus:ring-orange-600 font-mono"
                    maxLength={6}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToLogin}
                    className="flex-1 h-12 rounded-xl border-gray-300 hover:border-orange-600 hover:text-orange-600"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-12 bg-orange-600 hover:bg-orange-500 text-black rounded-xl font-medium shadow-lg shadow-orange-600/20 transition-all hover:shadow-xl hover:shadow-orange-600/30"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {isRedirecting ? "Redirecting..." : "Verifying..."}
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                </div>

                {/* Resend OTP option */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    Didn't receive the code? <span className="font-medium">Resend</span>
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-xs text-gray-500">
            © 2025 South Place. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
} 
