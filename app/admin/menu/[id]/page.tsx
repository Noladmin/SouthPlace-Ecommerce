"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import AdminLayout from "@/components/admin-layout"
import {
    Loader2,
    ArrowLeft,
    Edit,
    Clock,
    Flame,
    Utensils,
    Star,
    MapPin,
    Tag,
    AlertCircle,
    Leaf,
    ChefHat,
    Image as ImageIcon
} from "lucide-react"
import type { MenuItem, MenuCategory } from "@/lib/types"

export default function MenuItemDetailsPage() {
    const [item, setItem] = useState<MenuItem | null>(null)
    const [categoryName, setCategoryName] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const params = useParams()
    const { toast } = useToast()
    const itemId = params.id as string

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch menu item
                const itemResponse = await fetch(`/api/admin/menu/${itemId}`)
                if (itemResponse.ok) {
                    const itemData = await itemResponse.json()
                    setItem(itemData.data)

                    // Fetch category name if we have a category ID
                    if (itemData.data?.categoryId) {
                        const categoriesResponse = await fetch('/api/admin/menu/categories')
                        if (categoriesResponse.ok) {
                            const categoriesData = await categoriesResponse.json()
                            const category = categoriesData.data.find((c: MenuCategory) => c.id === itemData.data.categoryId)
                            if (category) setCategoryName(category.name)
                        }
                    }
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to fetch menu item details",
                        variant: "destructive",
                    })
                    router.push("/admin/menu")
                }
            } catch (error) {
                console.error("Error fetching details:", error)
                toast({
                    title: "Error",
                    description: "An error occurred while loading details",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        if (itemId) {
            fetchData()
        }
    }, [itemId, router, toast])

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex items-center space-x-2">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span>Loading details...</span>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    if (!item) return null

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "Easy": return "bg-green-50 text-green-700 border-green-200"
            case "Medium": return "bg-yellow-50 text-yellow-700 border-yellow-200"
            case "Hard": return "bg-red-50 text-red-700 border-red-200"
            default: return "bg-gray-50 text-gray-700 border-gray-200"
        }
    }

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.back()}
                            className="h-9"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
                                <Badge
                                    variant={item.isActive ? "default" : "secondary"}
                                    className={item.isActive ? "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200" : ""}
                                >
                                    {item.isActive ? "Active" : "Inactive"}
                                </Badge>
                                {item.isFeatured && (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                        Featured
                                    </Badge>
                                )}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">ID: {item.id}</p>
                        </div>
                    </div>
                    <Button onClick={() => router.push(`/admin/menu/${item.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Item
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Left Column */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">

                        {/* Image & Description */}
                        <Card>
                            <div className="aspect-video w-full bg-gray-100 relative overflow-hidden rounded-t-xl group">
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col">
                                        <ImageIcon className="h-12 w-12 mb-2 opaciy-50" />
                                        <span className="text-sm">No image available</span>
                                    </div>
                                )}
                            </div>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {item.description}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Attributes Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Dietary & Allergens */}
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <Leaf className="h-5 w-5 mr-2 text-green-600" />
                                        Dietary & Allergens
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Dietary Info</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {item.dietary.length > 0 ? item.dietary.map((tag, i) => (
                                                <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    {tag}
                                                </Badge>
                                            )) : <span className="text-gray-400 text-sm italic">None specified</span>}
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Allergens</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {item.allergens.length > 0 ? item.allergens.map((tag, i) => (
                                                <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {tag}
                                                </Badge>
                                            )) : <span className="text-gray-400 text-sm italic">None specified</span>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Preparation Details */}
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <ChefHat className="h-5 w-5 mr-2 text-orange-600" />
                                        Preparation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Cooking Methods</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {item.cookingMethod.length > 0 ? item.cookingMethod.map((tag, i) => (
                                                <Badge key={i} variant="secondary">
                                                    {tag}
                                                </Badge>
                                            )) : <span className="text-gray-400 text-sm italic">None specified</span>}
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Meal Types</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {item.mealType.length > 0 ? item.mealType.map((tag, i) => (
                                                <Badge key={i} variant="outline">
                                                    {tag}
                                                </Badge>
                                            )) : <span className="text-gray-400 text-sm italic">None specified</span>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Sidebar Info - Right Column */}
                    <div className="col-span-1 space-y-6">

                        {/* Price Card */}
                        <Card className="bg-primary/5 border-primary/20 shadow-sm">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Price</p>
                                    <h2 className="text-4xl font-bold text-gray-900">
                                        ₦{parseFloat(item.basePrice.toString()).toFixed(2)}
                                    </h2>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-600">
                                        <Tag className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Category</span>
                                    </div>
                                    <span className="font-medium">{categoryName || "Unknown"}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-600">
                                        <Clock className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Prep Time</span>
                                    </div>
                                    <span className="font-medium">{item.prepTime || "-"}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-600">
                                        <Flame className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Difficulty</span>
                                    </div>
                                    {item.difficulty ? (
                                        <Badge className={getDifficultyColor(item.difficulty)} variant="outline">
                                            {item.difficulty}
                                        </Badge>
                                    ) : <span>-</span>}
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Origin</span>
                                    </div>
                                    <span className="font-medium">{item.origin || "-"}</span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-600">
                                        <Star className="h-4 w-4 mr-2 text-yellow-500" />
                                        <span className="text-sm">Rating</span>
                                    </div>
                                    <span className="font-medium">
                                        {item.rating ? parseFloat(item.rating.toString()).toFixed(1) : "N/A"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Public Tags */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Search Tags</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {item.tags.length > 0 ? item.tags.map((tag, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200">
                                            #{tag}
                                        </Badge>
                                    )) : <span className="text-gray-400 text-sm italic">No tags</span>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Nutritional Info */}
                        {item.nutritionalHighlights && item.nutritionalHighlights.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Nutrition</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {item.nutritionalHighlights.map((highlight, i) => (
                                            <li key={i} className="flex items-center text-sm text-gray-600">
                                                <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mr-2" />
                                                {highlight}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
