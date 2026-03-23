import crypto from "crypto"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/db"
import { emailService } from "@/lib/services/email-service"
import { smsService } from "@/lib/services/sms-service"
import type { DeliveryAssignment, DeliveryAssignmentType, OrderStatus } from "@/lib/types"
import { getAppBaseUrl } from "@/lib/app-url"

const DELIVERY_ACCESS_SECRET = process.env.DELIVERY_ACCESS_SECRET || process.env.JWT_SECRET || "delivery-access-secret"
const DELIVERY_LINK_TTL_HOURS = 12
const DELIVERY_CODE_TTL_MINUTES = 180
const DELIVERY_CODE_LENGTH = 4

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "WAITING_FOR_PICKUP",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
]

export function getStatusLabel(status: string) {
  return status.replace(/_/g, " ")
}

export function getTrackingStepIndex(status: string) {
  const normalizedStatus = status === "READY" ? "WAITING_FOR_PICKUP" : status
  return ORDER_STATUS_FLOW.indexOf(normalizedStatus as OrderStatus)
}

export function generateRandomCode(length = DELIVERY_CODE_LENGTH) {
  const digits = "0123456789"
  return Array.from({ length }, () => digits[Math.floor(Math.random() * digits.length)]).join("")
}

export function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex")
}

export function generateAccessToken() {
  return crypto.randomBytes(32).toString("hex")
}

export function signDeliverySessionToken(assignmentId: string) {
  return jwt.sign({ assignmentId }, DELIVERY_ACCESS_SECRET, { expiresIn: "12h" })
}

export function verifyDeliverySessionToken(token: string): { valid: boolean; assignmentId?: string } {
  try {
    const payload = jwt.verify(token, DELIVERY_ACCESS_SECRET) as { assignmentId?: string }
    if (!payload.assignmentId) return { valid: false }
    return { valid: true, assignmentId: payload.assignmentId }
  } catch {
    return { valid: false }
  }
}

function buildDeliveryLink(token: string) {
  const baseUrl = getAppBaseUrl()
  return `${baseUrl}/delivery/access?token=${token}`
}

export async function createDeliveryVerificationCode(orderId: string, deliveryAssignmentId?: string) {
  const code = generateRandomCode()
  const expiresAt = new Date(Date.now() + DELIVERY_CODE_TTL_MINUTES * 60 * 1000)

  await prisma.deliveryVerificationCode.updateMany({
    where: { orderId, usedAt: null },
    data: { expiresAt: new Date() },
  })

  const record = await prisma.deliveryVerificationCode.create({
    data: {
      orderId,
      deliveryAssignmentId,
      codeHash: hashValue(code),
      expiresAt,
      sentAt: new Date(),
    },
  })

  return { record, code }
}

export async function sendDeliveryCodeNotifications(order: {
  id: string
  orderNumber: string
  customerName: string
  customerEmail?: string | null
  customerPhone: string
}) {
  const { code, record } = await createDeliveryVerificationCode(order.id)
  const smsMessage = `SouthtownPlace delivery code for ${order.orderNumber}: ${code}. Share only when your food arrives.`

  const tasks = []
  if (order.customerEmail) {
    tasks.push(emailService.sendDeliveryCode(order.customerEmail, {
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      code,
    }))
  }
  if (order.customerPhone) {
    tasks.push(smsService.sendSMS(order.customerPhone, smsMessage, { customerReference: order.orderNumber }))
  }

  await Promise.allSettled(tasks)
  return { code, record }
}

export async function createAssignmentAccessToken(assignmentId: string) {
  const token = generateAccessToken()
  const tokenHash = hashValue(token)
  const expiresAt = new Date(Date.now() + DELIVERY_LINK_TTL_HOURS * 60 * 60 * 1000)

  await prisma.deliveryAssignment.update({
    where: { id: assignmentId },
    data: {
      accessTokenHash: tokenHash,
      accessTokenExpiresAt: expiresAt,
      accessTokenUsedAt: null,
      accessTokenSentAt: new Date(),
    },
  })

  return { token, tokenHash, expiresAt, link: buildDeliveryLink(token) }
}

export async function sendAssignmentAccessLink(assignment: DeliveryAssignment & { order: any }) {
  const { link } = await createAssignmentAccessToken(assignment.id)
  const smsMessage = `SouthtownPlace assignment ${assignment.order.orderNumber}. Open your secure link: ${link}`

  const tasks = []
  if (assignment.riderEmail) {
    tasks.push(emailService.sendRiderAssignmentLink(assignment.riderEmail, {
      riderName: assignment.riderName,
      orderNumber: assignment.order.orderNumber,
      customerName: assignment.order.customerName,
      deliveryLink: link,
    }))
  }
  if (assignment.riderPhone) {
    tasks.push(smsService.sendSMS(assignment.riderPhone, smsMessage, { customerReference: assignment.order.orderNumber }))
  }

  await Promise.allSettled(tasks)
  return { link }
}

export async function resolveAssignmentByAccessToken(token: string) {
  const tokenHash = hashValue(token)
  const assignment = await prisma.deliveryAssignment.findFirst({
    where: {
      accessTokenHash: tokenHash,
      isActive: true,
      accessTokenUsedAt: null,
      accessTokenExpiresAt: { gt: new Date() },
    },
    include: {
      order: {
        include: {
          items: {
            include: {
              extras: true,
            },
          },
        },
      },
      rider: true,
    },
  })

  if (!assignment) return null

  await prisma.deliveryAssignment.update({
    where: { id: assignment.id },
    data: { accessTokenUsedAt: new Date() },
  })

  return assignment
}

export async function verifyDeliveryCode(orderId: string, code: string) {
  const record = await prisma.deliveryVerificationCode.findFirst({
    where: {
      orderId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  })

  if (!record) {
    return { valid: false, message: "Delivery code has expired. Ask admin to resend it." }
  }

  if (record.attempts >= record.maxAttempts) {
    return { valid: false, message: "Delivery code has been locked. Ask admin to resend it." }
  }

  const matches = hashValue(code) === record.codeHash
  if (!matches) {
    await prisma.deliveryVerificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    })
    return { valid: false, message: "Invalid delivery code." }
  }

  await prisma.deliveryVerificationCode.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  })

  return { valid: true, record }
}
