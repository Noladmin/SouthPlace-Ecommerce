"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  ShoppingCart,
  Menu as MenuIcon,
  Layers,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Package,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Admin } from "@/lib/types"

interface AdminLayoutProps {
  children: React.ReactNode
  adminUser?: Admin | null
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Menu",
    href: "/admin/menu",
    icon: MenuIcon,
  },
  {
    title: "Extras",
    href: "/admin/extras",
    icon: Layers,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Package,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: Eye,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  }
]

export default function AdminLayout({ children, adminUser }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/admin/logout", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        })
        router.push("/admin/login")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-gray-200 bg-white ${sidebarCollapsed ? "w-[70px]" : "w-64"
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <Image
                  src="/images/SouthLogo.png"
                  alt="South Place Catering"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-bold text-gray-900 tracking-tight">South Place</span>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="flex items-center justify-center w-full">
                <Image
                  src="/images/SouthLogo.png"
                  alt="South Place Catering"
                  width={32}
                  height={32}
                  className="rounded-lg mb-2"
                />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 text-gray-500 hover:text-orange-600 hover:bg-orange-50 border border-gray-200 shadow-sm transition-all duration-200"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${active
                    ? "bg-orange-50 text-orange-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  title={sidebarCollapsed ? item.title : undefined}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 transition-colors ${active ? "text-orange-600" : "text-gray-400 group-hover:text-gray-500"}`} />
                  {!sidebarCollapsed && (
                    <span className="ml-3 truncate">{item.title}</span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* User Info & Footer */}
          <div className="border-t border-gray-100 p-4 bg-gray-50/50">
            {adminUser && !sidebarCollapsed && (
              <div className="mb-4 px-1">
                <div className="font-medium text-gray-900 truncate">{adminUser.name}</div>
                <div className="text-xs text-gray-500 truncate">{adminUser.email}</div>
                <Badge variant="outline" className="mt-2 text-[10px] text-gray-500 font-normal border-gray-200 bg-white">
                  {adminUser.role.replace("_", " ")}
                </Badge>
              </div>
            )}

            <div className="flex items-center gap-2">
              {!sidebarCollapsed ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs justify-start px-2"
                >
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 mx-auto"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${sidebarCollapsed ? "ml-[70px]" : "ml-64"
          }`}
      >
        <div className="p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
