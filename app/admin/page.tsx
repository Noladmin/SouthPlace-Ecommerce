"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  ShoppingCart,
  Utensils,
  Settings,
  LogOut,
  Shield,
  Mail,
  Calendar,
  Plus,
  Eye,
  BarChart3,
  CreditCard
} from "lucide-react"
import type { Admin } from "@/lib/types"

export default function AdminDashboardPage() {
  const [user, setUser] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activity, setActivity] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        // Load recent activity after auth
        loadRecentActivity()
      } else {
        router.push("/admin/login")
      }
    } catch (error) {
      console.error("Auth check error:", error)
      router.push("/admin/login")
    } finally {
      setIsLoading(false)
    }
  }

  const loadRecentActivity = async () => {
    try {
      const res = await fetch('/api/admin/dashboard/activity')
      if (!res.ok) return
      const data = await res.json()
      if (data.success) setActivity(data.data || [])
    } catch (e) {
      console.error('Activity load error', e)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" })
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img
                src="/images/SouthLogo.png"
                alt="South Place Catering"
                className="h-8 w-auto mr-4"
              />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Badge variant={user.role === "SUPER_ADMIN_USER" ? "default" : "secondary"}>
                {user.role.replace("_", " ")}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">Manage your catering operations from here.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No orders yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No items yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">You are the admin</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Secure</div>
              <p className="text-xs text-muted-foreground">OTP enabled</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("/admin/payments")}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                View Payments
              </CardTitle>
              <CardDescription>
                Track and manage payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Payment history</span>
                <Eye className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("/admin/menu")}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Utensils className="h-5 w-5 mr-2" />
                Manage Menu
              </CardTitle>
              <CardDescription>
                Add, edit, or remove menu items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">View all menu items</span>
                <Eye className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("/admin/orders")}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                View Orders
              </CardTitle>
              <CardDescription>
                Track and manage customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Process orders</span>
                <Eye className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("/admin/menu/new")}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add Menu Item
              </CardTitle>
              <CardDescription>
                Create a new menu item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Add new dish</span>
                <Plus className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("/admin/settings")}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure business settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Business configuration</span>
                <Settings className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>

                                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("/admin/analytics")}>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2" />
                            Analytics Dashboard
                          </CardTitle>
                          <CardDescription>
                            View business insights and metrics
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Business analytics</span>
                            <BarChart3 className="h-4 w-4 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Users className="h-5 w-5 mr-2" />
                            Manage Admins
                          </CardTitle>
                          <CardDescription>
                            Create and manage admin users
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Admin management</span>
                            <Users className="h-4 w-4 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest orders and system updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activity.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 text-primary">{item.icon || '•'}</div>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                        <div className="text-xs text-gray-400">{item.timeAgo}</div>
                      </div>
                    </div>
                  ))}
              </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 
