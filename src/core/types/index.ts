// Global TypeScript type definitions for Billio
import type { InvoiceStatus, PaymentStatus, MovementType } from '@prisma/client';

// Re-export Prisma enums for convenience
export type { InvoiceStatus, PaymentStatus, MovementType };

// -----------------------------------------------------------------
// API Response wrapper
// -----------------------------------------------------------------
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// -----------------------------------------------------------------
// Client types
// -----------------------------------------------------------------
export interface ClientData {
  id: string;
  gstNumber: string | null;
  companyName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientInput {
  gstNumber?: string;
  companyName: string;
  address?: string;
  phone?: string;
  email?: string;
}

// -----------------------------------------------------------------
// Product types
// -----------------------------------------------------------------
export interface ProductData {
  id: string;
  productName: string;
  hsnCode: string | null;
  unit: string;
  currentStock: number;
  sellingPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  productName: string;
  hsnCode?: string;
  unit: string;
  currentStock: number;
  sellingPrice: number;
}

// -----------------------------------------------------------------
// Invoice line item types
// -----------------------------------------------------------------
export interface InvoiceItemInput {
  productId?: string;
  productName: string;
  hsnCode?: string;
  quantity: number;
  unit: string;
  rate: number;
  gstPercentage: number;
}

export interface InvoiceItemData extends InvoiceItemInput {
  id: string;
  invoiceId: string;
  lineTotal: number;
  createdAt: string;
}

// -----------------------------------------------------------------
// Invoice types
// -----------------------------------------------------------------
export interface CreateInvoiceInput {
  clientId: string;
  invoiceDate: string;
  notes?: string;
  items: InvoiceItemInput[];
  supplierState: string;
  customerState: string;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client: ClientData;
  invoiceDate: string;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes: string | null;
  items: InvoiceItemData[];
  payment: PaymentData | null;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------
// Payment types
// -----------------------------------------------------------------
export interface PaymentData {
  id: string;
  invoiceId: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: PaymentStatus;
  dueDate: string | null;
  lastPaymentDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePaymentInput {
  paidAmount: number;
  lastPaymentDate?: string;
}

// -----------------------------------------------------------------
// Inventory movement types
// -----------------------------------------------------------------
export interface InventoryMovementData {
  id: string;
  productId: string;
  product: Pick<ProductData, 'id' | 'productName' | 'unit'>;
  invoiceId: string | null;
  movementType: MovementType;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  remarks: string | null;
  createdAt: string;
}

export interface AddStockInput {
  productId: string;
  quantity: number;
  remarks?: string;
}

// -----------------------------------------------------------------
// Dashboard summary types
// -----------------------------------------------------------------
export interface DashboardStats {
  todayBillsCount: number;
  todayBillsTotal: number;
  pendingPaymentsTotal: number;
  pendingPaymentsCount: number;
  lowStockCount: number;
  thisMonthRevenue: number;
}
