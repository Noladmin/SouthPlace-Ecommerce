import twilio from "twilio"
import { OrderEmailPayload } from "./email-service"

interface SendSMSResult {
  success: boolean
  messageSid?: string
  error?: string
}

let twilioClient: twilio.Twilio | null = null

function getEnv(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback
}

function createTwilioClient(): twilio.Twilio | null {
  if (twilioClient) return twilioClient

  const accountSid = getEnv("TWILIO_ACCOUNT_SID")
  const authToken = getEnv("TWILIO_AUTH_TOKEN")

  if (!accountSid || !authToken) {
    console.warn("SMS service: Twilio credentials not configured. SMS messages will be skipped.")
    return null
  }

  twilioClient = twilio(accountSid, authToken)
  return twilioClient
}

function formatCurrencyNGN(amount: number): string {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount)
  } catch {
    return `₦${amount.toFixed(2)}`
  }
}

function formatOrderSMS(order: OrderEmailPayload): string {
  // Keep SMS concise - ideal under 160 chars, max 1600 chars
  const itemsCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const itemsText = itemsCount === 1 ? "item" : "items"
  
  // Format: Order #TB12345678 - John Doe - ₦25.99 - 5 items - 123 Main St, City POSTCODE
  let message = `New Order: ${order.orderNumber}\n`
  message += `Customer: ${order.customerName}\n`
  message += `Total: ${formatCurrencyNGN(order.total)}\n`
  message += `${itemsCount} ${itemsText}\n`
  message += `Address: ${order.deliveryAddress}`
  
  // If message is too long, truncate address
  if (message.length > 300) {
    const addressMaxLength = 300 - (message.length - order.deliveryAddress.length) - 10
    const truncatedAddress = order.deliveryAddress.substring(0, addressMaxLength)
    message = message.replace(order.deliveryAddress, truncatedAddress + "...")
  }
  
  return message
}

async function sendSMS(to: string, message: string): Promise<SendSMSResult> {
  try {
    const client = createTwilioClient()
    if (!client) {
      return { success: false, error: "Twilio client not configured" }
    }

    const from = getEnv("TWILIO_PHONE_NUMBER")
    if (!from) {
      return { success: false, error: "Twilio phone number not configured" }
    }

    const result = await client.messages.create({
      body: message,
      from: from,
      to: to,
    })

    return { success: true, messageSid: result.sid }
  } catch (error: any) {
    console.error("SMS send error:", error)
    return { success: false, error: error?.message || "Failed to send SMS" }
  }
}

async function sendNewOrderNotification(order: OrderEmailPayload): Promise<SendSMSResult> {
  const to = getEnv("ADMIN_PHONE") || getEnv("ORDERS_NOTIFY_PHONE")
  if (!to) {
    return { success: false, error: "No admin phone number configured" }
  }

  const message = formatOrderSMS(order)
  return sendSMS(to, message)
}

async function testConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createTwilioClient()
    if (!client) {
      return { success: false, error: "Twilio credentials not configured" }
    }

    const accountSid = getEnv("TWILIO_ACCOUNT_SID")
    if (!accountSid) {
      return { success: false, error: "TWILIO_ACCOUNT_SID not configured" }
    }

    // Test connection by fetching account details
    await client.api.accounts(accountSid).fetch()
    return { success: true }
  } catch (error: any) {
    console.error("Twilio connection test error:", error)
    return { success: false, error: error?.message || "Connection failed" }
  }
}

export const smsService = {
  sendSMS,
  sendNewOrderNotification,
  testConnection,
}

