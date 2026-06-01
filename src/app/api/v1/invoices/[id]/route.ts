import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, cancelInvoice } from '@/modules/billing/repository';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const invoice = await getInvoiceById(id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: { code: 'ERR_INVOICE_NOT_FOUND', message: 'Invoice not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'Invoice fetched', data: invoice });
  } catch (err) {
    console.error('[GET /api/v1/invoices/:id]', err);
    return NextResponse.json(
      { success: false, error: { code: 'ERR_SERVER', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body as { action: string };

    if (action === 'cancel') {
      const invoice = await cancelInvoice(id);
      return NextResponse.json({ success: true, message: 'Invoice cancelled', data: invoice });
    }

    return NextResponse.json(
      { success: false, error: { code: 'ERR_INVALID_ACTION', message: 'Unknown action' } },
      { status: 400 }
    );
  } catch (err) {
    const error = err as Error;
    if (error.message === 'ERR_INVOICE_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { code: 'ERR_INVOICE_NOT_FOUND', message: 'Invoice not found' } },
        { status: 404 }
      );
    }
    if (error.message === 'ERR_ALREADY_CANCELLED') {
      return NextResponse.json(
        { success: false, error: { code: 'ERR_ALREADY_CANCELLED', message: 'Invoice is already cancelled' } },
        { status: 409 }
      );
    }
    console.error('[PATCH /api/v1/invoices/:id]', err);
    return NextResponse.json(
      { success: false, error: { code: 'ERR_TX_FAILED', message: 'Operation failed' } },
      { status: 500 }
    );
  }
}
