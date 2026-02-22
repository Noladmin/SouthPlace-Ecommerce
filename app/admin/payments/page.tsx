"use client"

import { useState, useEffect } from "react"
import { motion } from "@/lib/motion"
import {
  CreditCard,
  Banknote,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { useToast } from "@/hooks/use-toast"
import AdminLayout from "@/components/admin-layout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Payment {
  id: string
  paymentIntentId: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  gateway: string
  createdAt: string
  processedAt?: string
  order: {
    orderNumber: string
    customerName: string
    customerEmail: string
    total: number
    status: string
    createdAt: string
  }
}

interface PaymentSummary {
  totalAmount: number
  todayPayments: number
  todayAmount: number
}

export default function PaymentsPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<PaymentSummary>({
    totalAmount: 0,
    todayPayments: 0,
    todayAmount: 0
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "ALL",
    paymentMethod: "ALL",
    startDate: "",
    endDate: "",
    page: 1
  })

  useEffect(() => {
    fetchPayments()
  }, [filters])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: "20",
      })
      if (filters.status && filters.status !== "ALL") params.set("status", filters.status)
      if (filters.paymentMethod && filters.paymentMethod !== "ALL") params.set("paymentMethod", filters.paymentMethod)
      if (filters.startDate) params.set("startDate", filters.startDate)
      if (filters.endDate) params.set("endDate", filters.endDate)

      const response = await fetch(`/api/admin/payments?${params}`)
      const result = await response.json()

      if (result.success) {
        setPayments(result.data.payments)
        setSummary(result.data.summary)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch payments",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast({
        title: "Error",
        description: "Failed to fetch payments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">Paid</Badge>
      case "FAILED":
        return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">Failed</Badge>
      case "PENDING":
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Pending</Badge>
      case "PROCESSING":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Processing</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payments</h1>
            <p className="text-gray-500 mt-1">Track and reconcile payment transactions.</p>
          </div>
          <Button variant="outline" className="h-9">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
              <Banknote className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalAmount)}</div>
              <p className="text-xs text-gray-400 mt-1">All time payments</p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Today's Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{summary.todayPayments}</div>
              <p className="text-xs text-gray-400 mt-1">Payments received today</p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Today's Volume</CardTitle>
              <CreditCard className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(summary.todayAmount)}</div>
              <p className="text-xs text-gray-400 mt-1">Revenue for today</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Method</label>
                <Select value={filters.paymentMethod} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Methods</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
                <Input
                  type="date"
                  className="h-9"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">End Date</label>
                <Input
                  type="date"
                  className="h-9"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4">
                <TableSkeleton columns={7} rowCount={8} />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-gray-100 hover:bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-900">Order ID</TableHead>
                    <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                    <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Method</TableHead>
                    <TableHead className="font-semibold text-gray-900">Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                        <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        No payments found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="font-medium text-gray-900">{payment.order.orderNumber}</div>
                          <div className="text-xs text-gray-400 font-mono">{payment.paymentIntentId?.slice(-8) || "N/A"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{payment.order.customerName}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">{payment.order.customerEmail}</div>
                        </TableCell>
                        <TableCell className="font-bold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 capitalize">
                            {payment.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{formatDate(payment.createdAt)}</span>
                        </TableCell>
                        <TableCell>
                          <PaymentDetailsModal payment={payment} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}

function PaymentDetailsModal({ payment }: { payment: Payment }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>Transaction information for {payment.order.orderNumber}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium">{payment.status}</p>
            </div>
            <div>
              <p className="text-gray-500">Amount</p>
              <p className="font-bold text-lg">₦{payment.amount}</p>
            </div>
            <div>
              <p className="text-gray-500">Method</p>
              <p className="font-medium capitalize">{payment.paymentMethod}</p>
            </div>
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium">{new Date(payment.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500">Transaction ID</p>
              <p className="font-mono text-xs bg-gray-100 p-1 rounded break-all">{payment.paymentIntentId || "N/A"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500">Customer</p>
              <p className="font-medium">{payment.order.customerName}</p>
              <p className="text-xs text-gray-500">{payment.order.customerEmail}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
