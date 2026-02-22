"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "@/lib/motion"
import { User, Package, Clock, MapPin, Phone, Mail, Settings, LogOut, ChevronRight, ShoppingBag, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import ProtectedRoute from "@/components/protected-route"

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  address: string | null
  city: string | null
  createdAt: string
}

function DashboardContent() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          toast({
            title: "Error",
            description: "Failed to load user data",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [toast])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      try { window.dispatchEvent(new Event('authChanged')) } catch { }
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-12 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-[400px] rounded-xl" />
              <Skeleton className="h-[400px] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-white py-12 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-12 flex items-center justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mb-2"
              >
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-3 py-1">
                  Member
                </Badge>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl font-bold font-display text-gray-900 tracking-tight"
              >
                Welcome, {user.name.split(' ')[0]}!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-gray-500 mt-2"
              >
                Here's what's happening with your account today.
              </motion.p>
            </div>
          </div>

          {/* Quick Stats / Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <Card
                className="hover:shadow-xl transition-all cursor-pointer border-gray-100 bg-white h-full group relative overflow-hidden"
                onClick={() => router.push('/order')}
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShoppingBag className="w-24 h-24 text-primary" />
                </div>
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-primary transition-colors">Place Order</h3>
                  <p className="text-gray-500 mb-6 text-sm">Hungry? Browse our menu and order your favorites now.</p>
                  <div className="flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                    Start Order <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <Card
                className="hover:shadow-xl transition-all cursor-pointer border-gray-100 bg-white h-full group relative overflow-hidden"
                onClick={() => router.push('/order-history')}
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Clock className="w-24 h-24 text-primary" />
                </div>
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-primary transition-colors">Order History</h3>
                  <p className="text-gray-500 mb-6 text-sm">View past orders, download receipts, and reorder.</p>
                  <div className="flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                    View History <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <Card
                className="hover:shadow-xl transition-all cursor-pointer border-gray-100 bg-white h-full group relative overflow-hidden"
                onClick={() => router.push('/track-order')}
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Package className="w-24 h-24 text-primary" />
                </div>
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Package className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-primary transition-colors">Track Order</h3>
                  <p className="text-gray-500 mb-6 text-sm">Real-time updates on your current delivery status.</p>
                  <div className="flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                    Track Now <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="h-full border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-500 border border-gray-100">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">Profile Details</CardTitle>
                      <CardDescription>Manage your personal information</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    <div className="flex items-center p-6 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <Mail className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Email Address</p>
                        <p className="font-medium text-gray-900 mt-0.5">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-6 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <Phone className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Phone Number</p>
                        <p className="font-medium text-gray-900 mt-0.5">{user.phone}</p>
                      </div>
                    </div>

                    {user.address && (
                      <div className="flex items-center p-6 hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                          <MapPin className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Default Address</p>
                          <p className="font-medium text-gray-900 mt-0.5">
                            {user.address}
                            {user.city && `, ${user.city}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="h-full border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-500 border border-gray-100">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">Account Settings</CardTitle>
                      <CardDescription>Update your preferences</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-between h-auto py-4 px-4 rounded-xl border-gray-200 hover:border-primary/50 hover:bg-primary/5 group transition-all"
                    onClick={() => router.push('/account/address')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Manage Addresses</div>
                        <div className="text-xs text-gray-500">Update delivery locations</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-between h-auto py-4 px-4 rounded-xl border-gray-200 hover:border-primary/50 hover:bg-primary/5 group transition-all"
                    onClick={() => router.push('/contact')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Support</div>
                        <div className="text-xs text-gray-500">Get help with your orders</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
                  </Button>

                  <div className="pt-4 mt-2 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      className="w-full justify-between h-auto py-4 px-4 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 group transition-all"
                      onClick={handleLogout}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 group-hover:bg-red-100 transition-colors">
                          <LogOut className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">Sign Out</div>
                          <div className="text-xs text-red-400">Securely logo out of device</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
