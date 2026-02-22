import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Minimal handler to satisfy module import and avoid type errors
export async function POST(request: NextRequest) {
  try {
    // Placeholder: echo back payload to confirm endpoint wiring
    const contentType = request.headers.get('content-type') || ''
    let payload: any = null
    if (contentType.includes('application/json')) {
      payload = await request.json()
    }

    return NextResponse.json({ success: true, received: payload ?? null })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Payment confirmation failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}


