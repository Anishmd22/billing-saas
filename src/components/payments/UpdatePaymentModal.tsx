'use client';

import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@base-ui/react/dialog';
import { z } from 'zod';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { paymentsApi } from '@/lib/api-client';
import { formatCurrency } from '@/core/utils/currency';

const schema = z.object({
  paidAmount: z.coerce.number().min(0, 'Amount cannot be negative'),
  lastPaymentDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const INPUT =
  'w-full h-9 px-3 text-sm border border-[var(--color-border-strong)] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-colors';
const LABEL = 'block text-xs font-medium text-[var(--color-muted)] mb-1';

interface UpdatePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: string;
  invoiceNumber: string;
  clientName: string;
  totalAmount: number;
  currentPaid: number;
  onSaved: () => void | Promise<void>;
}

export default function UpdatePaymentModal({
  open,
  onOpenChange,
  paymentId,
  invoiceNumber,
  clientName,
  totalAmount,
  currentPaid,
  onSaved,
}: UpdatePaymentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) as Resolver<FormValues> });

  useEffect(() => {
    if (open) {
      reset({
        paidAmount: currentPaid,
        lastPaymentDate: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [open, currentPaid, reset]);

  const paidAmount = Number(watch('paidAmount')) || 0;
  const pendingAfter = Math.max(0, totalAmount - paidAmount);

  async function onSubmit(values: FormValues) {
    try {
      await paymentsApi.update(paymentId, {
        paidAmount: values.paidAmount,
        lastPaymentDate: values.lastPaymentDate,
      });
      toast.success('Payment updated');
      await onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update payment');
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(val) => onOpenChange(val)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-xl shadow-xl outline-none">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <Dialog.Title className="text-base font-semibold text-[var(--color-text)]">
              Update Payment
            </Dialog.Title>
            <Dialog.Close className="flex items-center justify-center size-6 rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)] transition-colors">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {/* Invoice info */}
          <div className="px-6 py-3 bg-[var(--color-surface-secondary)] border-b border-[var(--color-border)] text-sm">
            <p className="font-medium text-[var(--color-text)]">{clientName}</p>
            <p className="text-[var(--color-muted)] text-xs mt-0.5">
              Invoice: <span className="font-mono">{invoiceNumber}</span> · Total:{' '}
              <span className="font-mono font-semibold">{formatCurrency(totalAmount)}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={LABEL}>Amount Paid (₹) *</label>
                <input
                  {...register('paidAmount')}
                  type="number"
                  min="0"
                  step="0.01"
                  max={totalAmount}
                  className={`${INPUT} text-right font-mono`}
                />
                {errors.paidAmount && (
                  <p className="text-xs text-[var(--color-danger)] mt-1">{errors.paidAmount.message}</p>
                )}
              </div>

              <div>
                <label className={LABEL}>Payment Date</label>
                <input {...register('lastPaymentDate')} type="date" className={INPUT} />
              </div>

              {/* Preview */}
              <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3 text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Paid after update</span>
                  <span className={`font-mono font-semibold ${paidAmount >= totalAmount ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'}`}>
                    {formatCurrency(paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Pending after update</span>
                  <span className={`font-mono font-semibold ${pendingAfter > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                    {formatCurrency(pendingAfter)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">New status</span>
                  <span className="font-medium text-xs">
                    {paidAmount <= 0 ? 'Pending' : paidAmount >= totalAmount ? 'Paid' : 'Partial'}
                  </span>
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
                {isSubmitting ? 'Saving…' : 'Save Payment'}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
