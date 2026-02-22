import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const VAT_ENABLED_KEY = "vat.enabled"
const VAT_RATE_KEY = "vat.rate"

function toTwoDp(value: unknown): number | null {
  const num = typeof value === "string" ? parseFloat(value) : typeof value === "number" ? value : NaN
  if (!isFinite(num)) return null
  return Math.round(num * 100) / 100
}

async function getVatFromDb(): Promise<{ enabled: boolean; rate: number }> {
  const defaults = { enabled: false, rate: 0 }
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: [VAT_ENABLED_KEY, VAT_RATE_KEY] } },
    })
    const map = new Map(settings.map((s: { key: string; value: string }) => [s.key, s.value]))
    const enabledRaw = map.get(VAT_ENABLED_KEY)
    const rateRaw = map.get(VAT_RATE_KEY)
    const enabled = enabledRaw === "true"
    const rate = toTwoDp(rateRaw) ?? defaults.rate
    return { enabled, rate }
  } catch {
    return defaults
  }
}

export async function GET() {
  const vat = await getVatFromDb()
  return NextResponse.json({ success: true, data: vat }, { status: 200 })
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const next: { enabled?: boolean; rate?: number } = {}

    if (body.enabled !== undefined) {
      next.enabled = Boolean(body.enabled)
    }
    if (body.rate !== undefined) {
      const n = toTwoDp(body.rate)
      if (n === null || n < 0 || n > 100) {
        return NextResponse.json({ success: false, error: "Invalid VAT rate" }, { status: 400 })
      }
      next.rate = n
    }

    if (Object.keys(next).length === 0) {
      return NextResponse.json({ success: false, error: "No changes provided" }, { status: 400 })
    }

    const ops: Promise<any>[] = []
    if (next.enabled !== undefined) {
      ops.push(
        prisma.siteSetting.upsert({
          where: { key: VAT_ENABLED_KEY },
          update: { value: next.enabled ? "true" : "false" },
          create: { key: VAT_ENABLED_KEY, value: next.enabled ? "true" : "false" },
        })
      )
    }
    if (next.rate !== undefined) {
      ops.push(
        prisma.siteSetting.upsert({
          where: { key: VAT_RATE_KEY },
          update: { value: next.rate.toFixed(2) },
          create: { key: VAT_RATE_KEY, value: next.rate.toFixed(2) },
        })
      )
    }

    await Promise.all(ops)
    const updated = await getVatFromDb()
    return NextResponse.json({ success: true, data: updated }, { status: 200 })
  } catch (error: any) {
    console.error("VAT update error", { message: error?.message })
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
