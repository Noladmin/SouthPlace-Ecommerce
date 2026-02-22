"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "@/lib/motion"
import { Search, Package, Clock, CheckCircle, Truck, Calendar, ArrowRight, Eye, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface OrderItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  variant?: string
}

interface OrderHistory {
  id: string
  orderNumber: string
  status: string
  customerName: string
  deliveryMethod: string
  subtotal: number
  deliveryFee: number
  vatRate?: number
  vatAmount?: number
  total: number | string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

interface OrderHistoryData {
  email: string
  orders: OrderHistory[]
  totalOrders: number
}

function OrderHistoryContent() {
  const [email, setEmail] = useState("")
  const [orderHistory, setOrderHistory] = useState<OrderHistoryData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showEmailSearch, setShowEmailSearch] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Auto-load authenticated orders
  useEffect(() => {
    const loadAuthed = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/customer/orders")
        const data = await res.json()
        if (res.ok && data.success) {
          const mapped: OrderHistoryData = {
            email: "",
            orders: (data.data || []).map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              status: o.status,
              customerName: o.customerName,
              deliveryMethod: o.deliveryMethod,
              subtotal: Number(o.subtotal),
              deliveryFee: Number(o.deliveryFee),
              vatRate: Number(o.vatRate || 0),
              vatAmount: Number(o.vatAmount || 0),
              total: Number(o.total),
              createdAt: typeof o.createdAt === 'string' ? o.createdAt : o.createdAt.toISOString(),
              updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : o.updatedAt.toISOString(),
              items: (o.items || []).map((it: any) => ({
                name: it.itemName,
                quantity: it.quantity,
                unitPrice: Number(it.price),
                totalPrice: Number(it.price) * it.quantity,
                variant: it.variantName || undefined,
              })),
            })),
            totalOrders: (data.data || []).length,
          }
          setOrderHistory(mapped)
          setHasSearched(true)
          setShowEmailSearch(false)
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadAuthed()
  }, [])

  // Check for email in URL params
  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
      handleSearchOrderHistory(emailParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleSearchOrderHistory = async (emailToSearch: string) => {
    if (!emailToSearch.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address to view your order history.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/orders/history/${encodeURIComponent(emailToSearch.trim())}`)
      const result = await response.json()

      if (response.ok) {
        const mapped: OrderHistoryData = {
          email: result.data?.email || emailToSearch.trim(),
          orders: (result.data?.orders || []).map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            status: o.status,
            customerName: o.customerName,
            deliveryMethod: o.deliveryMethod,
            subtotal: Number(o.subtotal),
            deliveryFee: Number(o.deliveryFee),
            vatRate: Number(o.vatRate || 0),
            vatAmount: Number(o.vatAmount || 0),
            total: Number(o.total),
            createdAt: typeof o.createdAt === 'string' ? o.createdAt : o.createdAt.toISOString(),
            updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : o.updatedAt.toISOString(),
            items: (o.items || []).map((it: any) => ({
              name: it.name || it.itemName,
              quantity: it.quantity,
              unitPrice: Number(it.unitPrice || it.price),
              totalPrice: Number(it.totalPrice || (it.price * it.quantity)),
              variant: it.variant || it.variantName || undefined,
            })),
          })),
          totalOrders: result.data?.totalOrders || 0,
        }
        setOrderHistory(mapped)
        toast({
          title: "Order History Found",
          description: `Found ${result.data.totalOrders} orders for your email.`,
        })
        setShowEmailSearch(false)
      } else {
        setOrderHistory(null)
        toast({
          title: "No Orders Found",
          description: result.error || "No orders found for this email address.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching order history:", error)
      toast({
        title: "Error",
        description: "Failed to fetch order history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearchOrderHistory(email)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return Package
      case "CONFIRMED": return CheckCircle
      case "PREPARING": return Clock
      case "READY": return CheckCircle
      case "OUT_FOR_DELIVERY": return Truck
      case "DELIVERED": return CheckCircle
      case "CANCELLED": return Package
      default: return Package
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
            <h1 className="text-4xl font-bold mb-4 font-display">Order History</h1>
            <p className="text-gray-600 text-lg">
              View your past orders and track their status
            </p>
          </div>

          {/* Search Form */}
          {showEmailSearch && !orderHistory && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Find Your Orders</CardTitle>
                <CardDescription>
                  Enter your email address to view your complete order history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearchOrderHistory(email)}
                      className="text-base sm:text-lg w-full"
                    />
                  </div>
                  <Button
                    onClick={() => handleSearchOrderHistory(email)}
                    disabled={isLoading}
                    className="w-full sm:w-auto px-6 sm:px-8 rounded-lg bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Find Orders
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Search Yet */}
          {showEmailSearch && !hasSearched && (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to View History</h3>
                <p className="text-gray-500">
                  Enter your email address above to see your complete order history.
                </p>
              </CardContent>
            </Card>
          )}

          {/* No Orders Found */}
          {hasSearched && !isLoading && !orderHistory && (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-500 mb-4">
                  We couldn't find any orders for this email address. Please make sure you're using the correct email.
                </p>
                <Button variant="outline" onClick={() => router.push("/contact")} className="rounded-lg border-2 border-gray-200 hover:border-gray-300">
                  <MapPin className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          )}


          {/* Order History List */}
          {orderHistory && orderHistory.orders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{orderHistory.totalOrders}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Delivered</p>
                    <p className="text-3xl font-bold text-orange-600">{orderHistory.orders.filter(o => o.status === "DELIVERED").length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Total Spent</p>
                    <p className="text-3xl font-bold text-primary">₦{orderHistory.orders.reduce((sum, order) => sum + Number(order.total), 0).toFixed(2)}</p>
                    <div className="mt-2 space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between max-w-[200px] mx-auto">
                        <span>Subtotal</span>
                        <span>₦{orderHistory.orders.reduce((sum, order) => sum + Number(order.subtotal), 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between max-w-[200px] mx-auto">
                        <span>Delivery</span>
                        <span>₦{orderHistory.orders.reduce((sum, order) => sum + Number(order.deliveryFee), 0).toFixed(2)}</span>
                      </div>
                      {orderHistory.orders.reduce((sum, order) => sum + Number(order.vatAmount || 0), 0) > 0 && (
                        <div className="flex justify-between max-w-[200px] mx-auto">
                          <span>VAT</span>
                          <span>₦{orderHistory.orders.reduce((sum, order) => sum + Number(order.vatAmount || 0), 0).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {orderHistory.orders.map((order, index) => {
                const StatusIcon = getStatusIcon(order.status)
                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <div className={cn("p-2 rounded-full", getStatusColor(order.status).split(' ')[0])}>
                              <StatusIcon className={cn("h-4 w-4", getStatusColor(order.status).split(' ')[1])} />
                            </div>
                            <h3 className="font-bold text-lg">Order #{order.orderNumber}</h3>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <Badge className={cn("px-3 py-1 text-sm", getStatusColor(order.status))}>
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Order Items</p>
                            <div className="space-y-2">
                              {order.items.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span>{item.quantity}x {item.name} {item.variant && <span className="text-gray-400">({item.variant})</span>}</span>
                                  <span className="font-medium text-gray-600">₦{(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <p className="text-sm text-primary font-medium">+{order.items.length - 3} more items...</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between gap-4 border-l pl-0 md:pl-6 border-gray-100">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600">Total Amount</span>
                              <span className="text-xl font-bold text-primary">₦{Number(order.total).toFixed(2)}</span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-500">
                              <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₦{Number(order.subtotal).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>₦{Number(order.deliveryFee).toFixed(2)}</span>
                              </div>
                              {Number(order.vatAmount || 0) > 0 && (
                                <div className="flex justify-between">
                                  <span>VAT{order.vatRate ? ` (${Number(order.vatRate).toFixed(2)}%)` : ""}</span>
                                  <span>₦{Number(order.vatAmount).toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => router.push(`/track-order?order=${order.orderNumber}`)}
                            >
                              Track
                            </Button>
                            <Button
                              className="flex-1 bg-primary hover:bg-primary-dark text-white"
                              onClick={() => router.push(`/order?reorder=${order.orderNumber}`)}
                            >
                              Reorder
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              <div className="flex justify-center pt-8">
                <Button
                  variant="outline"
                  onClick={() => router.push("/order")}
                  className="rounded-lg border-2 border-gray-200 hover:border-gray-300"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Place New Order
                </Button>
              </div>

            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  )
}

export default function OrderHistoryPage() {
  return <OrderHistoryContent />
}
