'use client';

import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@base-ui/react/dialog';
import { z } from 'zod';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { productsApi, type ProductListItem } from '@/lib/api-client';
import { PRODUCT_UNITS, GST_RATES } from '@/core/constants';

const schema = z.object({
  productName: z.string().min(1, 'Product name is required').max(255),
  hsnCode: z.string().max(50).optional().or(z.literal('')),
  unit: z.enum(PRODUCT_UNITS, { error: 'Select a valid unit' }),
  currentStock: z.coerce.number().min(0, 'Stock cannot be negative'),
  sellingPrice: z.coerce.number().min(0, 'Price cannot be negative'),
});

type FormValues = z.infer<typeof schema>;

const INPUT =
  'w-full h-9 px-3 text-sm border border-[var(--color-border-strong)] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-colors';
const LABEL = 'block text-xs font-medium text-[var(--color-muted)] mb-1';

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductListItem | null;
  onSaved: () => void;
}

export default function ProductModal({ open, onOpenChange, product, onSaved }: ProductModalProps) {
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) as Resolver<FormValues> });

  useEffect(() => {
    if (open) {
      reset(
        product
          ? {
              productName: product.productName,
              hsnCode: product.hsnCode ?? '',
              unit: product.unit as FormValues['unit'],
              currentStock: product.currentStock,
              sellingPrice: product.sellingPrice,
            }
          : { productName: '', hsnCode: '', unit: 'Pcs', currentStock: 0, sellingPrice: 0 }
      );
    }
  }, [open, product, reset]);

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit && product) {
        await productsApi.update(product.id, values);
        toast.success('Product updated');
      } else {
        await productsApi.create(values);
        toast.success('Product added');
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(val) => onOpenChange(val)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-xl shadow-xl outline-none">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <Dialog.Title className="text-base font-semibold text-[var(--color-text)]">
              {isEdit ? 'Edit Product' : 'Add Product'}
            </Dialog.Title>
            <Dialog.Close className="flex items-center justify-center size-6 rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)] transition-colors">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={LABEL}>Product Name *</label>
                <input {...register('productName')} className={INPUT} placeholder="Steel Pipe 25mm" />
                {errors.productName && (
                  <p className="text-xs text-[var(--color-danger)] mt-1">{errors.productName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>HSN Code</label>
                  <input {...register('hsnCode')} className={`${INPUT} font-mono`} placeholder="7304" />
                </div>
                <div>
                  <label className={LABEL}>Unit *</label>
                  <select {...register('unit')} className={INPUT}>
                    {PRODUCT_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  {errors.unit && (
                    <p className="text-xs text-[var(--color-danger)] mt-1">{errors.unit.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>{isEdit ? 'Current Stock' : 'Opening Stock'} *</label>
                  <input
                    {...register('currentStock')}
                    type="number"
                    min="0"
                    step="0.01"
                    className={`${INPUT} text-right font-mono`}
                  />
                  {errors.currentStock && (
                    <p className="text-xs text-[var(--color-danger)] mt-1">{errors.currentStock.message}</p>
                  )}
                </div>
                <div>
                  <label className={LABEL}>Selling Price (₹) *</label>
                  <input
                    {...register('sellingPrice')}
                    type="number"
                    min="0"
                    step="0.01"
                    className={`${INPUT} text-right font-mono`}
                  />
                  {errors.sellingPrice && (
                    <p className="text-xs text-[var(--color-danger)] mt-1">{errors.sellingPrice.message}</p>
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
                {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
