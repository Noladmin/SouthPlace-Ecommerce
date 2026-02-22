"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "@/lib/motion"
import { MapPin, Save, ArrowLeft, Home, Building, Phone, User, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ProtectedRoute from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface AddressForm {
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
}

function AddressContent() {
  const [form, setForm] = useState<AddressForm>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "Lagos",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await fetch('/api/auth/customer/address')
        if (res.ok) {
          const { data } = await res.json()
          setForm(prev => ({ ...prev, ...data }))
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAddress()
  }, [])

  const isValid = () => {
    const { firstName, lastName, phone, address, city } = form
    return [firstName, lastName, phone, address, city].every(v => typeof v === 'string' && v.trim().length > 0)
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid()) return
    setSaving(true)
    try {
      const res = await fetch('/api/auth/customer/address', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const json = await res.json()
      if (res.ok && json.success) {
        toast({
          title: 'Address Saved',
          description: 'Your delivery address has been updated successfully.'
        })
        setTimeout(() => router.push('/account/dashboard'), 1500)
      } else {
        toast({
          title: 'Error',
          description: json.error || 'Failed to save address',
          variant: 'destructive'
        })
      }
    } catch (e) {
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="h-12 bg-gray-100 rounded-lg w-1/3 animate-pulse"></div>
            <div className="h-96 bg-gray-100 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Link
              href="/account/dashboard"
              className="inline-flex items-center text-gray-500 hover:text-orange-600 font-medium group transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold font-display text-gray-900">
                  Delivery Address
                </h1>
                <p className="text-lg text-gray-500 mt-2">
                  Save your address for faster checkout
                </p>
              </div>
            </div>
          </motion.div>

          {/* Address Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-lg border-gray-100 bg-white">
              <CardHeader className="pb-6 border-b border-gray-50">
                <CardTitle className="text-xl flex items-center gap-3 text-gray-900">
                  <Home className="h-5 w-5 text-primary" />
                  Address Information
                </CardTitle>
                <CardDescription>
                  This address will be used for all your future deliveries
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <User className="h-4 w-4 text-primary" />
                        First Name *
                      </label>
                      <Input
                        name="firstName"
                        value={form.firstName}
                        onChange={onChange}
                        required
                        placeholder="Enter your first name"
                        className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <User className="h-4 w-4 text-primary" />
                        Last Name *
                      </label>
                      <Input
                        name="lastName"
                        value={form.lastName}
                        onChange={onChange}
                        required
                        placeholder="Enter your last name"
                        className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl bg-gray-50/50"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Phone className="h-4 w-4 text-primary" />
                      Phone Number *
                    </label>
                    <Input
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      required
                      placeholder="Enter your phone number"
                      className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl bg-gray-50/50"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Building className="h-4 w-4 text-primary" />
                      Street Address *
                    </label>
                    <Input
                      name="address"
                      value={form.address}
                      onChange={onChange}
                      required
                      placeholder="Enter your street address"
                      className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl bg-gray-50/50"
                    />
                  </div>

                  {/* City */}
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <MapPin className="h-4 w-4 text-primary" />
                        Town/City *
                      </label>
                      <Input
                        name="city"
                        value={form.city}
                        onChange={onChange}
                        required
                        placeholder="Enter town/city"
                        className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20 rounded-xl bg-gray-50/50"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={!isValid() || saving}
                      className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Saving Address...
                        </>
                      ) : (
                        <>
                          <Save className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                          Save Delivery Address
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Delivery Information</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We currently deliver to Lagos and surrounding areas. Your saved address will be automatically used during checkout. You can always update it later from your dashboard.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function AddressPage() {
  return (
    <ProtectedRoute>
      <AddressContent />
    </ProtectedRoute>
  )
}
