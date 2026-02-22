"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import AdminLayout from "@/components/admin-layout"
import ConfirmationDialog from "@/components/admin/confirmation-dialog"
import SuccessModal from "@/components/admin/success-modal"
import type { MenuCategory } from "@/lib/types"

interface ExtraGroupSummary {
  id: string
  name: string
  description?: string | null
  isGlobal: boolean
  minSelections: number
  maxSelections: number
  isActive: boolean
}
import { Loader2, X, Plus, Save, ArrowLeft, Upload, Image as ImageIcon } from "lucide-react"

interface MenuItemForm {
  name: string
  description: string
  basePrice: string
  categoryId: string
  imageUrl: string
  tags: string[]
  dietary: string[]
  allergens: string[]
  cookingMethod: string[]
  mealType: string[]
  nutritionalHighlights: string[]
  rating: string
  prepTime: string
  difficulty: string
  origin: string
  isActive: boolean
  isFeatured: boolean
}

export default function EditMenuItemPage() {
  const [formData, setFormData] = useState<MenuItemForm>({
    name: "",
    description: "",
    basePrice: "",
    categoryId: "",
    imageUrl: "",
    tags: [],
    dietary: [],
    allergens: [],
    cookingMethod: [],
    mealType: [],
    nutritionalHighlights: [],
    rating: "",
    prepTime: "",
    difficulty: "",
    origin: "",
    isActive: true,
    isFeatured: false
  })
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [extraGroups, setExtraGroups] = useState<ExtraGroupSummary[]>([])
  const [selectedExtraGroupIds, setSelectedExtraGroupIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Tag input states
  const [tagInputs, setTagInputs] = useState({
    tags: "",
    dietary: "",
    allergens: "",
    cookingMethod: "",
    mealType: "",
    nutritionalHighlights: ""
  })

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const itemId = params.id as string

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    setIsUploading(true)
    setUploadProgress(0)
    try {
      const previewUrl = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, imageUrl: previewUrl }))

      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/admin/upload")
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
      }
      const form = new FormData()
      form.append("file", file)
      const responsePromise = new Promise<{ success: boolean; url?: string; path?: string }>((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            try {
              const json = JSON.parse(xhr.responseText)
              if (xhr.status >= 200 && xhr.status < 300 && json.success) resolve(json)
              else reject(new Error(json.error || "Upload failed"))
            } catch (err) {
              reject(err)
            }
          }
        }
        xhr.onerror = () => reject(new Error("Network error"))
        xhr.send(form)
      })

      const data = await responsePromise
      setFormData(prev => ({ ...prev, imageUrl: data.path || prev.imageUrl }))
    } catch (error) {
      console.error("Upload Error:", error)
      toast({
        title: "Upload Failed",
        description: "Could not upload image",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 400)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, extrasResponse] = await Promise.all([
          fetch('/api/admin/menu/categories'),
          fetch('/api/admin/extras/groups')
        ])
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.data || [])
        }
        if (extrasResponse.ok) {
          const extrasData = await extrasResponse.json()
          setExtraGroups(extrasData.data || [])
        }

        const itemResponse = await fetch(`/api/admin/menu/${itemId}`)
        if (itemResponse.ok) {
          const itemData = await itemResponse.json()
          const item = itemData.data

          if (item) {
            setFormData({
              name: item.name || "",
              description: item.description || "",
              basePrice: item.basePrice ? Number(item.basePrice).toFixed(2) : "",
              categoryId: item.categoryId || "",
              imageUrl: item.imageUrl || "",
              tags: item.tags || [],
              dietary: item.dietary || [],
              allergens: item.allergens || [],
              cookingMethod: item.cookingMethod || [],
              mealType: item.mealType || [],
              nutritionalHighlights: item.nutritionalHighlights || [],
              rating: item.rating?.toString() || "",
              prepTime: item.prepTime || "",
              difficulty: item.difficulty || "",
              origin: item.origin || "",
              isActive: item.isActive ?? true,
              isFeatured: item.isFeatured ?? false
            })
            setSelectedExtraGroupIds(
              (item.extraGroups || []).map((eg: any) => eg.extraGroupId || eg.extraGroup?.id).filter(Boolean)
            )
          }
        } else if (itemResponse.status === 404) {
          toast({ title: "Not Found", description: "Menu item not found", variant: "destructive" })
          router.push('/admin/menu')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [itemId, toast, router])

  const handleInputChange = (field: keyof MenuItemForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Generic tag handler
  const handleTagAdd = (field: keyof MenuItemForm, inputField: keyof typeof tagInputs) => {
    const value = tagInputs[inputField].trim()
    if (value && !(formData[field] as string[]).includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value]
      }))
      setTagInputs(prev => ({ ...prev, [inputField]: "" }))
    }
  }

  const handleTagRemove = (field: keyof MenuItemForm, tag: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter(t => t !== tag)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowSaveDialog(true)
  }

  const confirmSave = async () => {
    setIsSaving(true)
    setShowSaveDialog(false)

    try {
      const payload: any = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        extraGroupIds: selectedExtraGroupIds,
      }
      if (formData.rating && formData.rating.trim().length > 0) {
        payload.rating = parseFloat(formData.rating)
      } else {
        delete payload.rating
      }

      const response = await fetch(`/api/admin/menu/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setSuccessMessage(`"${formData.name}" has been successfully updated.`)
        setShowSuccessModal(true)
        setTimeout(() => {
          router.push(`/admin/menu/${itemId}`) // Go to details page
        }, 1500)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update menu item",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating menu item:', error)
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading menu item...</span>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="h-9"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
              <p className="text-gray-500 text-sm">Update item details and visibility</p>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={isSaving} className="min-w-[140px]">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Core details of your menu item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Details & Specification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time</Label>
                    <Input
                      id="prepTime"
                      placeholder="e.g. 15 mins"
                      value={formData.prepTime}
                      onChange={(e) => handleInputChange('prepTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin</Label>
                    <Input
                      id="origin"
                      placeholder="e.g. Ghanian"
                      value={formData.origin}
                      onChange={(e) => handleInputChange('origin', e.target.value)}
                    />
                  </div>
                </div>

                {/* Tags Section */}
                <div className="space-y-4">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={tagInputs.tags}
                      onChange={(e) => setTagInputs(prev => ({ ...prev, tags: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd('tags', 'tags'))}
                    />
                    <Button type="button" variant="secondary" onClick={() => handleTagAdd('tags', 'tags')}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[30px]">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleTagRemove('tags', tag)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Cooking Methods */}
                <div className="space-y-4">
                  <Label>Cooking Methods</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add cooking method..."
                      value={tagInputs.cookingMethod}
                      onChange={(e) => setTagInputs(prev => ({ ...prev, cookingMethod: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd('cookingMethod', 'cookingMethod'))}
                    />
                    <Button type="button" variant="secondary" onClick={() => handleTagAdd('cookingMethod', 'cookingMethod')}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[30px]">
                    {formData.cookingMethod.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleTagRemove('cookingMethod', tag)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Extras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {extraGroups.filter(g => g.isGlobal).length > 0 && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    Global extras apply to all items automatically.
                  </div>
                )}
                <div className="space-y-3">
                  {extraGroups.filter(g => !g.isGlobal).length === 0 && (
                    <p className="text-sm text-gray-500">No item-specific extras groups yet.</p>
                  )}
                  {extraGroups.filter(g => !g.isGlobal).map(group => (
                    <label key={group.id} className="flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-3">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selectedExtraGroupIds.includes(group.id)}
                        onChange={(e) => {
                          setSelectedExtraGroupIds(prev =>
                            e.target.checked ? [...prev, group.id] : prev.filter(id => id !== group.id)
                          )
                        }}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{group.name}</div>
                        {group.description && <p className="text-xs text-gray-500">{group.description}</p>}
                        <p className="text-xs text-gray-500 mt-1">Min {group.minSelections} / Max {group.maxSelections === 0 ? "∞" : group.maxSelections}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dietary & Allergens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Dietary Information</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add dietary info (e.g. Vegan)..."
                      value={tagInputs.dietary}
                      onChange={(e) => setTagInputs(prev => ({ ...prev, dietary: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd('dietary', 'dietary'))}
                    />
                    <Button type="button" variant="secondary" onClick={() => handleTagAdd('dietary', 'dietary')}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.dietary.map(tag => (
                      <Badge key={tag} className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                        {tag}
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleTagRemove('dietary', tag)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Allergens</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add allergen (e.g. Nuts)..."
                      value={tagInputs.allergens}
                      onChange={(e) => setTagInputs(prev => ({ ...prev, allergens: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd('allergens', 'allergens'))}
                    />
                    <Button type="button" variant="secondary" onClick={() => handleTagAdd('allergens', 'allergens')}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.allergens.map(tag => (
                      <Badge key={tag} variant="destructive" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                        {tag}
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleTagRemove('allergens', tag)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">

            {/* Status & Price */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price (₦)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => handleInputChange('basePrice', e.target.value)}
                    className="text-lg font-bold"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Active Status</Label>
                    <p className="text-xs text-gray-500">Visible to customers</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50/50 border-yellow-100">
                  <div className="space-y-0.5">
                    <Label className="text-base text-yellow-900">Featured</Label>
                    <p className="text-xs text-yellow-700">Display on homepage</p>
                  </div>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video w-full rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50 group hover:border-gray-300 transition-colors">
                  {formData.imageUrl ? (
                    <>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white font-medium">Click to change</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <span className="text-sm">Upload Image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                  />
                </div>
                {isUploading && <Progress value={uploadProgress} className="h-2" />}
                <p className="text-xs text-center text-gray-500">Rec. size: 1200x800px</p>
              </CardContent>
            </Card>

          </div>
        </form>

        <ConfirmationDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          title="Save Changes"
          message={`Are you sure you want to save changes to "${formData.name}"?`}
          confirmText="Save Item"
          cancelText="Cancel"
          onConfirm={confirmSave}
          isLoading={isSaving}
        />

        <SuccessModal
          open={showSuccessModal}
          onOpenChange={setShowSuccessModal}
          title="Success"
          message={successMessage}
          variant="success"
          autoClose={true}
          autoCloseDelay={1500}
        />
      </div>
    </AdminLayout>
  )
}
