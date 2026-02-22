"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "@/lib/motion"
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface LoginForm {
  email: string
  password: string
}

export default function CustomerLoginPage() {
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const redirectTo = searchParams.get("redirect") || "/account/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting you now.",
        })
        try { window.dispatchEvent(new Event('authChanged')) } catch {}
        
        // Redirect to the intended page or dashboard
        setTimeout(() => {
          router.push(redirectTo)
        }, 1000)
      } else {
        const message = result.error || result.message || "Invalid credentials. Please try again."
        toast({
          title: "Login Failed",
          description: message,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-orange-100/30 py-20 flex items-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Card className="shadow-2xl border border-orange-100 rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-8 bg-gradient-to-br from-orange-50 via-white to-orange-100/40 border-b border-orange-100">
              <div className="mx-auto w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
                <User className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold font-display text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-12 h-12 rounded-xl border-2 border-orange-100 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-12 pr-12 h-12 rounded-xl border-2 border-orange-100 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl py-6 text-base font-semibold bg-orange-600 hover:bg-orange-500 text-black shadow-lg shadow-orange-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Signing In..."
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href={`/account/register?redirect=${encodeURIComponent(redirectTo)}`}
                    className="text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 
