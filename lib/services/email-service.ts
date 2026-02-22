import nodemailer from "nodemailer"
import { getEmailConfig, getEmailFromAddress } from "./email-config"

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

interface WelcomeEmailPayload {
  name: string
  email: string
  phone: string
  address?: string | null
  city?: string | null
}

interface OrderItemEmail {
  name: string
  quantity: number
  price: number
  variant?: string | null
  extras?: Array<{ name: string; price: number; quantity?: number }>
}

export interface OrderEmailPayload {
  id?: string
  orderNumber: string
  customerName: string
  customerEmail?: string | null
  customerPhone?: string | null
  deliveryAddress: string
  createdAt: Date | string
  paymentMethod: string
  paymentStatus?: string
  paymentIntentId?: string
  receiptUrl?: string
  subtotal: number
  deliveryFee: number
  vatRate?: number
  vatAmount?: number
  total: number
  items?: OrderItemEmail[]
  estimatedDelivery?: string
}

let transporter: nodemailer.Transporter | null = null

function createTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter

  const config = getEmailConfig()
  if (!config) {
    return null
  }

  console.log(`[Email Service] Creating email transporter: ${config.host}:${config.port} (secure: ${config.secure})`)
  transporter = nodemailer.createTransport(config as nodemailer.TransportOptions)
  return transporter
}

function formatCurrencyNGN(amount: number): string {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount)
  } catch {
    return `₦${amount.toFixed(2)}`
  }
}

function baseEmailLayout(title: string, bodyHtml: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || ""
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background:#f6f7fb; color:#111; margin:0; padding:24px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <tr>
        <td style="background:linear-gradient(135deg,#387237,#4a8a4a); padding:20px 24px; color:#fff;">
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${baseUrl}/images/SouthLogo.png" alt="South Place" width="36" height="36" style="border-radius:6px;" />
            <div style="font-size:18px; font-weight:700;">South Place</div>
          </div>
          <div style="font-size:14px; opacity:0.9; margin-top:4px;">${title}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">${bodyHtml}</td>
      </tr>
      <tr>
        <td style="padding:16px 24px; background:#f8faf8; color:#61776b; font-size:12px;">
          South Place Lagos · Authentic African Cuisine & Catering
        </td>
      </tr>
    </table>
  </body>
  </html>
  `
}

function renderOrderItems(items?: OrderItemEmail[]): string {
  if (!items || items.length === 0) return ""
  const rows = items
    .map((it) => {
      const extrasLine = it.extras && it.extras.length
        ? `<div style="color:#6b7280; font-size:12px; margin-top:4px;">Extras: ${it.extras.map(ex => ex.name).join(", ")}</div>`
        : ""
      return `
        <tr>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">${it.quantity}×</td>
          <td style="padding:8px 12px; border-bottom:1px solid #eee;">
            ${it.name}${it.variant ? ` <span style=\"color:#6b7280\">(${it.variant})</span>` : ""}
            ${extrasLine}
          </td>
          <td style="padding:8px 12px; text-align:right; border-bottom:1px solid #eee;">${formatCurrencyNGN(it.price)}</td>
        </tr>`
    })
    .join("")
  return `
    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-top:12px;">
      <thead>
        <tr>
          <th align="left" style="padding:8px 12px; border-bottom:2px solid #e5e7eb; font-size:12px; color:#6b7280;">Qty</th>
          <th align="left" style="padding:8px 12px; border-bottom:2px solid #e5e7eb; font-size:12px; color:#6b7280;">Item</th>
          <th align="right" style="padding:8px 12px; border-bottom:2px solid #e5e7eb; font-size:12px; color:#6b7280;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
}

