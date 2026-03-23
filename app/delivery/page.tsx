"use client"

import { useEffect, useState } from "react"
import { Bike, CheckCircle, Clock, MapPin, Package, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function DeliveryPage() {
  const [assignment, setAssignment] = useState<any>(null)
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const loadAssignment = async () => {
    try {
      const response = await fetch("/api/delivery/me")
      const result = await response.json()
      if (response.status === 404) {
        setAssignment(null)
        return
      }
      if (!response.ok) throw new Error(result.error || "Unable to load delivery assignment")
      setAssignment(result.data)
    } catch (error: any) {
      toast({ title: "Access error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAssignment()
  }, [])

  const submitAction = async (action: "PICKED_UP" | "OUT_FOR_DELIVERY" | "DELIVERED") => {
    if (!assignment) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/delivery/assignment/${assignment.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, code: action === "DELIVERED" ? code : undefined }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to update delivery")
      setCode("")
      setAssignment(result.data)
      toast({ title: "Updated", description: result.message || "Delivery updated successfully" })
      if (action !== "DELIVERED") {
        await loadAssignment()
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">Loading assignment...</div>
  }

  if (!assignment) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">No active delivery assignment found.</div>
  }

  const riderLabel = assignment.riderName || assignment.rider?.name || "Assigned rider"
  const formatDateTime = (value?: string | Date | null) => {
    if (!value) return null
    return new Date(value).toLocaleString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bike className="h-5 w-5 text-orange-600" />
              Delivery for order {assignment.order.orderNumber}
            </CardTitle>
            <CardDescription>{riderLabel}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <Package className="mt-0.5 h-4 w-4 text-orange-600" />
                <div>
                  <p className="font-medium">{assignment.order.customerName}</p>
                  <p>{assignment.order.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="mt-0.5 h-4 w-4 text-orange-600" />
                <div>
                  <p>{assignment.order.deliveryAddress}</p>
                  <p>{assignment.order.deliveryCity}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Badge variant="outline" className="border-orange-200 text-orange-700">
                {assignment.order.status.replace(/_/g, " ")}
              </Badge>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Assigned: {formatDateTime(assignment.assignedAt)}</p>
                {assignment.order.pickedUpAt && <p>Picked up: {formatDateTime(assignment.order.pickedUpAt)}</p>}
                {assignment.order.outForDeliveryAt && <p>Out for delivery: {formatDateTime(assignment.order.outForDeliveryAt)}</p>}
                {assignment.order.deliveredAt && <p>Delivered: {formatDateTime(assignment.order.deliveredAt)}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Delivery Actions</CardTitle>
            <CardDescription>Move the order through pickup and confirmation without admin intervention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={isSubmitting || ["PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"].includes(assignment.order.status)}
                onClick={() => submitAction("PICKED_UP")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Clock className="mr-2 h-4 w-4" />
                Confirm Pickup
              </Button>
              <Button
                disabled={isSubmitting || !["PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"].includes(assignment.order.status)}
                onClick={() => submitAction("OUT_FOR_DELIVERY")}
                variant="outline"
              >
                <Truck className="mr-2 h-4 w-4" />
                Start Delivery
              </Button>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-medium text-gray-900">Complete delivery with customer code</p>
              <p className="mt-1 text-sm text-gray-500">Ask the customer for the code that SouthtownPlace sent to them.</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Enter delivery code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="sm:max-w-[220px]"
                />
                <Button
                  disabled={isSubmitting || assignment.order.status !== "OUT_FOR_DELIVERY" || !code.trim()}
                  onClick={() => submitAction("DELIVERED")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify and Complete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
