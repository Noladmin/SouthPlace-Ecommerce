"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "@/lib/motion"
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import AdminLayout from "@/components/admin-layout"
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

interface MenuItemForm {
  name: string
  description: string
  basePrice: string
  categoryId: string
  isActive: boolean
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  prepTime: string
  difficulty: string
  tags: string[]
  dietary: string[]
  allergens: string[]
  cookingMethod: string[]
  mealType: string[]
  nutritionalHighlights: string[]
  variants: Array<{
    name: string
    price: string
    description: string
  }>
  images: string[]
  imageUrl?: string
}

export default function NewMenuItemPage() {
  const [formData, setFormData] = useState<MenuItemForm>({
    name: "",
    description: "",
    basePrice: "",
    categoryId: "",
    isActive: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    prepTime: "",
    difficulty: "",
    tags: [],
    dietary: [],
    allergens: [],
    cookingMethod: [],
    mealType: [],
    nutritionalHighlights: [],
    variants: [],
    images: []
  })
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [extraGroups, setExtraGroups] = useState<ExtraGroupSummary[]>([])
  const [selectedExtraGroupIds, setSelectedExtraGroupIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [newVariant, setNewVariant] = useState({ name: "", price: "", description: "" })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
    fetchExtraGroups()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/menu/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchExtraGroups = async () => {
    try {
      const response = await fetch("/api/admin/extras/groups")
      if (response.ok) {
        const data = await response.json()
        setExtraGroups(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching extras groups:", error)
    }
  }

  const handleInputChange = (field: keyof MenuItemForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addVariant = () => {
    if (newVariant.name.trim() && newVariant.price.trim()) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { ...newVariant }]
      }))
      setNewVariant({ name: "", price: "", description: "" })
    }
  }

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    setIsUploading(true)
    setUploadProgress(0)
    try {
      // Show instant preview
      const objectUrl = URL.createObjectURL(file)
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, objectUrl]
      }))

      // Use XHR to track progress
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/admin/upload")
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(percent)
        }
      }
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      const responsePromise = new Promise<{ success: boolean; url?: string; path?: string }>((resolve, reject) => {
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            try {
              const json = JSON.parse(xhr.responseText)
              if (xhr.status >= 200 && xhr.status < 300 && json.success) {
                resolve(json)
              } else {
                reject(new Error(json.error || "Upload failed"))
              }
            } catch (err) {
              reject(err)
            }
          }
        }
        xhr.onerror = () => reject(new Error("Network error"))
        xhr.send(formDataUpload)
      })

      const data = await responsePromise
      setFormData(prev => ({
        ...prev,
        // Replace the temporary objectUrl with the stored public path
        images: prev.images.map((img, idx, arr) => idx === arr.length - 1 ? (data.path || img) : img),
        // Store absolute URL from Supabase (or local origin in fallback)
        imageUrl: data.url || data.path || prev.imageUrl
      }))
    } catch (e) {
      console.error("Image upload failed", e)
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 400)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch("/api/admin/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify((() => {
          const payload: any = {
            name: formData.name,
            description: formData.description || undefined,
            basePrice: parseFloat(formData.basePrice),
            categoryId: formData.categoryId || undefined,
            imageUrl: formData.imageUrl || undefined,
            tags: formData.tags.length ? formData.tags : undefined,
            dietary: formData.dietary.length ? formData.dietary : undefined,
            allergens: formData.allergens.length ? formData.allergens : undefined,
            cookingMethod: formData.cookingMethod.length ? formData.cookingMethod : undefined,
            mealType: formData.mealType.length ? formData.mealType : undefined,
            nutritionalHighlights: formData.nutritionalHighlights.length ? formData.nutritionalHighlights : undefined,
            isActive: formData.isActive,
            prepTime: formData.prepTime || undefined,
            difficulty: formData.difficulty || undefined,
            variants: formData.variants.length
              ? formData.variants.map(v => ({
                  name: v.name,
                  price: v.price, // string as per schema
                  numericPrice: parseFloat(v.price)
                }))
              : undefined,
            extraGroupIds: selectedExtraGroupIds.length ? selectedExtraGroupIds : undefined,
          }
          // rating optional
          // Only include if user provided a value and it parses to a number
          if ((formData as any).rating && (formData as any).rating.trim().length > 0) {
            const r = parseFloat((formData as any).rating)
            if (!Number.isNaN(r)) payload.rating = r
          }
          return payload
        })()),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Menu item created successfully",
        })
        router.push("/admin/menu")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to create menu item")
      }
    } catch (error) {
      console.error("Error creating menu item:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create menu item",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/menu")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Menu
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Add New Menu Item</h1>
                <p className="text-gray-600">Create a new menu item for your restaurant</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential details about the menu item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g., Jollof Rice"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Price (₦) *
                    </label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.basePrice}
                      onChange={(e) => handleInputChange("basePrice", e.target.value)}
                      placeholder="12.99"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe the dish, ingredients, and flavors..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange("categoryId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Dietary Information */}
            <Card>
              <CardHeader>
                <CardTitle>Dietary Information</CardTitle>
                <CardDescription>Dietary restrictions and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isVegetarian}
                      onChange={(e) => handleInputChange("isVegetarian", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Vegetarian</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isVegan}
                      onChange={(e) => handleInputChange("isVegan", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Vegan</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isGlutenFree}
                      onChange={(e) => handleInputChange("isGlutenFree", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Gluten Free</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preparation Time
                    </label>
                    <Input
                      value={formData.prepTime}
                      onChange={(e) => handleInputChange("prepTime", e.target.value)}
                      placeholder="e.g., 30 minutes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange("difficulty", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select difficulty</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Add tags to help customers find this item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Extras */}
            <Card>
              <CardHeader>
                <CardTitle>Extras</CardTitle>
                <CardDescription>Assign extra groups to this menu item</CardDescription>
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

            {/* Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>Add different versions of this menu item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    value={newVariant.name}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Variant name"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Price"
                  />
                  <Button type="button" onClick={addVariant} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{variant.name}</div>
                        <div className="text-sm text-gray-600">₦{variant.price}</div>
                        {variant.description && (
                          <div className="text-sm text-gray-500">{variant.description}</div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <CardDescription>Upload images of the menu item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  {isUploading && (
                    <div className="text-xs text-gray-500 mt-1">Uploading...</div>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative space-y-2">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      {isUploading && index === formData.images.length - 1 && (
                        <Progress value={uploadProgress} />
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/menu")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Creating..." : "Create Menu Item"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  )
} 