async function sendEmail(to: string, subject: string, html: string): Promise<SendEmailResult> {
  try {
    const tx = createTransporter()
    if (!tx) {
      return { success: false, error: "Email transporter not configured" }
    }

    // Verify connection before sending
    try {
      await tx.verify()
    } catch (verifyError: any) {
      console.error("[Email Service] SMTP connection verification failed:", {
        code: verifyError?.code,
        command: verifyError?.command,
        response: verifyError?.response,
        responseCode: verifyError?.responseCode,
        message: verifyError?.message,
      })
      // Reset transporter so it can be recreated with fresh config
      transporter = null
      return { 
        success: false, 
        error: `SMTP connection failed: ${verifyError?.response || verifyError?.message || "Authentication error"}` 
      }
    }

    const from = getEmailFromAddress()
    
    console.log(`[Email Service] Sending email to: ${to} from: ${from}`)
    
    const info = await tx.sendMail({ from, to, subject, html })
    
    console.log(`[Email Service] Email sent successfully to: ${to}, messageId: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error("[Email Service] Email send error:", {
      code: error?.code,
      command: error?.command,
      response: error?.response,
      responseCode: error?.responseCode,
      message: error?.message,
      stack: error?.stack,
    })
    // Reset transporter on error so it can be recreated
    transporter = null
    return { 
      success: false, 
      error: error?.response || error?.message || "Failed to send email" 
    }
  }
}

async function testConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const tx = createTransporter()
    if (!tx) {
      return { success: false, error: "SMTP credentials not configured" }
    }
    await tx.verify()
    return { success: true }
  } catch (error: any) {
    console.error("Email transport verify error:", error)
    return { success: false, error: error?.message || "Connection failed" }
  }
}

function buildWelcomeEmail(payload: WelcomeEmailPayload): { subject: string; html: string } {
  const subject = "Welcome to South Place!"
  const html = baseEmailLayout(
    "Welcome to South Place",
    `
      <p style="margin:0 0 12px;">Hi <strong>${payload.name}</strong>,</p>
      <p style="margin:0 0 12px;">Thanks for creating an account with South Place. We're excited to serve you!</p>
      <div style="margin-top:16px; padding:12px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
        <div style="font-weight:700; margin-bottom:6px;">Your details</div>
        <div style="font-size:14px; color:#374151;">Email: ${payload.email}</div>
        ${payload.phone ? `<div style="font-size:14px; color:#374151;">Phone: ${payload.phone}</div>` : ""}
        ${payload.address ? `<div style="font-size:14px; color:#374151;">Address: ${payload.address}${payload.city ? ", " + payload.city : ""}</div>` : ""}
      </div>
      <p style="margin:16px 0 0;">If you didn't create this account, please ignore this email.</p>
    `
  )
  return { subject, html }
}

function buildOrderConfirmationEmail(order: OrderEmailPayload): { subject: string; html: string } {
  const subject = `Your South Place order ${order.orderNumber} is confirmed`
  const html = baseEmailLayout(
    "Order Confirmation",
    `
      <p style="margin:0 0 12px;">Hi <strong>${order.customerName}</strong>,</p>
      <p style="margin:0 0 12px;">Thanks for your order. We are getting it ready!</p>
      <div style="margin:12px 0; font-size:14px; color:#6b7280;">Order placed on ${new Date(order.createdAt).toLocaleString("en-NG")}</div>
      <div style="margin:12px 0; font-size:14px;">Delivery address: ${order.deliveryAddress}</div>
      ${renderOrderItems(order.items)}
      <div style="margin-top:16px; border-top:1px dashed #e5e7eb; padding-top:12px;">
        <div style="display:flex; justify-content:space-between; margin:4px 0; color:#374151; font-size:14px;">Subtotal <span>${formatCurrencyNGN(order.subtotal)}</span></div>
        <div style="display:flex; justify-content:space-between; margin:4px 0; color:#374151; font-size:14px;">Delivery <span>${formatCurrencyNGN(order.deliveryFee)}</span></div>
        ${order.vatAmount && order.vatAmount > 0 ? `<div style="display:flex; justify-content:space-between; margin:4px 0; color:#374151; font-size:14px;">VAT${order.vatRate ? ` (${order.vatRate.toFixed(2)}%)` : ""} <span>${formatCurrencyNGN(order.vatAmount)}</span></div>` : ""}
        <div style="display:flex; justify-content:space-between; margin:8px 0; font-weight:700;">Total <span>${formatCurrencyNGN(order.total)}</span></div>
      </div>
      <div style="margin-top:16px; padding:12px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
        <div style="font-weight:700; margin-bottom:6px;">Payment</div>
        <div style="font-size:14px; color:#374151;">Method: ${order.paymentMethod}</div>
        ${order.paymentStatus ? `<div style="font-size:14px; color:#374151;">Status: ${order.paymentStatus}</div>` : ""}
        ${order.paymentIntentId ? `<div style=\"font-size:12px; color:#6b7280;\">Reference: ${order.paymentIntentId}</div>` : ""}
        ${order.receiptUrl ? `<div style=\"margin-top:8px;\"><a href=\"${order.receiptUrl}\" style=\"display:inline-block; padding:8px 12px; background:#111827; color:#ffffff; text-decoration:none; border-radius:6px; font-size:13px;\">View Stripe receipt</a></div>` : ""}
      </div>
      ${order.estimatedDelivery ? `<p style="margin:12px 0 0; color:#374151;">Estimated delivery: <strong>${order.estimatedDelivery}</strong></p>` : ""}
    `
  )
  return { subject, html }
}

function buildAdminNewOrderEmail(order: OrderEmailPayload): { subject: string; html: string } {
  const subject = `New order received: ${order.orderNumber}`
  const html = baseEmailLayout(
    "New Order Notification",
    `
      <p style="margin:0 0 12px;">A new order has been placed.</p>
      <div style="margin:12px 0; font-size:14px;">Customer: <strong>${order.customerName}</strong> (${order.customerEmail || "no email"})</div>
      <div style="margin:12px 0; font-size:14px;">Order #: <strong>${order.orderNumber}</strong></div>
      <div style="margin:12px 0; font-size:14px;">Total: <strong>${formatCurrencyNGN(order.total)}</strong></div>
      <div style="margin:12px 0; padding:12px; background:#f3f4f6; border-radius:8px; border:1px solid #e5e7eb;">
        <div style="font-weight:700; margin-bottom:6px; font-size:14px;">Payment Information</div>
        <div style="font-size:13px; color:#374151; margin:4px 0;">Method: ${order.paymentMethod}</div>
        ${order.paymentStatus ? `<div style="font-size:13px; color:#374151; margin:4px 0;">Status: ${order.paymentStatus}</div>` : ""}
        ${order.paymentIntentId ? `<div style="font-size:12px; color:#6b7280; margin:4px 0;">Reference: ${order.paymentIntentId}</div>` : ""}
        ${order.receiptUrl ? `<div style="margin-top:8px;"><a href="${order.receiptUrl}" style="display:inline-block; padding:8px 16px; background:#111827; color:#ffffff; text-decoration:none; border-radius:6px; font-size:13px; font-weight:600;">View Payment Receipt</a></div>` : ""}
      </div>
      ${renderOrderItems(order.items)}
    `
  )
  return { subject, html }
}

function buildOrderDeliveredEmail(order: OrderEmailPayload): { subject: string; html: string } {
  const subject = `Your South Place order ${order.orderNumber} has been delivered`
  const html = baseEmailLayout(
    "Order Delivered",
    `
      <p style="margin:0 0 12px;">Hi <strong>${order.customerName}</strong>,</p>
      <p style="margin:0 0 12px;">Your order <strong>${order.orderNumber}</strong> has been delivered. Enjoy your meal!</p>
      <p style="margin:12px 0 0;">Thank you for ordering with South Place.</p>
    `
  )
  return { subject, html }
}

function buildOrderStatusUpdateEmail(order: OrderEmailPayload, status: string): { subject: string; html: string } {
  const subject = `Update on your order ${order.orderNumber}: ${status.replace(/_/g, " ")}`
  const html = baseEmailLayout(
    "Order Status Update",
    `
      <p style="margin:0 0 12px;">Hi <strong>${order.customerName}</strong>,</p>
      <p style="margin:0 0 12px;">The status of your order <strong>${order.orderNumber}</strong> has changed to <strong>${status.replace(/_/g, " ")}</strong>.</p>
      <p style="margin:12px 0 0;">We'll notify you of further updates.</p>
    `
  )
  return { subject, html }
}

async function sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<SendEmailResult> {
  if (!payload.email) return { success: false, error: "Missing recipient email" }
  const { subject, html } = buildWelcomeEmail(payload)
  return sendEmail(payload.email, subject, html)
}

async function sendOrderConfirmation(order: OrderEmailPayload): Promise<SendEmailResult> {
  if (!order.customerEmail) return { success: false, error: "Missing customer email" }
  const { subject, html } = buildOrderConfirmationEmail(order)
  return sendEmail(order.customerEmail, subject, html)
}

async function sendNewOrderNotification(order: OrderEmailPayload): Promise<SendEmailResult> {
  const to = process.env.ORDERS_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER
  if (!to) return { success: false, error: "No admin recipient configured" }
  const { subject, html } = buildAdminNewOrderEmail(order)
  return sendEmail(to, subject, html)
}

async function sendOrderDelivered(order: OrderEmailPayload): Promise<SendEmailResult> {
  if (!order.customerEmail) return { success: false, error: "Missing customer email" }
  const { subject, html } = buildOrderDeliveredEmail(order)
  return sendEmail(order.customerEmail, subject, html)
}

async function sendOrderStatusUpdate(order: OrderEmailPayload, status: string): Promise<SendEmailResult> {
  if (!order.customerEmail) return { success: false, error: "Missing customer email" }
  const { subject, html } = buildOrderStatusUpdateEmail(order, status)
  return sendEmail(order.customerEmail, subject, html)
}

export const emailService = {
  testConnection,
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendNewOrderNotification,
  sendOrderDelivered,
  sendOrderStatusUpdate,
}
