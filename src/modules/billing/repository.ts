import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { calcInvoiceGST, getGSTType } from '@/core/utils/gst';
import { DEFAULT_SETTINGS } from '@/core/constants';
import type { CreateInvoiceInput } from './validators';

// -----------------------------------------------------------------------
// Invoice number generation
// -----------------------------------------------------------------------
async function generateInvoiceNumber(tx: Prisma.TransactionClient): Promise<string> {
  const prefix = DEFAULT_SETTINGS.invoicePrefix;
  const year = new Date().getFullYear();
  const count = await tx.invoice.count();
  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}${year}-${seq}`;
}

// -----------------------------------------------------------------------
// CREATE INVOICE (full transaction)
// -----------------------------------------------------------------------
export async function createInvoice(data: CreateInvoiceInput) {
  const gstType = getGSTType(data.supplierState, data.customerState);
  const lineItems = data.items.map((item) => ({
    quantity: item.quantity,
    rate: item.rate,
    gstPercentage: item.gstPercentage,
  }));
  const totals = calcInvoiceGST(lineItems, gstType);

  return prisma.$transaction(async (tx) => {
    const invoiceNumber = await generateInvoiceNumber(tx);

    // Calculate due date
    const invoiceDate = new Date(data.invoiceDate);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + DEFAULT_SETTINGS.dueDays);

    // 1. Create Invoice
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        clientId: data.clientId,
        invoiceDate,
        subtotal: new Prisma.Decimal(totals.subtotal),
        cgstAmount: new Prisma.Decimal(totals.cgstAmount),
        sgstAmount: new Prisma.Decimal(totals.sgstAmount),
        igstAmount: new Prisma.Decimal(totals.igstAmount),
        totalAmount: new Prisma.Decimal(totals.totalAmount),
        status: 'GENERATED',
        notes: data.notes || null,
      },
    });

    // 2. Create InvoiceItems + update inventory for each product-linked item
    for (const item of data.items) {
      const lineSubtotal = item.quantity * item.rate;
      const gstDecimal = item.gstPercentage / 100;
      const lineTotal = lineSubtotal * (1 + gstDecimal);

      await tx.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          productId: item.productId || null,
          productName: item.productName,
          hsnCode: item.hsnCode || null,
          quantity: new Prisma.Decimal(item.quantity),
          unit: item.unit,
          rate: new Prisma.Decimal(item.rate),
          gstPercentage: new Prisma.Decimal(item.gstPercentage),
          lineTotal: new Prisma.Decimal(Math.round(lineTotal * 100) / 100),
        },
      });

      // Reduce inventory only for products that are linked to a product record
      if (item.productId) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw Object.assign(new Error('ERR_PRODUCT_NOT_FOUND'), { productId: item.productId });
        }

        const stockBefore = Number(product.currentStock);
        const stockAfter = stockBefore - item.quantity;

        if (stockAfter < 0) {
          throw Object.assign(new Error('ERR_INSUFFICIENT_STOCK'), { productName: product.productName });
        }

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: new Prisma.Decimal(stockAfter) },
        });

        // Log inventory movement
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            invoiceId: invoice.id,
            movementType: 'SALE',
            quantityChange: new Prisma.Decimal(-item.quantity),
            stockBefore: new Prisma.Decimal(stockBefore),
            stockAfter: new Prisma.Decimal(stockAfter),
            remarks: `Invoice ${invoiceNumber}`,
          },
        });
      }
    }

    // 3. Create Payment record
    await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        totalAmount: new Prisma.Decimal(totals.totalAmount),
        paidAmount: new Prisma.Decimal(0),
        pendingAmount: new Prisma.Decimal(totals.totalAmount),
        paymentStatus: 'PENDING',
        dueDate,
      },
    });

    return invoice;
  });
}

// -----------------------------------------------------------------------
// GET ALL INVOICES
// -----------------------------------------------------------------------
export async function getAllInvoices(filters?: {
  status?: string;
  search?: string;
  page?: number;
}) {
  const page = filters?.page ?? 1;
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  const where: Prisma.InvoiceWhereInput = {};

  if (filters?.status && filters.status !== 'ALL') {
    where.status = filters.status as Prisma.EnumInvoiceStatusFilter;
  }

  if (filters?.search) {
    where.OR = [
      { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
      { client: { companyName: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, companyName: true, gstNumber: true } },
        payment: { select: { paymentStatus: true, pendingAmount: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return { invoices, total, page, pageSize };
}

// -----------------------------------------------------------------------
// GET INVOICE BY ID
// -----------------------------------------------------------------------
export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      items: {
        include: { product: { select: { id: true, productName: true, unit: true } } },
      },
      payment: true,
    },
  });
}

// -----------------------------------------------------------------------
// CANCEL INVOICE (full transaction)
// -----------------------------------------------------------------------
export async function cancelInvoice(id: string) {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id },
      include: { items: true, payment: true },
    });

    if (!invoice) throw new Error('ERR_INVOICE_NOT_FOUND');
    if (invoice.status === 'CANCELLED') throw new Error('ERR_ALREADY_CANCELLED');

    // 1. Update invoice status
    await tx.invoice.update({ where: { id }, data: { status: 'CANCELLED' } });

    // 2. Restore inventory for each product-linked item
    for (const item of invoice.items) {
      if (!item.productId) continue;

      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      const stockBefore = Number(product.currentStock);
      const qty = Number(item.quantity);
      const stockAfter = stockBefore + qty;

      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: new Prisma.Decimal(stockAfter) },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          invoiceId: id,
          movementType: 'INVOICE_CANCELLED',
          quantityChange: new Prisma.Decimal(qty),
          stockBefore: new Prisma.Decimal(stockBefore),
          stockAfter: new Prisma.Decimal(stockAfter),
          remarks: `Cancelled: ${invoice.invoiceNumber}`,
        },
      });
    }

    // 3. Update payment record — zero out pending, preserve what was already paid, mark CANCELLED
    if (invoice.payment) {
      await tx.payment.update({
        where: { id: invoice.payment.id },
        data: {
          paymentStatus: 'CANCELLED',
          pendingAmount: new Prisma.Decimal(0),
        },
      });
    }

    return tx.invoice.findUnique({ where: { id } });
  });
}
