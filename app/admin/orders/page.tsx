"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Truck
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AdminLayout from "@/components/admin-layout"
import ConfirmationDialog from "@/components/admin/confirmation-dialog"
import SuccessModal from "@/components/admin/success-modal"
import { TableSkeleton } from "@/components/ui/table-skeleton"
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

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [orderToUpdate, setOrderToUpdate] = useState<{ id: string; status: OrderStatus } | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [searchTerm, selectedStatus, dateFrom, dateTo])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (selectedStatus) params.append("status", selectedStatus)
      if (dateFrom) params.append("dateFrom", dateFrom)
      if (dateTo) params.append("dateTo", dateTo)

      const response = await fetch(`/api/admin/orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.data || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrderToUpdate({ id: orderId, status })
    setShowStatusDialog(true)
  }

  const confirmStatusUpdate = async () => {
    if (!orderToUpdate) return

    try {
      const response = await fetch(`/api/admin/orders/${orderToUpdate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: orderToUpdate.status }),
      })

      if (response.ok) {
        setSuccessMessage(`Order #${orderToUpdate.id} status has been updated.`)
        setShowSuccessModal(true)
        setShowStatusDialog(false)
        setOrderToUpdate(null)
        fetchOrders()
      } else {
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const handleExportOrders = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append("startDate", dateFrom)
      if (dateTo) params.append("endDate", dateTo)
      if (selectedStatus) params.append("status", selectedStatus)

      const response = await fetch(`/api/admin/orders/export?${params.toString()}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Export successful",
          description: "Orders have been exported to CSV file.",
        })
      } else {
        throw new Error("Export failed")
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "Failed to export orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Orders</h1>
            <p className="text-gray-500 mt-1">Manage and track your customer orders.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportOrders}
              disabled={isExporting}
              variant="outline"
              className="whitespace-nowrap bg-white"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/3">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Order ID, Customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/4">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PREPARING">Preparing</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-auto">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Date Range</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-auto"
                  />
                  <span className="text-gray-400">-</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-auto"
                  />
                </div>
              </div>
              <div className="w-full md:w-auto md:ml-auto">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedStatus("")
                    setDateFrom("")
                    setDateTo("")
                  }}
                  className="h-9 text-gray-500 hover:text-gray-900"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4">
                <TableSkeleton columns={7} rowCount={8} />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-gray-100 hover:bg-gray-50/50">
                    <TableHead className="w-[100px] font-semibold text-gray-900">Order ID</TableHead>
                    <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                    <TableHead className="font-semibold text-gray-900">Date</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Items</TableHead>
                    <TableHead className="text-right font-semibold text-gray-900">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <p className="text-lg font-medium text-gray-900 mb-1">No orders found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => {
                      const StatusIcon = statusIcons[order.status];
                      return (
                        <TableRow key={order.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-medium text-gray-900">
                            #{order.orderNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{order.customerName}</span>
                              <span className="text-xs text-gray-500">{order.customerPhone}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">
                            {formatDate(typeof order.createdAt === 'string' ? order.createdAt : order.createdAt.toISOString())}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`font-medium ${statusColors[order.status]}`}>
                              <StatusIcon className="h-3 w-3 mr-1.5" />
                              {order.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 max-w-[200px] truncate" title={order.items.map(i => `${i.quantity}x ${i.itemName}`).join(", ")}>
                            {order.items.length} items
                          </TableCell>
                          <TableCell className="text-right font-semibold text-gray-900">
                            ₦{parseFloat(order.total.toString()).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {order.status === 'PENDING' && (
                                  <>
                                    <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}>
                                      <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                                      Confirm
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Cancel
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {order.status === 'CONFIRMED' && (
                                  <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'PREPARING')}>
                                    <Clock className="mr-2 h-4 w-4 text-orange-600" />
                                    Start Preparing
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'PREPARING' && (
                                  <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'READY')}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    Mark Ready
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'READY' && (
                                  <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}>
                                    <Truck className="mr-2 h-4 w-4 text-purple-600" />
                                    Out for Delivery
                                  </DropdownMenuItem>
                                )}
                                {order.status === 'OUT_FOR_DELIVERY' && (
                                  <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'DELIVERED')}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-orange-600" />
                                    Mark Delivered
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>

      <ConfirmationDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        title="Update Order Status"
        message={`Are you sure you want to update order #${orderToUpdate?.id} status to ${orderToUpdate?.status}?`}
        confirmText="Update"
        cancelText="Cancel"
        variant="info"
        onConfirm={confirmStatusUpdate}
        onCancel={() => setOrderToUpdate(null)}
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