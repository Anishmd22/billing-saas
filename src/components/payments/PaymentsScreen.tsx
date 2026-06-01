'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { paymentsApi, type PaymentListItem } from '@/lib/api-client';
import { formatCurrency } from '@/core/utils/currency';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import CurrencyDisplay from '@/components/shared/CurrencyDisplay';
import EmptyState from '@/components/shared/EmptyState';
import UpdatePaymentModal from './UpdatePaymentModal';
import type { BadgeStatus } from '@/components/shared/StatusBadge';
import { CreditCard } from 'lucide-react';

const STATUS_FILTERS = ['ALL', 'PENDING', 'PARTIAL'] as const;

function daysOverdue(dueDate: string | null): number {
  if (!dueDate) return 0;
  const diff = differenceInDays(new Date(), new Date(dueDate));
  return Math.max(0, diff);
}

function rowBg(payment: PaymentListItem): string {
  const overdue = daysOverdue(payment.dueDate);
  if (payment.paymentStatus === 'PAID' || payment.paymentStatus === 'CANCELLED') return '';
  if (overdue > 30) return 'bg-[var(--color-danger-bg)]';
  if (overdue > 15) return 'bg-[var(--color-warning-bg)]';
  return '';
}

export default function PaymentsScreen() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [updateTarget, setUpdateTarget] = useState<PaymentListItem | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    paymentsApi
      .list({ status: statusFilter, search: search || undefined })
      .then(setPayments)
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false));
  }, [statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  // Summary stats
  const totalPending = payments
    .filter((p) => p.paymentStatus !== 'PAID' && p.paymentStatus !== 'CANCELLED')
    .reduce((s, p) => s + Number(p.pendingAmount), 0);

  const overdue = payments
    .filter((p) => p.paymentStatus !== 'PAID' && p.paymentStatus !== 'CANCELLED' && daysOverdue(p.dueDate) > 0)
    .reduce((s, p) => s + Number(p.pendingAmount), 0);

  const filtered = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.invoice.client.companyName.toLowerCase().includes(q) ||
      p.invoice.invoiceNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader title="Payments" description="Track pending and overdue invoice payments" />

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Pending', value: totalPending, color: 'text-[var(--color-danger)]' },
          { label: 'Overdue', value: overdue, color: 'text-[var(--color-warning)]' },
          { label: 'All Invoices', value: payments.length, isCount: true, color: 'text-[var(--color-text)]' },
        ].map(({ label, value, color, isCount }) => (
          <div key={label} className="bg-white rounded-xl border border-[var(--color-border)] px-5 py-4">
            <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide mb-1">{label}</p>
            {isCount ? (
              <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
            ) : (
              <p className={`text-xl font-bold font-mono ${color}`}>{formatCurrency(value as number)}</p>
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search client or invoice…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 text-sm border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-colors"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === 'ALL' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-muted)]">
          Loading payments…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments found"
          description="Payments are created automatically when invoices are generated."
        />
      ) : (
        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-white">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Invoice No</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th className="text-right">Total</th>
                <th className="text-right">Paid</th>
                <th className="text-right">Pending</th>
                <th>Days Overdue</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment) => {
                const overdueDays = daysOverdue(payment.dueDate);
                return (
                  <tr key={payment.id} className={rowBg(payment)}>
                    <td className="font-medium">{payment.invoice.client.companyName}</td>
                    <td>
                      <span className="font-mono text-sm">{payment.invoice.invoiceNumber}</span>
                    </td>
                    <td className="text-[var(--color-muted)] text-xs">
                      {format(new Date(payment.invoice.invoiceDate), 'dd MMM yyyy')}
                    </td>
                    <td className="text-xs">
                      {payment.dueDate
                        ? format(new Date(payment.dueDate), 'dd MMM yyyy')
                        : <span className="text-[var(--color-muted-light)]">—</span>}
                    </td>
                    <td className="text-right">
                      <CurrencyDisplay amount={payment.totalAmount} size="sm" />
                    </td>
                    <td className="text-right">
                      <CurrencyDisplay amount={payment.paidAmount} size="sm" className="text-[var(--color-success)]" />
                    </td>
                    <td className="text-right">
                      <CurrencyDisplay amount={payment.pendingAmount} size="sm" className={payment.pendingAmount > 0 ? 'text-[var(--color-danger)]' : ''} />
                    </td>
                    <td>
                      {overdueDays > 0 && payment.paymentStatus !== 'PAID' && payment.paymentStatus !== 'CANCELLED' ? (
                        <span className={`text-xs font-medium ${overdueDays > 30 ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]'}`}>
                          {overdueDays}d
                        </span>
                      ) : (
                        <span className="text-[var(--color-muted-light)] text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={payment.paymentStatus as BadgeStatus} />
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/billing/${payment.invoiceId}`)}
                          className="flex items-center justify-center size-7 rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)] transition-colors"
                          title="View invoice"
                        >
                          <Eye className="size-4" />
                        </button>
                        {payment.paymentStatus !== 'PAID' && payment.paymentStatus !== 'CANCELLED' && (
                          <button
                            onClick={() => setUpdateTarget(payment)}
                            className="h-7 px-2 text-xs font-medium rounded-md text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent-bg)] transition-colors"
                          >
                            Update
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {updateTarget && (
        <UpdatePaymentModal
          open={!!updateTarget}
          onOpenChange={(open) => !open && setUpdateTarget(null)}
          paymentId={updateTarget.id}
          invoiceNumber={updateTarget.invoice.invoiceNumber}
          clientName={updateTarget.invoice.client.companyName}
          totalAmount={updateTarget.totalAmount}
          currentPaid={updateTarget.paidAmount}
          onSaved={load}
        />
      )}
    </div>
  );
}
