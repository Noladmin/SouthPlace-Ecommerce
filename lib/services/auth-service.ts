import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { verifyPassword } from "@/lib/services/password-service"
import { 
  generateOTPCode, 
  sendEmailOTP, 
  calculateOTPExpiry,
  validateOTPFormat,
  isOTPExpired
} from "@/lib/services/otp-service"
import type { 
  Admin, 
  LoginRequest, 
  AuthResponse, 
  OTPType,
  Role 
} from "@/lib/types"

export interface LoginResult {
  success: boolean
  message: string
  requiresOTP?: boolean
  user?: Admin
}

export interface OTPVerificationResult {
  success: boolean
  message: string
  user?: Admin
}

/**
 * Authenticates admin user with email and password
 */
export const authenticateAdmin = async (
  credentials: LoginRequest
): Promise<LoginResult> => {
  try {
    const { email, password } = credentials

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!admin || !admin.isActive) {
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    // Verify password
    const passwordResult = await verifyPassword(admin.password, password)
    if (!passwordResult.isValid) {
      await logLoginAttempt(admin.id, false)
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    // No OTP provided, create and send one via email
    const otpResult = await createAndSendOTP(admin.id, "LOGIN")
    if (!otpResult.success) {
      return {
        success: false,
        message: "Failed to send OTP. Please try again.",
      }
    }

    return {
      success: false,
      message: "OTP required",
      requiresOTP: true,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return {
      success: false,
      message: "Internal server error",
    }
  }
}

/**
 * Creates and sends OTP to admin via email only
 */
export const createAndSendOTP = async (
  adminId: string,
  type: OTPType
): Promise<{ success: boolean; message: string }> => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    })

    if (!admin) {
      return { success: false, message: "Admin not found" }
    }

    // Invalidate existing OTP codes
    await prisma.oTPCode.updateMany({
      where: {
        adminId,
        type,
        isUsed: false,
      },
      data: { isUsed: true },
    })

    // Generate new OTP
    const otp = generateOTPCode()
    const expiresAt = calculateOTPExpiry()

    // Save OTP to database
    await prisma.oTPCode.create({
      data: {
        adminId,
        code: otp,
        type,
        expiresAt,
      },
    })

    // Send OTP via email
    const result = await sendEmailOTP(admin.email, otp, type)

    if (result.success) {
      return {
        success: true,
        message: "OTP sent to your email",
      }
    } else {
      return { success: false, message: "Failed to send OTP" }
    }
  } catch (error) {
    console.error("OTP creation error:", error)
    return { success: false, message: "Internal server error" }
  }
}

/**
 * Verifies OTP for admin
 */
export const verifyOTP = async (
  adminId: string,
  otp: string,
  type: OTPType
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!validateOTPFormat(otp)) {
      return { success: false, message: "Invalid OTP format" }
    }

    const otpRecord = await prisma.oTPCode.findFirst({
      where: {
        adminId,
        code: otp,
        type,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!otpRecord) {
      return { success: false, message: "Invalid or expired OTP" }
    }

    // Mark OTP as used
    await prisma.oTPCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    })

    return { success: true, message: "OTP verified successfully" }
  } catch (error) {
    console.error("OTP verification error:", error)
    return { success: false, message: "Internal server error" }
  }
}

/**
 * Logs login attempt for security monitoring
 */
const logLoginAttempt = async (
  adminId: string,
  success: boolean,
  ipAddress: string = "unknown",
  userAgent: string = "unknown"
): Promise<void> => {
  try {
    await prisma.loginAttempt.create({
      data: {
        adminId,
        ipAddress,
        userAgent,
        success,
      },
    })
  } catch (error) {
    console.error("Failed to log login attempt:", error)
  }
}

/**
 * Completes login process by updating last login time
 */
const completeLogin = async (adminId: string): Promise<void> => {
  try {
    await prisma.admin.update({
      where: { id: adminId },
      data: { lastLogin: new Date() },
    })
    await logLoginAttempt(adminId, true)
  } catch (error) {
    console.error("Failed to complete login:", error)
  }
}

