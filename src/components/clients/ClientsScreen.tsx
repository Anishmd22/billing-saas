'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { clientsApi, type ClientListItem } from '@/lib/api-client';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmModal from '@/components/shared/ConfirmModal';
import ClientModal from './ClientModal';
import ClientDrawer from './ClientDrawer';

export default function ClientsScreen() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<ClientListItem | null>(null);

  const [drawerClientId, setDrawerClientId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ClientListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    clientsApi
      .list()
      .then(setClients)
      .catch(() => toast.error('Failed to load clients'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(q) ||
      (c.gstNumber?.toLowerCase() ?? '').includes(q) ||
      (c.phone ?? '').includes(q)
    );
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await clientsApi.delete(deleteTarget.id);
      toast.success('Client deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete client');
    } finally {
      setDeleting(false);
    }
  }

  function openAdd() {
    setEditClient(null);
    setModalOpen(true);
  }

  function openEdit(client: ClientListItem, e: React.MouseEvent) {
    e.stopPropagation();
    setEditClient(client);
    setModalOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage your customer master data"
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 h-9 px-4 text-sm font-medium rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            <Plus className="size-4" />
            Add Client
          </button>
        }
      />

      {/* Search */}
      <div className="relative w-72 mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-muted)] pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name, GST, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-sm border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-colors"
        />
      </div>

      {loading ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-muted)]">
          Loading clients…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No clients match your search' : 'No clients yet'}
          description={search ? 'Try a different search term.' : 'Add your first client to get started.'}
          action={
            !search ? (
              <button
                onClick={openAdd}
                className="flex items-center gap-1.5 h-9 px-4 text-sm font-medium rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                <Plus className="size-4" /> Add Client
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-white">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>GST Number</th>
                <th>Phone</th>
                <th>Invoices</th>
                <th>Added</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="cursor-pointer"
                  onClick={() => setDrawerClientId(client.id)}
                >
                  <td className="font-medium">{client.companyName}</td>
                  <td>
                    {client.gstNumber ? (
                      <span className="font-mono text-xs">{client.gstNumber}</span>
                    ) : (
                      <span className="text-[var(--color-muted-light)] text-xs">—</span>
                    )}
                  </td>
                  <td>{client.phone ?? <span className="text-[var(--color-muted-light)] text-xs">—</span>}</td>
                  <td>{client._count.invoices}</td>
                  <td className="text-[var(--color-muted)] text-xs">
                    {format(new Date(client.createdAt), 'dd MMM yyyy')}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDrawerClientId(client.id)}
                        className="flex items-center justify-center size-7 rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)] transition-colors"
                        title="View details"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        onClick={(e) => openEdit(client, e)}
                        className="flex items-center justify-center size-7 rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)] transition-colors"
                        title="Edit"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(client); }}
                        className="flex items-center justify-center size-7 rounded-md text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ClientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        client={editClient}
        onSaved={load}
      />

      <ClientDrawer
        clientId={drawerClientId}
        onClose={() => setDrawerClientId(null)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Client"
        description={`Are you sure you want to delete "${deleteTarget?.companyName}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}
