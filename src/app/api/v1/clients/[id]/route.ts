import { NextRequest, NextResponse } from 'next/server';
import { getClientById, updateClient, deleteClient } from '@/modules/clients/repository';
import { updateClientSchema } from '@/modules/clients/validators';
import { ZodError } from 'zod';
import { validationError, serverError, notFound } from '@/lib/api-errors';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const client = await getClientById(id);
    if (!client) return notFound('ERR_CLIENT_NOT_FOUND', 'Client not found');
    return NextResponse.json({ success: true, message: 'Client fetched', data: client });
  } catch (err) {
    console.error('[GET /api/v1/clients/:id]', err);
    return serverError();
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = updateClientSchema.parse(body);
    const client = await updateClient(id, validated);
    return NextResponse.json({ success: true, message: 'Client updated', data: client });
  } catch (err) {
    if (err instanceof ZodError) return validationError(err);
    console.error('[PUT /api/v1/clients/:id]', err);
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteClient(id);
    return NextResponse.json({ success: true, message: 'Client deleted', data: null });
  } catch (err) {
    console.error('[DELETE /api/v1/clients/:id]', err);
    return serverError();
  }
}
