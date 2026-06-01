'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, Download, MessageCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { invoicesApi, paymentsApi, type InvoiceDetail } from '@/lib/api-client';
import { useAppStore } from '@/core/store/useAppStore';
import { formatCurrency, numberToWords } from '@/core/utils/currency';
import StatusBadge from '@/components/shared/StatusBadge';
import CurrencyDisplay from '@/components/shared/CurrencyDisplay';
import ConfirmModal from '@/components/shared/ConfirmModal';
import UpdatePaymentModal from '@/components/payments/UpdatePaymentModal';
import type { BadgeStatus } from '@/components/shared/StatusBadge';

interface InvoiceViewScreenProps {
  invoiceId: string;
}

export default function InvoiceViewScreen({ invoiceId }: InvoiceViewScreenProps) {
  const router = useRouter();
  const settings = useAppStore((s) => s.settings);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    invoicesApi
      .get(invoiceId)
      .then(setInvoice)
      .catch(() => toast.error('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  async function handleCancel() {
    if (!invoice) return;
    setCancelling(true);
    try {
      await invoicesApi.cancel(invoice.id);
      toast.success('Invoice cancelled');
      setCancelOpen(false);
      const updated = await invoicesApi.get(invoiceId);
      setInvoice(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  }

  function handlePrint() { window.print(); }

  function handleDownloadPDF() {
    if (!invoice) return;
    const params = new URLSearchParams({ invoiceId: invoice.id });
    if (settings.companyName) params.set('cName', settings.companyName);
    if (settings.companyAddress) params.set('cAddr', settings.companyAddress);
    if (settings.companyGST) params.set('cGST', settings.companyGST);
    if (settings.companyPhone) params.set('cPhone', settings.companyPhone);
    if (settings.bankName) params.set('bName', settings.bankName);
    if (settings.bankAccount) params.set('bAcc', settings.bankAccount);
    if (settings.bankIFSC) params.set('bIFSC', settings.bankIFSC);
    window.open(`/api/v1/pdf?${params}`, '_blank');
  }

  function handleWhatsApp() {
    if (!invoice) return;
    const text = encodeURIComponent(
      `Invoice ${invoice.invoiceNumber} — ${invoice.client.companyName}\nAmount: ${formatCurrency(invoice.totalAmount)}\nDate: ${format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  const paymentStatus = invoice?.payment?.paymentStatus as BadgeStatus | undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-[var(--color-muted)]">Loading invoice…</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-base font-semibold text-[var(--color-text)] mb-2">Invoice not found</p>
        <button
          onClick={() => router.push('/billing/history')}
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          Back to Previous Bills
        </button>
      </div>
    );
  }

  const isIntrastate = invoice.cgstAmount > 0 || invoice.sgstAmount > 0;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] mb-6">
        <button onClick={() => router.push('/billing/history')} className="hover:text-[var(--color-accent)] transition-colors">
          Previous Bills
        </button>
        <span>/</span>
        <span className="font-mono text-[var(--color-text)]">{invoice.invoiceNumber}</span>
      </div>

      <div className="flex gap-6 items-start">
        {/* Invoice Preview — 65% */}
        <div className="flex-1 min-w-0">
          <div
            id="invoice-print-area"
            className="bg-white rounded-xl border border-[var(--color-border)] p-8 text-sm"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-[var(--color-border)]">
              <div>
                <p className="text-lg font-bold text-[var(--color-text)]">TAX INVOICE</p>
                <p className="font-mono text-base font-semibold mt-1">{invoice.invoiceNumber}</p>
                <p className="text-[var(--color-muted)] mt-0.5">
                  Date: {format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}
                </p>
                {invoice.payment?.dueDate && (
                  <p className="text-[var(--color-muted)]">
                    Due: {format(new Date(invoice.payment.dueDate), 'dd MMM yyyy')}
                  </p>
                )}
              </div>
              <div className="text-right">
                {invoice.status !== 'GENERATED' && (
                  <StatusBadge status={invoice.status as BadgeStatus} />
                )}
                {paymentStatus && invoice.status === 'GENERATED' && (
                  <StatusBadge status={paymentStatus} />
                )}
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-2">Bill To</p>
              <p className="font-semibold text-[var(--color-text)]">{invoice.client.companyName}</p>
              {invoice.client.gstNumber && (
                <p className="font-mono text-xs text-[var(--color-muted)]">GST: {invoice.client.gstNumber}</p>
              )}
              {invoice.client.address && (
                <p className="text-[var(--color-muted)] mt-0.5 leading-relaxed">{invoice.client.address}</p>
              )}
              {invoice.client.phone && (
                <p className="text-[var(--color-muted)]">{invoice.client.phone}</p>
              )}
            </div>

            {/* Line Items */}
            <table className="w-full mb-6 text-sm">
              <thead>
                <tr className="border-b-2 border-[var(--color-border)]">
                  <th className="pb-2 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">#</th>
                  <th className="pb-2 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Description</th>
                  <th className="pb-2 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">HSN</th>
                  <th className="pb-2 text-right text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Qty</th>
                  <th className="pb-2 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Unit</th>
                  <th className="pb-2 text-right text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Rate</th>
                  <th className="pb-2 text-right text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">GST%</th>
                  <th className="pb-2 text-right text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-[var(--color-surface-hover)]">
                    <td className="py-2 text-[var(--color-muted)]">{idx + 1}</td>
                    <td className="py-2 font-medium">{item.productName}</td>
                    <td className="py-2 font-mono text-xs">{item.hsnCode ?? '—'}</td>
                    <td className="py-2 text-right font-mono">{item.quantity}</td>
                    <td className="py-2">{item.unit}</td>
                    <td className="py-2 text-right font-mono">{formatCurrency(item.rate)}</td>
                    <td className="py-2 text-right">{item.gstPercentage}%</td>
                    <td className="py-2 text-right font-mono font-semibold">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tax summary */}
            <div className="flex justify-end mb-4">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Subtotal</span>
                  <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {isIntrastate ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-cgst)]">CGST</span>
                      <span className="font-mono text-[var(--color-cgst)]">{formatCurrency(invoice.cgstAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-sgst)]">SGST</span>
                      <span className="font-mono text-[var(--color-sgst)]">{formatCurrency(invoice.sgstAmount)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-igst)]">IGST</span>
                    <span className="font-mono text-[var(--color-igst)]">{formatCurrency(invoice.igstAmount)}</span>
                  </div>
                )}
                <div className="border-t border-[var(--color-border)] pt-2 flex justify-between font-bold">
                  <span>Grand Total</span>
                  <span className="text-grand-total">{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[var(--color-muted)] italic">
              Amount in words: {numberToWords(invoice.totalAmount)}
            </p>

            {invoice.notes && (
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-[var(--color-text)]">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Sidebar — 35% */}
        <div className="w-72 shrink-0 space-y-3">
          {/* Print / Download / Share */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 space-y-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 w-full h-9 text-sm font-medium rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              <Printer className="size-4" /> Print Invoice
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 w-full h-9 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] transition-colors"
            >
              <Download className="size-4" /> Download PDF
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 w-full h-9 text-sm font-medium rounded-lg border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 transition-colors"
            >
              <MessageCircle className="size-4" /> Share on WhatsApp
            </button>
          </div>

          {/* Payment Status */}
          {invoice.payment && invoice.status !== 'CANCELLED' && (
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
              <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">
                Payment
              </p>
              <div className="space-y-1.5 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Total</span>
                  <CurrencyDisplay amount={invoice.payment.totalAmount} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">Paid</span>
                  <CurrencyDisplay amount={invoice.payment.paidAmount} size="sm" className="text-[var(--color-success)]" />
                </div>
                <div className="flex justify-between font-medium">
                  <span>Pending</span>
                  <CurrencyDisplay amount={invoice.payment.pendingAmount} size="sm" className="text-[var(--color-danger)]" />
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[var(--color-muted)]">Status</span>
                {paymentStatus && <StatusBadge status={paymentStatus} />}
              </div>
              <button
                onClick={() => setPaymentOpen(true)}
                className="w-full h-8 text-sm font-medium rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-secondary)] transition-colors"
              >
                Update Payment
              </button>
            </div>
          )}

          {/* Status indicators */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-muted)]">Inventory</span>
              <span className="text-[var(--color-success)] font-medium text-xs">✓ Updated</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-muted)]">Payment Record</span>
              <span className="text-[var(--color-success)] font-medium text-xs">✓ Created</span>
            </div>
          </div>

          {/* Danger zone */}
          {invoice.status !== 'CANCELLED' && (
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-4">
              <button
                onClick={() => setCancelOpen(true)}
                className="flex items-center justify-center gap-2 w-full h-9 text-sm font-medium rounded-lg text-[var(--color-danger)] border border-[var(--color-danger)]/30 hover:bg-[var(--color-danger-bg)] transition-colors"
              >
                <XCircle className="size-4" /> Cancel Invoice
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={cancelOpen}
        onOpenChange={(open) => !open && setCancelOpen(false)}
        title="Cancel Invoice"
        description={`Cancel invoice ${invoice.invoiceNumber}? This will restore inventory stock and mark the payment as cancelled. This cannot be undone.`}
        confirmLabel="Cancel Invoice"
        variant="danger"
        onConfirm={handleCancel}
        isLoading={cancelling}
      />

      {invoice.payment && (
        <UpdatePaymentModal
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          paymentId={invoice.payment.id}
          invoiceNumber={invoice.invoiceNumber}
          clientName={invoice.client.companyName}
          totalAmount={invoice.payment.totalAmount}
          currentPaid={invoice.payment.paidAmount}
          onSaved={async () => {
            const updated = await invoicesApi.get(invoiceId);
            setInvoice(updated);
          }}
        />
      )}
    </div>
  );
}
