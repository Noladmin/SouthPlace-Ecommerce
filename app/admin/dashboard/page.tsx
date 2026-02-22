"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "@/lib/motion"
import {
  Package,
  Users,
  Banknote,
  Menu,
  ShoppingCart,
  Star,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AdminLayout from "@/components/admin-layout"
import { Prisma } from '@prisma/client'
import type { Admin } from "@/lib/types"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DashboardStats {
  totalOrders: number
  totalRevenue: Prisma.Decimal
  totalCustomers: number
  totalMenuItems: number
  pendingOrders: number
  todayOrders: number
}

export default function AdminDashboardPage() {
  const [adminUser, setAdminUser] = useState<Admin | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [activityPage, setActivityPage] = useState(1)
  const [activityTotalPages, setActivityTotalPages] = useState(1)
  const [activityLimit, setActivityLimit] = useState(10)
  const [statusCounts, setStatusCounts] = useState<any | null>(null)
  const [trendPoints, setTrendPoints] = useState<Array<{ date: string; orders: number; revenue: number }>>([])
  const [topItems, setTopItems] = useState<Array<{ name: string; orders: number; quantity: number; revenue: number }>>([])
  const [trendDays, setTrendDays] = useState(14)
  const [topItemsDays, setTopItemsDays] = useState(30)
  const [orders, setOrders] = useState<any[]>([])
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersTotalPages, setOrdersTotalPages] = useState(1)
  const [ordersLimit, setOrdersLimit] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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

      // Load dashboard stats
      const statsResponse = await fetch("/api/admin/dashboard/stats", { cache: "no-store" })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.data)
      }

      // Load recent activity
      const actRes = await fetch(`/api/admin/dashboard/activity?page=${activityPage}&limit=${activityLimit}`, { cache: "no-store" })
      if (actRes.ok) {
        const actData = await actRes.json()
        if (actData.success) {
          setActivity(actData.data || [])
          if (actData.pagination) {
            setActivityTotalPages(actData.pagination.totalPages || 1)
          }
        }
      }

      // Load status breakdown
      const statusRes = await fetch('/api/admin/dashboard/status', { cache: "no-store" })
      if (statusRes.ok) {
        const statusData = await statusRes.json()
        if (statusData.success) setStatusCounts(statusData.data)
      }

      // Load trends (last 14 days)
      const trendsRes = await fetch(`/api/admin/dashboard/trends?days=${trendDays}`, { cache: "no-store" })
      if (trendsRes.ok) {
        const trendsData = await trendsRes.json()
        if (trendsData.success) setTrendPoints(trendsData.data || [])
      }

      // Load top items (30 days)
      const topRes = await fetch(`/api/admin/dashboard/top-items?days=${topItemsDays}`, { cache: "no-store" })
      if (topRes.ok) {
        const topData = await topRes.json()
        if (topData.success) setTopItems(topData.data || [])
      }

      // Load latest orders
      await loadOrders(ordersPage, ordersLimit)
    } catch (error) {
      console.error("Dashboard load error:", error)
      router.push("/admin/login")
    } finally {
      setIsLoading(false)
    }
  }

  // Compute safe formatted revenue
  const totalRevenueDisplay = (() => {
    if (!stats || stats.totalRevenue == null) return '0.00'
    const anyVal: any = stats.totalRevenue as any
    const num = typeof anyVal?.toString === 'function' ? parseFloat(anyVal.toString()) : Number(anyVal ?? 0)
    return isNaN(num) ? '0.00' : num.toFixed(2)
  })()

  const displayName = (() => {
    const rawName = (adminUser?.name || '').trim()
    if (rawName && !/^super\s*admin$/i.test(rawName)) {
      return rawName.split(' ')[0]
    }
    return 'Admin'
  })()

  const goToActivityPage = async (page: number) => {
    const next = Math.max(1, Math.min(page, activityTotalPages))
    setActivityPage(next)
    try {
      const res = await fetch(`/api/admin/dashboard/activity?page=${next}&limit=${activityLimit}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        setActivity(data.data || [])
        if (data.pagination) setActivityTotalPages(data.pagination.totalPages || 1)
      }
    } catch (e) {
      console.error('Activity pagination error', e)
    }
  }

  const changeActivityLimit = async (limit: number) => {
    setActivityLimit(limit)
    setActivityPage(1)
    try {
      const res = await fetch(`/api/admin/dashboard/activity?page=1&limit=${limit}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        setActivity(data.data || [])
        if (data.pagination) setActivityTotalPages(data.pagination.totalPages || 1)
      }
    } catch (e) {
      console.error('Activity page size error', e)
    }
  }

  const renderPagination = () => {
    const pages: number[] = []
    const start = Math.max(1, activityPage - 2)
    const end = Math.min(activityTotalPages, start + 4)
    for (let p = start; p <= end; p++) pages.push(p)
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => goToActivityPage(activityPage - 1)} aria-disabled={activityPage <= 1} />
          </PaginationItem>
          {pages.map((p) => (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === activityPage} onClick={() => goToActivityPage(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext onClick={() => goToActivityPage(activityPage + 1)} aria-disabled={activityPage >= activityTotalPages} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  const refreshTrends = async (days: number) => {
    setTrendDays(days)
    const res = await fetch(`/api/admin/dashboard/trends?days=${days}`)
    if (!res.ok) return
    const data = await res.json()
    if (data.success) setTrendPoints(data.data || [])
  }

  const refreshTopItems = async (days: number) => {
    setTopItemsDays(days)
    const res = await fetch(`/api/admin/dashboard/top-items?days=${days}`)
    if (!res.ok) return
    const data = await res.json()
    if (data.success) setTopItems(data.data || [])
  }

  const loadOrders = async (page: number, limit: number) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      if (data.success) {
        setOrders(data.data || [])
        setOrdersTotalPages(data.pagination?.pages || 1)
      }
    } catch (e) {
      console.error('Latest orders load error', e)
    }
  }

  const changeOrdersPage = async (page: number) => {
    const next = Math.max(1, Math.min(page, ordersTotalPages))
    setOrdersPage(next)
    await loadOrders(next, ordersLimit)
  }

  if (isLoading) {
    return (
      <AdminLayout adminUser={adminUser}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout adminUser={adminUser}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">Hello {displayName}, welcome back to your overview.</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  {stats.pendingOrders > 0 && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                      {stats.pendingOrders} pending
                    </Badge>
                  )}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                  <div className="text-sm text-gray-500 font-medium">Total Orders</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Banknote className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="flex items-center text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    Today
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">₦{totalRevenueDisplay}</div>
                  <div className="text-sm text-gray-500 font-medium">Total Revenue</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</div>
                  <div className="text-sm text-gray-500 font-medium">Total Customers</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Menu className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalMenuItems}</div>
                  <div className="text-sm text-gray-500 font-medium">Active Menu Items</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status Donut Chart */}
          <Card className="border-gray-100 shadow-sm col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-900">Order Status</CardTitle>
              <CardDescription>Live distribution of order statuses</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-6">
              {statusCounts ? (
                <div className="h-[250px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: statusCounts.pending, color: '#eab308' },
                          { name: 'Preparing', value: statusCounts.preparing, color: '#f97316' },
                          { name: 'Ready', value: statusCounts.ready, color: '#22c55e' },
                          { name: 'Delivered', value: statusCounts.delivered, color: '#10b981' },
                          { name: 'Cancelled', value: statusCounts.cancelled || 0, color: '#ef4444' },
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Pending', value: statusCounts.pending, color: '#eab308' },
                          { name: 'Preparing', value: statusCounts.preparing, color: '#f97316' },
                          { name: 'Ready', value: statusCounts.ready, color: '#22c55e' },
                          { name: 'Delivered', value: statusCounts.delivered, color: '#10b981' },
                          { name: 'Cancelled', value: statusCounts.cancelled || 0, color: '#ef4444' },
                        ].filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#374151', fontSize: '12px', fontWeight: '500' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</span>
                      <p className="text-xs text-gray-500 uppercase font-medium">Total</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px]">
                  <LoadingSpinner />
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {[
                  { label: 'Pending', color: 'bg-yellow-500' },
                  { label: 'Preparing', color: 'bg-orange-500' },
                  { label: 'Ready', color: 'bg-green-500' },
                  { label: 'Delivered', color: 'bg-orange-500' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    <span className="text-xs font-medium text-gray-600">{s.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trends Chart */}
          <Card className="lg:col-span-2 border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-white rounded-t-xl border-b border-gray-50/50">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Revenue & Orders</CardTitle>
                <CardDescription>Performance tracking over time</CardDescription>
              </div>
              <Select value={String(trendDays)} onValueChange={(v) => refreshTrends(parseInt(v))}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="pt-6 pl-0">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendPoints} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" name="Orders" />
                    <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₦)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Items */}
          <Card className="border-gray-100 shadow-sm col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-gray-900">Top Selling</CardTitle>
              <Select value={String(topItemsDays)} onValueChange={(v) => refreshTopItems(parseInt(v))}>
                <SelectTrigger className="w-[110px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {topItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No items found</div>
                ) : (
                  topItems.slice(0, 5).map((item, i) => {
                    // Calculate simple percentage for progress bar (relative to top item)
                    const maxQty = Math.max(...topItems.map(t => t.quantity));
                    const percent = (item.quantity / maxQty) * 100;

                    return (
                      <div key={i} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-bold text-gray-500 group-hover:bg-gray-200 transition-colors">
                              {i + 1}
                            </div>
                            <div>
                              <div className="font-medium text-sm text-gray-900 truncate max-w-[150px]" title={item.name}>{item.name}</div>
                              <div className="text-xs text-gray-500">{item.quantity} sold</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm text-gray-900">₦{Number(item.revenue).toFixed(2)}</div>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>


          {/* Latest Orders */}
          <Card className="lg:col-span-2 border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">Recent Orders</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-gray-100">
                    <TableHead className="w-[100px] text-xs font-semibold uppercase text-gray-500">Order ID</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-gray-500">Customer</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-gray-500">Status</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase text-gray-500">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.orderNumber} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-900">#{order.orderNumber}</TableCell>
                      <TableCell className="text-gray-600">{order.customerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`
                                            ${order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                            order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              order.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-gray-50 text-gray-700 border-gray-200'
                          }
                                        `}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-gray-900">₦{Number(order.total).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">Activity Log</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {activity.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No activity logged</div>
                ) : (
                  activity.slice(0, 6).map((act, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-200 mt-2"></div>
                        <div className="w-px h-full bg-gray-100 my-1"></div>
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium text-gray-900">{act.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{act.timeAgo}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </AdminLayout>
  )
}