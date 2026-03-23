"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DeliveryAccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState("Validating delivery link...")

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      setMessage("Delivery link is missing or invalid.")
      return
    }

    const run = async () => {
      const response = await fetch("/api/delivery/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const result = await response.json()
      if (response.ok) {
        router.replace("/delivery")
      } else {
        setMessage(result.error || "Unable to validate delivery link.")
      }
    }

    run()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Delivery Access</CardTitle>
          <CardDescription>SouthtownPlace rider access</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{message}</p>
        </CardContent>
      </Card>
    </div>
  )
}
