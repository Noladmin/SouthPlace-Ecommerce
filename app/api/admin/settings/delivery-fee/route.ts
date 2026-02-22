import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const STANDARD_KEY = "deliveryFee.standard"
const EXPRESS_KEY = "deliveryFee.express"

function toTwoDp(value: unknown): number | null {
  const num = typeof value === 'string' ? parseFloat(value) : typeof value === 'number' ? value : NaN
  if (!isFinite(num)) return null
  return Math.round(num * 100) / 100
}

async function getFeesFromDb(): Promise<{ standard: number; express: number }> {
  const defaults = { standard: 3, express: 5 }
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: [STANDARD_KEY, EXPRESS_KEY] } },
    })
    const map = new Map(settings.map((s: { key: string; value: string }) => [s.key, s.value]))
    const standard = toTwoDp(map.get(STANDARD_KEY)) ?? defaults.standard
    const express = toTwoDp(map.get(EXPRESS_KEY)) ?? defaults.express
    return { standard, express }
  } catch {
    return defaults
  }
}

export async function GET() {
  const fees = await getFeesFromDb()
  return NextResponse.json({ success: true, data: fees }, { status: 200 })
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const next: { standard?: number; express?: number } = {}
    if (body.standard !== undefined) {
      const n = toTwoDp(body.standard)
      if (n === null || n < 0) return NextResponse.json({ success: false, error: "Invalid standard fee" }, { status: 400 })
      next.standard = n
    }
    if (body.express !== undefined) {
      const n = toTwoDp(body.express)
      if (n === null || n < 0) return NextResponse.json({ success: false, error: "Invalid express fee" }, { status: 400 })
      next.express = n
    }
    if (Object.keys(next).length === 0) {
      return NextResponse.json({ success: false, error: "No changes provided" }, { status: 400 })
    }

    const ops: Promise<any>[] = []
    if (next.standard !== undefined) {
      ops.push(
        prisma.siteSetting.upsert({
          where: { key: STANDARD_KEY },
          update: { value: next.standard.toFixed(2) },
          create: { key: STANDARD_KEY, value: next.standard.toFixed(2) },
        })
      )
    }
    if (next.express !== undefined) {
      ops.push(
        prisma.siteSetting.upsert({
          where: { key: EXPRESS_KEY },
          update: { value: next.express.toFixed(2) },
          create: { key: EXPRESS_KEY, value: next.express.toFixed(2) },
        })
      )
    }
    await Promise.all(ops)

    const updated = await getFeesFromDb()
    return NextResponse.json({ success: true, data: updated }, { status: 200 })
  } catch (error: any) {
    console.error("Delivery fee update error", { message: error?.message })
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}


