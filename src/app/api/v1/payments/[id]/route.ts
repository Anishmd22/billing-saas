import { NextRequest, NextResponse } from 'next/server';
import { getPaymentById, updatePayment } from '@/modules/payments/repository';
import { updatePaymentSchema } from '@/modules/payments/validators';
import { ZodError } from 'zod';
import { validationError, serverError, notFound } from '@/lib/api-errors';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const payment = await getPaymentById(id);
    if (!payment) return notFound('ERR_PAYMENT_NOT_FOUND', 'Payment not found');
    return NextResponse.json({ success: true, message: 'Payment fetched', data: payment });
  } catch (err) {
    console.error('[GET /api/v1/payments/:id]', err);
    return serverError();
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = updatePaymentSchema.parse(body);
    const payment = await updatePayment(id, validated);
    return NextResponse.json({ success: true, message: 'Payment updated', data: payment });
  } catch (err) {
    if (err instanceof ZodError) return validationError(err);
    const error = err as Error;
    if (error.message === 'ERR_PAYMENT_NOT_FOUND') {
      return notFound('ERR_PAYMENT_NOT_FOUND', 'Payment not found');
    }
    if (error.message?.includes('ERR_OVERPAYMENT')) {
      return NextResponse.json(
        { success: false, error: { code: 'ERR_OVERPAYMENT', message: 'Paid amount cannot exceed total amount' } },
        { status: 400 }
      );
    }
    console.error('[PUT /api/v1/payments/:id]', err);
    return serverError();
  }
}
