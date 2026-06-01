// Application-wide constants

// -----------------------------------------------------------------
// GST Rate options for billing forms
// -----------------------------------------------------------------
export const GST_RATES = [0, 5, 12, 18, 28] as const;
export type GSTRate = (typeof GST_RATES)[number];

// -----------------------------------------------------------------
// Product unit options - selectable in billing and inventory forms
// -----------------------------------------------------------------
export const PRODUCT_UNITS = ['Pcs', 'Kg', 'Ltr', 'Mtr', 'Box', 'Set', 'Nos'] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

// -----------------------------------------------------------------
// Invoice status labels and colours
// -----------------------------------------------------------------
export const INVOICE_STATUS_LABELS = {
  DRAFT: 'Draft',
  GENERATED: 'Generated',
  CANCELLED: 'Cancelled',
} as const;

// -----------------------------------------------------------------
// Payment status labels and colours
// -----------------------------------------------------------------
export const PAYMENT_STATUS_LABELS = {
  PENDING: 'Pending',
  PARTIAL: 'Partial',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
} as const;

// -----------------------------------------------------------------
// Inventory movement type labels
// -----------------------------------------------------------------
export const MOVEMENT_TYPE_LABELS = {
  STOCK_ADD: 'Stock Added',
  STOCK_REDUCE: 'Stock Reduced',
  SALE: 'Invoice Sale',
  ADJUSTMENT: 'Adjustment',
  INVOICE_CANCELLED: 'Invoice Cancelled',
} as const;

// -----------------------------------------------------------------
// Indian states list (for GST state selector in Settings)
// -----------------------------------------------------------------
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;
export type IndianState = (typeof INDIAN_STATES)[number];

// -----------------------------------------------------------------
// Default application settings
// -----------------------------------------------------------------
export const DEFAULT_SETTINGS = {
  invoicePrefix: process.env.NEXT_PUBLIC_DEFAULT_INVOICE_PREFIX ?? 'INV-',
  dueDays: parseInt(process.env.NEXT_PUBLIC_DEFAULT_DUE_DAYS ?? '30', 10),
  supplierState: process.env.NEXT_PUBLIC_SUPPLIER_STATE ?? '',
};

// -----------------------------------------------------------------
// Inventory thresholds
// -----------------------------------------------------------------
export const LOW_STOCK_THRESHOLD = parseInt(process.env.LOW_STOCK_THRESHOLD ?? '50', 10);

// -----------------------------------------------------------------
// Pagination defaults
// -----------------------------------------------------------------
export const PAGE_SIZE = 20;

// -----------------------------------------------------------------
// API base path
// -----------------------------------------------------------------
export const API_BASE = '/api/v1';
