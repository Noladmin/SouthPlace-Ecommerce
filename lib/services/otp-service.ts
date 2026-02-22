import nodemailer from "nodemailer"
import type { OTPType } from "@/lib/types"
import { getEmailConfig, getEmailFromAddress } from "./email-config"

export interface OTPResponse {
  success: boolean
  message: string
  method?: string
}

export interface OTPConfig {
  length: number
  expiryMinutes: number
  maxAttempts: number
}

export interface OTPGenerationResult {
  success: boolean
  code?: string
  message: string
  expiresAt?: Date
}

export interface OTPVerificationResult {
  valid: boolean
  message: string
}

// OTP Configuration
const OTP_CONFIG: OTPConfig = {
  length: 6,
  expiryMinutes: 10,
  maxAttempts: 3,
} as const

/**
 * Generates a secure random OTP code
 */
export const generateOTPCode = (length: number = OTP_CONFIG.length): string => {
  const digits = "0123456789"
  let code = ""
  
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)]
  }
  
  return code
}

/**
 * Creates email transporter for sending OTP (lazy initialization)
 */
let otpTransporter: nodemailer.Transporter | null = null

function createEmailTransporter(): nodemailer.Transporter | null {
  if (!otpTransporter) {
    const config = getEmailConfig()
    if (!config) {
      return null
    }

    console.log(`[OTP Service] Creating email transporter: ${config.host}:${config.port} (secure: ${config.secure})`)
    otpTransporter = nodemailer.createTransport(config as nodemailer.TransportOptions)
  }
  return otpTransporter
}

/**
 * Sends OTP via email only
 */
export const sendEmailOTP = async (
  email: string,
  otp: string,
  type: OTPType
): Promise<OTPResponse> => {
  try {
    const transporter = createEmailTransporter()
    
    if (!transporter) {
      return {
        success: false,
        message: "Email transporter not configured for OTP",
        method: "email",
      }
    }
    
    // Verify connection before sending
    try {
      await transporter.verify()
    } catch (verifyError: any) {
      console.error("[OTP Service] SMTP connection verification failed:", {
        code: verifyError?.code,
        command: verifyError?.command,
        response: verifyError?.response,
        responseCode: verifyError?.responseCode,
        message: verifyError?.message,
      })
      
      // Reset transporter so it can be recreated with fresh config
      otpTransporter = null
      
      if (verifyError?.responseCode === 535 || verifyError?.code === 'EAUTH') {
        return {
          success: false,
          message: "SMTP authentication failed: Invalid email username or password. Please check EMAIL_USER and EMAIL_PASS in your .env file.",
          method: "email",
        }
      }
      
      return {
        success: false,
        message: verifyError?.response || verifyError?.message || "SMTP connection failed",
        method: "email",
      }
    }
    
    const subject = getOTPEmailSubject(type)
    const htmlContent = generateOTPEmailTemplate(otp, type)
    const from = getEmailFromAddress()
    
    console.log(`[OTP Service] Sending OTP email to: ${email} from: ${from}`)
    
    await transporter.sendMail({
      from,
      to: email,
      subject,
      html: htmlContent,
    })

    console.log(`[OTP Service] OTP email sent successfully to: ${email}`)
    return {
      success: true,
      message: "OTP sent to your email",
      method: "email",
    }
  } catch (error: any) {
    console.error("[OTP Service] Email OTP error:", {
      code: error?.code,
      command: error?.command,
      response: error?.response,
      responseCode: error?.responseCode,
      message: error?.message,
      stack: error?.stack,
    })
    // Reset transporter on error so it can be recreated
    otpTransporter = null
    return {
      success: false,
      message: error?.response || error?.message || "Failed to send email OTP",
    }
  }
}

/**
 * Gets appropriate email subject based on OTP type
 */
const getOTPEmailSubject = (type: OTPType): string => {
  switch (type) {
    case "LOGIN":
      return "South Place Admin - Login OTP"
    case "PASSWORD_RESET":
      return "South Place Admin - Password Reset OTP"
    case "TWO_FACTOR":
      return "South Place Admin - Two-Factor Authentication"
    default:
      return "South Place Admin - Verification Code"
  }
}

/**
 * Generates HTML email template for OTP
 */
const generateOTPEmailTemplate = (otp: string, type: OTPType): string => {
  const title = getOTPEmailSubject(type)
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || ""}/images/SouthLogo.png" alt="South Place" style="height: 60px; width: auto;">
        </div>
        
        <h2 style="color: #387237; text-align: center; margin-bottom: 20px;">${title}</h2>
        
        <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 30px;">
          Please enter the following verification code to continue:
        </p>
        
        <div style="background: linear-gradient(135deg, #387237, #4a8a4a); padding: 25px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
          <h1 style="color: white; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #387237;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            <strong>Security Notice:</strong> This code will expire in ${OTP_CONFIG.expiryMinutes} minutes. 
            Do not share this code with anyone. If you didn't request this code, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            South Place Lagos<br>
            Authentic African Cuisine & Catering
          </p>
        </div>
      </div>
    </div>
  `
}

/**
 * Validates OTP format
 */
export const validateOTPFormat = (otp: string): boolean => {
  const otpRegex = new RegExp(`^\\d{${OTP_CONFIG.length}}$`)
  return otpRegex.test(otp)
}

/**
 * Calculates OTP expiry time
 */
export const calculateOTPExpiry = (): Date => {
  return new Date(Date.now() + OTP_CONFIG.expiryMinutes * 60 * 1000)
}

/**
 * Checks if OTP is expired
 */
export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt
}

/**
 * Formats OTP for display (adds spaces for readability)
 */
export const formatOTPForDisplay = (otp: string): string => {
  return otp.replace(/(\d{3})(?=\d)/g, '$1 ')
} 
