import prisma from '@/lib/prisma';
import type { CreateClientInput, UpdateClientInput } from './validators';

export async function getAllClients() {
  return prisma.client.findMany({
    orderBy: { companyName: 'asc' },
    include: {
      _count: { select: { invoices: true } },
    },
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      invoices: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { payment: true },
      },
    },
  });
}

export async function getClientByGST(gstNumber: string) {
  return prisma.client.findUnique({
    where: { gstNumber },
  });
}

export async function createClient(data: CreateClientInput) {
  return prisma.client.create({
    data: {
      gstNumber: data.gstNumber || null,
      companyName: data.companyName,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
    },
  });
}

export async function updateClient(id: string, data: UpdateClientInput) {
  return prisma.client.update({
    where: { id },
    data: {
      ...(data.gstNumber !== undefined && { gstNumber: data.gstNumber || null }),
      ...(data.companyName !== undefined && { companyName: data.companyName }),
      ...(data.address !== undefined && { address: data.address || null }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.email !== undefined && { email: data.email || null }),
    },
  });
}

export async function deleteClient(id: string) {
  return prisma.client.delete({ where: { id } });
}
