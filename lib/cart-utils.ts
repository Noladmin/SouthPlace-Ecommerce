// Types
export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  variant?: string
  variantPrice?: number
  measurement?: string
  measurementType?: 'litres' | 'plates' | 'packs' | 'pcs'
  extras?: Array<{
    id: string
    name: string
    price: number
    groupName: string
  }>
}

// Trigger cart update event
export function triggerCartUpdate(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent('cartUpdated'))
  }
}

// Get cart from localStorage
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return []

  const storedCart = localStorage.getItem("tastyBowlsCart")
  return storedCart ? JSON.parse(storedCart) : []
}

// Save cart to localStorage
export function saveCart(cart: CartItem[]): void {
  if (typeof window === "undefined") return

  localStorage.setItem("tastyBowlsCart", JSON.stringify(cart))
  triggerCartUpdate()
}

// Add item to cart
export function addToCart(item: CartItem): CartItem[] {
  const cart = getCart()

  // Create a unique identifier for the item (id + variant)
  const extrasKey = item.extras && item.extras.length
    ? item.extras.map(e => `${e.id}`).sort().join("|")
    : ""
  const itemKey = `${item.id}-${item.variant || "base"}-${extrasKey}`
  
  const existingItemIndex = cart.findIndex((cartItem) => {
    const cartExtrasKey = cartItem.extras && cartItem.extras.length
      ? cartItem.extras.map(e => `${e.id}`).sort().join("|")
      : ""
    const cartItemKey = `${cartItem.id}-${cartItem.variant || "base"}-${cartExtrasKey}`
    return cartItemKey === itemKey
  })

  if (existingItemIndex >= 0) {
    // Item exists, update quantity
    cart[existingItemIndex].quantity += item.quantity || 1
  } else {
    // Item doesn't exist, add to cart
    cart.push({
      ...item,
      quantity: item.quantity || 1,
    })
  }

  saveCart(cart)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent('cartItemAdded', { detail: { id: item.id, variant: item.variant } }))
  }
  return cart
}

// Update item quantity
export function updateCartItemQuantity(id: string, quantity: number, variant?: string, extrasKey?: string): CartItem[] {
  const cart = getCart()

  const updatedCart = cart
    .map((item) => {
      const itemExtrasKey = item.extras && item.extras.length
        ? item.extras.map(e => `${e.id}`).sort().join("|")
        : ""
      const itemMatches = variant
        ? item.id === id && item.variant === variant && itemExtrasKey === (extrasKey || "")
        : item.id === id && !item.variant && itemExtrasKey === (extrasKey || "")
      
      if (itemMatches) {
        return { ...item, quantity: Math.max(0, quantity) }
      }
      return item
    })
    .filter((item) => item.quantity > 0)

  saveCart(updatedCart)
  return updatedCart
}

// Remove item from cart
export function removeFromCart(id: string, variant?: string, extrasKey?: string): CartItem[] {
  const cart = getCart()
  
  const updatedCart = cart.filter((item) => {
    const itemExtrasKey = item.extras && item.extras.length
      ? item.extras.map(e => `${e.id}`).sort().join("|")
      : ""
    const itemMatches = variant
      ? item.id === id && item.variant === variant && itemExtrasKey === (extrasKey || "")
      : item.id === id && !item.variant && itemExtrasKey === (extrasKey || "")
    return !itemMatches
  })

  saveCart(updatedCart)
  return updatedCart
}

// Clear cart
export function clearCart(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("tastyBowlsCart")
  triggerCartUpdate()
}

// Calculate cart totals
export function getCartTotals(cart: CartItem[]): {
  subtotal: number
  itemCount: number
} {
  const subtotal = cart.reduce((total, item) => {
    const itemPrice = item.variantPrice || item.price
    const extrasTotal = (item.extras || []).reduce((sum, ex) => sum + ex.price, 0)
    return total + (itemPrice + extrasTotal) * item.quantity
  }, 0)
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0)

  return { subtotal, itemCount }
}

// Get measurement icon based on type (using descriptive text for now, will be replaced with proper icons in components)
export function getMeasurementIcon(measurementType?: string): string {
  switch (measurementType) {
    case 'litres':
      return 'Droplets' // Will use Lucide Droplets icon
    case 'plates':
      return 'Utensils' // Will use Lucide Utensils icon  
    case 'packs':
      return 'Package' // Will use Lucide Package icon
    case 'pcs':
      return 'Hash' // Will use Lucide Hash icon for numbers/pieces
    default:
      return 'Ruler'
  }
}
