import { uploadToCloudinary } from "@/lib/cloudinary"
import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/services/jwt-service"
import { prisma } from "@/lib/db"
import { promises as fs } from "fs"
import path from "path"

export const runtime = "nodejs"

async function verifyAdminAuth(request: NextRequest) {
  const token = request.cookies.get("admin-token")?.value
  if (!token) {
    return { success: false, message: "No token provided", status: 401 }
  }

  const tokenResult = verifyToken(token)
  if (!tokenResult.valid || !tokenResult.payload) {
    return { success: false, message: "Invalid token", status: 401 }
  }

  const admin = await prisma.admin.findUnique({ where: { id: tokenResult.payload.id } })
  if (!admin || !admin.isActive) {
    return { success: false, message: "Admin not found or inactive", status: 401 }
  }

  return { success: true, admin }
}

function sanitizeFilename(originalName: string) {
  const base = originalName.toLowerCase().replace(/[^a-z0-9_.-]+/g, "-")
  const timestamp = Date.now()
  const rand = Math.random().toString(36).slice(2, 8)
  const ext = path.extname(base) || ".jpg"
  const name = path.basename(base, ext)
  return `${name}-${timestamp}-${rand}${ext}`
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.message },
        { status: authResult.status }
      )
    }

    const form = await request.formData()
    const file = form.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Unsupported file type" },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const filename = sanitizeFilename(file.name)

    // Upload to Cloudinary
    try {
      const result = await uploadToCloudinary(buffer, filename, 'tastybowls/menu')
      return NextResponse.json({ 
        success: true, 
        url: result.url, 
        path: result.public_id 
      })
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError)
      // Fallback to local storage if Cloudinary fails
    }

    // Fallback to local disk storage
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "menu")
    await fs.mkdir(uploadsDir, { recursive: true })
    const filePath = path.join(uploadsDir, filename)
    await fs.writeFile(filePath, buffer)
    const publicPath = `/uploads/menu/${filename}`
    const origin = request.nextUrl.origin
    const url = `${origin}${publicPath}`
    return NextResponse.json({ success: true, url, path: publicPath })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    )
  }
}


