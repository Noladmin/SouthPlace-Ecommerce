import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { createAdmin, requireSuperAdmin } from "@/lib/services/auth-service"
import { emailService } from "@/lib/services/email-service"
import { generateSecurePassword } from "@/lib/services/password-service"
import type { Role } from "@/lib/types"

export const dynamic = "force-dynamic"
export const revalidate = 0

const adminCreateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("A valid email address is required"),
  phone: z.string().trim().optional().or(z.literal("")),
  role: z.enum(["SUPER_ADMIN_USER", "ADMIN_USER"]),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request)
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized" },
        { status: auth.status || 401 }
      )
    }

    const admins = await prisma.admin.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: admins,
    })
  } catch (error) {
    console.error("Admin users list error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to load admin users" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request)
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized" },
        { status: auth.status || 401 }
      )
    }

    const body = await request.json()
    const input = adminCreateSchema.parse(body)
    const temporaryPassword = generateSecurePassword(14)

    const result = await createAdmin({
      name: input.name,
      email: input.email,
      password: temporaryPassword,
      phone: input.phone || undefined,
      role: input.role as Role,
      mustChangePassword: true,
    })

    if (!result.success || !result.admin) {
      return NextResponse.json(
        { success: false, error: result.message || "Failed to create admin user" },
        { status: result.message === "An admin with that email already exists" ? 409 : 400 }
      )
    }

    const emailResult = await emailService.sendAdminInvitation({
      name: result.admin.name,
      email: result.admin.email,
      role: result.admin.role,
      temporaryPassword,
    })

    if (!emailResult.success) {
      await prisma.admin.delete({ where: { id: result.admin.id } }).catch((error) => {
        console.error("Admin rollback after invitation email failure:", error)
      })

      return NextResponse.json(
        {
          success: false,
          error: emailResult.error || "Failed to email temporary password to the new admin",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Admin user created successfully and temporary password emailed",
        data: result.admin,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      )
    }

    console.error("Admin user creation error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create admin user" },
      { status: 500 }
    )
  }
}
