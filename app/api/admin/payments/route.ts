import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminAuth } from "@/lib/services/auth-service"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('paymentMethod')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (paymentMethod) {
      where.paymentMethod = paymentMethod
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get payments with order details
    const payments = await prisma.payment.findMany({
      where,
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            customerEmail: true,
            total: true,
            status: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
    })

    // Get total count for pagination
    const total = await prisma.payment.count({ where })

    // Calculate summary statistics
    const totalAmount = await prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
    })

    const todayPayments = await prisma.payment.count({
      where: {
        status: 'PAID',
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    const todayAmount = await prisma.payment.aggregate({
      where: {
        status: 'PAID',
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      _sum: { amount: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        summary: {
          totalAmount: totalAmount._sum.amount || 0,
          todayPayments,
          todayAmount: todayAmount._sum.amount || 0
        }
      }
    })

  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

