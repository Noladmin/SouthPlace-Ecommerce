"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "@/lib/motion"
import { Search, Package, Clock, CheckCircle, Truck, MapPin, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import ProtectedRoute from "@/components/protected-route"

interface OrderItem {
  name: string
  quantity: number
  unitPrice: number | string
  totalPrice: number | string
  variant?: string
  extras?: Array<{
    name: string
    price: number | string
    quantity?: number
  }>
}

interface OrderDetails {
  orderNumber: string
  status: string
  customerName: string
  deliveryMethod: string
  subtotal: number | string
  deliveryFee: number | string
  total: number | string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

const statusSteps = [
  { key: "PENDING", label: "Order Received", icon: Package, color: "bg-yellow-100 text-yellow-800" },
  { key: "CONFIRMED", label: "Order Confirmed", icon: CheckCircle, color: "bg-blue-100 text-blue-800" },
  { key: "PREPARING", label: "Preparing", icon: Clock, color: "bg-orange-100 text-orange-800" },
  { key: "READY", label: "Ready", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck, color: "bg-purple-100 text-purple-800" },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle, color: "bg-green-100 text-green-800" },
]

const statusOrder = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"]

function TrackOrderContent() {
  const [orderNumber, setOrderNumber] = useState("")
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const handleTrackOrder = async (overrideNumber?: string) => {
    const numberToUse = (overrideNumber ?? orderNumber).trim()
    if (!numberToUse) {
      toast({
        title: "Order number required",
        description: "Please enter your order number to track your order.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/orders/track/${numberToUse}`)
      const result = await response.json()

      if (response.ok) {
        setOrderDetails(result.data)
        toast({
          title: "Order Found",
          description: "Your order details have been retrieved.",
        })
      } else {
        setOrderDetails(null)
        toast({
          title: "Order Not Found",
          description: result.error || "Please check your order number and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error tracking order:", error)
      toast({
        title: "Error",
        description: "Failed to track order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const paramOrder = searchParams.get("order")
    if (paramOrder) {
      setOrderNumber(paramOrder)
      handleTrackOrder(paramOrder)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const getCurrentStepIndex = (status: string) => {
    return statusOrder.indexOf(status)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "CONFIRMED": return "bg-blue-100 text-blue-800"
      case "PREPARING": return "bg-orange-100 text-orange-800"
      case "READY": return "bg-green-100 text-green-800"
      case "OUT_FOR_DELIVERY": return "bg-purple-100 text-purple-800"
      case "DELIVERED": return "bg-green-100 text-green-800"
      case "CANCELLED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="pt-24 pb-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 font-display">Track Your Order</h1>
            <p className="text-gray-600 text-lg">
              Enter your order number to track the status of your order
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Tracking</CardTitle>
              <CardDescription>
                Enter your order number to see the current status and delivery updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter your order number (e.g., TB123456789)"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleTrackOrder()}
                    className="text-base sm:text-lg w-full"
                  />
                </div>
                <Button
                  onClick={() => handleTrackOrder()}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 sm:px-8 rounded-lg bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Tracking...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Track Order
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* No Search Yet */}
          {!hasSearched && (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Track</h3>
                <p className="text-gray-500">
                  Enter your order number above to see your order status and delivery updates.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Order Not Found */}
          {hasSearched && !isLoading && !orderDetails && (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
                <p className="text-gray-500 mb-4">
                  We couldn't find an order with that number. Please check your order number and try again.
                </p>
                <Button variant="outline" onClick={() => router.push("/contact")} className="rounded-lg border-2 border-gray-200 hover:border-gray-300">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          {orderDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                  <CardDescription>
                    Current status: <Badge className={getStatusColor(orderDetails.status)}>
                      {orderDetails.status.replace("_", " ")}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Progress Bar */}
                    <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
                      <div
                        className="h-1 bg-primary rounded-full transition-all duration-500"
                        style={{
                          width: `${((getCurrentStepIndex(orderDetails.status) + 1) / statusSteps.length) * 100}%`
                        }}
                      ></div>
                    </div>

                    {/* Status Steps */}
                    <div className="relative grid grid-cols-6 gap-4">
                      {statusSteps.map((step, index) => {
                        const Icon = step.icon
                        const isCompleted = index <= getCurrentStepIndex(orderDetails.status)
                        const isCurrent = index === getCurrentStepIndex(orderDetails.status)

                        return (
                          <div key={step.key} className="text-center">
                            <div className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300 shadow-md",
                              isCompleted
                                ? "bg-primary text-white shadow-primary/20 ring-4 ring-primary/20"
                                : "bg-gray-200 text-gray-400"
                            )}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <p className={cn("text-xs font-medium", isCompleted ? "text-primary" : "text-gray-500")}>
                              {step.label}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Order Number</span>
                        <span className="font-bold text-lg">{orderDetails.orderNumber}</span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Customer</span>
                        <span className="font-medium">{orderDetails.customerName}</span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Order Date</span>
                        <span>{formatDate(orderDetails.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Delivery Method</span>
                        <span className="font-medium">
                          {orderDetails.deliveryMethod === "EXPRESS" ? "Express" : "Standard"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Subtotal</span>
                        <span>₦{Number(orderDetails.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span>₦{Number(orderDetails.deliveryFee).toFixed(2)}</span>
                      </div>
                      {Number((orderDetails as any).vatAmount || 0) > 0 && (
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-gray-600">VAT</span>
                          <span>₦{Number((orderDetails as any).vatAmount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold text-primary">₦{Number(orderDetails.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {item.name}
                            {item.variant && (
                              <span className="text-gray-500 text-sm ml-2">({item.variant})</span>
                            )}
                          </h4>
                          {item.extras && item.extras.length > 0 && (
                            <p className="text-xs text-gray-500">Extras: {item.extras.map((ex: any) => ex.name).join(", ")}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            ₦{Number(item.unitPrice).toFixed(2)} each × {item.quantity}
                          </p>
                        </div>
                        <span className="font-medium">₦{Number(item.totalPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Estimated Delivery */}
              <Card>
                <CardHeader>
                  <CardTitle>Estimated Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">
                        {orderDetails.deliveryMethod === "EXPRESS"
                          ? "Express Delivery (25-35 minutes)"
                          : "Standard Delivery (45-60 minutes)"
                        }
                      </p>
                      <p className="text-sm text-gray-600">
                        We'll contact you when your order is ready for delivery.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push("/contact")}
                  className="rounded-lg border-2 border-gray-200 hover:border-gray-300"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
                <Button
                  onClick={() => router.push("/order")}
                  className="rounded-lg bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20"
                >
                  Order Again
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <ProtectedRoute>
      <TrackOrderContent />
    </ProtectedRoute>
  )
} 