/**
 * Maps Prisma admin to AdminUser type
 */
const mapAdminToUser = (admin: Prisma.AdminGetPayload<{}>): Admin => ({
  id: admin.id,
  email: admin.email,
  name: admin.name,
  role: admin.role as Role,
  isActive: admin.isActive,
  lastLogin: admin.lastLogin,
  phone: admin.phone,
  twoFactorEnabled: admin.twoFactorEnabled,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
})

/**
 * Creates a new admin user (backend/script only)
 */
export const createAdmin = async (data: {
  email: string
  password: string
  name: string
  role: Role
  phone?: string
}): Promise<{ success: boolean; message: string; admin?: Admin }> => {
  try {
    const { hashPassword } = await import("@/lib/services/password-service")
    
    const hashResult = await hashPassword(data.password)
    if (!hashResult.success) {
      return {
        success: false,
        message: hashResult.error || "Failed to hash password",
      }
    }

    const admin = await prisma.admin.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashResult.hash!,
        name: data.name,
        role: data.role,
        phone: data.phone,
      },
    })

    return {
      success: true,
      message: "Admin created successfully",
      admin: mapAdminToUser(admin),
    }
  } catch (error) {
    console.error("Admin creation error:", error)
    return {
      success: false,
      message: "Failed to create admin",
    }
  }
}

/**
 * Validates admin session
 */
export const validateSession = async (
  token: string
): Promise<{ valid: boolean; admin?: Admin }> => {
  try {
    const session = await prisma.adminSession.findUnique({
      where: { token },
      include: { admin: true },
    })

    if (!session || session.expiresAt < new Date()) {
      return { valid: false }
    }

    return {
      valid: true,
      admin: mapAdminToUser(session.admin),
    }
  } catch (error) {
    console.error("Session validation error:", error)
    return { valid: false }
  }
}

/**
 * Verifies admin authentication from request headers or cookies
 */
export const verifyAdminAuth = async (
  request: Request
): Promise<{ success: boolean; admin?: Admin; error?: string }> => {
  try {
    // Try to get token from authorization header first
    let token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie") || ""
      const cookie = cookieHeader.split(';').map(v => v.trim()).find(v => v.startsWith('admin-token='))
      token = cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined
    }
    
    console.log("Admin auth - Token found:", !!token)
    
    if (!token) {
      return { success: false, error: "No token provided" }
    }

    // Verify JWT token
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
    console.log("Admin auth - Token decoded:", { id: decoded?.id, role: decoded?.role })
    
    if (!decoded || !decoded.id || !decoded.role) {
      return { success: false, error: "Invalid token" }
    }

    // Check if role is any admin role
    const adminRoles = ['admin', 'SUPER_ADMIN_USER', 'ADMIN_USER']
    if (!adminRoles.includes(decoded.role)) {
      return { success: false, error: "Invalid admin role" }
    }

    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id }
    })

    console.log("Admin auth - Admin found:", !!admin, "Active:", admin?.isActive, "Admin ID:", decoded.id)

    if (!admin) {
      console.log("Admin auth - Admin not found in database")
      return { success: false, error: "Admin not found" }
    }

    if (!admin.isActive) {
      console.log("Admin auth - Admin is inactive")
      return { success: false, error: "Admin account is inactive" }
    }

    return { success: true, admin: mapAdminToUser(admin) }
  } catch (error) {
    console.error("Admin auth verification error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export const verifyAuth = async (
  request: Request
): Promise<{ success: boolean; userId?: string; error?: string }> => {
  try {
    const cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie") || ""
    const cookie = cookieHeader.split(';').map(v => v.trim()).find(v => v.startsWith('auth-token='))
    const token = cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined
    
    if (!token) {
      return { success: false, error: "No token provided" }
    }

    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
    if (!decoded || !decoded.userId || decoded.role !== 'customer') {
      return { success: false, error: "Invalid token" }
    }

    return { success: true, userId: decoded.userId }
  } catch (error) {
    console.error("Auth verification error:", error)
    return { success: false, error: "Auth verification failed" }
  }
} 