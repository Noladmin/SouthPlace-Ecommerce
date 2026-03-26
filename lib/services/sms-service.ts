import { OrderEmailPayload } from "./email-service"

interface SendSMSResult {
  success: boolean
  messageSid?: string
  provider?: string
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

interface TermiiHistoryRecord {
  sender?: string
  receiver?: string
  message?: string
  amount?: number
  reroute?: number
  status?: string
  sms_type?: string
  send_by?: string
  message_id?: string
  created_at?: string
}

function getEnv(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback
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

function normalizeRecipients(to: string): string[] {
  return [...new Set(to.split(",").map((phone) => normalizePhone(phone)).filter(Boolean))]
}

function resolveAdminRecipients(): string[] {
  const fromAdminPhone = process.env.ADMIN_PHONE
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean)[0]
  const fromOrdersNotify = process.env.ORDERS_NOTIFY_PHONE
    ?.split(",")
    .map((v) => v.trim())
    .filter(Boolean)[0]

  return [...new Set([fromAdminPhone, fromOrdersNotify].filter(Boolean).map((v) => normalizePhone(v as string)))]
}

function formatOrderSMS(order: OrderEmailPayload): string {
  const orderRef = String(order.orderNumber || "N/A").trim()
  const message = `New order ${orderRef}`
  return message.length <= 60 ? message : message.slice(0, 60)
}

function getTermiiConfig() {
  return {
    apiKey: getEnv("TERMII_API_KEY"),
    baseUrl: (getEnv("TERMII_BASE_URL") || "https://v3.api.termii.com").replace(/\/$/, ""),
    senderId: getEnv("TERMII_SENDER_ID") || getEnv("SMS_SENDER_ID") || "N-Alert",
    channel: getEnv("TERMII_CHANNEL") || "dnd",
    type: getEnv("TERMII_MESSAGE_TYPE") || "plain",
    sendPath: getEnv("TERMII_SEND_PATH") || "/api/sms/send",
    balancePath: getEnv("TERMII_BALANCE_PATH") || "/api/get-balance",
    historyPath: getEnv("TERMII_HISTORY_PATH") || "/api/sms/inbox",
  }
}

function validateTermiiConfig(): string | undefined {
  const { apiKey, baseUrl } = getTermiiConfig()
  if (!apiKey) return "TERMII_API_KEY not configured"
  if (!baseUrl) return "TERMII_BASE_URL not configured"
  return undefined
}

function extractErrorMessage(payload: any, fallback: string): string {
  return payload?.message || payload?.error || payload?.errors?.message || fallback
}

async function termiiRequest<T = any>(
  path: string,
  options?: { method?: "GET" | "POST"; query?: Record<string, string | undefined>; body?: Record<string, any> }
): Promise<SMSGatewayResult<T>> {
  try {
    const configError = validateTermiiConfig()
    if (configError) {
      return { success: false, error: configError }
    }

    const { apiKey, baseUrl } = getTermiiConfig()
    const method = options?.method || "GET"
    const qs = new URLSearchParams()

    if (method === "GET") {
      qs.set("api_key", apiKey as string)
    }

    for (const [key, value] of Object.entries(options?.query || {})) {
      if (value) qs.set(key, value)
    }

    const url = `${baseUrl}${path}${qs.toString() ? `?${qs.toString()}` : ""}`
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
      },
      ...(method === "POST" ? { body: JSON.stringify({ api_key: apiKey, ...(options?.body || {}) }) } : {}),
    })

    const payload: any = await response.json().catch(() => ({}))
    const ok = response.ok && (payload?.code === "ok" || Array.isArray(payload))

    if (ok) {
      return {
        success: true,
        data: payload as T,
        message: payload?.message,
        code: payload?.code,
        statusCode: response.status,
      }
    }

    return {
      success: false,
      error: extractErrorMessage(payload, `Termii request failed with HTTP ${response.status}`),
      code: payload?.code,
      statusCode: response.status,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Termii request failed",
    }
  }
}

