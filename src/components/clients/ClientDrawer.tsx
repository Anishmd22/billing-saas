'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { X, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { clientsApi, type ClientDetail } from '@/lib/api-client';
import CurrencyDisplay from '@/components/shared/CurrencyDisplay';
import StatusBadge from '@/components/shared/StatusBadge';
import type { BadgeStatus } from '@/components/shared/StatusBadge';

interface ClientDrawerProps {
  clientId: string | null;
  onClose: () => void;
}

export default function ClientDrawer({ clientId, onClose }: ClientDrawerProps) {
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    clientsApi
      .getById(clientId)
      .then(setClient)
      .catch(() => setClient(null))
      .finally(() => setLoading(false));
  }, [clientId]);

  const totalBilled = client?.invoices.reduce((s, i) => s + Number(i.totalAmount), 0) ?? 0;
  const totalPending = client?.invoices.reduce(
    (s, i) => s + (i.payment ? Number((i.payment as { pendingAmount: number }).pendingAmount) : 0),
    0
  ) ?? 0;

  return (
    <Dialog.Root open={!!clientId} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Popup className="fixed right-0 top-0 h-full w-[560px] bg-white shadow-2xl z-50 flex flex-col outline-none">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
            <Dialog.Title className="text-base font-semibold text-[var(--color-text)]">
              Client Details
            </Dialog.Title>
            <Dialog.Close
              onClick={onClose}
              className="flex items-center justify-center size-7 rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)] transition-colors"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-24">
                <div className="text-sm text-[var(--color-muted)]">Loading…</div>
              </div>
            )}

            {!loading && client && (
              <div className="px-6 py-5 space-y-6">
                {/* Client Info */}
                <section>
                  <h2 className="text-sm font-semibold text-[var(--color-text)] mb-3 pb-2 border-b border-[var(--color-border)]">
                    Client Information
                  </h2>
                  <dl className="space-y-2 text-sm">
                    <div className="flex gap-3">
                      <dt className="w-28 shrink-0 text-[var(--color-muted)]">Company</dt>
                      <dd className="font-medium text-[var(--color-text)]">{client.companyName}</dd>
                    </div>
                    {client.gstNumber && (
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-[var(--color-muted)]">GST Number</dt>
                        <dd className="font-mono text-[var(--color-text)]">{client.gstNumber}</dd>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-[var(--color-muted)]">Phone</dt>
                        <dd>{client.phone}</dd>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-[var(--color-muted)]">Email</dt>
                        <dd>{client.email}</dd>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-[var(--color-muted)]">Address</dt>
                        <dd className="leading-relaxed">{client.address}</dd>
                      </div>
                    )}
                  </dl>
                </section>

                {/* Payment Summary */}
                <section>
                  <h2 className="text-sm font-semibold text-[var(--color-text)] mb-3 pb-2 border-b border-[var(--color-border)]">
                    Payment Summary
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3 text-center">
                      <p className="text-xs text-[var(--color-muted)] mb-1">Total Billed</p>
                      <CurrencyDisplay amount={totalBilled} size="sm" className="text-[var(--color-text)] font-semibold" />
                    </div>
                    <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3 text-center">
                      <p className="text-xs text-[var(--color-muted)] mb-1">Total Paid</p>
                      <CurrencyDisplay amount={totalBilled - totalPending} size="sm" className="text-[var(--color-success)] font-semibold" />
                    </div>
                    <div className="rounded-lg bg-[var(--color-surface-secondary)] p-3 text-center">
                      <p className="text-xs text-[var(--color-muted)] mb-1">Pending</p>
                      <CurrencyDisplay amount={totalPending} size="sm" className="text-[var(--color-danger)] font-semibold" />
                    </div>
                  </div>
                </section>

                {/* Recent Invoices */}
                <section>
                  <h2 className="text-sm font-semibold text-[var(--color-text)] mb-3 pb-2 border-b border-[var(--color-border)]">
                    Recent Invoices
                  </h2>
                  {client.invoices.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-sm text-[var(--color-muted)]">
                      <FileText className="size-4 mr-2" /> No invoices yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {client.invoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[var(--color-surface-secondary)] text-sm"
                        >
                          <div>
                            <p className="font-mono text-[var(--color-text)] font-medium">{inv.invoiceNumber}</p>
                            <p className="text-xs text-[var(--color-muted)] mt-0.5">
                              {format(new Date(inv.invoiceDate), 'dd MMM yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <CurrencyDisplay amount={inv.totalAmount} size="sm" />
                            <StatusBadge status={inv.status as BadgeStatus} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
