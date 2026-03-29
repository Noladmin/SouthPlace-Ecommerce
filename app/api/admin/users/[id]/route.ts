import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireSuperAdmin } from "@/lib/services/auth-service"
import { emailService } from "@/lib/services/email-service"
import { generateSecurePassword, hashPassword } from "@/lib/services/password-service"

export const dynamic = "force-dynamic"
export const revalidate = 0

const adminUpdateSchema = z.object({
  role: z.enum(["SUPER_ADMIN_USER", "ADMIN_USER"]).optional(),
  isActive: z.boolean().optional(),
}).refine((value) => value.role !== undefined || value.isActive !== undefined, {
  message: "Provide at least one field to update",
})

async function countActiveSuperAdmins() {
  return prisma.admin.count({
    where: {
      role: "SUPER_ADMIN_USER",
      isActive: true,
    },
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSuperAdmin(request)
    if (!auth.success || !auth.admin) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized" },
        { status: auth.status || 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const input = adminUpdateSchema.parse(body)

    const target = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    })

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Admin user not found" },
        { status: 404 }
      )
    }

    const isSelf = target.id === auth.admin.id
    const changingRole = input.role !== undefined && input.role !== target.role
    const changingActive = input.isActive !== undefined && input.isActive !== target.isActive

    if (!changingRole && !changingActive) {
      return NextResponse.json({
        success: true,
        message: "No changes applied",
      })
    }

    if (isSelf && input.role && input.role !== "SUPER_ADMIN_USER") {
      return NextResponse.json(
        { success: false, error: "You cannot demote your own super admin account" },
        { status: 400 }
      )
    }

    if (isSelf && input.isActive === false) {
      return NextResponse.json(
        { success: false, error: "You cannot deactivate your own account" },
        { status: 400 }
      )
    }

    const activeSuperAdmins = await countActiveSuperAdmins()
    const removesSuperAdminRole = target.role === "SUPER_ADMIN_USER" && input.role === "ADMIN_USER"
    const deactivatesSuperAdmin = target.role === "SUPER_ADMIN_USER" && input.isActive === false

    if ((removesSuperAdminRole || deactivatesSuperAdmin) && activeSuperAdmins <= 1) {
      return NextResponse.json(
        { success: false, error: "You must keep at least one active super admin account" },
        { status: 400 }
      )
    }

    const updated = await prisma.admin.update({
      where: { id },
      data: {
        ...(input.role ? { role: input.role } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
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
      message: "Admin user updated successfully",
      data: updated,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      )
    }

    console.error("Admin user update error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update admin user" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSuperAdmin(request)
    if (!auth.success || !auth.admin) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized" },
        { status: auth.status || 401 }
      )
    }

    const { id } = await params

    const target = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        password: true,
        mustChangePassword: true,
      },
    })

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Admin user not found" },
        { status: 404 }
      )
    }

    if (target.id === auth.admin.id) {
      return NextResponse.json(
        { success: false, error: "You cannot resend an invite to your own account" },
        { status: 400 }
      )
    }

    const temporaryPassword = generateSecurePassword(14)
    const passwordResult = await hashPassword(temporaryPassword)

    if (!passwordResult.success || !passwordResult.hash) {
      return NextResponse.json(
        { success: false, error: passwordResult.error || "Failed to prepare invite" },
        { status: 500 }
      )
    }

    await prisma.admin.update({
      where: { id: target.id },
      data: {
        password: passwordResult.hash,
        mustChangePassword: true,
      },
    })

    const emailResult = await emailService.sendAdminInvitation({
      name: target.name,
      email: target.email,
      role: target.role,
      temporaryPassword,
    })

    if (!emailResult.success) {
      await prisma.admin.update({
        where: { id: target.id },
        data: {
          password: target.password,
          mustChangePassword: target.mustChangePassword,
        },
      }).catch((rollbackError) => {
        console.error("Admin invite resend rollback error:", rollbackError)
      })

      return NextResponse.json(
        { success: false, error: emailResult.error || "Failed to resend invite email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Invite resent to ${target.email}`,
    })
  } catch (error) {
    console.error("Admin invite resend error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to resend invite" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSuperAdmin(request)
    if (!auth.success || !auth.admin) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized" },
        { status: auth.status || 401 }
      )
    }

    const { id } = await params
    const target = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    })

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Admin user not found" },
        { status: 404 }
      )
    }

    if (target.id === auth.admin.id) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own account" },
        { status: 400 }
      )
    }

    const removingActiveSuperAdmin = target.role === "SUPER_ADMIN_USER" && target.isActive
    if (removingActiveSuperAdmin) {
      const activeSuperAdmins = await countActiveSuperAdmins()
      if (activeSuperAdmins <= 1) {
        return NextResponse.json(
          { success: false, error: "You must keep at least one active super admin account" },
          { status: 400 }
        )
      }
    }

    await prisma.admin.delete({
      where: { id: target.id },
    })

    return NextResponse.json({
      success: true,
      message: "Admin user deleted successfully",
    })
  } catch (error) {
    console.error("Admin user delete error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete admin user" },
      { status: 500 }
    )
  }
}
