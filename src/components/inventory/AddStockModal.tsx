'use client';

import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@base-ui/react/dialog';
import { z } from 'zod';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { productsApi, type ProductListItem } from '@/lib/api-client';

const schema = z.object({
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  remarks: z.string().max(500).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

const INPUT =
  'w-full h-9 px-3 text-sm border border-[var(--color-border-strong)] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-colors';
const LABEL = 'block text-xs font-medium text-[var(--color-muted)] mb-1';

interface AddStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductListItem | null;
  onSaved: () => void;
}

export default function AddStockModal({ open, onOpenChange, product, onSaved }: AddStockModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) as Resolver<FormValues> });

  useEffect(() => {
    if (open) reset({ quantity: undefined, remarks: '' });
  }, [open, reset]);

  async function onSubmit(values: FormValues) {
    if (!product) return;
    try {
      await productsApi.addStock({
        productId: product.id,
        quantity: values.quantity,
        remarks: values.remarks || undefined,
      });
      toast.success(`Added ${values.quantity} ${product.unit} to ${product.productName}`);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add stock');
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(val) => onOpenChange(val)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white rounded-xl shadow-xl outline-none">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <Dialog.Title className="text-base font-semibold text-[var(--color-text)]">
              Add Stock
            </Dialog.Title>
            <Dialog.Close className="flex items-center justify-center size-6 rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)] transition-colors">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          {product && (
            <div className="px-6 pt-4 pb-2 bg-[var(--color-surface-secondary)] border-b border-[var(--color-border)]">
              <p className="text-sm font-medium text-[var(--color-text)]">{product.productName}</p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Current stock:{' '}
                <span className="font-mono font-semibold">
                  {product.currentStock} {product.unit}
                </span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={LABEL}>Quantity to Add *</label>
                <input
                  {...register('quantity')}
                  type="number"
                  min="0.01"
                  step="0.01"
                  className={`${INPUT} text-right font-mono`}
                  placeholder="0"
                />
                {errors.quantity && (
                  <p className="text-xs text-[var(--color-danger)] mt-1">{errors.quantity.message}</p>
                )}
              </div>

              <div>
                <label className={LABEL}>Remarks</label>
                <input
                  {...register('remarks')}
                  className={INPUT}
                  placeholder="Purchase order, adjustment reason…"
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
                className="h-9 px-4 text-sm font-medium rounded-lg text-white bg-[var(--color-success)] hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Adding…' : 'Add Stock'}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
