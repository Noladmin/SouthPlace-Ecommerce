"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "@/lib/motion"
import { Eye, EyeOff, Lock, Mail, Shield, ArrowRight, KeyRound } from "lucide-react"
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

interface ForgotPasswordForm {
  email: string
  otp: string
  password: string
  confirmPassword: string
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
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [authView, setAuthView] = useState<"login" | "forgot">("login")
  const [userEmail, setUserEmail] = useState("")
  const [resetCodeSent, setResetCodeSent] = useState(false)
  const [forgotPasswordForm, setForgotPasswordForm] = useState<ForgotPasswordForm>({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  })
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
          description: result.requiresPasswordChange ? "Redirecting to password setup..." : "Redirecting to dashboard...",
        })
        // Keep loading state true while redirecting
        router.push(result.requiresPasswordChange ? "/admin/change-password" : "/admin/dashboard")
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

  const handleOpenForgotPassword = () => {
    setAuthView("forgot")
    setShowOTP(false)
    setOtpForm({ otp: "" })
    setForgotPasswordForm({
      email: loginForm.email,
      otp: "",
      password: "",
      confirmPassword: "",
    })
    setResetCodeSent(false)
  }

  const handleBackFromForgotPassword = () => {
    setAuthView("login")
    setResetCodeSent(false)
    setShowResetPassword(false)
    setShowResetConfirmPassword(false)
    setForgotPasswordForm((current) => ({
      ...current,
      otp: "",
      password: "",
      confirmPassword: "",
    }))
  }

  const handleResendOTP = async () => {
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Session expired",
        description: "Please sign in again to request a new OTP.",
        variant: "destructive",
      })
      setShowOTP(false)
      setUserEmail("")
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

      if (!response.ok) {
        throw new Error(result.error || "Failed to resend OTP")
      }

      setOtpForm({ otp: "" })
      toast({
        title: "OTP Resent",
        description: "A new 6-digit verification code has been sent.",
      })
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message || "Could not resend OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestResetCode = async () => {
    if (!forgotPasswordForm.email) {
      toast({
        title: "Missing Information",
        description: "Please enter the admin email address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/admin/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordForm.email }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to send reset code")
      }

      setResetCodeSent(true)
      setForgotPasswordForm((current) => ({ ...current, otp: "" }))
      toast({
        title: "Reset code sent",
        description: "If the admin account exists, a 6-digit reset code has been sent to the email.",
      })
    } catch (error: any) {
      toast({
        title: "Request failed",
        description: error.message || "Could not send reset code.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resetCodeSent) {
      await handleRequestResetCode()
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(forgotPasswordForm),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to reset password")
      }

      setAuthView("login")
      setResetCodeSent(false)
      setShowResetPassword(false)
      setShowResetConfirmPassword(false)
      setLoginForm({
        email: forgotPasswordForm.email,
        password: "",
      })
      setForgotPasswordForm({
        email: forgotPasswordForm.email,
        otp: "",
        password: "",
        confirmPassword: "",
      })
      toast({
        title: "Password reset complete",
        description: "Sign in with your new password to continue.",
      })
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message || "Could not reset password.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">South Town Place Admin</h1>
        </motion.div>

        <Card className="shadow-2xl border-0 rounded-3xl overflow-hidden backdrop-blur-sm bg-white/90">
          <CardHeader className="text-center pb-6 pt-8 px-8">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {showOTP ? "Verify Your Identity" : authView === "forgot" ? "Reset Password" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {showOTP
                ? "Please verify your identity to continue"
                : authView === "forgot"
                  ? "Request a reset code and choose a new admin password"
                  : "Sign in to access the admin dashboard"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {showOTP ? (
              // OTP Form
              <form onSubmit={handleOTPVerification} className="space-y-5">
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

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    Didn't receive the code? <span className="font-medium">Resend</span>
                  </button>
                </div>
              </form>
            ) : authView === "login" ? (
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

                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="text-gray-500">Secure admin sign-in</span>
                  <button
                    type="button"
                    onClick={handleOpenForgotPassword}
                    className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-sm font-medium text-gray-700">
                    Admin Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="admin@southplacecatering.com"
                      value={forgotPasswordForm.email}
                      onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, email: e.target.value })}
                      className="pl-12 h-12 rounded-xl border-gray-200 focus:border-orange-600 focus:ring-orange-600"
                      required
                    />
                  </div>
                </div>

                {resetCodeSent ? (
                  <>
                    <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-900">
                      Enter the 6-digit code from your email and choose a new password.
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="reset-otp" className="text-sm font-medium text-gray-700">
                        Reset Code
                      </label>
                      <Input
                        id="reset-otp"
                        type="text"
                        placeholder="000000"
                        value={forgotPasswordForm.otp}
                        onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                        className="text-center text-2xl tracking-[0.5em] h-14 rounded-xl border-gray-200 focus:border-orange-600 focus:ring-orange-600 font-mono"
                        maxLength={6}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="reset-password" className="text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                        <Input
                          id="reset-password"
                          type={showResetPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          value={forgotPasswordForm.password}
                          onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, password: e.target.value })}
                          className="pl-12 pr-12 h-12 rounded-xl border-gray-200 focus:border-orange-600 focus:ring-orange-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowResetPassword(!showResetPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
                        >
                          {showResetPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="reset-confirm-password" className="text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="relative group">
                        <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                        <Input
                          id="reset-confirm-password"
                          type={showResetConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          value={forgotPasswordForm.confirmPassword}
                          onChange={(e) => setForgotPasswordForm({ ...forgotPasswordForm, confirmPassword: e.target.value })}
                          className="pl-12 pr-12 h-12 rounded-xl border-gray-200 focus:border-orange-600 focus:ring-orange-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
                        >
                          {showResetConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackFromForgotPassword}
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
                        {resetCodeSent ? "Resetting..." : "Sending..."}
                      </>
                    ) : (
                      resetCodeSent ? "Reset Password" : "Send Reset Code"
                    )}
                  </Button>
                </div>

                {resetCodeSent ? (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleRequestResetCode}
                      disabled={isLoading}
                      className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                    >
                      Didn't receive the code? <span className="font-medium">Resend reset code</span>
                    </button>
                  </div>
                ) : null}
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
            © {new Date().getFullYear()} South Town Place. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
} 
