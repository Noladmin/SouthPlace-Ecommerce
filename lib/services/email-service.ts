import { getEmailFromAddress } from "./email-config"
import { sendEmailViaProvider, testEmailProviderConnection, type EmailSendResult } from "./email-provider"
import { getAppBaseUrl } from "@/lib/app-url"

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

interface RiderAssignmentEmailPayload {
  riderName?: string | null
  orderNumber: string
  customerName: string
  deliveryLink: string
}

interface DeliveryCodeEmailPayload {
  customerName: string
  orderNumber: string
  code: string
}

interface AdminInvitationEmailPayload {
  name: string
  email: string
  role: string
  temporaryPassword: string
}

interface CustomerPasswordResetEmailPayload {
  firstName: string
  code: string
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

function formatCurrencyNGN(amount: number): string {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount)
  } catch {
    return `₦${amount.toFixed(2)}`
  }
}

function baseEmailLayout(title: string, bodyHtml: string): string {
  const baseUrl = getAppBaseUrl()
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
        <td style="background:linear-gradient(135deg,#c2410c,#ea580c); padding:20px 24px; color:#fff;">
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${baseUrl}/images/SouthLogo.png" alt="SouthtownPlace" width="36" height="36" style="border-radius:6px;" />
            <div style="font-size:18px; font-weight:700;">SouthtownPlace</div>
          </div>
          <div style="font-size:14px; opacity:0.9; margin-top:4px;">${title}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">${bodyHtml}</td>
      </tr>
      <tr>
        <td style="padding:16px 24px; background:#fff7ed; color:#9a3412; font-size:12px;">
          SouthtownPlace Lagos · Authentic African Cuisine & Catering
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

async function sendEmail(to: string, subject: string, html: string): Promise<EmailSendResult> {
  console.log(`[Email Service] Sending email to: ${to} from: ${getEmailFromAddress()} via Resend`)
  return sendEmailViaProvider(to, subject, html)
}

async function testConnection(): Promise<{ success: boolean; error?: string }> {
  const result = await testEmailProviderConnection()
  return result.success ? { success: true } : { success: false, error: result.error }
}

function buildWelcomeEmail(payload: WelcomeEmailPayload): { subject: string; html: string } {
  const subject = "Welcome to SouthtownPlace!"
  const appUrl = getAppBaseUrl()
  const html = baseEmailLayout(
    "Welcome to SouthtownPlace",
    `
      <p style="margin:0 0 12px;">Hi <strong>${payload.name}</strong>,</p>
      <p style="margin:0 0 12px;">Thanks for creating an account with SouthtownPlace. We're excited to serve you!</p>
      <div style="margin-top:16px; padding:12px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
        <div style="font-weight:700; margin-bottom:6px;">Your details</div>
        <div style="font-size:14px; color:#374151;">Email: ${payload.email}</div>
        ${payload.phone ? `<div style="font-size:14px; color:#374151;">Phone: ${payload.phone}</div>` : ""}
        ${payload.address ? `<div style="font-size:14px; color:#374151;">Address: ${payload.address}${payload.city ? ", " + payload.city : ""}</div>` : ""}
      </div>
      <p style="margin:16px 0 0;">
        <a href="${appUrl}" style="display:inline-block; padding:10px 16px; background:#ea580c; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:700;">Visit SouthtownPlace</a>
      </p>
      <p style="margin:12px 0 0; font-size:13px; color:#6b7280;">Website: <a href="${appUrl}" style="color:#c2410c; text-decoration:none;">${appUrl}</a></p>
      <p style="margin:16px 0 0;">If you didn't create this account, please ignore this email.</p>
    `
  )
  return { subject, html }
}

function buildOrderConfirmationEmail(order: OrderEmailPayload): { subject: string; html: string } {
  const subject = `Your SouthtownPlace order ${order.orderNumber} is confirmed`
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
  const subject = `Your SouthtownPlace order ${order.orderNumber} has been delivered`
  const html = baseEmailLayout(
    "Order Delivered",
    `
      <p style="margin:0 0 12px;">Hi <strong>${order.customerName}</strong>,</p>
      <p style="margin:0 0 12px;">Your order <strong>${order.orderNumber}</strong> has been delivered. Enjoy your meal!</p>
      <p style="margin:12px 0 0;">Thank you for ordering with SouthtownPlace.</p>
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

function buildRiderAssignmentEmail(payload: RiderAssignmentEmailPayload): { subject: string; html: string } {
  const subject = `Delivery assignment for order ${payload.orderNumber}`
  const html = baseEmailLayout(
    "Delivery Assignment",
    `
      <p style="margin:0 0 12px;">Hi <strong>${payload.riderName || "Rider"}</strong>,</p>
      <p style="margin:0 0 12px;">You have been assigned a delivery for order <strong>${payload.orderNumber}</strong>.</p>
      <div style="margin:12px 0; padding:12px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
        <div style="font-size:14px; color:#374151;">Customer: ${payload.customerName}</div>
        <div style="font-size:14px; color:#374151; margin-top:6px;">Open the secure link below to view the delivery details.</div>
      </div>
      <p style="margin:16px 0 0;">
        <a href="${payload.deliveryLink}" style="display:inline-block; padding:10px 16px; background:#ea580c; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:700;">Open delivery link</a>
      </p>
      <p style="margin:16px 0 0; font-size:13px; color:#6b7280;">This link is for this assignment only.</p>
    `
  )
  return { subject, html }
}

function buildDeliveryCodeEmail(payload: DeliveryCodeEmailPayload): { subject: string; html: string } {
  const subject = `Your SouthtownPlace delivery code for ${payload.orderNumber}`
  const html = baseEmailLayout(
    "Delivery Verification Code",
    `
      <p style="margin:0 0 12px;">Hi <strong>${payload.customerName}</strong>,</p>
      <p style="margin:0 0 12px;">Use this code only when your order arrives.</p>
      <div style="background:linear-gradient(135deg,#c2410c,#ea580c); padding:24px; text-align:center; border-radius:10px; margin:18px 0;">
        <div style="color:#ffffff; font-size:34px; letter-spacing:8px; font-weight:700;">${payload.code}</div>
      </div>
      <p style="margin:0; color:#374151;">Order: <strong>${payload.orderNumber}</strong></p>
      <p style="margin:12px 0 0; font-size:13px; color:#6b7280;">Share this code only with the rider when your food has been delivered to you.</p>
    `
  )
  return { subject, html }
}

function buildAdminInvitationEmail(payload: AdminInvitationEmailPayload): { subject: string; html: string } {
  const subject = "Your SouthtownPlace admin account is ready"
  const appUrl = getAppBaseUrl()
  const adminLoginUrl = `${appUrl}/admin/login`
  const html = baseEmailLayout(
    "Admin Account Created",
    `
      <p style="margin:0 0 12px;">Hi <strong>${payload.name}</strong>,</p>
      <p style="margin:0 0 12px;">A SouthtownPlace admin account has been created for you.</p>
      <div style="margin-top:16px; padding:12px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
        <div style="font-weight:700; margin-bottom:6px;">Your sign-in details</div>
        <div style="font-size:14px; color:#374151;">Email: ${payload.email}</div>
        <div style="font-size:14px; color:#374151;">Role: ${payload.role.replace(/_/g, " ")}</div>
        <div style="font-size:14px; color:#374151; margin-top:8px;">Temporary password:</div>
        <div style="margin-top:8px; font-size:20px; letter-spacing:1px; font-weight:700; color:#111827;">${payload.temporaryPassword}</div>
      </div>
      <p style="margin:16px 0 0;">
        <a href="${adminLoginUrl}" style="display:inline-block; padding:10px 16px; background:#ea580c; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:700;">Open Admin Login</a>
      </p>
      <p style="margin:12px 0 0; font-size:13px; color:#6b7280;">Admin login: <a href="${adminLoginUrl}" style="color:#c2410c; text-decoration:none;">${adminLoginUrl}</a></p>
      <p style="margin:16px 0 0;">Use the temporary password to sign in. You will be required to change it immediately after your first login.</p>
    `
  )
  return { subject, html }
}

function buildCustomerPasswordResetEmail(payload: CustomerPasswordResetEmailPayload): { subject: string; html: string } {
  const subject = "SouthtownPlace account password reset"
  const html = baseEmailLayout(
    "Password Reset",
    `
      <p style="margin:0 0 12px;">Hi <strong>${payload.firstName}</strong>,</p>
      <p style="margin:0 0 12px;">We received a request to reset your SouthtownPlace account password.</p>
      <div style="background:linear-gradient(135deg,#c2410c,#ea580c); padding:24px; text-align:center; border-radius:10px; margin:18px 0;">
        <div style="color:#ffffff; font-size:34px; letter-spacing:8px; font-weight:700;">${payload.code}</div>
      </div>
      <p style="margin:0 0 12px;">Enter this 6-digit code on the password reset form and choose a new password.</p>
      <div style="background-color:#fff7ed; padding:16px; border-radius:8px; border-left:4px solid #ea580c;">
        <p style="color:#666; font-size:14px; margin:0;">
          This code expires in 10 minutes. If you did not request this password reset, you can ignore this email.
        </p>
      </div>
    `
  )
  return { subject, html }
}

async function sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<EmailSendResult> {
  if (!payload.email) return { success: false, error: "Missing recipient email" }
  const { subject, html } = buildWelcomeEmail(payload)
  return sendEmail(payload.email, subject, html)
}

async function sendOrderConfirmation(order: OrderEmailPayload): Promise<EmailSendResult> {
  if (!order.customerEmail) return { success: false, error: "Missing customer email" }
  const { subject, html } = buildOrderConfirmationEmail(order)
  return sendEmail(order.customerEmail, subject, html)
}

async function sendNewOrderNotification(order: OrderEmailPayload): Promise<EmailSendResult> {
  const to = process.env.ORDERS_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || process.env.BUSINESS_EMAIL
  if (!to) return { success: false, error: "No admin recipient configured" }
  const { subject, html } = buildAdminNewOrderEmail(order)
  return sendEmail(to, subject, html)
}

async function sendOrderDelivered(order: OrderEmailPayload): Promise<EmailSendResult> {
  if (!order.customerEmail) return { success: false, error: "Missing customer email" }
  const { subject, html } = buildOrderDeliveredEmail(order)
  return sendEmail(order.customerEmail, subject, html)
}

async function sendOrderStatusUpdate(order: OrderEmailPayload, status: string): Promise<EmailSendResult> {
  if (!order.customerEmail) return { success: false, error: "Missing customer email" }
  const { subject, html } = buildOrderStatusUpdateEmail(order, status)
  return sendEmail(order.customerEmail, subject, html)
}

async function sendRiderAssignmentLink(to: string, payload: RiderAssignmentEmailPayload): Promise<EmailSendResult> {
  if (!to) return { success: false, error: "Missing rider email" }
  const { subject, html } = buildRiderAssignmentEmail(payload)
  return sendEmail(to, subject, html)
}

async function sendDeliveryCode(to: string, payload: DeliveryCodeEmailPayload): Promise<EmailSendResult> {
  if (!to) return { success: false, error: "Missing customer email" }
  const { subject, html } = buildDeliveryCodeEmail(payload)
  return sendEmail(to, subject, html)
}

async function sendAdminInvitation(payload: AdminInvitationEmailPayload): Promise<EmailSendResult> {
  if (!payload.email) return { success: false, error: "Missing admin email" }
  const { subject, html } = buildAdminInvitationEmail(payload)
  return sendEmail(payload.email, subject, html)
}

async function sendCustomerPasswordReset(email: string, payload: CustomerPasswordResetEmailPayload): Promise<EmailSendResult> {
  if (!email) return { success: false, error: "Missing customer email" }
  const { subject, html } = buildCustomerPasswordResetEmail(payload)
  return sendEmail(email, subject, html)
}

export const emailService = {
  testConnection,
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendNewOrderNotification,
  sendOrderDelivered,
  sendOrderStatusUpdate,
  sendRiderAssignmentLink,
  sendDeliveryCode,
  sendAdminInvitation,
  sendCustomerPasswordReset,
}
