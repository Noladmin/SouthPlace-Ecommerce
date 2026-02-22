"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "@/lib/motion"
import { ArrowLeft, CreditCard, MapPin, Truck, ChevronRight, Info, Utensils, Droplets, Package, Hash, Ruler, User, Lock, Mail, Phone, Eye, EyeOff, Shield, Lock as LockIcon, CheckCircle2, Loader2, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn, getMeasurementIcon } from "@/lib/utils"
import { getCart, type CartItem, clearCart, triggerCartUpdate } from "@/lib/cart-utils"
import StripePayment from "@/components/stripe-payment"
import PaystackPayment from "@/components/paystack-payment"

// Helper function to render measurement icon
const renderMeasurementIcon = (measurementType?: string) => {
  const iconName = getMeasurementIcon(measurementType || '')
  const iconProps = { className: "h-3 w-3" }
  
  switch (iconName) {
    case 'Droplets':
      return <Droplets {...iconProps} />
    case 'Utensils':
      return <Utensils {...iconProps} />
    case 'Package':
      return <Package {...iconProps} />
    case 'Hash':
      return <Hash {...iconProps} />
    default:
      return <Ruler {...iconProps} />
  }
}

// Login Form Component
function LoginForm({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await onLogin(email, password)
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          id="loginEmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
          required
        />
      </div>
      <div>
        <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Password *
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="loginPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <Eye className="h-4 w-4 text-gray-400" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full rounded-lg bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20" disabled={isLoading}>
        {isLoading ? "Signing In..." : "Sign In"}
      </Button>
    </form>
  )
}

