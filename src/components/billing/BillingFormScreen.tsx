'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { clientsApi, invoicesApi, type ClientListItem } from '@/lib/api-client';
import { useAppStore } from '@/core/store/useAppStore';
import { GST_RATES, PRODUCT_UNITS, INDIAN_STATES } from '@/core/constants';
import { calcInvoiceGST, getGSTType } from '@/core/utils/gst';
import { formatCurrency, numberToWords } from '@/core/utils/currency';

// ─── Form schema ────────────────────────────────────────────────────────────
const itemSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  hsnCode: z.string().optional(),
  quantity: z.coerce.number().positive('Qty > 0'),
  unit: z.enum(PRODUCT_UNITS),
  rate: z.coerce.number().positive('Rate > 0'),
  gstPercentage: z.coerce.number().refine(
    (v) => (GST_RATES as readonly number[]).includes(v),
    'Select a GST rate'
  ),
});

const formSchema = z.object({
  clientId: z.string().uuid('Please select a client'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  customerState: z.string().min(1, 'Customer state is required'),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Add at least one item'),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Shared CSS helpers ───────────────────────────────────────────────────
const INPUT =
  'w-full h-9 px-3 text-sm border border-[var(--color-border-strong)] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-colors';
const LABEL = 'block text-xs font-medium text-[var(--color-muted)] mb-1';
const INPUT_NUM = `${INPUT} text-right font-mono`;

// ─── Component ───────────────────────────────────────────────────────────
export default function BillingFormScreen() {
  const router = useRouter();
  const { settings } = useAppStore();
  const supplierState = settings.supplierState || 'Tamil Nadu';

  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientListItem | null>(null);
  const [gstQuery, setGstQuery] = useState('');
  const [gstStatus, setGstStatus] = useState<'idle' | 'found' | 'notfound'>('idle');

  useEffect(() => {
    clientsApi.list().then(setClients).catch(() => {});
  }, []);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      invoiceDate: format(new Date(), 'yyyy-MM-dd'),
      customerState: '',
      notes: '',
      items: [{ productName: '', hsnCode: '', quantity: 1, unit: 'Pcs', rate: 0, gstPercentage: 18 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // Watch items + states to compute live totals
  const watchedItems = useWatch({ control, name: 'items' });
  const watchedCustomerState = useWatch({ control, name: 'customerState' });

  const gstType = getGSTType(supplierState, watchedCustomerState ?? '');
  const lineItems = (watchedItems ?? []).map((item) => ({
    quantity: Number(item.quantity) || 0,
    rate: Number(item.rate) || 0,
    gstPercentage: Number(item.gstPercentage) || 0,
  }));
  const totals = calcInvoiceGST(lineItems, gstType);

  // GST lookup
  async function handleGSTFetch() {
    const gst = gstQuery.trim().toUpperCase();
    if (gst.length !== 15) { toast.error('Enter a valid 15-character GST number'); return; }
    try {
      const client = await clientsApi.getByGST(gst);
      setSelectedClient(client);
      setValue('clientId', client.id);
      setGstStatus('found');
    } catch {
      setGstStatus('notfound');
    }
  }

  // Client dropdown selection
  function handleClientSelect(id: string) {
    const client = clients.find((c) => c.id === id) ?? null;
    setSelectedClient(client);
    setValue('clientId', id);
    setGstStatus('idle');
  }

  async function onSubmit(values: FormValues) {
    try {
      const invoice = await invoicesApi.create({
        ...values,
        supplierState,
      });
      toast.success(`Invoice ${invoice.invoiceNumber} created`);
      router.push(`/billing/${invoice.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create invoice');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">New Invoice</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">Create a GST-compliant tax invoice</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column: main form */}
        <div className="col-span-2 space-y-6">

          {/* Section 1: Bill Header */}
          <section className="bg-white rounded-xl border border-[var(--color-border)] p-6">
            <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Bill Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={LABEL}>Invoice Number</label>
                <input
                  value="Auto-generated on save"
                  readOnly
                  className={`${INPUT} bg-[var(--color-surface-secondary)] text-[var(--color-muted)] cursor-not-allowed font-mono`}
                />
              </div>
              <div>
                <label className={LABEL}>Invoice Date *</label>
                <input
                  {...register('invoiceDate')}
                  type="date"
                  className={INPUT}
                />
                {errors.invoiceDate && (
                  <p className="text-xs text-[var(--color-danger)] mt-1">{errors.invoiceDate.message}</p>
                )}
              </div>
            </div>

            {/* GST Lookup */}
            <div className="mb-4">
              <label className={LABEL}>Customer GST Number (for auto-fill)</label>
              <div className="flex gap-2">
                <input
                  value={gstQuery}
                  onChange={(e) => { setGstQuery(e.target.value.toUpperCase()); setGstStatus('idle'); }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleGSTFetch())}
                  className={`${INPUT} flex-1 font-mono uppercase`}
                  placeholder="29ABCDE1234F1Z5"
                  maxLength={15}
                />
                <button
                  type="button"
                  onClick={handleGSTFetch}
                  className="flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)] transition-colors shrink-0"
                >
                  <Search className="size-4" /> Fetch
                </button>
              </div>
              {gstStatus === 'found' && (
                <p className="text-xs text-[var(--color-success)] mt-1">
                  ✓ Client found: {selectedClient?.companyName}
                </p>
              )}
              {gstStatus === 'notfound' && (
                <p className="text-xs text-[var(--color-warning)] mt-1">
                  Not found — select from dropdown below
                </p>
              )}
            </div>

            {/* Client selector */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Select Client *</label>
                <select
                  value={getValues('clientId') ?? ''}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className={INPUT}
                >
                  <option value="">— Choose client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="text-xs text-[var(--color-danger)] mt-1">{errors.clientId.message}</p>
                )}
                <input type="hidden" {...register('clientId')} />
              </div>

              <div>
                <label className={LABEL}>Customer State *</label>
                <select {...register('customerState')} className={INPUT}>
                  <option value="">— Select state —</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s.toUpperCase()}>{s}</option>
                  ))}
                </select>
                {errors.customerState && (
                  <p className="text-xs text-[var(--color-danger)] mt-1">{errors.customerState.message}</p>
                )}
              </div>
            </div>

            {selectedClient && (
              <div className="mt-3 p-3 rounded-lg bg-[var(--color-accent-bg)] text-sm">
                <p className="font-medium text-[var(--color-text)]">{selectedClient.companyName}</p>
                {selectedClient.gstNumber && (
                  <p className="font-mono text-xs text-[var(--color-muted)] mt-0.5">{selectedClient.gstNumber}</p>
                )}
                {selectedClient.address && (
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">{selectedClient.address}</p>
                )}
              </div>
            )}
          </section>

          {/* Section 2: Line Items */}
          <section className="bg-white rounded-xl border border-[var(--color-border)]">
            <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Product Line Items</h2>
              <button
                type="button"
                onClick={() => append({ productName: '', hsnCode: '', quantity: 1, unit: 'Pcs', rate: 0, gstPercentage: 18 })}
                className="flex items-center gap-1 h-7 px-2.5 text-xs font-medium rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)] transition-colors"
              >
                <Plus className="size-3" /> Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide w-8">#</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide min-w-[160px]">Product Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide w-24">HSN</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide w-20">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide w-20">Unit</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide w-24">Rate ₹</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide w-20">GST %</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide w-28">Amount</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, idx) => {
                    const item = watchedItems?.[idx];
                    const qty = Number(item?.quantity) || 0;
                    const rate = Number(item?.rate) || 0;
                    const gst = Number(item?.gstPercentage) || 0;
                    const lineTotal = qty * rate * (1 + gst / 100);
                    return (
                      <tr key={field.id} className="border-b border-[var(--color-surface-hover)]">
                        <td className="px-3 py-2 text-[var(--color-muted)] text-xs">{idx + 1}</td>
                        <td className="px-3 py-2">
                          <input
                            {...register(`items.${idx}.productName`)}
                            className="w-full h-8 px-2 text-sm border border-transparent rounded focus:border-[var(--color-accent)] focus:ring-0 focus:outline-none bg-transparent hover:bg-[var(--color-surface-secondary)] focus:bg-white transition-colors"
                            placeholder="Product description"
                          />
                          {errors.items?.[idx]?.productName && (
                            <p className="text-xs text-[var(--color-danger)]">{errors.items[idx].productName?.message}</p>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            {...register(`items.${idx}.hsnCode`)}
                            className="w-full h-8 px-2 text-sm font-mono border border-transparent rounded focus:border-[var(--color-accent)] focus:outline-none bg-transparent hover:bg-[var(--color-surface-secondary)] focus:bg-white transition-colors"
                            placeholder="HSN"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            {...register(`items.${idx}.quantity`)}
                            type="number"
                            step="0.01"
                            min="0.01"
                            className="w-full h-8 px-2 text-sm font-mono text-right border border-transparent rounded focus:border-[var(--color-accent)] focus:outline-none bg-transparent hover:bg-[var(--color-surface-secondary)] focus:bg-white transition-colors"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            {...register(`items.${idx}.unit`)}
                            className="w-full h-8 px-1 text-sm border border-transparent rounded focus:border-[var(--color-accent)] focus:outline-none bg-transparent hover:bg-[var(--color-surface-secondary)] focus:bg-white transition-colors"
                          >
                            {PRODUCT_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            {...register(`items.${idx}.rate`)}
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full h-8 px-2 text-sm font-mono text-right border border-transparent rounded focus:border-[var(--color-accent)] focus:outline-none bg-transparent hover:bg-[var(--color-surface-secondary)] focus:bg-white transition-colors"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            {...register(`items.${idx}.gstPercentage`)}
                            className="w-full h-8 px-1 text-sm border border-transparent rounded focus:border-[var(--color-accent)] focus:outline-none bg-transparent hover:bg-[var(--color-surface-secondary)] focus:bg-white transition-colors"
                          >
                            {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-sm text-[var(--color-text)]">
                          {lineTotal > 0 ? formatCurrency(lineTotal) : '—'}
                        </td>
                        <td className="px-2 py-2">
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="flex items-center justify-center size-6 rounded text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {errors.items?.root && (
              <p className="px-6 py-2 text-xs text-[var(--color-danger)]">{errors.items.root.message}</p>
            )}
          </section>

          {/* Notes */}
          <section className="bg-white rounded-xl border border-[var(--color-border)] p-6">
            <label className={LABEL}>Notes (optional)</label>
            <textarea
              {...register('notes')}
              rows={2}
              className={`${INPUT} h-auto py-2 resize-none`}
              placeholder="Payment terms, delivery info, etc."
            />
          </section>
        </div>

        {/* Right column: Totals + Actions */}
        <div className="space-y-4">
          {/* Supplier State indicator */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 text-sm">
            <p className="text-xs text-[var(--color-muted)] mb-1">Supplier State</p>
            <p className="font-medium">{supplierState}</p>
            {watchedCustomerState && (
              <>
                <p className="text-xs text-[var(--color-muted)] mt-2 mb-1">GST Type</p>
                <p className={`text-xs font-medium ${gstType === 'INTRASTATE' ? 'text-[var(--color-cgst)]' : 'text-[var(--color-igst)]'}`}>
                  {gstType === 'INTRASTATE' ? 'Intra-state (CGST + SGST)' : 'Inter-state (IGST)'}
                </p>
              </>
            )}
          </div>

          {/* Totals */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
            <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Invoice Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">Subtotal</span>
                <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
              </div>
              {gstType === 'INTRASTATE' ? (
                <>
                  {totals.cgstAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-cgst)]">CGST</span>
                      <span className="font-mono text-[var(--color-cgst)]">{formatCurrency(totals.cgstAmount)}</span>
                    </div>
                  )}
                  {totals.sgstAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-sgst)]">SGST</span>
                      <span className="font-mono text-[var(--color-sgst)]">{formatCurrency(totals.sgstAmount)}</span>
                    </div>
                  )}
                </>
              ) : (
                totals.igstAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-igst)]">IGST</span>
                    <span className="font-mono text-[var(--color-igst)]">{formatCurrency(totals.igstAmount)}</span>
                  </div>
                )
              )}
              <div className="border-t border-[var(--color-border)] pt-2 mt-2 flex justify-between font-semibold">
                <span>Grand Total</span>
                <span className="text-grand-total">{formatCurrency(totals.totalAmount)}</span>
              </div>
            </div>
            {totals.totalAmount > 0 && (
              <p className="text-[10px] text-[var(--color-muted)] mt-3 leading-relaxed italic">
                {numberToWords(totals.totalAmount)}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 text-sm font-medium rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Generating…' : 'Generate Invoice'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full h-10 text-sm font-medium rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
