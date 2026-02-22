"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "@/lib/motion"
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Mail,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  Calendar,
  CreditCard,
  MessageSquare,
  Edit,
  Save,
  X,
  Printer
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import AdminLayout from "@/components/admin-layout"
import ConfirmationDialog from "@/components/admin/confirmation-dialog"
import SuccessModal from "@/components/admin/success-modal"
import type { Order, OrderStatus } from "@/lib/types"

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PREPARING: "bg-orange-50 text-orange-700 border-orange-200",
  READY: "bg-green-50 text-green-700 border-green-200",
  OUT_FOR_DELIVERY: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-orange-50 text-orange-700 border-orange-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
}

const statusIcons: Record<OrderStatus, any> = {
  PENDING: AlertCircle,
  CONFIRMED: CheckCircle,
  PREPARING: Clock,
  READY: CheckCircle,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
}

const statusSteps = [
  { key: "PENDING", label: "Pending", icon: Package },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
  { key: "PREPARING", label: "Preparing", icon: Clock },
  { key: "READY", label: "Ready", icon: CheckCircle },
  { key: "OUT_FOR_DELIVERY", label: "In Transit", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
]

const statusOrder = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"]

export default function SingleOrderPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedOrder, setEditedOrder] = useState<Partial<Order>>({})
  const [adminUser, setAdminUser] = useState<any>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [statusToUpdate, setStatusToUpdate] = useState<OrderStatus | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      // Check if admin is authenticated
      const authResponse = await fetch("/api/auth/admin/me")
      if (!authResponse.ok) {
        router.push("/admin/login")
        return
      }

      const authData = await authResponse.json()
      setAdminUser(authData.admin)

      // Load order data
      const orderId = params.id as string
      const orderResponse = await fetch(`/api/admin/orders/${orderId}`)
      if (orderResponse.ok) {
        const orderData = await orderResponse.json()
        setOrder(orderData.data)
        setEditedOrder(orderData.data)
      } else {
        toast({
          title: "Error",
          description: "Order not found",
          variant: "destructive",
        })
        router.push("/admin/orders")
      }
    } catch (error) {
      console.error("Error loading order:", error)
      router.push("/admin/login")
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (status: OrderStatus) => {
    if (!order) return
    setStatusToUpdate(status)
    setShowStatusDialog(true)
  }

  const confirmStatusUpdate = async () => {
    if (!order || !statusToUpdate) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: statusToUpdate }),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrder(updatedOrder.data)
        setEditedOrder(updatedOrder.data)
        setSuccessMessage(`Order #${order.id} status has been updated to ${statusToUpdate}.`)
        setShowSuccessModal(true)
        setShowStatusDialog(false)
        setStatusToUpdate(null)
      } else {
        throw new Error("Failed to update order")
      }
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const saveOrderChanges = async () => {
    if (!order) return
    setShowSaveDialog(true)
  }

  const confirmSaveChanges = async () => {
    if (!order) return

    setIsUpdating(true)
    setShowSaveDialog(false)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedOrder),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrder(updatedOrder.data)
        setEditedOrder(updatedOrder.data)
        setIsEditing(false)
        setSuccessMessage(`Order #${order.id} has been successfully updated.`)
        setShowSuccessModal(true)
      } else {
        throw new Error("Failed to update order")
      }
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getCurrentStepIndex = (status: string) => {
    return statusOrder.indexOf(status)
  }

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: OrderStatus) => {
    const Icon = statusIcons[status]
    return (
      <Badge variant="outline" className={`pl-2 pr-2.5 py-0.5 text-xs font-medium ${statusColors[status]}`}>
        <Icon className="h-3 w-3 mr-1.5" />
        {status.replace("_", " ")}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <AdminLayout adminUser={adminUser}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout adminUser={adminUser}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <Button onClick={() => router.push("/admin/orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout adminUser={adminUser}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-white border-gray-200"
              onClick={() => router.push("/admin/orders")}
            >
              <ArrowLeft className="h-4 w-4 text-gray-700" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt)} via {order.deliveryMethod}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-white" disabled>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            {isEditing ? (
              <>
                <Button onClick={saveOrderChanges} disabled={isUpdating} className="bg-orange-600 hover:bg-orange-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)} className="bg-white">
                <Edit className="h-4 w-4 mr-2" />
                Edit Order
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Status Timeline */}
            <Card className="border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Order Status</h3>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Timeline</span>
                </div>

                <div className="relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full -z-10" />
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-orange-500 rounded-full transition-all duration-500 -z-10"
                    style={{ width: `${(getCurrentStepIndex(order.status) / (statusSteps.length - 1)) * 100}%` }}
                  />

                  <div className="flex justify-between items-center w-full">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon
                      const currentStepIndex = getCurrentStepIndex(order.status)
                      const isCompleted = index <= currentStepIndex
                      const isCurrent = index === currentStepIndex

                      return (
                        <div key={step.key} className="flex flex-col items-center gap-2 bg-white px-1">
                          <div
                            className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${isCompleted ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-400'
                              } ${isCurrent ? 'ring-2 ring-orange-100 ring-offset-2' : ''}`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className={`text-[10px] font-semibold uppercase tracking-tight ${isCompleted ? 'text-orange-700' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap gap-3 justify-center pt-6 border-t border-gray-50">
                  {order.status === 'PENDING' && (
                    <>
                      <Button onClick={() => updateOrderStatus('CONFIRMED')} className="bg-orange-600 hover:bg-orange-500 text-black">
                        <CheckCircle className="h-4 w-4 mr-2" /> Confirm Order
                      </Button>
                      <Button onClick={() => updateOrderStatus('CANCELLED')} variant="destructive">
                        <XCircle className="h-4 w-4 mr-2" /> Cancel Order
                      </Button>
                    </>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <Button onClick={() => updateOrderStatus('PREPARING')} className="bg-orange-500 hover:bg-orange-400 text-black">
                      <Clock className="h-4 w-4 mr-2" /> Start Preparing
                    </Button>
                  )}
                  {order.status === 'PREPARING' && (
                    <Button onClick={() => updateOrderStatus('READY')} className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="h-4 w-4 mr-2" /> Mark Ready
                    </Button>
                  )}
                  {order.status === 'READY' && (
                    <Button onClick={() => updateOrderStatus('OUT_FOR_DELIVERY')} className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Truck className="h-4 w-4 mr-2" /> Send for Delivery
                    </Button>
                  )}
                  {order.status === 'OUT_FOR_DELIVERY' && (
                    <Button onClick={() => updateOrderStatus('DELIVERED')} className="bg-orange-600 hover:bg-orange-500 text-black">
                      <CheckCircle className="h-4 w-4 mr-2" /> Mark Delivered
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Items Table */}
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, i) => (
                    <div key={i} className="p-4 flex items-start justify-between hover:bg-gray-50/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-100 text-sm font-bold text-gray-500">
                          {item.quantity}x
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.itemName}</h4>
                          {item.variantName && (
                            <p className="text-sm text-gray-500">Variant: {item.variantName}</p>
                          )}
                          {item.extras && item.extras.length > 0 && (
                            <p className="text-xs text-gray-500">Extras: {item.extras.map((ex: any) => ex.name).join(", ")}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            ₦{parseFloat(item.price.toString()).toFixed(2)} each
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">₦{((parseFloat(item.price.toString()) + (item.extras || []).reduce((sum: number, ex: any) => sum + parseFloat(ex.price.toString()), 0)) * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                  <div className="flex flex-col gap-2 max-w-xs ml-auto">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>₦{parseFloat(order.subtotal.toString()).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery Fee</span>
                      <span>₦{parseFloat(order.deliveryFee.toString()).toFixed(2)}</span>
                    </div>
                    {Number((order as any).vatAmount || 0) > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>VAT</span>
                        <span>₦{parseFloat((order as any).vatAmount.toString()).toFixed(2)}</span>
                      </div>
                    )}
                    <Separator className="my-1" />
                    <div className="flex justify-between font-bold text-base text-gray-900">
                      <span>Total</span>
                      <span>₦{parseFloat(order.total.toString()).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900">Customer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">Customer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.customerPhone}</p>
                    <p className="text-xs text-gray-500">Contact Number</p>
                  </div>
                </div>
                {order.customerEmail && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customerEmail}</p>
                      <p className="text-xs text-gray-500">Email Address</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900">Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 rounded-full text-orange-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.deliveryAddress}</p>
                    <p className="text-xs text-gray-500">{order.deliveryCity}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.deliveryMethod}</p>
                    <p className="text-xs text-gray-500">Delivery Method</p>
                  </div>
                </div>
                {order.specialInstructions && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-100">
                    <div className="flex items-center gap-2 mb-1 text-yellow-800 font-medium text-xs uppercase tracking-wide">
                      <MessageSquare className="h-3 w-3" />
                      Note
                    </div>
                    <p className="text-sm text-yellow-900 italic">"{order.specialInstructions}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        title="Update Order Status"
        message={`Are you sure you want to update order #${order?.orderNumber} status to ${statusToUpdate}?`}
        confirmText="Update"
        cancelText="Cancel"
        variant="info"
        onConfirm={confirmStatusUpdate}
        onCancel={() => setStatusToUpdate(null)}
        isLoading={isUpdating}
      />

      <ConfirmationDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        title="Save Order Changes"
        message={`Are you sure you want to save changes to order #${order?.orderNumber}?`}
        confirmText="Save"
        cancelText="Cancel"
        variant="default"
        onConfirm={confirmSaveChanges}
        isLoading={isUpdating}
      />

      <SuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title="Order Updated"
        message={successMessage}
        variant="success"
        autoClose={true}
        autoCloseDelay={3000}
      />
    </AdminLayout>
  )
}
