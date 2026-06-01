'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, XCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { invoicesApi, type InvoiceListItem } from '@/lib/api-client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import CurrencyDisplay from '@/components/shared/CurrencyDisplay';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmModal from '@/components/shared/ConfirmModal';
import type { BadgeStatus } from '@/components/shared/StatusBadge';

const STATUSES = ['ALL', 'GENERATED', 'PAID', 'PARTIAL', 'PENDING', 'CANCELLED'] as const;

export default function HistoryScreen() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [cancelTarget, setCancelTarget] = useState<InvoiceListItem | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(
    (p = 1) => {
      setLoading(true);
      invoicesApi
        .list({ status: statusFilter, search: search || undefined, page: p })
        .then((res) => {
          setInvoices(res.invoices);
          setTotalPages(Math.ceil(res.total / res.pageSize));
          setPage(p);
        })
        .catch(() => toast.error('Failed to load invoices'))
        .finally(() => setLoading(false));
    },
    [statusFilter, search]
  );

  useEffect(() => { load(1); }, [load]);

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await invoicesApi.cancel(cancelTarget.id);
      toast.success(`Invoice ${cancelTarget.invoiceNumber} cancelled`);
      setCancelTarget(null);
      load(page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel invoice');
    } finally {
      setCancelling(false);
    }
  }

  const paymentStatusBadge = (inv: InvoiceListItem): BadgeStatus => {
    if (inv.status === 'CANCELLED') return 'CANCELLED';
    return (inv.payment?.paymentStatus ?? 'PENDING') as BadgeStatus;
  };

  return (
    <div>
      <PageHeader
        title="Previous Bills"
        description="Invoice history and records"
        action={
          <button
            onClick={() => router.push('/billing/new')}
            className="flex items-center gap-1.5 h-9 px-4 text-sm font-medium rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            <Plus className="size-4" /> New Bill
          </button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search invoice no or client…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); }}
            className="w-full h-9 pl-9 pr-3 text-sm border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 text-sm border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-colors"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'ALL' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-muted)]">
          Loading invoices…
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description="Create your first invoice to see it here."
          action={
            <button
              onClick={() => router.push('/billing/new')}
              className="flex items-center gap-1.5 h-9 px-4 text-sm font-medium rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              <Plus className="size-4" /> New Bill
            </button>
          }
        />
      ) : (
        <>
          <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-white">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th className="text-right">Amount</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/billing/${inv.id}`)}
                  >
                    <td>
                      <span className="font-mono text-sm font-medium">{inv.invoiceNumber}</span>
                    </td>
                    <td className="font-medium">{inv.client.companyName}</td>
                    <td className="text-[var(--color-muted)] text-xs">
                      {format(new Date(inv.invoiceDate), 'dd MMM yyyy')}
                    </td>
                    <td className="text-[var(--color-muted)] text-xs">
                      {inv._count.items} item{inv._count.items !== 1 ? 's' : ''}
                    </td>
                    <td className="text-right">
                      <CurrencyDisplay amount={inv.totalAmount} size="sm" />
                    </td>
                    <td>
                      <StatusBadge status={paymentStatusBadge(inv)} />
                    </td>
                    <td>
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => router.push(`/billing/${inv.id}`)}
                          className="flex items-center justify-center size-7 rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)] transition-colors"
                          title="View invoice"
                        >
                          <Eye className="size-4" />
                        </button>
                        {inv.status !== 'CANCELLED' && (
                          <button
                            onClick={() => setCancelTarget(inv)}
                            className="flex items-center justify-center size-7 rounded-md text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
                            title="Cancel invoice"
                          >
                            <XCircle className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 text-sm text-[var(--color-muted)]">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => load(page - 1)}
                  disabled={page === 1}
                  className="h-8 px-3 rounded-lg border border-[var(--color-border)] disabled:opacity-40 hover:bg-[var(--color-surface-secondary)] transition-colors text-xs"
                >
                  Previous
                </button>
                <button
                  onClick={() => load(page + 1)}
                  disabled={page === totalPages}
                  className="h-8 px-3 rounded-lg border border-[var(--color-border)] disabled:opacity-40 hover:bg-[var(--color-surface-secondary)] transition-colors text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel Invoice"
        description={`Cancel invoice ${cancelTarget?.invoiceNumber}? This will restore inventory stock and update the payment record. This cannot be undone.`}
        confirmLabel="Cancel Invoice"
        variant="danger"
        onConfirm={handleCancel}
        isLoading={cancelling}
      />
    </div>
  );
}
