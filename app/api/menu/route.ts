import { NextRequest, NextResponse } from "next/server"
import { getPublicMenuData } from "@/lib/menu-data"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const tags = searchParams.get("tags")
    const menuData = await getPublicMenuData({ category, search, tags })

    return NextResponse.json({
      success: true,
      data: menuData
    })
  } catch (error) {
    console.error("Error fetching menu:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch menu",
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
} 
