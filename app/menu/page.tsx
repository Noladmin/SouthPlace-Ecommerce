"use client"

import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, ChefHat, Eye, Heart, ShoppingBag, Utensils, Droplets, Package, Hash, Ruler, Filter, Grid, List, ArrowUpDown, Star, Clock, TrendingUp, Tag, Crown, Flame, Award, Coffee, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { addToCart, updateCartItemQuantity, removeFromCart, getCartTotals, getMeasurementIcon } from "@/lib/cart-utils"
import AddToCartModal from "@/components/add-to-cart-modal"
// Define types for menu items
interface MenuVariant {
  name: string
  price: string
  numericPrice: number
  measurement?: string
  measurementType?: 'litres' | 'plates' | 'packs' | 'pcs'
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  basePrice: number
  image: string
  tags: string[]
  dietary?: string[]
  allergens?: string[]
  cookingMethod?: string[]
  mealType?: string[]
  nutritionalHighlights?: string[]
  variants?: MenuVariant[]
  serving?: string
  serves?: string
  measurement?: string
  measurementType?: 'litres' | 'plates' | 'packs' | 'pcs'
  specialOffer?: string
  rating?: number
  prepTime?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  spiceLevel?: 1 | 2 | 3 | 4 | 5
  origin?: string
  extraGroups?: Array<{
    id: string
    name: string
    description?: string
    isGlobal?: boolean
    minSelections?: number
    maxSelections?: number
    items: Array<{ id: string; name: string; price: number; imageUrl?: string }>
  }>
}
import { MenuSkeleton } from "@/components/MenuSkeleton"
import MiniCart from "@/components/mini-cart"

// Helper function to render measurement icon
const renderMeasurementIcon = (measurementType?: string) => {
  const iconName = getMeasurementIcon(measurementType)
  const iconProps = { className: "h-3 w-3" }
  
  switch (iconName) {
    case 'Droplets':
      return <Droplets {...iconProps} />
    case 'Utensils':
      return <Utensils {...iconProps} />
    case 'Package':
      return <Package {...iconProps} />
    case 'Hash':
      return <Hash {...iconProps} />
    default:
      return <Ruler {...iconProps} />
  }
}

// Enhanced sorting and filtering options
const sortOptions = [
  { id: 'popular', name: 'Most Popular', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'newest', name: 'Newest', icon: <Clock className="h-4 w-4" /> },
  { id: 'price-low', name: 'Price: Low to High', icon: <ArrowUpDown className="h-4 w-4" /> },
  { id: 'price-high', name: 'Price: High to Low', icon: <ArrowUpDown className="h-4 w-4" /> },
  { id: 'rating', name: 'Highest Rated', icon: <Star className="h-4 w-4" /> },
]

// Helper function to get tag icon - using consistent Tag icon
const getTagIcon = () => {
  return <Tag className="h-3 w-3" />
}

// Clean, simplified filter tags with consistent styling
const filterTags = [
  { id: 'popular', name: 'Popular' },
  { id: 'new', name: 'New' },
  { id: 'trending', name: 'Trending' },
  { id: 'halal', name: 'Halal' },
  { id: 'vegetarian', name: 'Vegetarian' },
  { id: 'gluten-free', name: 'Gluten-Free' },
  { id: 'mild', name: 'Mild' },
  { id: 'spicy', name: 'Spicy' },
  { id: 'very-spicy', name: 'Very Spicy' },
  { id: 'individual', name: 'Individual' },
  { id: 'family-size', name: 'Family Size' },
  { id: 'sharing', name: 'Sharing' },
  { id: 'premium', name: 'Premium' },
  { id: 'traditional', name: 'Traditional' },
  { id: 'signature', name: 'Signature' },
]

const priceRanges = [
  { id: 'all', name: 'All Prices', min: 0, max: Infinity },
  { id: 'under-20', name: 'Under ₦20', min: 0, max: 20 },
  { id: '20-40', name: '₦20 - ₦40', min: 20, max: 40 },
  { id: '40-60', name: '₦40 - ₦60', min: 40, max: 60 },
  { id: 'over-60', name: 'Over ₦60', min: 60, max: Infinity },
]

