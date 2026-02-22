"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "@/lib/motion"
import { X, Eye, EyeOff, Lock, Mail, User, Phone, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "login" | "register"
  redirectTo?: string
}

interface LoginForm {
  email: string
  password: string
}

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  address: string
  city: string
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login", redirectTo = "/" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [loginData, setLoginData] = useState<LoginForm>({
    email: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLoginData({ email: "", password: "" })
      setRegisterData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        address: "",
        city: "",
      })
      setShowPassword(false)
      setShowConfirmPassword(false)
      setIsLoading(false)
    }
  }, [isOpen])

  // Update active tab when defaultTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab)
    }
  }, [defaultTab, isOpen])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!loginData.email || !loginData.password) {
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
        body: JSON.stringify(loginData),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        })
        try {
          window.dispatchEvent(new Event("authChanged"))
        } catch {}

        onClose()
        setTimeout(() => {
          router.push(redirectTo)
          router.refresh()
        }, 500)
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !registerData.firstName ||
      !registerData.lastName ||
      !registerData.email ||
      !registerData.phone ||
      !registerData.password ||
      !registerData.confirmPassword
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (registerData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          email: registerData.email,
          phone: registerData.phone,
          password: registerData.password,
          address: registerData.address,
          city: registerData.city,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "Account created! Signing you in...",
        })

        // Auto login after registration
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: registerData.email,
            password: registerData.password,
          }),
        })

        if (loginResponse.ok) {
          try {
            window.dispatchEvent(new Event("authChanged"))
          } catch {}
          onClose()
          setTimeout(() => {
            router.push(redirectTo)
            router.refresh()
          }, 500)
        }
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to create account. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Centering Container */}
          <div className="flex min-h-full items-center justify-center p-4 relative z-10">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-br from-orange-50 to-white px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold font-display text-gray-900 text-center">
              {activeTab === "login" ? "Welcome Back" : "Register"}
            </h2>
            <p className="text-gray-600 text-center mt-2">
              {activeTab === "login"
                ? "Sign in to your account to continue"
                : "Join us to track orders and manage preferences"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-4 text-center font-medium transition-all relative ${
                activeTab === "login"
                  ? "text-primary bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Sign In
              {activeTab === "login" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-4 text-center font-medium transition-all relative ${
                activeTab === "register"
                  ? "text-primary bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Register
              {activeTab === "register" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </button>
          </div>

          {/* Forms */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-240px)]">
            <AnimatePresence mode="wait">
              {activeTab === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-5"
                >
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
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className="pl-11 h-12 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
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
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className="pl-11 pr-12 h-12 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        disabled={isLoading}
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
                    className="w-full rounded-lg py-6 text-base font-semibold bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⏳</span>
                        Signing In...
                      </span>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleRegisterSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={registerData.firstName}
                          onChange={handleRegisterChange}
                          className="pl-11 h-11 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          placeholder="First name"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <Input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={registerData.lastName}
                        onChange={handleRegisterChange}
                        className="h-11 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Last name"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        id="reg-email"
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        className="pl-11 h-11 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        className="pl-11 h-11 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Phone number"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        id="address"
                        name="address"
                        value={registerData.address}
                        onChange={handleRegisterChange}
                        className="pl-11 h-11 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Your address"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <Input
                      type="text"
                      id="city"
                      name="city"
                      value={registerData.city}
                      onChange={handleRegisterChange}
                      className="h-11 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="City"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        id="reg-password"
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        className="pl-11 pr-12 h-11 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Create password"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        className="pl-11 pr-12 h-11 rounded-lg border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Confirm password"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-lg py-6 text-base font-semibold bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⏳</span>
                        Creating Account...
                      </span>
                    ) : (
                      <>
                        Register
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
