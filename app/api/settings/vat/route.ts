import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const VAT_ENABLED_KEY = "vat.enabled"
const VAT_RATE_KEY = "vat.rate"

function toTwoDp(value: unknown): number | null {
  const num = typeof value === "string" ? parseFloat(value) : typeof value === "number" ? value : NaN
  if (!isFinite(num)) return null
  return Math.round(num * 100) / 100
}

export async function GET() {
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
    return NextResponse.json({ success: true, data: { enabled, rate } }, { status: 200 })
  } catch {
    return NextResponse.json({ success: true, data: defaults }, { status: 200 })
  }
}
