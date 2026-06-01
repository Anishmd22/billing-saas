import { z } from 'zod';

export const updatePaymentSchema = z.object({
  paidAmount: z.coerce.number().min(0, 'Paid amount cannot be negative'),
  lastPaymentDate: z.string().optional(),
});

export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
