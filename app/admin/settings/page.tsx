"use client"

import { useEffect, useState } from "react"
import AdminLayout from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Settings,
  Truck,
  Bell,
  User,
  Shield,
  Mail,
  Save,
  Loader2,
  Percent
} from "lucide-react"

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("delivery")
  const [deliveryFees, setDeliveryFees] = useState({ standard: "", express: "" })
  const [vatSettings, setVatSettings] = useState({ enabled: false, rate: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Mock data for other settings to demonstrate UI
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailMarketing: false,
    smsAlerts: true
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [deliveryRes, vatRes] = await Promise.all([
          fetch("/api/admin/settings/delivery-fee"),
          fetch("/api/admin/settings/vat")
        ])
        if (deliveryRes.ok) {
          const { data } = await deliveryRes.json()
          if (data) {
            setDeliveryFees({
              standard: Number(data.standard).toFixed(2),
              express: Number(data.express).toFixed(2)
            })
          }
        }
        if (vatRes.ok) {
          const { data } = await vatRes.json()
          if (data) {
            setVatSettings({
              enabled: Boolean(data.enabled),
              rate: Number(data.rate || 0).toFixed(2)
            })
          }
        }
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const saveDeliveryFees = async () => {
    setIsSaving(true)
    try {
      const body: any = {}
      if (deliveryFees.standard.trim().length) body.standard = parseFloat(deliveryFees.standard)
      if (deliveryFees.express.trim().length) body.express = parseFloat(deliveryFees.express)

      const res = await fetch("/api/admin/settings/delivery-fee", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error("Save failed")
      toast({ title: "Success", description: "Delivery configuration updated successfully." })
    } catch (e) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const saveVatSettings = async () => {
    setIsSaving(true)
    try {
      const body: any = {
        enabled: vatSettings.enabled
      }
      if (vatSettings.rate.trim().length) body.rate = parseFloat(vatSettings.rate)

      const res = await fetch("/api/admin/settings/vat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error("Save failed")
      toast({ title: "Success", description: "VAT configuration updated successfully." })
    } catch (e) {
      toast({ title: "Error", description: "Failed to save VAT settings", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: "delivery", label: "Delivery", icon: Truck },
    { id: "tax", label: "VAT", icon: Percent },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Shield },
  ]

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage system preferences and configurations.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="lg:w-64 flex-shrink-0 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? "bg-orange-50 text-orange-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-orange-600" : "text-gray-400"}`} />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Content Area */}
          <div className="flex-1">
            {activeTab === "delivery" && (
              <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle>Delivery Configuration</CardTitle>
                  <CardDescription>Set up delivery areas and fees.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                      <div className="flex justify-end pt-4">
                        <Skeleton className="h-10 w-32" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Standard Delivery Fee (₦)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={deliveryFees.standard}
                            onChange={(e) => setDeliveryFees(prev => ({ ...prev, standard: e.target.value }))}
                            placeholder="0.00"
                          />
                          <p className="text-xs text-gray-400">Base fee for standard delivery radius.</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Express Delivery Fee (₦)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={deliveryFees.express}
                            onChange={(e) => setDeliveryFees(prev => ({ ...prev, express: e.target.value }))}
                            placeholder="0.00"
                          />
                          <p className="text-xs text-gray-400">Premium fee for faster delivery.</p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button onClick={saveDeliveryFees} disabled={isSaving || isLoading}>
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                          Save Changes
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "tax" && (
              <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle>VAT Configuration</CardTitle>
                  <CardDescription>Set VAT percentage applied to subtotal only.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <div className="flex justify-end pt-4">
                        <Skeleton className="h-10 w-32" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Enable VAT</Label>
                          <p className="text-sm text-gray-400">Apply VAT to order subtotal.</p>
                        </div>
                        <Switch checked={vatSettings.enabled} onCheckedChange={(c) => setVatSettings(prev => ({ ...prev, enabled: c }))} />
                      </div>

                      <div className="space-y-2">
                        <Label>VAT Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={vatSettings.rate}
                          onChange={(e) => setVatSettings(prev => ({ ...prev, rate: e.target.value }))}
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-400">Percentage applied to subtotal only (not delivery).</p>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button onClick={saveVatSettings} disabled={isSaving || isLoading}>
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                          Save Changes
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage how you receive alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Order Emails</Label>
                      <p className="text-sm text-gray-400">Receive emails for new orders.</p>
                    </div>
                    <Switch checked={notifications.emailOrders} onCheckedChange={(c) => setNotifications(prev => ({ ...prev, emailOrders: c }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Alerts</Label>
                      <p className="text-sm text-gray-400">Get text messages for urgent status updates.</p>
                    </div>
                    <Switch checked={notifications.smsAlerts} onCheckedChange={(c) => setNotifications(prev => ({ ...prev, smsAlerts: c }))} />
                  </div>
                </CardContent>
              </Card>
            )}

            {(activeTab === "account" || activeTab === "security") && (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <div className="bg-gray-100 p-3 rounded-full mb-4">
                  <Settings className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Coming Soon</h3>
                <p className="text-gray-500 max-w-sm mt-1">
                  This section is currently under development. Check back later for updates.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
