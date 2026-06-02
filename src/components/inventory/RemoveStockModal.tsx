'use client';

import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@base-ui/react/dialog';
import { z } from 'zod';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { productsApi, type ProductListItem } from '@/lib/api-client';
import { REMOVE_STOCK_REASONS, type RemoveStockReason } from '@/modules/inventory/validators';

const REASON_LABELS: Record<RemoveStockReason, string> = {
  DAMAGED: 'Damaged',
  EXPIRED: 'Expired',
  LOST: 'Lost',
  MANUAL_ADJUSTMENT: 'Manual Adjustment',
  SAMPLE_USAGE: 'Sample Usage',
  OTHER: 'Other',
};

const schema = z.object({
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  reason: z.enum(REMOVE_STOCK_REASONS, { error: 'Select a reason' }),
  remarks: z.string().max(500).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

const INPUT =
  'w-full h-9 px-3 text-sm border border-[var(--color-border-strong)] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)]/30 focus:border-[var(--color-danger)] transition-colors';
const LABEL = 'block text-xs font-medium text-[var(--color-muted)] mb-1';

interface RemoveStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductListItem | null;
  onSaved: () => void;
}

export default function RemoveStockModal({ open, onOpenChange, product, onSaved }: RemoveStockModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) as Resolver<FormValues> });

  useEffect(() => {
    if (open) reset({ quantity: undefined, reason: undefined, remarks: '' });
  }, [open, reset]);

  async function onSubmit(values: FormValues) {
    if (!product) return;
    try {
      await productsApi.removeStock({
        productId: product.id,
        quantity: values.quantity,
        reason: values.reason,
        remarks: values.remarks || undefined,
      });
      toast.success(`Removed ${values.quantity} ${product.unit} from ${product.productName}`);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove stock');
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(val) => onOpenChange(val)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white rounded-xl shadow-xl outline-none">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <Dialog.Title className="text-base font-semibold text-[var(--color-text)]">
              Remove Stock
            </Dialog.Title>
            <Dialog.Close className="flex items-center justify-center size-6 rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)] transition-colors">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {product && (
            <div className="px-6 pt-4 pb-2 bg-[var(--color-danger-bg)] border-b border-[var(--color-border)]">
              <p className="text-sm font-medium text-[var(--color-text)]">{product.productName}</p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Current stock:{' '}
                <span className="font-mono font-semibold text-[var(--color-danger)]">
                  {product.currentStock} {product.unit}
                </span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={LABEL}>Quantity to Remove *</label>
                <input
                  {...register('quantity')}
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={product?.currentStock}
                  className={`${INPUT} text-right font-mono`}
                  placeholder="0"
                />
                {errors.quantity && (
                  <p className="text-xs text-[var(--color-danger)] mt-1">{errors.quantity.message}</p>
                )}
              </div>

              <div>
                <label className={LABEL}>Reason *</label>
                <select {...register('reason')} className={INPUT}>
                  <option value="">— Select reason —</option>
                  {REMOVE_STOCK_REASONS.map((r) => (
                    <option key={r} value={r}>{REASON_LABELS[r]}</option>
                  ))}
                </select>
                {errors.reason && (
                  <p className="text-xs text-[var(--color-danger)] mt-1">{errors.reason.message}</p>
                )}
              </div>

              <div>
                <label className={LABEL}>Additional Remarks</label>
                <input
                  {...register('remarks')}
                  className={INPUT}
                  placeholder="Optional details…"
                />
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
                className="h-9 px-4 text-sm font-medium rounded-lg text-white bg-[var(--color-danger)] hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Removing…' : 'Remove Stock'}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
