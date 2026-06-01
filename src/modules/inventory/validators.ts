import { z } from 'zod';
import { PRODUCT_UNITS } from '@/core/constants';

export const createProductSchema = z.object({
  productName: z.string().min(1, 'Product name is required').max(255),
  hsnCode: z.string().max(50).optional().or(z.literal('')),
  unit: z.enum([...PRODUCT_UNITS], { error: 'Please select a valid unit' }),
  currentStock: z.coerce.number().min(0, 'Stock cannot be negative'),
  sellingPrice: z.coerce.number().min(0, 'Price cannot be negative'),
});

export const updateProductSchema = createProductSchema.partial().extend({
  currentStock: z.coerce.number().min(0).optional(),
  sellingPrice: z.coerce.number().min(0).optional(),
});

export const addStockSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  remarks: z.string().max(500).optional().or(z.literal('')),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AddStockInput = z.infer<typeof addStockSchema>;
