"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "@/lib/motion"
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Banknote,
  Package,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts"

import { Prisma } from '@prisma/client'
import { useToast } from "@/hooks/use-toast"

import AdminLayout from "@/components/admin-layout"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsData {
  overview: {
    totalOrders: number
    totalRevenue: Prisma.Decimal
    averageOrderValue: Prisma.Decimal
    revenueGrowth: number
    orderGrowth: number
  }
  statusBreakdown: Record<string, number>
  dailyRevenue: Record<string, Prisma.Decimal>
  topSellingItems: Array<{
    name: string
    quantity: number
    revenue: Prisma.Decimal
  }>
  deliveryBreakdown: Record<string, number>
  paymentBreakdown: Record<string, number>
  recentOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    total: Prisma.Decimal
    status: string
    createdAt: string
    items: Array<{
      itemName: string
      quantity: number
    }>
  }>
  dateRange: {
    start: string
    end: string
    days: number
  }
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState("30")
  const router = useRouter()

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?days=${dateRange}`)
      const result = await response.json()

      if (response.ok) {
        setAnalyticsData(result.data)
      } else {
        console.error("Failed to fetch analytics:", result.error)
      }
    } catch (error) {
      console.error("Analytics error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number | Prisma.Decimal) => {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount.toString())
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(numAmount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "CONFIRMED": return "bg-blue-50 text-blue-700 border-blue-200"
      case "PREPARING": return "bg-orange-50 text-orange-700 border-orange-200"
      case "READY": return "bg-purple-50 text-purple-700 border-purple-200"
      case "OUT_FOR_DELIVERY": return "bg-indigo-50 text-indigo-700 border-indigo-200"
      case "DELIVERED": return "bg-orange-50 text-orange-700 border-orange-200"
      case "CANCELLED": return "bg-red-50 text-red-700 border-red-200"
      default: return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getGrowthBadge = (growth: number) => {
    const isPositive = growth >= 0
    return (
      <Badge
        variant="outline"
        className={isPositive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
      >
        {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
        {Math.abs(growth).toFixed(1)}%
      </Badge>
    )
  }

  // Prepare data for charts
  const prepareDailyRevenueData = () => {
    if (!analyticsData?.dailyRevenue) return []

    return Object.entries(analyticsData.dailyRevenue)
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString("en-NG", { day: "2-digit", month: "short" }),
        revenue: parseFloat(revenue.toString())
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const prepareStatusData = () => {
    if (!analyticsData?.statusBreakdown) return []

    return Object.entries(analyticsData.statusBreakdown).map(([status, count]) => ({
      name: status.replace("_", " "),
      value: count
    }))
  }

  const prepareTopItemsData = () => {
    if (!analyticsData?.topSellingItems) return []

    return analyticsData.topSellingItems.slice(0, 8).map((item, index) => ({
      name: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
      quantity: item.quantity,
      revenue: parseFloat(item.revenue.toString()),
    }))
  }

  const prepareDeliveryData = () => {
    if (!analyticsData?.deliveryBreakdown) return []

    return Object.entries(analyticsData.deliveryBreakdown).map(([method, count], index) => ({
      name: method,
      value: count,
    }))
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          {/* Overview Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>

          {/* Charts Section Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>

          {/* Recent Orders Skeleton */}
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </AdminLayout>
    )
  }

  if (!analyticsData) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="bg-red-50 p-4 rounded-full mb-4">
            <Activity className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load analytics</h2>
          <p className="text-gray-500 mb-6">There was an issue fetching the data. Please try again.</p>
          <Button onClick={fetchAnalytics}>
            Retry
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">
              Overview of your business performance and metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-36 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchAnalytics} variant="outline" size="icon">
              <Activity className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalOrders}</div>
              <div className="flex items-center gap-2 mt-1">
                {getGrowthBadge(analyticsData.overview.orderGrowth)}
                <span className="text-xs text-gray-400">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
              <Banknote className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.totalRevenue)}</div>
              <div className="flex items-center gap-2 mt-1">
                {getGrowthBadge(analyticsData.overview.revenueGrowth)}
                <span className="text-xs text-gray-400">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Avg. Order Value</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.averageOrderValue)}</div>
              <p className="text-xs text-gray-400 mt-1">Per completed order</p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Orders</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Object.entries(analyticsData.statusBreakdown)
                  .filter(([status]) => !["DELIVERED", "CANCELLED"].includes(status))
                  .reduce((sum, [, count]) => sum + count, 0)}
              </div>
              <p className="text-xs text-gray-400 mt-1">Currently in progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Revenue Chart */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
              <CardDescription>Daily revenue performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareDailyRevenueData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₦${value}`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [formatCurrency(value), "Revenue"]}
                      labelStyle={{ color: '#6B7280', fontSize: '12px', marginBottom: '4px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={{ fill: "#059669", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Pie Chart */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Order Distribution</CardTitle>
              <CardDescription>Orders by current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={prepareStatusData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {prepareStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {prepareStatusData().map((entry, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      {entry.name}: {entry.value}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Items Chart */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Top Selling Items</CardTitle>
              <CardDescription>Highest quantity sold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareTopItemsData()} layout="horizontal" barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any, name: any) => [
                        name === "quantity" ? `${value} units` : formatCurrency(value),
                        name === "quantity" ? "Quantity" : "Revenue"
                      ]}
                    />
                    <Bar dataKey="quantity" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Method Chart */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Delivery Method</CardTitle>
              <CardDescription>Delivery vs Collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={prepareDeliveryData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {prepareDeliveryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#8b5cf6'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 -mt-8">
                {prepareDeliveryData().map((entry, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: index === 0 ? '#3b82f6' : '#8b5cf6' }} />
                    {entry.name}: {entry.value}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="border-gray-100 shadow-sm mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <CardDescription>Latest orders from customers</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/orders')}>View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                      {order.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{order.customerName}</span>
                        <span className="text-gray-400 text-xs">#{order.orderNumber}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {order.items.length} items • {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {order.status.replace("_", " ")}
                    </Badge>
                    <span className="font-medium text-gray-900 w-20 text-right">{formatCurrency(order.total)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="h-8 w-8 text-gray-400 hover:text-gray-900"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}