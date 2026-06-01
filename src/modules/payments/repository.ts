import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { UpdatePaymentInput } from '@/modules/payments/validators';

export async function getAllPayments(filters?: { status?: string; search?: string }) {
  const where: Prisma.PaymentWhereInput = {};

  if (filters?.status && filters.status !== 'ALL') {
    where.paymentStatus = filters.status as Prisma.EnumPaymentStatusFilter;
  }

  if (filters?.search) {
    where.invoice = {
      client: { companyName: { contains: filters.search, mode: 'insensitive' } },
    };
  }

  return prisma.payment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      invoice: {
        include: {
          client: { select: { id: true, companyName: true, phone: true } },
        },
      },
    },
  });
}

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      invoice: {
        include: { client: true },
      },
    },
  });
}

export async function updatePayment(id: string, data: UpdatePaymentInput) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id } });
    if (!payment) throw new Error('ERR_PAYMENT_NOT_FOUND');

    const totalAmount = Number(payment.totalAmount);
    const newPaid = data.paidAmount;

    if (newPaid > totalAmount) {
      throw new Error('ERR_OVERPAYMENT: Paid amount cannot exceed total amount');
    }

    const newPending = Math.round((totalAmount - newPaid) * 100) / 100;
    let status: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';
    if (newPaid >= totalAmount) status = 'PAID';
    else if (newPaid > 0) status = 'PARTIAL';

    return tx.payment.update({
      where: { id },
      data: {
        paidAmount: new Prisma.Decimal(newPaid),
        pendingAmount: new Prisma.Decimal(newPending),
        paymentStatus: status,
        lastPaymentDate: data.lastPaymentDate ? new Date(data.lastPaymentDate) : new Date(),
      },
    });
  });
}

// Dashboard aggregate: total pending across all invoices
export async function getPendingPaymentSummary() {
  const result = await prisma.payment.aggregate({
    where: { paymentStatus: { in: ['PENDING', 'PARTIAL'] } },
    _sum: { pendingAmount: true },
    _count: { id: true },
  });

  return {
    total: Number(result._sum.pendingAmount ?? 0),
    count: result._count.id,
  };
}
