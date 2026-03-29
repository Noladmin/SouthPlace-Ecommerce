"use client"

import { useEffect, useState } from "react"
import { Bike, CheckCircle, Circle, Clock, MapPin, Package, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

type RiderFeedback = {
  tone: "success" | "info"
  title: string
  description: string
}

type CompletedDeliverySummary = {
  orderNumber: string
  customerName: string
  deliveredAt: string
}

const COMPLETED_DELIVERY_STORAGE_KEY = "southtownplace:last-completed-delivery"

export default function DeliveryPage() {
  const [assignment, setAssignment] = useState<any>(null)
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<RiderFeedback | null>(null)
  const [completedSummary, setCompletedSummary] = useState<CompletedDeliverySummary | null>(null)
  const { toast } = useToast()

  const saveCompletedSummary = (summary: CompletedDeliverySummary) => {
    setCompletedSummary(summary)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COMPLETED_DELIVERY_STORAGE_KEY, JSON.stringify(summary))
    }
  }

  const loadCompletedSummary = () => {
    if (typeof window === "undefined") return null

    const raw = window.localStorage.getItem(COMPLETED_DELIVERY_STORAGE_KEY)
    if (!raw) return null

    try {
      return JSON.parse(raw) as CompletedDeliverySummary
    } catch {
      window.localStorage.removeItem(COMPLETED_DELIVERY_STORAGE_KEY)
      return null
    }
  }

  const loadAssignment = async () => {
    try {
      const response = await fetch("/api/delivery/me")
      const result = await response.json()
      if (response.status === 404) {
        setAssignment(null)
        setCompletedSummary(loadCompletedSummary())
        return
      }
      if (!response.ok) throw new Error(result.error || "Unable to load delivery assignment")
      setAssignment(result.data)
      setCompletedSummary(null)
    } catch (error: any) {
      toast({ title: "Access error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAssignment()
  }, [])

  const submitAction = async (action: "PICKED_UP" | "DELIVERED") => {
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
      setFeedback({
        tone: "success",
        title: action === "PICKED_UP" ? "Pickup confirmed" : "Delivery completed",
        description: result.message || (action === "PICKED_UP"
          ? "The order is now out for delivery and the timeline has been updated."
          : "The customer handoff is complete. You can move on to the next task."),
      })
      if (action === "DELIVERED") {
        saveCompletedSummary({
          orderNumber: result.data?.order?.orderNumber || assignment.order.orderNumber,
          customerName: result.data?.order?.customerName || assignment.order.customerName,
          deliveredAt: result.data?.order?.deliveredAt || new Date().toISOString(),
        })
      }
      toast({ title: "Updated", description: result.message || "Delivery updated successfully" })
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
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="mx-auto max-w-3xl space-y-6">
          {completedSummary ? (
            <Card className="border-green-200 bg-green-50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Delivery completed
                </CardTitle>
                <CardDescription className="text-green-800">
                  Order {completedSummary.orderNumber} for {completedSummary.customerName} was completed successfully.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-green-900">
                Delivered at {new Date(completedSummary.deliveredAt).toLocaleString("en-NG", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </CardContent>
            </Card>
          ) : null}

          <Card className="shadow-sm">
            <CardContent className="py-10 text-center text-sm text-gray-500">
              No active delivery assignment found.
            </CardContent>
          </Card>
        </div>
      </div>
    )
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

  const timeline = [
    {
      key: "ASSIGNED",
      title: "Assignment received",
      time: assignment.assignedAt,
      done: true,
    },
    {
      key: "PICKED_UP",
      title: "Order picked up",
      time: assignment.order.pickedUpAt || assignment.pickedUpAt,
      done: Boolean(assignment.order.pickedUpAt || assignment.pickedUpAt || ["OUT_FOR_DELIVERY", "DELIVERED"].includes(assignment.order.status)),
    },
    {
      key: "OUT_FOR_DELIVERY",
      title: "Out for delivery",
      time: assignment.order.outForDeliveryAt || assignment.outForDeliveryAt,
      done: Boolean(assignment.order.outForDeliveryAt || assignment.outForDeliveryAt || ["OUT_FOR_DELIVERY", "DELIVERED"].includes(assignment.order.status)),
    },
    {
      key: "DELIVERED",
      title: "Delivered",
      time: assignment.order.deliveredAt || assignment.deliveredAt,
      done: Boolean(assignment.order.deliveredAt || assignment.deliveredAt || assignment.order.status === "DELIVERED"),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {feedback && (
          <Card className="border-green-200 bg-green-50 shadow-sm">
            <CardContent className="flex items-start gap-3 p-5">
              <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">{feedback.title}</p>
                <p className="mt-1 text-sm text-green-800">{feedback.description}</p>
              </div>
            </CardContent>
          </Card>
        )}

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
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-600" />
              Delivery Timeline
            </CardTitle>
            <CardDescription>Track what has been completed and what still needs attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((step, index) => {
                const isLast = index === timeline.length - 1
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {step.done ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                      {!isLast && <div className={`mt-2 w-px flex-1 ${step.done ? "bg-green-300" : "bg-gray-200"}`} />}
                    </div>
                    <div className="pb-4">
                      <p className={`font-medium ${step.done ? "text-gray-900" : "text-gray-500"}`}>{step.title}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {step.time ? formatDateTime(step.time) : "Waiting for this step"}
                      </p>
                    </div>
                  </div>
                )
              })}
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
                disabled={isSubmitting || ["OUT_FOR_DELIVERY", "DELIVERED"].includes(assignment.order.status)}
                onClick={() => submitAction("PICKED_UP")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Clock className="mr-2 h-4 w-4" />
                Confirm Pickup
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
                  Confirm Delivery
                </Button>
              </div>
              {assignment.order.status === "DELIVERED" && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  This delivery has been completed successfully.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
