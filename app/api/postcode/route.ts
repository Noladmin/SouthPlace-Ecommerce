import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Postcode lookup is not supported in Nigeria." },
    { status: 410 }
  )
}

