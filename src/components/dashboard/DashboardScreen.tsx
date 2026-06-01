'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Receipt, Clock, Package, TrendingUp, Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { dashboardApi, invoicesApi, type InvoiceListItem } from '@/lib/api-client';
import type { DashboardStats } from '@/core/types';
import { formatCurrency } from '@/core/utils/currency';
import StatusBadge from '@/components/shared/StatusBadge';
import CurrencyDisplay from '@/components/shared/CurrencyDisplay';
import PageHeader from '@/components/shared/PageHeader';
import type { BadgeStatus } from '@/components/shared/StatusBadge';

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  onClick,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-[var(--color-border)] px-5 py-5 ${onClick ? 'cursor-pointer hover:border-[var(--color-accent)]/40 hover:shadow-sm transition-all' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`flex items-center justify-center size-10 rounded-lg ${iconBg}`}>
          <Icon className={`size-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-bold font-mono text-[var(--color-text)] mb-1">{value}</p>
      <p className="text-sm font-medium text-[var(--color-muted)]">{label}</p>
      {sub && <p className="text-xs text-[var(--color-muted-light)] mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBills, setRecentBills] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.stats(),
      invoicesApi.list({ page: 1 }),
    ])
      .then(([s, result]) => {
        setStats(s);
        setRecentBills(result.invoices.slice(0, 10));
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Overview for ${format(new Date(), 'dd MMM yyyy')}`}
        action={
          <button
            onClick={() => router.push('/billing/new')}
            className="flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            <Plus className="size-4" /> New Bill
          </button>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[var(--color-border)] px-5 py-5 animate-pulse">
              <div className="size-10 rounded-lg bg-[var(--color-surface-hover)] mb-3" />
              <div className="h-7 w-24 bg-[var(--color-surface-hover)] rounded mb-2" />
              <div className="h-4 w-32 bg-[var(--color-surface-hover)] rounded" />
            </div>
          ))
        ) : stats ? (
          <>
            <StatCard
              label="Today's Bills"
              value={String(stats.todayBillsCount)}
              sub={stats.todayBillsCount > 0 ? formatCurrency(stats.todayBillsTotal) : 'No bills today'}
              icon={Receipt}
              iconBg="bg-[var(--color-accent-bg)]"
              iconColor="text-[var(--color-accent)]"
              onClick={() => router.push('/billing/history')}
            />
            <StatCard
              label="Pending Payments"
              value={formatCurrency(stats.pendingPaymentsTotal)}
              sub={`${stats.pendingPaymentsCount} invoice${stats.pendingPaymentsCount !== 1 ? 's' : ''} unpaid`}
              icon={Clock}
              iconBg="bg-[var(--color-danger-bg)]"
              iconColor="text-[var(--color-danger)]"
              onClick={() => router.push('/payments')}
            />
            <StatCard
              label="Low Stock Items"
              value={String(stats.lowStockCount)}
              sub={stats.lowStockCount > 0 ? 'Needs attention' : 'All stock OK'}
              icon={Package}
              iconBg={stats.lowStockCount > 0 ? 'bg-[var(--color-warning-bg)]' : 'bg-[var(--color-success-bg)]'}
              iconColor={stats.lowStockCount > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}
              onClick={() => router.push('/inventory')}
            />
            <StatCard
              label="This Month Revenue"
              value={formatCurrency(stats.thisMonthRevenue)}
              sub={format(new Date(), 'MMMM yyyy')}
              icon={TrendingUp}
              iconBg="bg-[var(--color-success-bg)]"
              iconColor="text-[var(--color-success)]"
            />
          </>
        ) : null}
      </div>

      {/* Recent Bills */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Recent Bills</h2>
          <button
            onClick={() => router.push('/billing/history')}
            className="text-xs text-[var(--color-accent)] hover:underline font-medium"
          >
            View all
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-[var(--color-muted)]">Loading…</div>
        ) : recentBills.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center size-12 rounded-full bg-[var(--color-surface-secondary)] mx-auto mb-3">
              <Receipt className="size-6 text-[var(--color-muted-light)]" />
            </div>
            <p className="text-sm font-medium text-[var(--color-text)] mb-1">No bills yet</p>
            <p className="text-xs text-[var(--color-muted)] mb-4">Create your first invoice to get started.</p>
            <button
              onClick={() => router.push('/billing/new')}
              className="inline-flex items-center gap-2 h-8 px-4 text-sm font-medium rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              <Plus className="size-3.5" /> New Bill
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Client</th>
                <th>Date</th>
                <th className="text-right">Amount</th>
                <th>Payment</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBills.map((inv) => (
                <tr
                  key={inv.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/billing/${inv.id}`)}
                >
                  <td>
                    <span className="font-mono text-sm text-[var(--color-accent)]">{inv.invoiceNumber}</span>
                  </td>
                  <td className="font-medium">{inv.client.companyName}</td>
                  <td className="text-[var(--color-muted)] text-xs">
                    {format(new Date(inv.invoiceDate), 'dd MMM yyyy')}
                  </td>
                  <td className="text-right">
                    <CurrencyDisplay amount={inv.totalAmount} size="sm" />
                  </td>
                  <td>
                    {inv.payment ? (
                      <StatusBadge status={inv.payment.paymentStatus as BadgeStatus} />
                    ) : (
                      <StatusBadge status={inv.status as BadgeStatus} />
                    )}
                  </td>
                  <td>
                    <div className="flex items-center justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/billing/${inv.id}`); }}
                        className="flex items-center justify-center size-7 rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)] transition-colors"
                        title="View invoice"
                      >
                        <Eye className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
