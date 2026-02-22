import * as argon2 from "argon2"
import type { ApiResponse } from "@/lib/types"

export interface PasswordValidationResult {
  isValid: boolean
  message: string
}

export interface PasswordHashResult {
  success: boolean
  hash?: string
  error?: string
}

export interface PasswordVerifyResult {
  isValid: boolean
  error?: string
}

// Password validation rules
const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
} as const

/**
 * Validates password strength according to security rules
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  if (password.length < PASSWORD_RULES.minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${PASSWORD_RULES.minLength} characters long`,
    }
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    }
  }

  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    }
  }

  if (PASSWORD_RULES.requireNumbers && !/\d/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    }
  }

  if (PASSWORD_RULES.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character",
    }
  }

  return {
    isValid: true,
    message: "Password meets security requirements",
  }
}

/**
 * Hashes password using Argon2id with secure parameters
 */
export const hashPassword = async (password: string): Promise<PasswordHashResult> => {
  try {
    const validation = validatePassword(password)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.message,
      }
    }

    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64MB
      timeCost: 3, // 3 iterations
      parallelism: 1,
      hashLength: 32,
    })

    return {
      success: true,
      hash,
    }
  } catch (error) {
    console.error("Password hashing error:", error)
    return {
      success: false,
      error: "Failed to hash password",
    }
  }
}

/**
 * Verifies password against hash using Argon2
 */
export const verifyPassword = async (
  hash: string,
  password: string
): Promise<PasswordVerifyResult> => {
  try {
    const isValid = await argon2.verify(hash, password)
    return {
      isValid,
    }
  } catch (error) {
    console.error("Password verification error:", error)
    return {
      isValid: false,
      error: "Failed to verify password",
    }
  }
}

/**
 * Generates a secure random password
 */
export const generateSecurePassword = (length: number = 16): string => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  
  // Ensure at least one character from each required category
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)] // uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)] // lowercase
  password += "0123456789"[Math.floor(Math.random() * 10)] // number
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)] // special char
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
} 