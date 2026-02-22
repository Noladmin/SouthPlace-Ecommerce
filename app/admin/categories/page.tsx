"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import AdminLayout from "@/components/admin-layout"
import ConfirmationDialog from "@/components/admin/confirmation-dialog"
import SuccessModal from "@/components/admin/success-modal"
import type { MenuCategory } from "@/lib/types"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { Loader2, Plus, Edit, Trash2, Eye, Package, MoreHorizontal, Folder } from "lucide-react"

interface CategoryForm {
  name: string
  description: string
  icon: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<(MenuCategory & { _count?: { items: number } })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<MenuCategory | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    description: "",
    icon: ""
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/menu/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch categories",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CategoryForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: ""
    })
    setEditingId(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreating(true)
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: MenuCategory) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || ""
    })
    setEditingId(category.id)
    setIsCreating(false)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isCreating) {
      await createCategory()
    } else if (isEditing && editingId) {
      await updateCategory(editingId)
    }
  }

  const createCategory = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch('/api/admin/menu/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchCategories()
        setSuccessMessage(`"${formData.name}" category has been successfully created.`)
        setShowSuccessModal(true)
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: "Network Error",
        description: "Failed to connect to server.",
        variant: "destructive"
      })
    }
  }

  const updateCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/menu/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsDialogOpen(false)
        fetchCategories()
        setSuccessMessage(`"${formData.name}" category has been successfully updated.`)
        setShowSuccessModal(true)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update category",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      })
    }
  }

  const handleDeleteClick = (category: MenuCategory) => {
    setCategoryToDelete(category)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return
    setIsDeleting(categoryToDelete.id)
    try {
      const response = await fetch(`/api/admin/menu/categories/${categoryToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setShowDeleteDialog(false)
        setCategoryToDelete(null)
        fetchCategories()
        setSuccessMessage(`"${categoryToDelete.name}" category has been successfully deleted.`)
        setShowSuccessModal(true)
      } else {
        const error = await response.json().catch(() => ({}))
        toast({
          title: "Error",
          description: (error as any).error || "Failed to delete category",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Categories</h1>
            <p className="text-gray-500 mt-1">Organize your menu items into different sections.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Categories Table */}
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4">
                <TableSkeleton columns={5} rowCount={5} />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-gray-100 hover:bg-gray-50/50">
                    <TableHead className="w-[80px] font-semibold text-gray-900">Icon</TableHead>
                    <TableHead className="font-semibold text-gray-900">Name</TableHead>
                    <TableHead className="font-semibold text-gray-900">Description</TableHead>
                    <TableHead className="font-semibold text-gray-900">Items</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Folder className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium text-gray-900 mb-1">No categories found</p>
                          <p className="text-sm">Create a category to get started.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                            {category.icon || "📁"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-gray-900">{category.name}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-500 text-sm truncate max-w-[300px] block">
                            {category.description || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-normal">
                            {category._count?.items || 0} items
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => router.push(`/admin/menu?category=${category.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Items
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Category
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(category)}
                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        {/* Dialogs */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {isCreating ? "Create New Category" : "Edit Category"}
              </DialogTitle>
              <DialogDescription>
                {isCreating
                  ? "Add a new category to organize your menu items"
                  : "Update the category details"
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the category..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon (Emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  placeholder="🍽️"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  {isCreating ? "Create Category" : "Update Category"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Category"
          message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={handleConfirmDelete}
          onCancel={() => setCategoryToDelete(null)}
          isLoading={isDeleting === categoryToDelete?.id}
        />

        {/* Success Modal */}
        <SuccessModal
          open={showSuccessModal}
          onOpenChange={setShowSuccessModal}
          title="Operation Successful"
          message={successMessage}
          variant="success"
          autoClose={true}
          autoCloseDelay={3000}
        />
      </div>
    </AdminLayout>
  )
}