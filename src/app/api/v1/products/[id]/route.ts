import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct } from '@/modules/inventory/repository';
import { updateProductSchema } from '@/modules/inventory/validators';
import { ZodError } from 'zod';
import { validationError, serverError, notFound } from '@/lib/api-errors';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) return notFound('ERR_PRODUCT_NOT_FOUND', 'Product not found');
    return NextResponse.json({ success: true, message: 'Product fetched', data: product });
  } catch (err) {
    console.error('[GET /api/v1/products/:id]', err);
    return serverError();
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = updateProductSchema.parse(body);
    const product = await updateProduct(id, validated);
    return NextResponse.json({ success: true, message: 'Product updated', data: product });
  } catch (err) {
    if (err instanceof ZodError) return validationError(err);
    console.error('[PUT /api/v1/products/:id]', err);
    return serverError();
  }
}
