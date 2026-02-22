"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AdminProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AdminProtectedRoute({ children, fallback }: AdminProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/admin/me')
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          // Redirect to admin login page
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Admin auth check failed:', error)
        setIsAuthenticated(false)
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return <>{children}</>
} 