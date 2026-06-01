'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@base-ui/react/dialog';
import { z } from 'zod';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { clientsApi, type ClientListItem } from '@/lib/api-client';

const schema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(255),
  gstNumber: z
    .string()
    .max(20)
    .regex(/^[0-9A-Z]{15}$/, 'GST must be 15 alphanumeric characters')
    .optional()
    .or(z.literal('')),
  address: z.string().max(1000).optional().or(z.literal('')),
  phone: z
    .string()
    .max(20)
    .regex(/^[0-9+\-\s()]*$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

const INPUT =
  'w-full h-9 px-3 text-sm border border-[var(--color-border-strong)] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-colors';

const LABEL = 'block text-xs font-medium text-[var(--color-muted)] mb-1';

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientListItem | null;
  onSaved: () => void;
}

export default function ClientModal({ open, onOpenChange, client, onSaved }: ClientModalProps) {
  const isEdit = !!client;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset(
        client
          ? {
              companyName: client.companyName,
              gstNumber: client.gstNumber ?? '',
              address: client.address ?? '',
              phone: client.phone ?? '',
              email: client.email ?? '',
            }
          : { companyName: '', gstNumber: '', address: '', phone: '', email: '' }
      );
    }
  }, [open, client, reset]);

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit && client) {
        await clientsApi.update(client.id, values);
        toast.success('Client updated');
      } else {
        await clientsApi.create(values);
        toast.success('Client added');
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save client');
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(val) => onOpenChange(val)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-xl shadow-xl outline-none">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <Dialog.Title className="text-base font-semibold text-[var(--color-text)]">
              {isEdit ? 'Edit Client' : 'Add Client'}
            </Dialog.Title>
            <Dialog.Close className="flex items-center justify-center size-6 rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)] transition-colors">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={LABEL}>Company Name *</label>
                <input {...register('companyName')} className={INPUT} placeholder="ABC Industries Pvt Ltd" />
                {errors.companyName && (
                  <p className="text-xs text-[var(--color-danger)] mt-1">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label className={LABEL}>GST Number</label>
                <input
                  {...register('gstNumber')}
                  className={`${INPUT} font-mono uppercase`}
                  placeholder="29ABCDE1234F1Z5"
                  maxLength={15}
                />
                {errors.gstNumber && (
                  <p className="text-xs text-[var(--color-danger)] mt-1">{errors.gstNumber.message}</p>
                )}
              </div>

              <div>
                <label className={LABEL}>Address</label>
                <textarea
                  {...register('address')}
                  rows={2}
                  className={`${INPUT} h-auto py-2 resize-none`}
                  placeholder="123 Industrial Area, City"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Phone</label>
                  <input {...register('phone')} className={INPUT} placeholder="+91 98765 43210" />
                  {errors.phone && (
                    <p className="text-xs text-[var(--color-danger)] mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className={LABEL}>Email</label>
                  <input {...register('email')} className={INPUT} placeholder="billing@company.com" />
                  {errors.email && (
                    <p className="text-xs text-[var(--color-danger)] mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t border-[var(--color-border)]">
              <Dialog.Close
                className="h-9 px-4 text-sm font-medium border border-[var(--color-border)] rounded-lg bg-white hover:bg-[var(--color-surface-secondary)] transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-9 px-4 text-sm font-medium rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Client'}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
