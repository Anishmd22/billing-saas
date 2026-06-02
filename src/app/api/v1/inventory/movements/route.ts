import { NextRequest, NextResponse } from 'next/server';
import { getAllMovements, addStock, removeStock } from '@/modules/inventory/repository';
import { addStockSchema, removeStockSchema } from '@/modules/inventory/validators';
import { ZodError } from 'zod';
import { validationError, serverError, notFound } from '@/lib/api-errors';

export async function GET() {
  try {
    const movements = await getAllMovements();
    return NextResponse.json({ success: true, message: 'Movements fetched', data: movements });
  } catch (err) {
    console.error('[GET /api/v1/inventory/movements]', err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Route to removeStock when a reason field is present
    if (body.reason !== undefined) {
      const validated = removeStockSchema.parse(body);
      const product = await removeStock(validated);
      return NextResponse.json({ success: true, message: 'Stock removed successfully', data: product }, { status: 201 });
    }

    const validated = addStockSchema.parse(body);
    const product = await addStock(validated);
    return NextResponse.json({ success: true, message: 'Stock added successfully', data: product }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return validationError(err);
    const error = err as Error;
    if (error.message === 'ERR_PRODUCT_NOT_FOUND') {
      return notFound('ERR_PRODUCT_NOT_FOUND', 'Product not found');
    }
    if (error.message === 'ERR_INSUFFICIENT_STOCK') {
      return NextResponse.json(
        { success: false, error: { code: 'ERR_INSUFFICIENT_STOCK', message: 'Insufficient stock to remove that quantity' } },
        { status: 400 }
      );
    }
    console.error('[POST /api/v1/inventory/movements]', err);
    return serverError();
  }
}