// Register Form Component
function RegisterForm({ onRegister }: { onRegister: (formData: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      // Use the error modal instead of alert
      const errorMessage = "Passwords do not match. Please make sure both password fields are identical."
      // We need to pass this error to the parent component
      onRegister({ ...formData, _passwordMismatch: true })
      return
    }
    setIsLoading(true)
    await onRegister(formData)
    setIsLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
          required
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password *
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <Eye className="h-4 w-4 text-gray-400" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
            <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password *
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showConfirmPassword ? (
              <Eye className="h-4 w-4 text-gray-400" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full rounded-lg bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20" disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Form states
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [errorModal, setErrorModal] = useState<{
    show: boolean
    title: string
    message: string
    details?: string[]
  }>({
    show: false,
    title: "",
    message: ""
  })
  const [successModal, setSuccessModal] = useState<{
    show: boolean
    title: string
    message: string
  }>({
    show: false,
    title: "",
    message: ""
  })

  // Payment flow states
  const [orderData, setOrderData] = useState<any>(null)
  const [tempOrderNumber, setTempOrderNumber] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<"stripe" | "paystack">("stripe")
  const [isVerifyingRedirectPayment, setIsVerifyingRedirectPayment] = useState(false)
  const [saveAddress, setSaveAddress] = useState(true)
  
  // Form data
  const [deliveryInfo, setDeliveryInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "Lagos",
    specialInstructions: "",
    deliveryMethod: "standard", // standard or express
  })

  const [paymentInfo, setPaymentInfo] = useState({
    customerName: "",
  })
  const [deliveryFees, setDeliveryFees] = useState<{ standard: number; express: number }>({ standard: 3, express: 5 })
  const [vatSettings, setVatSettings] = useState<{ enabled: boolean; rate: number }>({ enabled: false, rate: 0 })
  const [isLoadingFees, setIsLoadingFees] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
    // Load delivery fees and VAT settings
    const loadFees = async () => {
      setIsLoadingFees(true)
      try {
        const [deliveryRes, vatRes] = await Promise.all([
          fetch('/api/admin/settings/delivery-fee'),
          fetch('/api/settings/vat'),
        ])
        if (deliveryRes.ok) {
          const { data } = await deliveryRes.json()
          if (data && typeof data.standard === 'number' && typeof data.express === 'number') {
            setDeliveryFees({ standard: data.standard, express: data.express })
          }
        }
        if (vatRes.ok) {
          const { data } = await vatRes.json()
          if (data) {
            setVatSettings({
              enabled: Boolean(data.enabled),
              rate: Number(data.rate || 0)
            })
          }
        }
      } catch {}
      finally {
        setIsLoadingFees(false)
      }
    }
    loadFees()
    // Pre-fill saved address if available
    const prefill = async () => {
      try {
        const res = await fetch('/api/auth/customer/address')
        if (res.ok) {
          const { data } = await res.json()
          setDeliveryInfo(prev => ({
            ...prev,
            firstName: data.firstName || prev.firstName,
            lastName: data.lastName || prev.lastName,
            email: prev.email, // keep current email source
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
            city: data.city || prev.city,
          }))
        }
      } catch {}
    }
    prefill()
  }, [])

  // Get cart from localStorage on component mount
  useEffect(() => {
    const currentCart = getCart()
    if (currentCart.length > 0) {
      setCart(currentCart)
    } else if (searchParams.has("demo")) {
      // Demo data if no cart exists
      setCart([
        {
          id: "1",
          name: "Snail & Egg Stew with Beans & Rice",
          price: 15.00,
          quantity: 2,
          image: "/assets/Snail & Egg Stew withBeans&Rice.webp",
        },
        {
          id: "4",
          name: "Fried Plantains",
          price: 4.99,
          quantity: 1,
          image: "/placeholder.svg",
        },
      ])
    } else {
      // Redirect to order page if cart is empty
      router.push("/order")
    }
  }, [router, searchParams])

  // (removed) previously logged paymentInfo changes

  // Check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
        try { window.dispatchEvent(new Event('authChanged')) } catch {}
        
        // Auto-fill delivery info if user is logged in
        if (data.user) {
          setDeliveryInfo(prev => ({
            ...prev,
            firstName: data.user.firstName || prev.firstName,
            lastName: data.user.lastName || prev.lastName,
            email: data.user.email || prev.email,
            phone: data.user.phone || prev.phone,
          }))
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
    }
  }

  // Calculate order totals
  const subtotal = cart.reduce((total, item) => {
    const itemPrice = item.variantPrice || item.price
    const extrasTotal = (item.extras || []).reduce((sum, ex) => sum + ex.price, 0)
    return total + (itemPrice + extrasTotal) * item.quantity
  }, 0)
  const deliveryFee = deliveryInfo.deliveryMethod === "express" ? deliveryFees.express : deliveryFees.standard
  const vatAmount = vatSettings.enabled ? subtotal * (vatSettings.rate / 100) : 0
  const total = subtotal + deliveryFee + vatAmount
  const stripeMinAmountNgn = Number(process.env.NEXT_PUBLIC_STRIPE_MIN_AMOUNT_NGN || "1000")
  const isStripeAvailableForAmount = total >= stripeMinAmountNgn

  useEffect(() => {
    if (!isStripeAvailableForAmount && selectedPaymentProvider === "stripe") {
      setSelectedPaymentProvider("paystack")
      setOrderData((prev: any) => (prev ? { ...prev, paymentMethod: "paystack" } : prev))
    }
  }, [isStripeAvailableForAmount, selectedPaymentProvider])

  // Handle form changes
  const handleDeliveryInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setDeliveryInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    console.log("Payment info change:", { name, value, type, checked })
    setPaymentInfo((prev) => {
      const newState = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }
      console.log("New payment info state:", newState)
      return newState
    })
  }

  // Form validation
  const isDeliveryInfoValid = () => {
    const { firstName, lastName, email, phone, address } = deliveryInfo
    const all = [firstName, lastName, email, phone, address]
    return all.every(v => typeof v === 'string' && v.trim().length > 0)
  }


  const isPaymentInfoValid = () => {
    const { customerName } = paymentInfo
    return customerName && customerName.trim().length > 0
  }

  // Authentication functions
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
        setShowAuthModal(false)
        
        // Auto-fill delivery info
        if (data.user) {
          setDeliveryInfo(prev => ({
            ...prev,
            firstName: data.user.firstName || prev.firstName,
            lastName: data.user.lastName || prev.lastName,
            email: data.user.email || prev.email,
            phone: data.user.phone || prev.phone,
          }))
        }
        
        setSuccessModal({
          show: true,
          title: "Welcome Back!",
          message: "You have been successfully logged in. Your information has been auto-filled."
        })
      } else {
        const error = await response.json()
        if (error.details && Array.isArray(error.details)) {
          // Handle validation errors
          setErrorModal({
            show: true,
            title: "Login Failed",
            message: error.message || "Please fix the following errors:",
            details: error.details.map((err: any) => `${err.path?.join('.')}: ${err.message}`)
          })
        } else {
          throw new Error(error.message || 'Login failed')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Please check your credentials and try again."
      setErrorModal({
        show: true,
        title: "Login Failed",
        message: errorMessage
      })
    }
  }

  const handleRegister = async (formData: any) => {
    // Handle password mismatch
    if (formData._passwordMismatch) {
      setErrorModal({
        show: true,
        title: "Password Mismatch",
        message: "Passwords do not match. Please make sure both password fields are identical."
      })
      return
    }

    try {
      const response = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data)
        setIsAuthenticated(true)
        setShowAuthModal(false)
        
        // Auto-fill delivery info
        setDeliveryInfo(prev => ({
          ...prev,
          firstName: formData.firstName || prev.firstName,
          lastName: formData.lastName || prev.lastName,
          email: formData.email || prev.email,
          phone: formData.phone || prev.phone,
        }))
        
        setSuccessModal({
          show: true,
          title: "Account Created!",
          message: "Your account has been created successfully. You can now proceed with your order."
        })
      } else {
        const error = await response.json()
        if (error.details && Array.isArray(error.details)) {
          // Handle validation errors
          setErrorModal({
            show: true,
            title: "Registration Failed",
            message: error.message || "Please fix the following errors:",
            details: error.details.map((err: any) => `${err.path?.join('.')}: ${err.message}`)
          })
        } else {
          throw new Error(error.message || 'Registration failed')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Please check your information and try again."
      setErrorModal({
        show: true,
        title: "Registration Failed",
        message: errorMessage
      })
    }
  }

  // Handle next step
  const handleNextStep = () => {
    if (step === 1) {
      // Step 1 is now authentication - can proceed if authenticated or as guest
      setStep(2)
      window.scrollTo(0, 0)
    } else if (step === 2 && isDeliveryInfoValid()) {
      // Auto-fill customer name if not already set
      if (!paymentInfo.customerName) {
        setPaymentInfo(prev => ({
          ...prev,
          customerName: `${deliveryInfo.firstName} ${deliveryInfo.lastName}`.trim()
        }))
      }
      // Submit order and move to payment
      handlePrepareOrder()
    } else if (step === 2) {
      toast({
        title: "Please complete all required fields",
        description: "All delivery information fields are required to proceed.",
        variant: "destructive",
      })
    }
  }

  // Handle previous step
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    }
  }

  // Handle order preparation - Prepare order data for payment
  const handlePrepareOrder = async () => {
    // Ensure a customer name exists by falling back to delivery info
    const effectiveCustomerName = (paymentInfo.customerName && paymentInfo.customerName.trim().length > 0)
      ? paymentInfo.customerName.trim()
      : `${deliveryInfo.firstName} ${deliveryInfo.lastName}`.trim()

    if (!effectiveCustomerName || effectiveCustomerName.trim().length === 0) {
      toast({
        title: "Please add your name",
        description: "Enter your full name in the payment section.",
        variant: "destructive",
      })
      return
    }

    setPaymentInfo(prev => ({ ...prev, customerName: effectiveCustomerName }))
    if (!isStripeAvailableForAmount && selectedPaymentProvider === "stripe") {
      setSelectedPaymentProvider("paystack")
    }
    setIsProcessing(true)

    try {
      // Optionally save address for authenticated users
      if (isAuthenticated && saveAddress) {
        try {
          await fetch('/api/auth/customer/address', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: deliveryInfo.firstName,
              lastName: deliveryInfo.lastName,
              phone: deliveryInfo.phone,
              address: deliveryInfo.address,
              city: deliveryInfo.city,
            })
          })
        } catch {}
      }

      // Prepare order data for API
      const orderData = {
        customerName: effectiveCustomerName,
        customerEmail: deliveryInfo.email,
        customerPhone: deliveryInfo.phone,
        deliveryAddress: deliveryInfo.address,
        deliveryCity: deliveryInfo.city,
        specialInstructions: deliveryInfo.specialInstructions,
        deliveryMethod: deliveryInfo.deliveryMethod,
        paymentMethod: selectedPaymentProvider,
        customerId: user?.id, // Link order to customer if authenticated
        items: cart.map(item => {
          const measurementValue = typeof item.measurement === 'number'
            ? item.measurement
            : (typeof item.measurement === 'string' ? Number(item.measurement) : undefined)

          return {
            id: String(item.id),
            name: item.name,
            price: item.variantPrice || item.price,
            quantity: item.quantity,
            variant: item.variant,
            variantPrice: item.variantPrice,
            measurement: Number.isFinite(measurementValue as number) ? (measurementValue as number) : undefined,
            measurementType: item.measurementType,
            extras: (item.extras || []).map(ex => ({
              id: ex.id,
              name: ex.name,
              price: ex.price,
              groupName: ex.groupName,
              quantity: 1,
            })),
          }
        }),
        subtotal,
        deliveryFee,
        vatRate: vatSettings.enabled ? vatSettings.rate : 0,
        vatAmount,
        total,
      }

      // proceed with request
      // Prepare order (don't create it yet)
      const response = await fetch("/api/orders/prepare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (response.ok) {
        // Store order data for payment processing
        setOrderData(orderData)
        setTempOrderNumber(result.data.tempOrderNumber)
        try {
          sessionStorage.setItem(
            "pendingCheckoutPayment",
            JSON.stringify({
              orderData,
              tempOrderNumber: result.data.tempOrderNumber,
              savedAt: Date.now(),
            })
          )
        } catch {}
        
        // Order prepared successfully - no toast needed as user will see payment form

        // Move to payment step
        setStep(3)

      } else {
        const errorMessage = result.details ? 
          `Validation errors: ${result.details.join(', ')}` : 
          result.error || "Failed to prepare order"
        throw new Error(errorMessage)
      }

    } catch (error) {
      console.error("Order preparation error:", error)
      toast({
        title: "Error preparing order",
        description: "There was an error preparing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentCompleted = useCallback(async (paymentReference: string, paymentProvider: "stripe" | "paystack") => {
    try {
      const response = await fetch("/api/orders/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentProvider,
          paymentReference,
          orderData,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setPaymentSuccess(true)
        setPaymentError(null)
        setOrderId(result.data.orderId)

        const orderDetails = {
          orderNumber: result.data.orderNumber,
          total: total,
          status: "CONFIRMED",
          items: cart,
          deliveryInfo: deliveryInfo,
          paymentInfo: paymentInfo,
          paymentProvider,
        }
        localStorage.setItem("lastOrder", JSON.stringify(orderDetails))
        try {
          sessionStorage.removeItem("pendingCheckoutPayment")
        } catch {}

        try {
          const current = JSON.parse(localStorage.getItem("tastyBowlsCart") || "[]")
          if (Array.isArray(current)) {
            localStorage.removeItem("tastyBowlsCart")
            window.dispatchEvent(new CustomEvent("cartUpdated"))
          }
        } catch {}

        toast({
          title: "Payment Successful!",
          description: "Your order has been confirmed and is being prepared.",
          className: "bg-green-500 text-white",
        })

        setTimeout(() => {
          router.push(`/order-confirmation?orderId=${result.data.orderId}`)
        }, 1500)
      } else {
        throw new Error(result.error || "Failed to confirm order")
      }
    } catch (error) {
      console.error("Order confirmation error:", error)
      setPaymentError("Payment succeeded but order confirmation failed. Please contact support with your payment reference.")
      setPaymentSuccess(false)
    }
  }, [orderData, total, cart, deliveryInfo, paymentInfo, router, toast])

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref")
    if (!reference || paymentSuccess || isVerifyingRedirectPayment) return

    let restoredOrderData = orderData
    let restoredTempOrderNumber = tempOrderNumber

    if (!restoredOrderData) {
      try {
        const raw = sessionStorage.getItem("pendingCheckoutPayment")
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?.orderData) {
            restoredOrderData = parsed.orderData
            restoredTempOrderNumber = parsed.tempOrderNumber || null
            setOrderData(parsed.orderData)
            setTempOrderNumber(parsed.tempOrderNumber || null)
            setStep(3)
          }
        }
      } catch {}
    }

    if (!restoredOrderData || !restoredTempOrderNumber) return

    setSelectedPaymentProvider("paystack")
    setIsVerifyingRedirectPayment(true)
    handlePaymentCompleted(reference, "paystack").finally(() => {
      setIsVerifyingRedirectPayment(false)
    })
  }, [searchParams, orderData, tempOrderNumber, paymentSuccess, isVerifyingRedirectPayment, handlePaymentCompleted])

  if (cart.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 bg-gradient-to-b from-orange-50/40 via-white to-orange-100/30">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/order" className="inline-flex items-center text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Order
          </Link>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-orange-100/70 bg-gradient-to-br from-white via-orange-50/60 to-orange-100/40 p-6 sm:p-8 shadow-2xl text-center">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />
            <div className="absolute -left-28 bottom-0 h-56 w-56 rounded-full bg-orange-300/20 blur-3xl" />
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 font-display text-gray-900">Checkout</h1>
              <p className="text-gray-700">Complete your order details below</p>
            </div>
          </div>
        </div>

        {/* Checkout Steps */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -z-10"></div>
            <div
              className="absolute left-0 right-0 top-1/2 h-1 bg-primary -z-10"
              style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
            ></div>

            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-2 transition-all shadow-md",
                  step >= 1 ? "bg-primary shadow-primary/20 ring-4 ring-primary/20" : "bg-gray-200",
                )}
              >
                {step > 1 ? <CheckCircle2 className="h-6 w-6" /> : "1"}
              </div>
              <span className={cn("text-sm font-medium", step >= 1 ? "text-primary" : "text-gray-500")}>Account</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-2 transition-all shadow-md",
                  step >= 2 ? "bg-primary shadow-primary/20 ring-4 ring-primary/20" : "bg-gray-200",
                )}
              >
                {step > 2 ? <CheckCircle2 className="h-6 w-6" /> : "2"}
              </div>
              <span className={cn("text-sm font-medium", step >= 2 ? "text-primary" : "text-gray-500")}>Delivery</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-2 transition-all shadow-md",
                  step >= 3 ? "bg-primary shadow-primary/20 ring-4 ring-primary/20" : "bg-gray-200",
                )}
              >
                {step > 3 ? <CheckCircle2 className="h-6 w-6" /> : "3"}
              </div>
              <span className={cn("text-sm font-medium", step >= 3 ? "text-primary" : "text-gray-500")}>Payment</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-2 transition-all shadow-md",
                  step >= 4 ? "bg-primary shadow-primary/20 ring-4 ring-primary/20" : "bg-gray-200",
                )}
              >
                {step > 4 ? <CheckCircle2 className="h-6 w-6" /> : "4"}
              </div>
              <span className={cn("text-sm font-medium", step >= 4 ? "text-primary" : "text-gray-500")}>Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-8">
          {/* Main Form */}
          <div className="md:col-span-2 order-2 md:order-1">
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8"
            >
              {step === 1 ? (
                <>
                  <div className="flex items-center mb-6">
                    <User className="h-6 w-6 text-primary mr-2" />
                    <h2 className="text-2xl font-bold font-display">Account & Login</h2>
                  </div>

                  {isAuthenticated ? (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <User className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold">Welcome back, {user?.firstName}!</h3>
                        <p className="text-gray-600">Your account information will be used for this order.</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                        <p className="text-sm text-gray-600">
                          <strong>Email:</strong> {user?.email}<br />
                          <strong>Phone:</strong> {user?.phone}
                        </p>
                      </div>
                      <Button onClick={() => setStep(2)} className="w-full rounded-lg bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20">
                        Continue to Delivery
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <p className="text-gray-600 mb-4">
                          Create an account or sign in to save your information and track your orders.
                        </p>
                        <div className="flex space-x-4 justify-center">
                          <Button
                            variant={authMode === 'login' ? 'default' : 'outline'}
                            onClick={() => setAuthMode('login')}
                          >
                            Sign In
                          </Button>
                          <Button
                            variant={authMode === 'register' ? 'default' : 'outline'}
                            onClick={() => setAuthMode('register')}
                          >
                            Create Account
                          </Button>
                        </div>
                      </div>

                      {authMode === 'login' ? (
                        <LoginForm onLogin={handleLogin} />
                      ) : (
                        <RegisterForm onRegister={handleRegister} />
                      )}

                      <div className="text-center">
                        <Button
                          variant="outline"
                          onClick={() => setStep(2)}
                          className="w-full"
                        >
                          Continue as Guest
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : step === 2 ? (
                <>
                  <div className="flex items-center mb-6">
                    <MapPin className="h-6 w-6 text-primary mr-2" />
                    <h2 className="text-2xl font-bold font-display">Delivery Information</h2>
                  </div>

                  <div className="grid md:grid-cols-1 gap-4 mb-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={deliveryInfo.firstName}
                        onChange={handleDeliveryInfoChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
                        required
                        aria-invalid={!deliveryInfo.firstName}
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={deliveryInfo.lastName}
                        onChange={handleDeliveryInfoChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
                        required
                        aria-invalid={!deliveryInfo.lastName}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={deliveryInfo.email}
                        onChange={handleDeliveryInfoChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
                        required
                        aria-invalid={!deliveryInfo.email}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={deliveryInfo.phone}
                        onChange={handleDeliveryInfoChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
                        required
                        aria-invalid={!deliveryInfo.phone}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={deliveryInfo.address}
                      onChange={handleDeliveryInfoChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
                      required
                      aria-invalid={!deliveryInfo.address}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={deliveryInfo.city}
                        onChange={handleDeliveryInfoChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-100"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">We currently only deliver to Lagos</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      id="specialInstructions"
                      name="specialInstructions"
                      value={deliveryInfo.specialInstructions}
                      onChange={handleDeliveryInfoChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
                      placeholder="E.g., Ring doorbell, leave at the door, etc."
                    ></textarea>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Method *</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div
                        className={cn(
                          "border rounded-lg p-4 cursor-pointer transition-all",
                          deliveryInfo.deliveryMethod === "standard"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300",
                        )}
                        onClick={() => setDeliveryInfo((prev) => ({ ...prev, deliveryMethod: "standard" }))}
                      >
                        <div className="flex items-start">
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border flex items-center justify-center mr-3 mt-0.5",
                              deliveryInfo.deliveryMethod === "standard" ? "border-primary" : "border-gray-300",
                            )}
                          >
                            {deliveryInfo.deliveryMethod === "standard" && (
                              <div className="w-3 h-3 rounded-full bg-primary"></div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">Standard Delivery</h3>
                              <span className="ml-auto font-medium">₦{deliveryFees.standard.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Delivery within 45-60 minutes</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "border rounded-lg p-4 cursor-pointer transition-all",
                          deliveryInfo.deliveryMethod === "express"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300",
                        )}
                        onClick={() => setDeliveryInfo((prev) => ({ ...prev, deliveryMethod: "express" }))}
                      >
                        <div className="flex items-start">
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border flex items-center justify-center mr-3 mt-0.5",
                              deliveryInfo.deliveryMethod === "express" ? "border-primary" : "border-gray-300",
                            )}
                          >
                            {deliveryInfo.deliveryMethod === "express" && (
                              <div className="w-3 h-3 rounded-full bg-primary"></div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">Express Delivery</h3>
                              <span className="ml-auto font-medium">₦{deliveryFees.express.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Priority delivery within 25-35 minutes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
                      Save this address to my account
                    </label>
                    <Button onClick={handlePrepareOrder} disabled={isProcessing || !isDeliveryInfoValid()} className="w-full sm:w-auto rounded-lg px-4 sm:px-8 py-3 sm:py-2 bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20">
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Preparing Order...
                        </>
                      ) : (
                        <>
                          Prepare Order & Pay <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : step === 3 ? (
                <>
                  <div className="flex items-center mb-6">
                    <CreditCard className="h-6 w-6 text-primary mr-2" />
                    <h2 className="text-2xl font-bold font-display">Payment & Confirmation</h2>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Payment Option *</label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        className={cn(
                          "rounded-lg border p-4 text-left transition-all",
                          selectedPaymentProvider === "stripe"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300",
                          !isStripeAvailableForAmount && "opacity-50 cursor-not-allowed bg-gray-50"
                        )}
                        onClick={() => {
                          if (!isStripeAvailableForAmount) return
                          setSelectedPaymentProvider("stripe")
                          setOrderData((prev: any) => (prev ? { ...prev, paymentMethod: "stripe" } : prev))
                          setPaymentError(null)
                        }}
                        disabled={!isStripeAvailableForAmount}
                      >
                        <div className="flex items-center gap-2 font-semibold text-gray-900">
                          <CreditCard className="h-4 w-4" />
                          Stripe
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {isStripeAvailableForAmount
                            ? "Pay with debit/credit card."
                            : `Unavailable below ₦${stripeMinAmountNgn.toFixed(2)}.`}
                        </p>
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "rounded-lg border p-4 text-left transition-all",
                          selectedPaymentProvider === "paystack"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => {
                          setSelectedPaymentProvider("paystack")
                          setOrderData((prev: any) => (prev ? { ...prev, paymentMethod: "paystack" } : prev))
                          setPaymentError(null)
                        }}
                      >
                        <div className="flex items-center gap-2 font-semibold text-gray-900">
                          <Wallet className="h-4 w-4" />
                          Paystack
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Pay with Paystack-supported methods.</p>
                      </button>
                    </div>
                    {!isStripeAvailableForAmount && (
                      <p className="mt-2 text-xs text-amber-700">
                        Stripe is unavailable for this total. Paystack is selected automatically for faster checkout.
                      </p>
                    )}
                  </div>

                  {orderData && tempOrderNumber && !paymentSuccess && !paymentError ? (
                    selectedPaymentProvider === "stripe" ? (
                      <StripePayment
                        amount={total}
                        onSuccess={(paymentIntentId) => handlePaymentCompleted(paymentIntentId, "stripe")}
                        onError={(error) => {
                          const msg = String(error || "")
                          const normalized = msg.toLowerCase()
                          if (
                            normalized.includes("amount_too_small") ||
                            normalized.includes("too small") ||
                            normalized.includes("minimum amount")
                          ) {
                            setSelectedPaymentProvider("paystack")
                            setOrderData((prev: any) => (prev ? { ...prev, paymentMethod: "paystack" } : prev))
                            setPaymentError(null)
                            setPaymentSuccess(false)
                            toast({
                              title: "Stripe unavailable for this amount",
                              description: "Switched to Paystack. Please continue payment with Paystack.",
                              variant: "destructive",
                            })
                            return
                          }
                          setPaymentError(error)
                          setPaymentSuccess(false)
                        }}
                        orderId={tempOrderNumber}
                      />
                    ) : (
                      <PaystackPayment
                        amount={total}
                        email={deliveryInfo.email}
                        customerName={paymentInfo.customerName || `${deliveryInfo.firstName} ${deliveryInfo.lastName}`.trim()}
                        onSuccess={(reference) => handlePaymentCompleted(reference, "paystack")}
                        onError={(error) => {
                          setPaymentError(error)
                          setPaymentSuccess(false)
                        }}
                        orderId={tempOrderNumber}
                      />
                    )
                  ) : paymentError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                      <div className="flex">
                        <Info className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-red-800 mb-2">Payment Error</h3>
                          <p className="text-sm text-red-700">{paymentError}</p>
                          <Button
                            onClick={() => {
                              setPaymentError(null)
                              setOrderData(null)
                              setTempOrderNumber(null)
                            }}
                            className="mt-3"
                            variant="outline"
                          >
                            Try Again
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8">
                      <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-gray-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Preparing payment… This may take a moment.</span>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                      Name for Order Confirmation *
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={paymentInfo.customerName || `${deliveryInfo.firstName} ${deliveryInfo.lastName}`}
                      onChange={handlePaymentInfoChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
                      required
                    />
                    
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Order Process:</span> Your order will be submitted to our system and we'll contact you to confirm delivery time and payment details.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevStep} disabled={isProcessing || (!orderData || !tempOrderNumber)} className="rounded-lg px-6 border-2 border-gray-200 hover:border-gray-300">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                  </div>
                </>
              ) : null}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4 font-display">Order Summary</h2>

              <div className="max-h-[300px] overflow-y-auto mb-4 pr-2">
                {cart.map((item, index) => {
                  // Create unique key that includes variant
                  const uniqueKey = item.variant ? `${item.id}-${item.variant}` : `${item.id}`
                  const itemPrice = item.variantPrice || item.price
                  const extrasTotal = (item.extras || []).reduce((sum, ex) => sum + ex.price, 0)
                  const lineTotal = (itemPrice + extrasTotal) * item.quantity
                  
                  return (
                    <div key={uniqueKey} className="flex py-3 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 mr-3">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                          <h3 className="font-medium text-sm">
                            {item.name}
                            {item.variant && (
                              <span className="text-gray-500 flex items-center gap-1">
                                {" - "}
                                {item.variant}
                                {item.measurement && (
                                  <>
                                    <span className="ml-1">{renderMeasurementIcon(item.measurementType)}</span>
                                    <span>{item.measurement}</span>
                                  </>
                                )}
                              </span>
                            )}
                          </h3>
                          <span className="font-medium text-sm">₦{lineTotal.toFixed(2)}</span>
                        </div>
                        <p className="text-gray-500 text-xs">₦{itemPrice.toFixed(2)} each</p>
                        {item.extras && item.extras.length > 0 && (
                          <p className="text-gray-500 text-xs">Extras: {item.extras.map((ex) => ex.name).join(", ")}</p>
                        )}
                        <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₦{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>₦{deliveryFee.toFixed(2)}</span>
                </div>
                {vatSettings.enabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT ({vatSettings.rate.toFixed(2)}%)</span>
                    <span>₦{vatAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100 mt-2">
                  <span>Total</span>
                  <span>₦{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-start">
                  <Truck className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm">Delivery Details</h3>
                    <p className="text-gray-600 text-xs mt-1">
                      {deliveryInfo.deliveryMethod === "express"
                        ? "Express Delivery (25-35 minutes)"
                        : "Standard Delivery (45-60 minutes)"}
                    </p>
                    {deliveryInfo.address && (
                      <p className="text-gray-600 text-xs mt-1">
                        Delivering to: {deliveryInfo.address}, {deliveryInfo.city}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <Dialog open={errorModal.show} onOpenChange={(open) => setErrorModal(prev => ({ ...prev, show: open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">{errorModal.title}</DialogTitle>
            <DialogDescription>
              {errorModal.message}
            </DialogDescription>
          </DialogHeader>
          {errorModal.details && errorModal.details.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="font-medium text-red-800 mb-2">Details:</h4>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {errorModal.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setErrorModal(prev => ({ ...prev, show: false }))}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={successModal.show} onOpenChange={(open) => setSuccessModal(prev => ({ ...prev, show: open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-green-600">{successModal.title}</DialogTitle>
            <DialogDescription>
              {successModal.message}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setSuccessModal(prev => ({ ...prev, show: false }))}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
