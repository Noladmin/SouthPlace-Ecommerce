import { getEmailFromAddress, getResendConfig } from "./email-config"

export type EmailProvider = "resend"

export interface EmailSendResult {
  success: boolean
  provider?: EmailProvider
  messageId?: string
  error?: string
}

export interface EmailConnectionResult {
  success: boolean
  provider?: EmailProvider
  error?: string
}

export interface EmailProviderStatus {
  provider: EmailProvider | "unconfigured"
  configured: boolean
  from: string
}

export function getActiveEmailProvider(): EmailProvider | null {
  return getResendConfig() ? "resend" : null
}

export function getEmailProviderStatus(): EmailProviderStatus {
  const provider = getActiveEmailProvider()

  return {
    provider: provider ?? "unconfigured",
    configured: provider !== null,
    from: getEmailFromAddress(),
  }
}

export async function sendEmailViaProvider(to: string, subject: string, html: string): Promise<EmailSendResult> {
  const config = getResendConfig()
  if (!config) {
    return {
      success: false,
      error: "Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.",
    }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: [to],
        subject,
        html,
        ...(config.replyTo ? { reply_to: config.replyTo } : {}),
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        data?.error ||
        `Resend request failed with status ${response.status}`

      console.error("[Email Provider] Resend send failed:", {
        status: response.status,
        body: data,
      })

      return {
        success: false,
        provider: "resend",
        error: errorMessage,
      }
    }

    console.log(`[Email Provider] Resend email sent successfully to: ${to}, id: ${data?.id}`)

    return {
      success: true,
      provider: "resend",
      messageId: data?.id,
    }
  } catch (error: any) {
    console.error("[Email Provider] Resend send error:", {
      message: error?.message,
      stack: error?.stack,
    })

    return {
      success: false,
      provider: "resend",
      error: error?.message || "Failed to send email with Resend",
    }
  }
}

export async function testEmailProviderConnection(): Promise<EmailConnectionResult> {
  const config = getResendConfig()
  if (!config) {
    return {
      success: false,
      error: "Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.",
    }
  }

  return {
    success: true,
    provider: "resend",
  }
}
