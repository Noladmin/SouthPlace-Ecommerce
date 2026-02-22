import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function for generating order numbers (now handled by API)
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `TB-${timestamp}${random}`
}

// Utility function to get measurement icon
export function getMeasurementIcon(measurement: string): string {
  switch (measurement?.toLowerCase()) {
    case 'weight':
    case 'kg':
    case 'g':
    case 'lb':
    case 'oz':
      return '⚖️'
    case 'volume':
    case 'l':
    case 'ml':
    case 'gal':
    case 'qt':
    case 'pt':
      return '🧪'
    case 'length':
    case 'cm':
    case 'm':
    case 'in':
    case 'ft':
      return '📏'
    case 'pieces':
    case 'pcs':
    case 'units':
      return '📦'
    case 'servings':
    case 'serves':
      return '🍽️'
    case 'portions':
      return '🍴'
    default:
      return '📋'
  }
}
