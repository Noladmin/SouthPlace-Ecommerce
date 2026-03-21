import { OrderEmailPayload } from "./email-service"

interface SendSMSResult {
  success: boolean
  messageSid?: string
  provider?: "bulksmsnigeria"
  statusCode?: number
  code?: string
  error?: string
}

interface SMSGatewayResult<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: string
  statusCode?: number
  error?: string
}

interface SMSSendOptions {
  gateway?: string
  appendSender?: "none" | "hosted" | "all"
  callbackUrl?: string
  customerReference?: string
}

function getEnv(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback
}

function formatCurrencyNGN(amount: number): string {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount)
  } catch {
    return `₦${amount.toFixed(2)}`
  }
}

function formatOrderSMS(order: OrderEmailPayload): string {
  const orderRef = String(order.orderNumber || "N/A").trim()
  const message = `New order ${orderRef}`
  return message.length <= 60 ? message : message.slice(0, 60)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizePhone(phone: string): string {
  const trimmed = phone.trim()
  if (!trimmed) return trimmed

  const digits = trimmed.replace(/[^\d+]/g, "")
  if (digits.startsWith("+")) {
    return digits.slice(1)
  }
  if (digits.startsWith("234")) {
    return digits
  }
  if (digits.startsWith("0") && digits.length >= 11) {
    return `234${digits.slice(1)}`
  }
  return digits
}

function normalizeRecipients(to: string): string {
  return to
    .split(",")
    .map((phone) => normalizePhone(phone))
    .filter(Boolean)
    .join(",")
}

function resolveAdminRecipients(): string[] {
  const fromAdminPhone = getEnv("ADMIN_PHONE")
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean)[0]
  const fromOrdersNotify = getEnv("ORDERS_NOTIFY_PHONE")
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean)[0]

  return [...new Set([fromAdminPhone, fromOrdersNotify].filter(Boolean).map((v) => normalizePhone(v as string)))]
}

function getBulkSMSConfig() {
  const apiToken = getEnv("BULKSMS_API_TOKEN")
  const senderId = getEnv("BULKSMS_SENDER_ID") || getEnv("SMS_SENDER_ID") || "SouthPlace"
  const sandboxEnv = String(getEnv("BULKSMS_SANDBOX", "false")).toLowerCase()
  const useSandbox = sandboxEnv === "1" || sandboxEnv === "true" || sandboxEnv === "yes"
  const defaultBaseUrl = useSandbox
    ? "https://www.bulksmsnigeria.com/api/sandbox/v2"
    : "https://www.bulksmsnigeria.com/api/v2"
  const baseUrl = (getEnv("BULKSMS_BASE_URL") || defaultBaseUrl).replace(/\/$/, "")
  const gateway = getEnv("BULKSMS_GATEWAY", "direct-corporate")
  const sendPath = getEnv("BULKSMS_SEND_PATH") || "/sms"
  const balancePath = getEnv("BULKSMS_BALANCE_PATH") || "/balance"
  const deliveryReportsPath = getEnv("BULKSMS_DELIVERY_REPORTS_PATH") || "/delivery-reports"

  return { apiToken, senderId, baseUrl, gateway, useSandbox, sendPath, balancePath, deliveryReportsPath }
}

async function bulkSMSRequest<T = any>(
  path: string,
  options?: { method?: "GET" | "POST"; query?: Record<string, string | undefined>; body?: Record<string, any> }
): Promise<SMSGatewayResult<T>> {
  try {
    const { apiToken, baseUrl } = getBulkSMSConfig()
    if (!apiToken) {
      return { success: false, error: "BULKSMS_API_TOKEN not configured" }
    }

    const method = options?.method || "GET"
    const query = options?.query || {}
    const qs = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value) qs.set(key, value)
    }

    const url = `${baseUrl}${path}${qs.toString() ? `?${qs.toString()}` : ""}`
    const response = await fetch(url, {
      method,
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Accept": "application/json",
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
      },
      ...(method === "POST" ? { body: JSON.stringify(options?.body || {}) } : {}),
    })

    const responseJson: any = await response.json().catch(() => ({}))
    if (response.ok && responseJson?.status === "success") {
      return {
        success: true,
        data: responseJson?.data as T,
        message: responseJson?.message,
        code: responseJson?.code,
        statusCode: response.status,
      }
    }

    const errorMessage =
      responseJson?.error?.message ||
      responseJson?.message ||
      `BulkSMS request failed with HTTP ${response.status}`
    return {
      success: false,
      error: errorMessage,
      code: responseJson?.code,
      statusCode: response.status,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "BulkSMS request failed",
    }
  }
}

function shouldRetryBulkSMS(httpStatus?: number, code?: string): boolean {
  if (httpStatus === 429 || (httpStatus && httpStatus >= 500)) return true
  const retryableCodes = new Set([
    "BSNG-3004", // Rate limit exceeded
    "BSNG-3006", // Gateway unavailable
    "BSNG-5001", // Internal server error
    "BSNG-5003", // Service unavailable
    "BSNG-5004", // Gateway timeout
  ])
  return Boolean(code && retryableCodes.has(code))
}

