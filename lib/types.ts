import { Prisma } from '@prisma/client'

// Re-export Prisma types for convenience
export type Admin = Omit<Prisma.AdminGetPayload<{}>, 'password'> & {
  password?: string
}
export type AdminCreateInput = Prisma.AdminCreateInput
export type AdminUpdateInput = Prisma.AdminUpdateInput

export type MenuItem = Omit<Prisma.MenuItemGetPayload<{}>, 'dietary' | 'allergens' | 'cookingMethod' | 'mealType' | 'tags' | 'nutritionalHighlights'> & {
  dietary: string[]
  allergens: string[]
  cookingMethod: string[]
  mealType: string[]
  tags: string[]
  nutritionalHighlights: string[]
}
export type MenuItemCreateInput = Prisma.MenuItemCreateInput
export type MenuItemUpdateInput = Prisma.MenuItemUpdateInput

export type MenuCategory = Prisma.MenuCategoryGetPayload<{}>
export type MenuCategoryCreateInput = Prisma.MenuCategoryCreateInput
export type MenuCategoryUpdateInput = Prisma.MenuCategoryUpdateInput

export type Order = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        menuItem: true
        extras: true
      }
    }
    customer: true
  }
}>
export type OrderCreateInput = Prisma.OrderCreateInput
export type OrderUpdateInput = Prisma.OrderUpdateInput

export type OrderItem = Prisma.OrderItemGetPayload<{
  include: {
    menuItem: true
  }
}>
export type OrderItemCreateInput = Prisma.OrderItemCreateInput
export type OrderItemUpdateInput = Prisma.OrderItemUpdateInput

export type Customer = Prisma.CustomerGetPayload<{}>
export type CustomerCreateInput = Prisma.CustomerCreateInput
export type CustomerUpdateInput = Prisma.CustomerUpdateInput

export type Review = Prisma.ReviewGetPayload<{
  include: {
    customer: true
    menuItem: true
  }
}>
export type ReviewCreateInput = Prisma.ReviewCreateInput
export type ReviewUpdateInput = Prisma.ReviewUpdateInput

export type CustomerFavorite = Prisma.CustomerFavoriteGetPayload<{
  include: {
    menuItem: true
  }
}>
export type CustomerFavoriteCreateInput = Prisma.CustomerFavoriteCreateInput

export type BusinessSettings = Prisma.BusinessSettingsGetPayload<{}>
export type BusinessSettingsCreateInput = Prisma.BusinessSettingsCreateInput
export type BusinessSettingsUpdateInput = Prisma.BusinessSettingsUpdateInput

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface OTPVerificationRequest {
  email: string
  otp: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: Admin
  error?: string
}

// Analytics types (using proper Prisma types)
export interface AnalyticsData {
  overview: {
    totalOrders: number
    totalRevenue: Prisma.Decimal
    averageOrderValue: Prisma.Decimal
    revenueGrowth: number
    orderGrowth: number
  }
  statusBreakdown: Record<string, number>
  dailyRevenue: Record<string, Prisma.Decimal>
  topSellingItems: Array<{
    name: string
    quantity: number
    revenue: Prisma.Decimal
  }>
  deliveryBreakdown: Record<string, number>
  paymentBreakdown: Record<string, number>
  recentOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    total: Prisma.Decimal
    status: string
    createdAt: Date
    items: Array<{
      itemName: string
      quantity: number
    }>
  }>
  dateRange: {
    start: string
    end: string
    days: number
  }
}

// Dashboard stats (using proper Prisma types)
export interface DashboardStats {
  totalOrders: number
  totalRevenue: Prisma.Decimal
  averageOrderValue: Prisma.Decimal
  pendingOrders: number
  todayOrders: number
  todayRevenue: Prisma.Decimal
}

// Order tracking types (using proper Prisma types)
export interface OrderTrackingData {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  deliveryCity: string
  deliveryMethod: string
  specialInstructions?: string
  subtotal: Prisma.Decimal
  deliveryFee: Prisma.Decimal
  total: Prisma.Decimal
  paymentMethod: string
  status: string
  createdAt: Date
  items: Array<{
    name: string
    quantity: number
    unitPrice: Prisma.Decimal
    totalPrice: Prisma.Decimal
    variant?: string
  }>
}

// Order history types (using proper Prisma types)
export interface OrderHistory {
  orders: Array<{
    id: string
    orderNumber: string
    customerName: string
    total: Prisma.Decimal
    status: string
    createdAt: Date
    items: Array<{
      itemName: string
      quantity: number
    }>
  }>
}

// Cart types (for frontend)
export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  variant?: string
  variantPrice?: number
  measurement?: string
  measurementType?: string
  extras?: Array<{
    id: string
    name: string
    price: number
    groupName: string
  }>
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
}

// Form validation schemas (for Zod)
export interface MenuItemFormData {
  name: string
  description?: string
  basePrice: number
  imageUrl?: string
  tags?: string[]
  dietary?: string[]
  allergens?: string[]
  cookingMethod?: string[]
  mealType?: string[]
  nutritionalHighlights?: string[]
  variants?: Array<{
    name: string
    price: number
  }>
  serving?: string
  serves?: string
  measurement?: string
  measurementType?: string
  specialOffer?: string
  rating?: number
  prepTime?: string
  difficulty?: string
  spiceLevel?: number
  origin?: string
  isActive: boolean
  isFeatured: boolean
  categoryId?: string
  extraGroupIds?: string[]
}

export interface OrderFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  deliveryCity: string
  deliveryMethod: string
  specialInstructions?: string
  paymentMethod: string
  items: CartItem[]
}

// Utility types
export type Role = 'SUPER_ADMIN_USER' | 'ADMIN_USER' | 'USER'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
export type OTPType = 'LOGIN' | 'PASSWORD_RESET' | 'TWO_FACTOR' 
