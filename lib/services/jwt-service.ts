import jwt from "jsonwebtoken"
import type { Admin, Role } from "@/lib/types"

export interface JWTPayload {
  id: string
  email: string
  name: string
  role: Role
  iat: number
  exp: number
}

export interface TokenResult {
  success: boolean
  token?: string
  error?: string
}

export interface VerifyResult {
  valid: boolean
  payload?: JWTPayload
  error?: string
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here"
const JWT_EXPIRES_IN = "24h"

/**
 * Generates JWT token for admin user
 */
export const generateToken = (user: Admin): TokenResult => {
  try {
    const payload: Omit<JWTPayload, "iat" | "exp"> = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    })

    return {
      success: true,
      token,
    }
  } catch (error) {
    console.error("Token generation error:", error)
    return {
      success: false,
      error: "Failed to generate token",
    }
  }
}

/**
 * Verifies JWT token
 */
export const verifyToken = (token: string): VerifyResult => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload
    
    return {
      valid: true,
      payload,
    }
  } catch (error) {
    console.error("Token verification error:", error)
    return {
      valid: false,
      error: "Invalid or expired token",
    }
  }
}

/**
 * Decodes JWT token without verification (for debugging)
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload
  } catch (error) {
    console.error("Token decode error:", error)
    return null
  }
}

/**
 * Extracts token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  
  return authHeader.substring(7)
} 