async function sendViaBulkSMSNigeria(to: string, message: string, options?: SMSSendOptions): Promise<SendSMSResult> {
  const { apiToken, senderId, baseUrl, gateway, sendPath } = getBulkSMSConfig()
  if (!apiToken) {
    return { success: false, provider: "bulksmsnigeria", error: "BULKSMS_API_TOKEN not configured" }
  }

  const recipients = normalizeRecipients(to)
  if (!recipients) {
    return { success: false, provider: "bulksmsnigeria", error: "No valid SMS recipients provided" }
  }

  const payload: Record<string, string> = {
    from: senderId.slice(0, 11),
    to: recipients,
    body: message,
  }
  const selectedGateway = options?.gateway || gateway
  const appendSender = options?.appendSender || (getEnv("BULKSMS_APPEND_SENDER") as "none" | "hosted" | "all" | undefined)
  const callbackUrl = options?.callbackUrl || getEnv("BULKSMS_CALLBACK_URL")
  if (selectedGateway) payload.gateway = selectedGateway
  if (appendSender) payload.append_sender = appendSender
  if (callbackUrl) payload.callback_url = callbackUrl
  if (options?.customerReference) payload.customer_reference = options.customerReference

  const maxAttempts = 3
  let lastError: SendSMSResult = { success: false, provider: "bulksmsnigeria", error: "Unknown BulkSMS error" }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}${sendPath}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const responseJson: any = await response.json().catch(() => ({}))
      const code = responseJson?.code as string | undefined

      if (response.ok && responseJson?.status === "success") {
        return {
          success: true,
          provider: "bulksmsnigeria",
          messageSid: responseJson?.data?.message_id,
          statusCode: response.status,
          code,
        }
      }

      const errorMessage =
        responseJson?.error?.message ||
        responseJson?.message ||
        `BulkSMS request failed with HTTP ${response.status}`

      lastError = {
        success: false,
        provider: "bulksmsnigeria",
        error: errorMessage,
        statusCode: response.status,
        code,
      }

      if (attempt < maxAttempts && shouldRetryBulkSMS(response.status, code)) {
        await sleep(250 * Math.pow(2, attempt - 1))
        continue
      }
      break
    } catch (error: any) {
      lastError = {
        success: false,
        provider: "bulksmsnigeria",
        error: error?.message || "Failed to call BulkSMS Nigeria API",
      }
      if (attempt < maxAttempts) {
        await sleep(250 * Math.pow(2, attempt - 1))
        continue
      }
      break
    }
  }

  return lastError
}

async function listDeliveryReports(params?: {
  page?: string
  per_page?: string
  from?: string
  to?: string
  message_id?: string
}): Promise<SMSGatewayResult<any>> {
  const { deliveryReportsPath } = getBulkSMSConfig()
  const query = {
    page: params?.page,
    per_page: params?.per_page,
    from: params?.from,
    to: params?.to,
    message_id: params?.message_id,
  }

  const primary = await bulkSMSRequest(deliveryReportsPath, {
    method: "GET",
    query,
  })
  if (primary.success || primary.statusCode !== 404) return primary

  const alternatePath = deliveryReportsPath.startsWith("/sms/")
    ? deliveryReportsPath.replace(/^\/sms/, "")
    : `/sms${deliveryReportsPath}`
  return bulkSMSRequest(alternatePath, { method: "GET", query })
}

async function getDeliveryReport(id: string): Promise<SMSGatewayResult<any>> {
  if (!id || !id.trim()) {
    return { success: false, error: "Delivery report id is required" }
  }
  const { deliveryReportsPath } = getBulkSMSConfig()
  const encodedId = encodeURIComponent(id.trim())
  const primary = await bulkSMSRequest(`${deliveryReportsPath}/${encodedId}`, { method: "GET" })
  if (primary.success || primary.statusCode !== 404) return primary

  const alternatePath = deliveryReportsPath.startsWith("/sms/")
    ? deliveryReportsPath.replace(/^\/sms/, "")
    : `/sms${deliveryReportsPath}`
  return bulkSMSRequest(`${alternatePath}/${encodedId}`, { method: "GET" })
}

async function sendSMS(to: string, message: string, options?: SMSSendOptions): Promise<SendSMSResult> {
  if (getEnv("BULKSMS_API_TOKEN")) {
    return sendViaBulkSMSNigeria(to, message, options)
  }

  return {
    success: false,
    error: "BulkSMS Nigeria is not configured. Set BULKSMS_API_TOKEN.",
  }
}

async function sendNewOrderNotification(order: OrderEmailPayload): Promise<SendSMSResult> {
  const recipients = resolveAdminRecipients()
  if (recipients.length === 0) {
    return { success: false, error: "No admin phone number configured" }
  }

  const message = formatOrderSMS(order)
  const results = await Promise.all(
    recipients.map((recipient) =>
      sendSMS(recipient, message, {
        customerReference: order.orderNumber,
      })
    )
  )
  const successResults = results.filter((result) => result.success)

  if (successResults.length > 0) {
    return {
      success: true,
      provider: successResults[0].provider,
      messageSid: successResults[0].messageSid,
    }
  }

  return results[0] || { success: false, error: "Failed to send SMS notification" }
}

async function testConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const { apiToken, balancePath } = getBulkSMSConfig()
    if (!apiToken) {
      return { success: false, error: "BULKSMS_API_TOKEN not configured" }
    }

    const result = await bulkSMSRequest(balancePath, { method: "GET" })
    if (result.success) return { success: true }
    return { success: false, error: result.error || "BulkSMS connection failed" }
  } catch (error: any) {
    console.error("BulkSMS connection test error:", error)
    return { success: false, error: error?.message || "BulkSMS connection failed" }
  }
}

export const smsService = {
  sendSMS,
  sendNewOrderNotification,
  testConnection,
  listDeliveryReports,
  getDeliveryReport,
}
