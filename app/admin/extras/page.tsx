"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ConfirmationDialog from "@/components/admin/confirmation-dialog"
import SuccessModal from "@/components/admin/success-modal"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Trash2, Edit, Upload } from "lucide-react"

interface ExtraItemForm {
  clientKey: string
  name: string
  price: string
  imageUrl: string
  isActive: boolean
}

interface ExtraGroupForm {
  name: string
  description: string
  isGlobal: boolean
  minSelections: string
  maxSelections: string
  isActive: boolean
  items: ExtraItemForm[]
}

interface ExtraGroup {
  id: string
  name: string
  description?: string | null
  isGlobal: boolean
  minSelections: number
  maxSelections: number
  isActive: boolean
  items: Array<{ id: string; name: string; price: number; imageUrl?: string | null; isActive: boolean }>
}

const emptyForm: ExtraGroupForm = {
  name: "",
  description: "",
  isGlobal: false,
  minSelections: "0",
  maxSelections: "0",
  isActive: true,
  items: [],
}

export default function AdminExtrasPage() {
  const [groups, setGroups] = useState<ExtraGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<ExtraGroup | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [formData, setFormData] = useState<ExtraGroupForm>(emptyForm)
  const [uploadingItemIndex, setUploadingItemIndex] = useState<number | null>(null)
  const { toast } = useToast()

  const createClientKey = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/extras/groups")
      if (res.ok) {
        const data = await res.json()
        setGroups(data.data || [])
      } else {
        toast({ title: "Error", description: "Failed to fetch extras", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error fetching extras:", error)
      toast({ title: "Error", description: "Failed to fetch extras", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateDialog = () => {
    setFormData({ ...emptyForm, items: [] })
    setIsEditing(false)
    setEditingId(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (group: ExtraGroup) => {
    setFormData({
      name: group.name,
      description: group.description || "",
      isGlobal: group.isGlobal,
      minSelections: String(group.minSelections ?? 0),
      maxSelections: String(group.maxSelections ?? 0),
      isActive: group.isActive,
      items: (group.items || []).map((item) => ({
        clientKey: createClientKey(),
        name: item.name,
        price: Number(item.price).toFixed(2),
        imageUrl: item.imageUrl || "",
        isActive: item.isActive,
      })),
    })
    setIsEditing(true)
    setEditingId(group.id)
    setIsDialogOpen(true)
  }

  const handleItemChange = (index: number, field: keyof ExtraItemForm, value: string | boolean) => {
    setFormData((prev) => {
      const items = [...prev.items]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, items }
    })
  }

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { clientKey: createClientKey(), name: "", price: "", imageUrl: "", isActive: true }],
    }))
  }

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const handleItemImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setUploadingItemIndex(index)
    try {
      const form = new FormData()
      form.append("file", file)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Upload failed")
      }

      const imageUrl = data.url || data.path || ""
      if (!imageUrl) throw new Error("Upload failed")

      handleItemChange(index, "imageUrl", imageUrl)
      toast({ title: "Uploaded", description: "Extra image uploaded successfully." })
    } catch (error: any) {
      console.error("Extra image upload error:", error)
      toast({ title: "Upload Failed", description: error?.message || "Could not upload image", variant: "destructive" })
    } finally {
      setUploadingItemIndex(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast({ title: "Validation Error", description: "Group name is required", variant: "destructive" })
      return
    }

    const minSelections = Math.max(0, parseInt(formData.minSelections || "0", 10))
    const maxSelections = Math.max(0, parseInt(formData.maxSelections || "0", 10))
    if (maxSelections > 0 && minSelections > maxSelections) {
      toast({
        title: "Validation Error",
        description: "Min selections cannot be greater than max selections.",
        variant: "destructive"
      })
      return
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      isGlobal: formData.isGlobal,
      minSelections,
      maxSelections,
      isActive: formData.isActive,
      items: formData.items
        .filter((item) => item.name.trim() && item.price.trim())
        .map((item) => ({
          name: item.name.trim(),
          price: parseFloat(item.price),
          imageUrl: item.imageUrl.trim() || undefined,
          isActive: item.isActive,
        })),
    }

    setIsSaving(true)
    try {
      const res = await fetch(
        isEditing && editingId ? `/api/admin/extras/groups/${editingId}` : "/api/admin/extras/groups",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to save extras group")
      }
      setIsDialogOpen(false)
      await fetchGroups()
      setSuccessMessage(isEditing ? "Extras group updated successfully." : "Extras group created successfully.")
      setShowSuccessModal(true)
    } catch (error: any) {
      console.error("Extras save error:", error)
      toast({ title: "Error", description: error?.message || "Failed to save extras group", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = (group: ExtraGroup) => {
    setGroupToDelete(group)
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!groupToDelete) return
    try {
      const res = await fetch(`/api/admin/extras/groups/${groupToDelete.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      setShowDeleteDialog(false)
      setGroupToDelete(null)
      await fetchGroups()
      setSuccessMessage("Extras group deleted successfully.")
      setShowSuccessModal(true)
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete extras group", variant: "destructive" })
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Extras</h1>
            <p className="text-gray-500">Create global and item-specific extras.</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            New Extras Group
          </Button>
        </div>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Extras Groups</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading extras...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rules</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No extras groups yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div className="font-semibold text-gray-900">{group.name}</div>
                        {group.description && (
                          <p className="text-xs text-gray-500 mt-1">{group.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {group.isGlobal ? (
                          <Badge className="bg-blue-50 text-blue-700 border border-blue-200">Global</Badge>
                        ) : (
                          <Badge className="bg-orange-50 text-orange-700 border border-orange-200">Item Specific</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        Min {group.minSelections} / Max {group.maxSelections === 0 ? "∞" : group.maxSelections}
                      </TableCell>
                      <TableCell>
                        {group.isActive ? (
                          <Badge className="bg-green-50 text-green-700 border border-green-200">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 border border-gray-200">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {(group.items || []).length} item(s)
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(group)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => confirmDelete(group)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Extras Group" : "Create Extras Group"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Group Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Rules (Min / Max)</Label>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      min="0"
                      value={formData.minSelections}
                      onChange={(e) => setFormData(prev => ({ ...prev, minSelections: e.target.value }))}
                      placeholder="Min"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={formData.maxSelections}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxSelections: e.target.value }))}
                      placeholder="Max (0 = no limit)"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={formData.isGlobal} onCheckedChange={(c) => setFormData(prev => ({ ...prev, isGlobal: c }))} />
                  <Label>Global (applies to all menu items)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.isActive} onCheckedChange={(c) => setFormData(prev => ({ ...prev, isActive: c }))} />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Extras Items</Label>
                  <Button type="button" variant="secondary" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                {formData.items.length === 0 && (
                  <p className="text-sm text-gray-500">No items yet. Add at least one extra.</p>
                )}
                {formData.items.map((item, index) => (
                  <div key={item.clientKey} className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_2fr_auto] gap-3 items-center">
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Price"
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, "price", e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Image URL (optional)"
                        value={item.imageUrl}
                        onChange={(e) => handleItemChange(index, "imageUrl", e.target.value)}
                      />
                      <input
                        id={`extra-upload-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleItemImageUpload(index, e)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById(`extra-upload-${index}`)?.click()}
                        disabled={uploadingItemIndex === index}
                        className="shrink-0"
                      >
                        {uploadingItemIndex === index ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                      {item.imageUrl && (
                        <div className="relative h-10 w-10 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                          <Image
                            src={item.imageUrl}
                            alt={item.name || "Extra image"}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={(c) => handleItemChange(index, "isActive", c)}
                      />
                      <Button type="button" variant="ghost" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isEditing ? "Save Changes" : "Create Group"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          title="Delete Extras Group"
          message={`Are you sure you want to delete "${groupToDelete?.name}"? This cannot be undone.`}
          isLoading={false}
        />

        <SuccessModal
          open={showSuccessModal}
          onOpenChange={setShowSuccessModal}
          title="Success"
          message={successMessage}
        />
      </div>
    </AdminLayout>
  )
}
