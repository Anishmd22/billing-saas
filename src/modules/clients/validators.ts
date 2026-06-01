import { z } from 'zod';

export const createClientSchema = z.object({
  gstNumber: z
    .string()
    .max(20)
    .regex(/^[0-9A-Z]{15}$/, 'GST number must be 15 alphanumeric characters')
    .optional()
    .or(z.literal('')),
  companyName: z.string().min(1, 'Company name is required').max(255),
  address: z.string().max(1000).optional().or(z.literal('')),
  phone: z
    .string()
    .max(20)
    .regex(/^[0-9+\-\s()]*$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
