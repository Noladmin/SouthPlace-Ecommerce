import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/services/jwt-service"

export async function verifyAdminAuth(request: NextRequest) {
  const token = request.cookies.get("admin-token")?.value

  if (!token) {
    return { success: false as const, message: "No token provided", status: 401 }
  }

  const tokenResult = verifyToken(token)
  if (!tokenResult.valid || !tokenResult.payload) {
    return { success: false as const, message: "Invalid token", status: 401 }
  }

  const admin = await prisma.admin.findUnique({
    where: { id: tokenResult.payload.id },
  })

  if (!admin || !admin.isActive) {
    return { success: false as const, message: "Admin not found or inactive", status: 401 }
  }

  return { success: true as const, admin }
}
