import { z } from 'zod';
import { GST_RATES, PRODUCT_UNITS } from '@/core/constants';

const invoiceItemSchema = z.object({
  productId: z.string().min(1).optional(),
  productName: z.string().min(1, 'Product name is required').max(255),
  hsnCode: z.string().max(50).optional().or(z.literal('')),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unit: z.enum(PRODUCT_UNITS),
  rate: z.coerce.number().positive('Rate must be greater than 0'),
  gstPercentage: z.coerce.number().refine((v) => (GST_RATES as readonly number[]).includes(v), {
    message: 'GST percentage must be one of: 0, 5, 12, 18, 28',
  }),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Please select a valid client'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  notes: z.string().max(1000).optional().or(z.literal('')),
  supplierState: z.string().min(1, 'Supplier state is required'),
  customerState: z.string().min(1, 'Customer state is required'),
  items: z
    .array(invoiceItemSchema)
    .min(1, 'At least one product line item is required'),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
