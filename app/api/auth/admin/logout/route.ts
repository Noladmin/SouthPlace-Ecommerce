import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully"
    })

    // Clear the admin token cookie
    response.cookies.delete('admin-token')
    
    return response
  } catch (error) {
    console.error("Error during admin logout:", error)
    return NextResponse.json(
      { success: false, error: "Failed to logout" },
      { status: 500 }
    )
  }
} 