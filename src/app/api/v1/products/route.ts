import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, createProduct } from '@/modules/inventory/repository';
import { createProductSchema } from '@/modules/inventory/validators';
import { ZodError } from 'zod';
import { validationError, serverError } from '@/lib/api-errors';

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ success: true, message: 'Products fetched', data: products });
  } catch (err) {
    console.error('[GET /api/v1/products]', err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createProductSchema.parse(body);
    const product = await createProduct(validated);
    return NextResponse.json({ success: true, message: 'Product created', data: product }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return validationError(err);
    console.error('[POST /api/v1/products]', err);
    return serverError();
  }
}
