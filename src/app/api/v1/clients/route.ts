import { NextRequest, NextResponse } from 'next/server';
import { getAllClients, createClient, getClientByGST } from '@/modules/clients/repository';
import { createClientSchema } from '@/modules/clients/validators';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { validationError, serverError } from '@/lib/api-errors';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gst = searchParams.get('gst');

    if (gst) {
      const client = await getClientByGST(gst.toUpperCase());
      if (!client) {
        return NextResponse.json(
          { success: false, error: { code: 'ERR_CLIENT_NOT_FOUND', message: 'Client not found' } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, message: 'Client found', data: client });
    }

    const clients = await getAllClients();
    return NextResponse.json({ success: true, message: 'Clients fetched', data: clients });
  } catch (err) {
    console.error('[GET /api/v1/clients]', err);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createClientSchema.parse(body);
    const client = await createClient(validated);
    return NextResponse.json({ success: true, message: 'Client created', data: client }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) return validationError(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: { code: 'ERR_DUPLICATE_GST', message: 'A client with this GST number already exists' } },
        { status: 409 }
      );
    }
    console.error('[POST /api/v1/clients]', err);
    return serverError();
  }
}
