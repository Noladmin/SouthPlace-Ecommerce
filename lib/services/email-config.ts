/**
 * Email service configuration
 * Resend-only mail settings
 */

export interface ResendConfig {
  apiKey: string
  from: string
  replyTo?: string
}

export function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM

  if (!apiKey || !from) {
    const missing = {
      apiKey: !apiKey,
      from: !from,
    }
    console.warn("[Email Config] Missing required Resend configuration:", missing)
    return null
  }

  return {
    apiKey,
    from,
    replyTo: process.env.RESEND_REPLY_TO_EMAIL || process.env.BUSINESS_EMAIL,
  }
}

export function getEmailFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM ||
    "noreply@tastybowls.com"
  )
}
