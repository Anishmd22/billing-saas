import { NextRequest, NextResponse } from 'next/server';
import { getAllInvoices, createInvoice } from '@/modules/billing/repository';
import { createInvoiceSchema } from '@/modules/billing/validators';
import { ZodError } from 'zod';
import { validationError, serverError } from '@/lib/api-errors';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? undefined;
    const search = searchParams.get('search') ?? undefined;
    const page = parseInt(searchParams.get('page') ?? '1', 10);

    const result = await getAllInvoices({ status, search, page });
    return NextResponse.json({ success: true, message: 'Invoices fetched', data: result });
  } catch (err) {
    console.error('[GET /api/v1/invoices]', err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createInvoiceSchema.parse(body);
    const invoice = await createInvoice(validated);
    return NextResponse.json({ success: true, message: 'Invoice created', data: invoice }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return validationError(err);
    const error = err as Error & { productName?: string; productId?: string };
    if (error.message === 'ERR_INSUFFICIENT_STOCK') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ERR_INSUFFICIENT_STOCK',
            message: `Insufficient stock for: ${error.productName ?? 'unknown product'}`,
          },
        },
        { status: 400 }
      );
    }
    if (error.message === 'ERR_PRODUCT_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { code: 'ERR_PRODUCT_NOT_FOUND', message: 'One or more products not found' } },
        { status: 404 }
      );
    }
    console.error('[POST /api/v1/invoices]', err);
    return NextResponse.json(
      { success: false, error: { code: 'ERR_TX_FAILED', message: 'Invoice creation failed' } },
      { status: 500 }
    );
  }
}
