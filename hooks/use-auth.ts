"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Admin, LoginRequest, Role } from "@/lib/types"

export interface AuthState {
  user: Admin | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginState {
  isLoading: boolean
  requiresOTP: boolean
  error: string | null
}

export interface UseAuthReturn {
  auth: AuthState
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  resendOTP: (email: string, password: string) => Promise<void>
  hasPermission: (requiredRole: Role) => boolean
}

/**
 * Custom hook for admin authentication
 */
export const useAuth = (): UseAuthReturn => {
  const router = useRouter()
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const [loginState, setLoginState] = useState<LoginState>({
    isLoading: false,
    requiresOTP: false,
    error: null,
  })

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  /**
   * Checks if user is authenticated
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/auth/me")
      
      if (response.ok) {
        const { user } = await response.json()
        setAuth({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        setAuth({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setAuth({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  /**
   * Handles admin login
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    setLoginState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (data.success) {
        if (data.requiresOTP) {
          setLoginState(prev => ({
            ...prev,
            isLoading: false,
            requiresOTP: true,
          }))
        } else {
          setAuth({
            user: data.user,
            isLoading: false,
            isAuthenticated: true,
          })
          setLoginState({
            isLoading: false,
            requiresOTP: false,
            error: null,
          })
          router.push("/admin")
        }
      } else {
        setLoginState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message,
        }))
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginState(prev => ({
        ...prev,
        isLoading: false,
        error: "An error occurred during login",
      }))
    }
  }, [router])

  /**
   * Handles admin logout
   */
  const logout = useCallback(async () => {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
      })

      setAuth({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })

      router.push("/admin/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }, [router])

  /**
   * Resends OTP to admin
   */
  const resendOTP = useCallback(async (email: string, password: string) => {
    setLoginState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch("/api/admin/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        setLoginState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }))
      } else {
        setLoginState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message,
        }))
      }
    } catch (error) {
      console.error("Resend OTP error:", error)
      setLoginState(prev => ({
        ...prev,
        isLoading: false,
        error: "Failed to resend OTP",
      }))
    }
  }, [])

  /**
   * Checks if user has required role permission
   */
  const hasPermission = useCallback((requiredRole: Role): boolean => {
    if (!auth.user) return false

    const roleHierarchy: Record<Role, number> = {
      USER: 1,
      ADMIN_USER: 2,
      SUPER_ADMIN_USER: 3,
    }

    const userRoleLevel = roleHierarchy[auth.user.role]
    const requiredRoleLevel = roleHierarchy[requiredRole]

    return userRoleLevel >= requiredRoleLevel
  }, [auth.user])

  return {
    auth,
    login,
    logout,
    resendOTP,
    hasPermission,
  }
}

/**
 * Hook for protecting admin routes
 */
export const useRequireAuth = (requiredRole?: Role) => {
  const { auth, hasPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading) {
      if (!auth.isAuthenticated) {
        router.push("/admin/login")
      } else if (requiredRole && !hasPermission(requiredRole)) {
        router.push("/admin/unauthorized")
      }
    }
  }, [auth, requiredRole, hasPermission, router])

  return auth
} 