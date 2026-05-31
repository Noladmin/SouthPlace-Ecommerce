"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Shield, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function AdminChangePasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const response = await fetch("/api/auth/admin/me", { cache: "no-store" })
        if (!response.ok) {
          router.push("/admin/login")
          return
        }

        const data = await response.json()
        if (!data.admin?.mustChangePassword) {
          router.push("/admin/dashboard")
          return
        }
      } catch (error) {
        console.error("Change password auth check error:", error)
        router.push("/admin/login")
        return
      } finally {
        setIsLoading(false)
      }
    }

    void check()
  }, [router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch("/api/auth/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, confirmPassword }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to update password")
      }

      toast({
        title: "Password updated",
        description: "You can now continue to the dashboard.",
      })
      setIsSuccess(true)
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Could not update password",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-orange-600" />
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-orange-50 p-4">
        <Card className="w-full max-w-lg border-0 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/90">
          <CardHeader className="text-center pb-6 pt-8 px-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-600 animate-bounce">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-gray-900 tracking-tight">Password Updated!</CardTitle>
            <CardDescription className="text-base mt-3 text-gray-600">
              Your security settings have been updated successfully. Your new password is now active.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 text-center">
            <p className="text-sm text-gray-500 mb-6">
              Please click the button below to securely enter your administration dashboard.
            </p>
            <Button 
              onClick={() => router.push("/admin/dashboard")} 
              className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-black rounded-xl font-semibold shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/30 transition-all duration-250 flex items-center justify-center gap-2"
            >
              Proceed to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-orange-50 p-4">
      <Card className="w-full max-w-lg border-0 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <CardTitle>Set Your New Password</CardTitle>
          <CardDescription>
            Your temporary password has served its purpose. Choose a new one before continuing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-orange-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-orange-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? "Saving..." : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
