'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Package } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { productsApi, type ProductListItem, type MovementListItem } from '@/lib/api-client';
import { LOW_STOCK_THRESHOLD } from '@/core/constants';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import CurrencyDisplay from '@/components/shared/CurrencyDisplay';
import ProductModal from './ProductModal';
import AddStockModal from './AddStockModal';
import RemoveStockModal from './RemoveStockModal';
import type { StockStatus } from '@/components/shared/StatusBadge';

function stockStatus(currentStock: number): StockStatus {
  if (currentStock <= 0) return 'OUT_OF_STOCK';
  if (currentStock <= LOW_STOCK_THRESHOLD) return 'LOW_STOCK';
  return 'IN_STOCK';
}

const MOVEMENT_COLORS: Record<string, string> = {
  SALE: 'text-[var(--color-danger)]',
  STOCK_ADD: 'text-[var(--color-success)]',
  INVOICE_CANCELLED: 'text-[var(--color-success)]',
  ADJUSTMENT: 'text-[var(--color-warning)]',
  STOCK_REDUCE: 'text-[var(--color-danger)]',
};

const MOVEMENT_LABELS: Record<string, string> = {
  SALE: 'Invoice Sale',
  STOCK_ADD: 'Stock Added',
  INVOICE_CANCELLED: 'Invoice Cancelled',
  ADJUSTMENT: 'Adjustment',
  STOCK_REDUCE: 'Stock Reduced',
};

type Tab = 'products' | 'movements';

export default function InventoryScreen() {
  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [movements, setMovements] = useState<MovementListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductListItem | null>(null);

  const [addStockOpen, setAddStockOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<ProductListItem | null>(null);

  const [removeStockOpen, setRemoveStockOpen] = useState(false);
  const [removeProduct, setRemoveProduct] = useState<ProductListItem | null>(null);

  const loadProducts = useCallback(() => {
    setLoading(true);
    productsApi
      .list()
      .then(setProducts)
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const loadMovements = useCallback(() => {
    setLoading(true);
    productsApi
      .movements()
      .then(setMovements)
      .catch(() => toast.error('Failed to load movements'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'products') loadProducts();
    else loadMovements();
  }, [tab, loadProducts, loadMovements]);

  const filteredProducts = products.filter((p) =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    (p.hsnCode ?? '').includes(search)
  );

  function openAddProduct() {
    setEditProduct(null);
    setProductModalOpen(true);
  }

  function openEditProduct(product: ProductListItem, e: React.MouseEvent) {
    e.stopPropagation();
    setEditProduct(product);
    setProductModalOpen(true);
  }

  function openAddStock(product: ProductListItem, e: React.MouseEvent) {
    e.stopPropagation();
    setStockProduct(product);
    setAddStockOpen(true);
  }

  function openRemoveStock(product: ProductListItem, e: React.MouseEvent) {
    e.stopPropagation();
    setRemoveProduct(product);
    setRemoveStockOpen(true);
  }

  const TAB_BTN = (active: boolean) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      active
        ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
        : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'
    }`;

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Manage products and track stock movements"
        action={
          tab === 'products' ? (
            <button
              onClick={openAddProduct}
              className="flex items-center gap-1.5 h-9 px-4 text-sm font-medium rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              <Plus className="size-4" />
              Add Product
            </button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] mb-4 -mt-2">
        <button className={TAB_BTN(tab === 'products')} onClick={() => setTab('products')}>
          Products
        </button>
        <button className={TAB_BTN(tab === 'movements')} onClick={() => setTab('movements')}>
          Stock Movements
        </button>
      </div>

      {/* Products Tab */}
      {tab === 'products' && (
        <>
          <div className="relative w-72 mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm border border-[var(--color-border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-colors"
            />
          </div>

          {loading ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-muted)]">
              Loading products…
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title={search ? 'No products match' : 'No products yet'}
              description="Add your first product to start tracking inventory."
              action={
                !search ? (
                  <button
                    onClick={openAddProduct}
                    className="flex items-center gap-1.5 h-9 px-4 text-sm font-medium rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
                  >
                    <Plus className="size-4" /> Add Product
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-white">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>HSN</th>
                    <th>Unit</th>
                    <th className="text-right">Current Stock</th>
                    <th className="text-right">Selling Price</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="font-medium">{product.productName}</td>
                      <td>
                        {product.hsnCode ? (
                          <span className="font-mono text-xs">{product.hsnCode}</span>
                        ) : (
                          <span className="text-[var(--color-muted-light)] text-xs">—</span>
                        )}
                      </td>
                      <td>{product.unit}</td>
                      <td className="text-right font-mono">{product.currentStock}</td>
                      <td className="text-right">
                        <CurrencyDisplay amount={product.sellingPrice} size="sm" />
                      </td>
                      <td>
                        <StatusBadge status={stockStatus(product.currentStock)} />
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => openAddStock(product, e)}
                            className="h-7 px-2 text-xs font-medium rounded-md text-[var(--color-success)] border border-[var(--color-success)]/30 hover:bg-[var(--color-success-bg)] transition-colors"
                          >
                            + Stock
                          </button>
                          <button
                            onClick={(e) => openRemoveStock(product, e)}
                            className="h-7 px-2 text-xs font-medium rounded-md text-[var(--color-danger)] border border-[var(--color-danger)]/30 hover:bg-[var(--color-danger-bg)] transition-colors"
                          >
                            − Stock
                          </button>
                          <button
                            onClick={(e) => openEditProduct(product, e)}
                            className="flex items-center justify-center size-7 rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-secondary)] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Movements Tab */}
      {tab === 'movements' && (
        <>
          {loading ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-muted)]">
              Loading movements…
            </div>
          ) : movements.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No stock movements yet"
              description="Stock movements are logged automatically when invoices are created or cancelled."
            />
          ) : (
            <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-white">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th className="text-right">Change</th>
                    <th className="text-right">Balance</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td className="text-[var(--color-muted)] text-xs">
                        {format(new Date(m.createdAt), 'dd MMM yyyy, HH:mm')}
                      </td>
                      <td className="font-medium">{m.product.productName}</td>
                      <td>
                        <span className="text-xs font-medium">
                          {MOVEMENT_LABELS[m.movementType] ?? m.movementType}
                        </span>
                      </td>
                      <td className={`text-right font-mono font-medium ${MOVEMENT_COLORS[m.movementType] ?? ''}`}>
                        {m.quantityChange > 0 ? '+' : ''}{m.quantityChange} {m.product.unit}
                      </td>
                      <td className="text-right font-mono">
                        {m.stockAfter} {m.product.unit}
                      </td>
                      <td className="text-[var(--color-muted)] text-xs">
                        {m.remarks ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <ProductModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        product={editProduct}
        onSaved={loadProducts}
      />

      <AddStockModal
        open={addStockOpen}
        onOpenChange={setAddStockOpen}
        product={stockProduct}
        onSaved={loadProducts}
      />

      <RemoveStockModal
        open={removeStockOpen}
        onOpenChange={setRemoveStockOpen}
        product={removeProduct}
        onSaved={loadProducts}
      />
    </div>
  );
}
