"use client"

import { useEffect, useState } from "react"
import { Bike, Mail, MoreHorizontal, Phone, Plus, Save } from "lucide-react"
import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { Rider } from "@/lib/types"

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  vehicleInfo: "",
  notes: "",
  isActive: true,
}

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([])
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const fetchRiders = async () => {
    try {
      const response = await fetch("/api/admin/riders")
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to fetch riders")
      setRiders(result.data || [])
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRiders()
  }, [])

  const handleCreate = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/riders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to create rider")
      setForm(emptyForm)
      setIsModalOpen(false)
      await fetchRiders()
      toast({ title: "Rider saved", description: "Rider was added to the pool." })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleRiderStatus = async (rider: Rider) => {
    try {
      const response = await fetch(`/api/admin/riders/${rider.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rider.isActive }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to update rider")
      await fetchRiders()
      toast({
        title: "Rider updated",
        description: `${rider.name} is now ${rider.isActive ? "inactive" : "active"}.`,
      })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Riders</h1>
            <p className="text-gray-500 mt-1">Manage the internal rider pool used for ready-to-pickup assignments.</p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Rider
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Add Rider</DialogTitle>
                <DialogDescription>Saved riders stay in the pool until they are assigned to a ready order.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <Input placeholder="Rider name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                <Input placeholder="Phone number" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
                <Input placeholder="Email address" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
                <Input placeholder="Vehicle info" value={form.vehicleInfo} onChange={(e) => setForm((prev) => ({ ...prev, vehicleInfo: e.target.value }))} />
                <Textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
                <div className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Set active on creation</p>
                    <p className="text-xs text-gray-500">Inactive riders stay on record but cannot be assigned.</p>
                  </div>
                  <Switch checked={form.isActive} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))} />
                </div>
                <Button onClick={handleCreate} disabled={isSaving} className="bg-orange-600 hover:bg-orange-700">
                  {isSaving ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                  {isSaving ? "Saving..." : "Create Rider"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Rider Pool</CardTitle>
            <CardDescription>Internal business riders available for assignment after orders reach ready-for-pickup.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading riders...</p>
            ) : riders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
                <Bike className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">No riders in the pool yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rider</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riders.map((rider) => (
                    <TableRow key={rider.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-orange-50 p-2 text-orange-600">
                            <Bike className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{rider.name}</p>
                            {rider.notes && <p className="text-xs text-gray-500 line-clamp-1">{rider.notes}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{rider.phone}</span>
                          </div>
                          {rider.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{rider.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {rider.vehicleInfo || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={rider.isActive ? "border-green-200 text-green-700" : "border-gray-200 text-gray-500"}>
                          {rider.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => toggleRiderStatus(rider)}>
                              {rider.isActive ? "Set inactive" : "Set active"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
