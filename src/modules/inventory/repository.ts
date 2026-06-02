import prisma from '@/lib/prisma';
import type { CreateProductInput, UpdateProductInput, AddStockInput, RemoveStockInput } from './validators';
import { Prisma } from '@prisma/client';

export async function getAllProducts() {
  return prisma.product.findMany({
    orderBy: { productName: 'asc' },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      movements: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });
}

export async function createProduct(data: CreateProductInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        productName: data.productName,
        hsnCode: data.hsnCode || null,
        unit: data.unit,
        currentStock: new Prisma.Decimal(data.currentStock),
        sellingPrice: new Prisma.Decimal(data.sellingPrice),
      },
    });

    // Log initial stock as a STOCK_ADD movement
    if (data.currentStock > 0) {
      await tx.inventoryMovement.create({
        data: {
          productId: product.id,
          movementType: 'STOCK_ADD',
          quantityChange: new Prisma.Decimal(data.currentStock),
          stockBefore: new Prisma.Decimal(0),
          stockAfter: new Prisma.Decimal(data.currentStock),
          remarks: 'Opening stock',
        },
      });
    }

    return product;
  });
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  return prisma.product.update({
    where: { id },
    data: {
      ...(data.productName !== undefined && { productName: data.productName }),
      ...(data.hsnCode !== undefined && { hsnCode: data.hsnCode || null }),
      ...(data.unit !== undefined && { unit: data.unit }),
      ...(data.sellingPrice !== undefined && {
        sellingPrice: new Prisma.Decimal(data.sellingPrice),
      }),
    },
  });
}

export async function addStock(data: AddStockInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error('ERR_PRODUCT_NOT_FOUND');

    const stockBefore = Number(product.currentStock);
    const stockAfter = stockBefore + data.quantity;

    await tx.product.update({
      where: { id: data.productId },
      data: { currentStock: new Prisma.Decimal(stockAfter) },
    });

    await tx.inventoryMovement.create({
      data: {
        productId: data.productId,
        movementType: 'STOCK_ADD',
        quantityChange: new Prisma.Decimal(data.quantity),
        stockBefore: new Prisma.Decimal(stockBefore),
        stockAfter: new Prisma.Decimal(stockAfter),
        remarks: data.remarks || null,
      },
    });

    return tx.product.findUnique({ where: { id: data.productId } });
  });
}

export async function removeStock(data: RemoveStockInput) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error('ERR_PRODUCT_NOT_FOUND');

    const stockBefore = Number(product.currentStock);
    const stockAfter = stockBefore - data.quantity;

    if (stockAfter < 0) throw new Error('ERR_INSUFFICIENT_STOCK');

    await tx.product.update({
      where: { id: data.productId },
      data: { currentStock: new Prisma.Decimal(stockAfter) },
    });

    const remarkParts = [data.reason.replace(/_/g, ' ')];
    if (data.remarks) remarkParts.push(data.remarks);

    await tx.inventoryMovement.create({
      data: {
        productId: data.productId,
        movementType: 'STOCK_REDUCE',
        quantityChange: new Prisma.Decimal(-data.quantity),
        stockBefore: new Prisma.Decimal(stockBefore),
        stockAfter: new Prisma.Decimal(stockAfter),
        remarks: remarkParts.join(': '),
      },
    });

    return tx.product.findUnique({ where: { id: data.productId } });
  });
}

export async function getAllMovements() {
  return prisma.inventoryMovement.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { id: true, productName: true, unit: true } },
      invoice: { select: { id: true, invoiceNumber: true } },
    },
  });
}

export async function getMovementsByProduct(productId: string) {
  return prisma.inventoryMovement.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    include: {
      invoice: { select: { id: true, invoiceNumber: true } },
    },
  });
}
