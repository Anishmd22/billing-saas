import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, startOfMonth } from 'date-fns';
import { LOW_STOCK_THRESHOLD } from '@/core/constants';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = startOfMonth(now);

    const [
      todayInvoices,
      pendingPayments,
      lowStockProducts,
      monthInvoices,
    ] = await Promise.all([
      // Today's bills
      prisma.invoice.findMany({
        where: {
          createdAt: { gte: todayStart },
          status: { not: 'CANCELLED' },
        },
        select: { totalAmount: true },
      }),
      // Pending payments summary
      prisma.payment.aggregate({
        where: { paymentStatus: { in: ['PENDING', 'PARTIAL'] } },
        _sum: { pendingAmount: true },
        _count: { id: true },
      }),
      prisma.product.count({
        where: { currentStock: { lt: LOW_STOCK_THRESHOLD } },
      }),
      // This month revenue
      prisma.invoice.findMany({
        where: {
          createdAt: { gte: monthStart },
          status: { not: 'CANCELLED' },
        },
        select: { totalAmount: true },
      }),
    ]);

    const todayBillsTotal = todayInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const thisMonthRevenue = monthInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    return NextResponse.json({
      success: true,
      message: 'Dashboard stats fetched',
      data: {
        todayBillsCount: todayInvoices.length,
        todayBillsTotal,
        pendingPaymentsTotal: Number(pendingPayments._sum.pendingAmount ?? 0),
        pendingPaymentsCount: pendingPayments._count.id,
        lowStockCount: lowStockProducts,
        thisMonthRevenue,
      },
    });
  } catch (err) {
    console.error('[GET /api/v1/dashboard]', err);
    return NextResponse.json(
      { success: false, error: { code: 'ERR_SERVER', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
