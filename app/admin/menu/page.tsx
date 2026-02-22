"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  MoreHorizontal,
  Utensils,
  Star,
  Clock,
  Flame,
  Loader2,
  Image as ImageIcon
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AdminLayout from "@/components/admin-layout"
import ConfirmationDialog from "@/components/admin/confirmation-dialog"
import SuccessModal from "@/components/admin/success-modal"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import type { MenuItem, MenuCategory } from "@/lib/types"

export default function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchMenuItems()
    fetchCategories()
  }, [searchTerm, selectedCategory, selectedStatus])

  const fetchMenuItems = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCategory) params.append("category", selectedCategory)
      if (selectedStatus) params.append("status", selectedStatus)

      const response = await fetch(`/api/admin/menu?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMenuItems(data.data || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch menu items",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching menu items:", error)
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item)
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!itemToDelete) return

    setIsDeleting(itemToDelete.id)
    try {
      const response = await fetch(`/api/admin/menu/${itemToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccessMessage(`"${itemToDelete.name}" has been successfully deleted.`)
        setShowSuccessModal(true)
        setShowDeleteDialog(false)
        setItemToDelete(null)
        fetchMenuItems()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete menu item",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-50 text-green-700 border-green-200"
      case "Medium": return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Hard": return "bg-red-50 text-red-700 border-red-200"
      default: return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getCategoryName = (id: string | null) => {
    if (!id) return "Uncategorized"
    const category = categories.find(c => c.id === id)
    return category ? category.name : "Uncategorized"
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Menu Items</h1>
            <p className="text-gray-500 mt-1">Manage your food menu, prices, and availability.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => router.push("/admin/menu/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/3">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/4">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-1/4">
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-auto md:ml-auto">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("")
                    setSelectedStatus("")
                  }}
                  className="h-9 text-gray-500 hover:text-gray-900"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Table */}
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4">
                <TableSkeleton columns={7} rowCount={8} />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-gray-100 hover:bg-gray-50/50">
                    <TableHead className="w-[80px] font-semibold text-gray-900">Image</TableHead>
                    <TableHead className="font-semibold text-gray-900">Name</TableHead>
                    <TableHead className="font-semibold text-gray-900">Category</TableHead>
                    <TableHead className="font-semibold text-gray-900">Price</TableHead>
                    <TableHead className="font-semibold text-gray-900">Prep Time</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Utensils className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium text-gray-900 mb-1">No items found</p>
                          <p className="text-sm">Try adjusting your filters or add a new item.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    menuItems.map((item) => (
                      <TableRow key={item.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <ImageIcon className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{item.name}</span>
                            <span className="text-xs text-gray-500 truncate max-w-[200px]">{item.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-normal">
                            {getCategoryName(item.categoryId)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          ₦{parseFloat(item.basePrice.toString()).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {item.prepTime ? (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.prepTime}
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.isActive ? "default" : "secondary"}
                            className={item.isActive ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" : "bg-gray-100 text-gray-500"}
                          >
                            {item.isActive ? "Active" : "Inactive"}
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
                              <DropdownMenuItem onClick={() => router.push(`/admin/menu/${item.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/admin/menu/${item.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Item
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(item)}
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
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
        isLoading={isDeleting === itemToDelete?.id}
      />

      <SuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title="Menu Item Deleted"
        message={successMessage}
        variant="success"
        autoClose={true}
        autoCloseDelay={3000}
      />
    </AdminLayout>
  )
}