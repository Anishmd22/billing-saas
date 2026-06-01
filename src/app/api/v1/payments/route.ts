import { NextRequest, NextResponse } from 'next/server';
import { getAllPayments } from '@/modules/payments/repository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? undefined;
    const search = searchParams.get('search') ?? undefined;

    const payments = await getAllPayments({ status, search });
    return NextResponse.json({ success: true, message: 'Payments fetched', data: payments });
  } catch (err) {
    console.error('[GET /api/v1/payments]', err);
    return NextResponse.json(
      { success: false, error: { code: 'ERR_SERVER', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
