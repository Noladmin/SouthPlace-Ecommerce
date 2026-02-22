import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/auth-service"

export const dynamic = 'force-dynamic'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await verifyAdminAuth(request)
        if (!authResult.success) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params

        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true,
                        total: true,
                        createdAt: true,
                        items: {
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        })

        if (!customer) {
            return NextResponse.json(
                { success: false, error: "Customer not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: customer
        })

    } catch (error) {
        console.error("Error fetching customer:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch customer" },
            { status: 500 }
        )
    }
}