function normalizeHistoryRecord(record: TermiiHistoryRecord) {
  return {
    ...record,
    id: record.message_id,
    message_id: record.message_id,
    to: record.receiver,
    from: record.sender,
    delivered_at: undefined,
  }
}

async function sendSMS(to: string, message: string, _options?: SMSSendOptions): Promise<SendSMSResult> {
  const configError = validateTermiiConfig()
  if (configError) {
    return { success: false, provider: "termii", error: configError }
  }

  const recipients = normalizeRecipients(to)
  if (recipients.length === 0) {
    return { success: false, provider: "termii", error: "No valid SMS recipients provided" }
  }

  const { senderId, channel, type, sendPath } = getTermiiConfig()
  const response = await termiiRequest<any>(sendPath, {
    method: "POST",
    body: {
      to: recipients.length === 1 ? recipients[0] : recipients,
      from: senderId,
      sms: message,
      channel,
      type,
    },
  })

  if (!response.success) {
    return {
      success: false,
      provider: "termii",
      error: response.error,
      code: response.code,
      statusCode: response.statusCode,
    }
  }

  return {
    success: true,
    provider: "termii",
    messageSid: response.data?.message_id || response.data?.message_id_str,
    code: response.code,
    statusCode: response.statusCode,
  }
}

async function sendNewOrderNotification(order: OrderEmailPayload): Promise<SendSMSResult> {
  const recipients = resolveAdminRecipients()
  if (recipients.length === 0) {
    return { success: false, error: "No admin phone number configured" }
  }

  const message = formatOrderSMS(order)
  return sendSMS(recipients.join(","), message, { customerReference: order.orderNumber })
}

async function testConnection(): Promise<{ success: boolean; error?: string }> {
  const { balancePath } = getTermiiConfig()
  const result = await termiiRequest<any>(balancePath, { method: "GET" })
  if (result.success) {
    return { success: true }
  }

  return { success: false, error: result.error || "Termii connection failed" }
}

async function listDeliveryReports(params?: {
  page?: string
  per_page?: string
  from?: string
  to?: string
  message_id?: string
}): Promise<SMSGatewayResult<any>> {
  const { historyPath } = getTermiiConfig()
  const result = await termiiRequest<TermiiHistoryRecord[]>(historyPath, {
    method: "GET",
    query: {
      message_id: params?.message_id,
    },
  })

  if (!result.success) {
    return result
  }

  let reports = Array.isArray(result.data) ? result.data : []

  if (params?.from) {
    reports = reports.filter((report) => String(report.created_at || "") >= params.from!)
  }
  if (params?.to) {
    reports = reports.filter((report) => String(report.created_at || "") <= params.to!)
  }

  const perPage = Number(params?.per_page || "20")
  const page = Number(params?.page || "1")
  const offset = Math.max(page - 1, 0) * Math.max(perPage, 1)
  const paginated = reports.slice(offset, offset + Math.max(perPage, 1)).map(normalizeHistoryRecord)

  return {
    success: true,
    data: paginated,
    message: result.message,
    code: result.code,
    statusCode: result.statusCode,
  }
}

async function getDeliveryReport(id: string): Promise<SMSGatewayResult<any>> {
  if (!id || !id.trim()) {
    return { success: false, error: "Delivery report id is required" }
  }

  const result = await listDeliveryReports({ message_id: id.trim(), per_page: "1", page: "1" })
  if (!result.success) {
    return result
  }

  const match = Array.isArray(result.data) ? result.data[0] : undefined
  if (!match) {
    return {
      success: false,
      error: "Delivery report not found",
      statusCode: 404,
    }
  }

  return {
    success: true,
    data: match,
    message: result.message,
    code: result.code,
    statusCode: result.statusCode,
  }
}

export const smsService = {
  sendSMS,
  sendNewOrderNotification,
  testConnection,
  listDeliveryReports,
  getDeliveryReport,
}