function MenuContent() {
  const { toast } = useToast()
  const [menuCategories, setMenuCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<MenuVariant | null>(null)
  const [selectedExtras, setSelectedExtras] = useState<Record<string, string[]>>({})
  const [showAddedToast, setShowAddedToast] = useState(false)
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const [addedItem, setAddedItem] = useState<{ id: string; name: string; image: string; price: number; quantity: number; variant?: string } | null>(null)
  
  // New e-commerce filters
  const [sortBy, setSortBy] = useState('popular')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const nonEmptyCategories = menuCategories.filter((c) => (c.items?.length || 0) > 0)

  // Fetch menu data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch('/api/menu')
        const data = await response.json().catch(() => null)
        if (response.ok && data?.success !== false) {
          setMenuCategories(data?.data || [])
        } else {
          console.error('Failed to fetch menu data', {
            status: response.status,
            statusText: response.statusText,
            error: data?.error || data?.details || null,
          })
          setMenuCategories([])
        }
      } catch (error) {
        console.error('Error fetching menu data:', error)
        setMenuCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuData()
  }, [])

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const viewDetails = (item: MenuItem) => {
    setSelectedItem(item)
    if (item.variants && item.variants.length > 0) {
      setSelectedVariant(item.variants[0])
    }
    setSelectedExtras({})
  }

  const handleAddToCart = (item: MenuItem, variant?: MenuVariant) => {
    const selectedVar = variant || selectedVariant || undefined
    const price = selectedVar ? selectedVar.numericPrice || parseFloat(selectedVar.price.replace(/[^0-9.]/g, '')) : item.basePrice

    const extrasForCart = (item.extraGroups || []).flatMap(group => {
      const selectedIds = selectedExtras[group.id] || []
      return group.items
        .filter(ex => selectedIds.includes(ex.id))
        .map(ex => ({
          id: ex.id,
          name: ex.name,
          price: ex.price,
          groupName: group.name,
        }))
    })

    // Validate extras selection rules
    for (const group of item.extraGroups || []) {
      const selectedIds = selectedExtras[group.id] || []
      const min = group.minSelections || 0
      const max = group.maxSelections || 0
      if (selectedIds.length < min) {
        toast({
          title: "Selection Required",
          description: `Please select at least ${min} option(s) for ${group.name}.`,
          variant: "destructive",
        })
        return
      }
      if (max > 0 && selectedIds.length > max) {
        toast({
          title: "Selection Limit",
          description: `Please select no more than ${max} option(s) for ${group.name}.`,
          variant: "destructive",
        })
        return
      }
    }
    
    addToCart({
      id: item.id,
      name: item.name,
      price: price,
      quantity: 1,
      image: item.image,
      variant: selectedVar?.name,
      variantPrice: selectedVar ? selectedVar.numericPrice || parseFloat(selectedVar.price.replace(/[^0-9.]/g, '')) : undefined,
      measurement: selectedVar?.measurement || item.measurement,
      measurementType: selectedVar?.measurementType || item.measurementType,
      extras: extrasForCart,
    })
    
    // Show add to cart modal
    setAddedItem({
      id: item.id,
      name: item.name,
      image: item.image,
      price: price,
      quantity: 1,
      variant: selectedVar?.name
    })
    setShowAddToCartModal(true)
    
    if (selectedItem) {
      setSelectedItem(null)
      setSelectedVariant(null)
    }
  }

  const toggleExtraSelection = (groupId: string, extraId: string, maxSelections?: number) => {
    setSelectedExtras((prev) => {
      const current = prev[groupId] || []
      const isSelected = current.includes(extraId)
      if (isSelected) {
        return { ...prev, [groupId]: current.filter((id) => id !== extraId) }
      }
      if (maxSelections && maxSelections > 0 && current.length >= maxSelections) {
        toast({
          title: "Selection Limit",
          description: `You can select up to ${maxSelections} option(s) for this group.`,
          variant: "destructive",
        })
        return prev
      }
      return { ...prev, [groupId]: [...current, extraId] }
    })
  }

  // Base filter/sort that doesn't depend on category selection
  const getBaseFilteredAndSortedItems = (items: MenuItem[]) => {
    let allItems = [...items]
    if (searchQuery) {
      allItems = allItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    if (selectedTags.length > 0) {
      allItems = allItems.filter(item =>
        selectedTags.some(tag => 
          item.tags.some(itemTag => itemTag.toLowerCase() === tag.toLowerCase())
        )
      )
    }
    const priceFilter = priceRanges.find(range => range.id === priceRange)
    if (priceFilter && priceFilter.id !== 'all') {
      allItems = allItems.filter(item => 
        item.basePrice >= priceFilter.min && item.basePrice <= priceFilter.max
      )
    }
    switch (sortBy) {
      case 'popular':
        allItems.sort((a, b) => {
          const aPopular = a.tags.includes('Popular') ? 1 : 0
          const bPopular = b.tags.includes('Popular') ? 1 : 0
          return bPopular - aPopular
        })
        break
      case 'newest':
        break
      case 'price-low':
        allItems.sort((a, b) => a.basePrice - b.basePrice)
        break
      case 'price-high':
        allItems.sort((a, b) => b.basePrice - a.basePrice)
        break
      case 'rating':
        allItems.sort((a, b) => {
          const aRating = a.tags.includes('Premium') ? 1 : 0
          const bRating = b.tags.includes('Premium') ? 1 : 0
          return bRating - aRating
        })
        break
    }
    return allItems
  }

  // Filter and sort respecting activeCategory (for single-category view)
  const getFilteredAndSortedItems = () => {
    let allItems: MenuItem[] = []
    if (activeCategory === 'all') {
      allItems = menuCategories.flatMap(category => category.items)
    } else {
      const category = menuCategories.find(cat => cat.id === activeCategory)
      allItems = category ? category.items : []
    }
    return getBaseFilteredAndSortedItems(allItems)
  }

  // No scrollspy; categories act as filters controlling a single item list

  const toggleTagFilter = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const clearAllFilters = () => {
    setSelectedTags([])
    setPriceRange('all')
    setSortBy('popular')
    setSearchQuery('')
  }

  const filteredItems = getFilteredAndSortedItems()
  const activeFiltersCount = selectedTags.length + (priceRange !== 'all' ? 1 : 0)

  if (isLoading) {
    return <MenuSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-orange-100/30 pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search and Controls */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search dishes, ingredients, or cuisine type..."
                className="w-full rounded-full border-2 border-gray-200 py-3.5 pl-12 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white shadow-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white hover:bg-primary-dark' : ''}`}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-lg ${viewMode === 'list' ? 'bg-primary text-white hover:bg-primary-dark' : ''}`}
              >
                <List className="h-4 w-4" />
              </Button>
              
              {/* Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative rounded-lg"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          
            {showFilters && (
              <div
                className="bg-white rounded-lg border border-gray-200 p-4 space-y-4"
              >
                {/* Sort Options */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Sort By</h3>
                  <div className="flex flex-wrap gap-2">
                    {sortOptions.map((option) => (
                      <Button
                        key={option.id}
                        variant={sortBy === option.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy(option.id)}
                        className="rounded-full text-xs"
                      >
                        {option.icon}
                        <span className="ml-1">{option.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tag Filters */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {filterTags.map((tag) => (
                      <Button
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleTagFilter(tag.id)}
                        className="rounded-full text-xs"
                      >
                        {tag.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Price Range</h3>
                  <div className="flex flex-wrap gap-2">
                    {priceRanges.map((range) => (
                      <Button
                        key={range.id}
                        variant={priceRange === range.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPriceRange(range.id)}
                        className="rounded-full text-xs"
                      >
                        {range.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                )}
        </div>
            )}
          
        </div>

        {/* Category Controls: show compact horizontal chips; act only as filters; do not render item sections */}
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
            <button
              onClick={() => setActiveCategory('all')}
                className={cn(
                "shrink-0 rounded-full px-5 py-2.5 text-sm font-medium border-2 transition-all",
                activeCategory === 'all' ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              All
              <span className="ml-2 text-xs text-gray-500">{menuCategories.reduce((t, c) => t + c.items.length, 0)}</span>
            </button>
            {nonEmptyCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "shrink-0 rounded-full px-5 py-2.5 text-sm font-medium border-2 transition-all",
                  activeCategory === category.id ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {category.name}
                <span className="ml-2 text-xs text-gray-500">{category.items.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <p className="text-gray-600">
            Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
          {activeFiltersCount > 0 && (
            <p className="text-sm text-gray-500">
              {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
            </p>
          )}
        </div>

        {/* Menu Items */}
        
          {filteredItems.length === 0 ? (
            <div
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No items found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <Button onClick={clearAllFilters} variant="outline">
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div
              key={`${activeCategory}-${viewMode}-${sortBy}`}
            >
              <div
                  className={`grid gap-4 sm:gap-6 lg:gap-8 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1 max-w-4xl mx-auto"
                  }`}
                >
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "bg-white/95 rounded-3xl overflow-hidden border border-orange-100/60 shadow-md shadow-orange-100/30 hover:shadow-lg hover:shadow-orange-200/30 transition-all group",
                        viewMode === "list" ? "flex flex-col sm:flex-row" : "flex flex-col"
                      )}
                    >
                      <div
                        className={cn(
                          "relative overflow-hidden",
                          viewMode === "list" ? "h-56 sm:h-auto sm:w-64" : "h-56"
                        )}
                      >
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        {item.tags.length > 0 && (
                          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            {item.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-white/90 text-gray-900 text-xs font-semibold px-3 py-1 shadow-md"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between bg-gradient-to-b from-white to-orange-50/20">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                            {item.name}
                          </h3>
                          <p className="mt-2 text-sm sm:text-base text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                          {item.serves && (
                            <p className="mt-3 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-100 rounded-full inline-flex px-3 py-1">
                              Serves {item.serves}
                            </p>
                          )}
                        </div>

                        <div className="mt-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-2xl sm:text-3xl font-bold text-orange-600">
                                {item.price}
                              </span>
                              {item.variants && item.variants.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">Multiple sizes available</p>
                              )}
                              {item.extraGroups && item.extraGroups.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">Extras available</p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if ((item.variants && item.variants.length > 0) || (item.extraGroups && item.extraGroups.length > 0)) {
                                  viewDetails(item)
                                } else {
                                  handleAddToCart(item)
                                }
                              }}
                              aria-label={`Add ${item.name} to cart`}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-gray-900 bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm"
                            >
                              <ShoppingBag className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="mt-4 pt-4 border-t border-orange-100/70 grid gap-2">
                            <button
                              onClick={() => viewDetails(item)}
                              className="inline-flex w-full items-center justify-center rounded-xl border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          )}
        

        {/* Item Details Modal - Mobile optimized */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div
              className="bg-white rounded-lg p-4 sm:p-8 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-100 shadow-xl"
            >
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold pr-4">{selectedItem.name}</h2>
                <button
                  onClick={() => {
                    setSelectedItem(null)
                    setSelectedVariant(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl flex-shrink-0"
                >
                  ✕
                </button>
              </div>
              
              <div className="relative h-48 sm:h-64 mb-4 sm:mb-6 rounded-lg sm:rounded-lg overflow-hidden">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">
                    {selectedVariant ? selectedVariant.price : selectedItem.price}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag: string) => (
                                              <Badge key={tag} className="bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium flex items-center gap-1.5 hover:bg-slate-200 transition-colors">
                          {getTagIcon()}
                          {tag}
                        </Badge>
                    ))}
                  </div>
                </div>

                {selectedItem.serving && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <span className="text-orange-700 font-medium">
                      {selectedItem.serving} {selectedItem.serves && `• Serves ${selectedItem.serves} people`}
                    </span>
                  </div>
                )}

                {selectedItem.measurement && !selectedItem.variants && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span className="text-blue-700 font-medium flex items-center gap-2">
                      {renderMeasurementIcon(selectedItem.measurementType)}
                      {selectedItem.measurement}
                    </span>
                  </div>
                )}

                <p className="text-gray-700 text-lg leading-relaxed">
                  {selectedItem.description}
                </p>

                {selectedItem.variants && selectedItem.variants.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Choose Your Option:</h4>
                    <div className="grid gap-3">
                      {selectedItem.variants.map((variant: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedVariant(variant)}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                            selectedVariant?.name === variant.name
                              ? 'border-primary bg-primary/5 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              selectedVariant?.name === variant.name
                                ? 'border-primary bg-primary'
                                : 'border-gray-300'
                            }`}>
                              {selectedVariant?.name === variant.name && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">{variant.name}</span>
                              {variant.measurement && (
                                <span className="text-sm text-gray-500 block flex items-center gap-1">
                                  <span>{renderMeasurementIcon(variant.measurementType)}</span>
                                  {variant.measurement}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-primary">{variant.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.extraGroups && selectedItem.extraGroups.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Extras</h4>
                    {selectedItem.extraGroups.map((group) => (
                      <div key={group.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{group.name}</p>
                            {group.description && (
                              <p className="text-xs text-gray-500">{group.description}</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Min {group.minSelections || 0} / Max {group.maxSelections === 0 ? "∞" : group.maxSelections}
                          </p>
                        </div>
                        <div className="grid gap-2">
                          {group.items.map((extra) => {
                            const selected = (selectedExtras[group.id] || []).includes(extra.id)
                            return (
                              <label key={extra.id} className={cn(
                                "flex items-center justify-between gap-3 rounded-md border px-3 py-2",
                                selected ? "border-orange-200 bg-orange-50/60" : "border-gray-100"
                              )}>
                                <div className="flex items-center gap-3 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => toggleExtraSelection(group.id, extra.id, group.maxSelections)}
                                  />
                                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                                    <Image
                                      src={extra.imageUrl || "/placeholder.jpg"}
                                      alt={extra.name}
                                      fill
                                      sizes="40px"
                                      className="object-cover"
                                    />
                                  </div>
                                  <span className="truncate text-sm text-gray-800">{extra.name}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-700">₦{extra.price.toFixed(2)}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button 
                    onClick={() => handleAddToCart(selectedItem, selectedVariant || undefined)}
                    className="flex-1 rounded-full border border-gray-900 bg-gray-900 py-6 text-lg font-semibold text-white hover:bg-gray-800"
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Add to Cart {selectedVariant && `- ${selectedVariant.name}`}
                  </Button>
                </div>
              </div>
            </div>
            </div>
        )}

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => {
          setShowAddToCartModal(false)
          setAddedItem(null)
        }}
        item={addedItem}
      />
      </div>
      <MiniCart />
    </div>
  )
}

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuSkeleton />}>
      <MenuContent />
    </Suspense>
  )
}
