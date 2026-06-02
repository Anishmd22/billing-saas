// Typed client-side API wrapper for all /api/v1/* endpoints
import type { DashboardStats } from '@/core/types';

const BASE = '/api/v1';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message ?? 'Request failed');
  }
  return json.data as T;
}

// ---------------------------------------------------------------------------
// Extended response types (include nested relations returned by the API)
// ---------------------------------------------------------------------------

export interface ClientListItem {
  id: string;
  gstNumber: string | null;
  companyName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { invoices: number };
}

export interface ClientDetail extends Omit<ClientListItem, '_count'> {
  invoices: InvoiceListItem[];
}

export interface ProductListItem {
  id: string;
  productName: string;
  hsnCode: string | null;
  unit: string;
  currentStock: number;
  sellingPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface MovementListItem {
  id: string;
  productId: string;
  product: { id: string; productName: string; unit: string };
  invoiceId: string | null;
  movementType: string;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  remarks: string | null;
  createdAt: string;
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  clientId: string;
  invoiceDate: string;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  status: 'DRAFT' | 'GENERATED' | 'CANCELLED';
  notes: string | null;
  createdAt: string;
  client: { id: string; companyName: string; gstNumber: string | null };
  payment: { paymentStatus: string; pendingAmount: number } | null;
  _count: { items: number };
}

export interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  clientId: string;
  invoiceDate: string;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  status: 'DRAFT' | 'GENERATED' | 'CANCELLED';
  notes: string | null;
  createdAt: string;
  client: {
    id: string;
    companyName: string;
    gstNumber: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
  };
  items: {
    id: string;
    productName: string;
    hsnCode: string | null;
    quantity: number;
    unit: string;
    rate: number;
    gstPercentage: number;
    lineTotal: number;
  }[];
  payment: {
    id: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    paymentStatus: string;
    dueDate: string | null;
    lastPaymentDate: string | null;
  } | null;
}

export interface PaymentListItem {
  id: string;
  invoiceId: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: string;
  dueDate: string | null;
  lastPaymentDate: string | null;
  createdAt: string;
  updatedAt: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    client: { id: string; companyName: string; phone: string | null };
  };
}

export interface InvoiceListResult {
  invoices: InvoiceListItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ---------------------------------------------------------------------------
// API modules
// ---------------------------------------------------------------------------

export const clientsApi = {
  list: () => req<ClientListItem[]>('/clients'),
  getById: (id: string) => req<ClientDetail>(`/clients/${id}`),
  getByGST: (gst: string) => req<ClientListItem>(`/clients?gst=${encodeURIComponent(gst)}`),
  create: (data: Record<string, unknown>) =>
    req<ClientListItem>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    req<ClientListItem>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => req<ClientListItem>(`/clients/${id}`, { method: 'DELETE' }),
};

export const productsApi = {
  list: () => req<ProductListItem[]>('/products'),
  create: (data: Record<string, unknown>) =>
    req<ProductListItem>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    req<ProductListItem>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  movements: () => req<MovementListItem[]>('/inventory/movements'),
  addStock: (data: { productId: string; quantity: number; remarks?: string }) =>
    req<MovementListItem>('/inventory/movements', { method: 'POST', body: JSON.stringify(data) }),
  removeStock: (data: { productId: string; quantity: number; reason: string; remarks?: string }) =>
    req<MovementListItem>('/inventory/movements', { method: 'POST', body: JSON.stringify(data) }),
};

export const invoicesApi = {
  list: (params?: { status?: string; search?: string; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', String(params.page));
    const query = qs.size ? `?${qs}` : '';
    return req<InvoiceListResult>(`/invoices${query}`);
  },
  get: (id: string) => req<InvoiceDetail>(`/invoices/${id}`),
  create: (data: Record<string, unknown>) =>
    req<InvoiceDetail>('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  cancel: (id: string) =>
    req<InvoiceDetail>(`/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'cancel' }),
    }),
};

export const paymentsApi = {
  list: (params?: { status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    const query = qs.size ? `?${qs}` : '';
    return req<PaymentListItem[]>(`/payments${query}`);
  },
  update: (id: string, data: { paidAmount: number; lastPaymentDate?: string }) =>
    req<PaymentListItem>(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const dashboardApi = {
  stats: () => req<DashboardStats>('/dashboard'),
};
