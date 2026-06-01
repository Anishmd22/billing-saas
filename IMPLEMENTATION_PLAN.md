# Implementation Plan — Smart Billing & Inventory Management System

**Project Type:** Business Billing & Inventory Management Application  
**Architecture:** Modular Monolith (Next.js + Prisma + Supabase PostgreSQL)  
**Version:** 1.0 (MVP)  
**Last Updated:** 2026-06-01

---

## Project Overview

The Smart Billing & Inventory Management System digitises manual billing workflows for small manufacturing and industrial businesses. The system automatically generates GST-compliant invoices, synchronises inventory levels, tracks pending payments, and produces printable A4 PDFs — all driven by the invoice as the central transaction object.

---

## Phase-wise Implementation Plan & Current Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Environment & Project Setup | ✅ COMPLETED |
| Phase 2 | Database Layer & Prisma Migration | ✅ COMPLETED |
| Phase 3 | Core Utility Layer (Constants, Types, Helpers) | ✅ COMPLETED |
| Phase 4 | Backend API Layer (All REST Endpoints) | ✅ COMPLETED |
| Phase 5 | Frontend — Layout Shell & Shared Components | ⬜ PENDING |
| Phase 6 | Frontend — Feature Screens (Billing, Inventory, Payments, Clients) | ⬜ PENDING |
| Phase 7 | PDF Generation & Invoice Printing | ⬜ PENDING |
| Phase 8 | Dashboard, Settings, Polish & Deployment | ⬜ PENDING |

---

## Phase 1 — Environment & Project Setup ✅ COMPLETED

### What was done
- Initialised a **Next.js 16** project with App Router, TypeScript strict mode, Tailwind CSS v4, and `src/` directory layout.
- Configured `tsconfig.json` with `"strict": true` and path alias `@/* → src/*`.
- Installed all required dependencies:
  - **Frontend/UI:** `react-hook-form`, `@hookform/resolvers`, `zod`, `zustand`, `@tanstack/react-table`, `date-fns`, `lucide-react`, `sonner`, `clsx`, `tailwind-merge`
  - **Backend/DB:** `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`
  - **PDF:** `puppeteer`
  - **Dev Tooling:** `eslint`, `eslint-config-next`, `eslint-config-prettier`, `prettier`, `ts-node`
- Set up **ShadCN UI** (base-nova style, Geist fonts, CSS variables).
- Created `.prettierrc`, `.env.example`, `.gitignore` configurations.
- Established the **feature-based modular folder structure** under `src/`.

### Files created
```
package.json                 — npm project config with all dependencies
tsconfig.json                — TypeScript strict mode + path aliases
.prettierrc                  — Prettier formatting rules
.env.example                 — Environment variable template
.env                         — Local env config (DATABASE_URL, DIRECT_URL, app settings)
eslint.config.mjs            — ESLint config (Next.js + TypeScript rules)
components.json              — ShadCN UI configuration
postcss.config.mjs           — PostCSS + Tailwind CSS v4
prisma.config.ts             — Prisma CLI config (DIRECT_URL for migrations)
```

---

## Phase 2 — Database Layer & Prisma Migration ✅ COMPLETED

### What was done
- Designed a **6-table relational schema** matching the BRD/PRD specifications:
  - `clients` — Customer master data with unique GST number
  - `products` — Inventory product catalog
  - `invoices` — Central transaction entity
  - `invoice_items` — Immutable line-item snapshots
  - `payments` — Per-invoice payment tracking (Pending/Partial/Paid)
  - `inventory_movements` — Audit trail for all stock changes
- Defined Prisma enums: `InvoiceStatus`, `PaymentStatus`, `MovementType`.
- Connected to **Supabase PostgreSQL** with:
  - `DIRECT_URL` (port 5432) for migrations (bypasses PgBouncer)
  - `DATABASE_URL` (port 6543) for runtime queries (via PgBouncer + `@prisma/adapter-pg`)
- Applied migration `20260527103605_init` successfully — all 6 tables created on Supabase.
- Created and executed a **seed script** (`prisma/seed.ts`) to populate sample data:
  - 1 sample client (Sample Industries Pvt Ltd, GST: 33AABCT1332L1ZX)
  - 2 sample products (Steel Pipes, Aluminium Sheets) with opening stock movements.

### Files created
```
prisma/schema.prisma                          — Complete database schema (6 models, 3 enums)
prisma/seed.ts                                — Seed script with sample client + products
prisma/migrations/20260527103605_init/        — Applied migration SQL
src/lib/prisma.ts                             — Prisma client singleton (pg driver adapter)
```

### Entity Relationship Diagram
```
CLIENTS
│
├──< INVOICES
│         │
│         ├──< INVOICE_ITEMS >── PRODUCTS
│         │
│         ├── PAYMENTS (1:1)
│         │
│         └── INVENTORY_MOVEMENTS
│
PRODUCTS
│
└──< INVENTORY_MOVEMENTS
```

---

## Phase 3 — Core Utility Layer ✅ COMPLETED

### What was done
- Created **GST calculation utilities** (`gst.ts`) — supports intra-state (CGST+SGST) and inter-state (IGST) tax logic.
- Created **Indian Rupee currency utilities** (`currency.ts`) — formatting with ₹ symbol, Indian comma system (lakhs/crores), number-to-words conversion for invoices.
- Created **application-wide constants** (`constants/index.ts`) — GST rates (0/5/12/18/28%), product units dropdown (Pcs/Kg/Ltr/Mtr/Box/Set/Nos), invoice/payment status labels, all Indian states list, default settings.
- Created **global TypeScript type definitions** (`types/index.ts`) — API response wrappers, all entity data types, input types for create/update operations.
- Created **Zustand global state store** (`store/useAppStore.ts`) — manages supplier state, invoice prefix, due days, and other application settings.
- Created **full design token system** in `globals.css` — colour palette (primary/accent/semantic/GST tax colours), typography helpers, status badges, sidebar styles, data table styles, and `@media print` A4 layout rules.

### Files created
```
src/core/utils/gst.ts              — GST calculation engine (CGST/SGST/IGST)
src/core/utils/currency.ts         — ₹ formatting + number-to-words
src/core/constants/index.ts        — All app constants (rates, units, states)
src/core/types/index.ts            — Global TypeScript type definitions
src/core/store/useAppStore.ts      — Zustand store for app settings
src/app/globals.css                — Full design token system + print styles
src/lib/api-errors.ts              — Shared API error response helpers (Zod v4 compat)
```

---

## Phase 4 — Backend API Layer ✅ COMPLETED

### What was done
- Implemented **Zod v4 validation schemas** for every module:
  - Client create/update validation (GST format, company name, phone, email)
  - Product create/update + add stock validation (product name, HSN, unit enum, stock, price)
  - Invoice creation validation (client, date, line items with qty/rate/GST%, supplier/customer state)
  - Payment update validation (paid amount, date)
- Built **repository layers** with full business logic:
  - `clients/repository.ts` — CRUD, GST-based lookup
  - `inventory/repository.ts` — Product CRUD, transactional stock addition with movement logging, movement history queries
  - `billing/repository.ts` — **Full invoice lifecycle in Prisma transactions:**
    - Create: generate invoice number → save invoice + items → reduce stock → log movements → create payment record
    - Cancel: mark cancelled → restore all stock → log reversal movements → update payment
    - List with pagination, search, and status filters
  - `payments/repository.ts` — Payment CRUD, auto-status calculation (PENDING/PARTIAL/PAID), aggregation helpers
- Created **14 REST API route handlers** at `/api/v1/`:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/clients` | List all clients (or search by GST) |
| POST | `/api/v1/clients` | Create a new client |
| GET | `/api/v1/clients/[id]` | Get client details with recent invoices |
| PUT | `/api/v1/clients/[id]` | Update client |
| DELETE | `/api/v1/clients/[id]` | Delete client |
| GET | `/api/v1/products` | List all products |
| POST | `/api/v1/products` | Create product with opening stock |
| GET | `/api/v1/products/[id]` | Get product with movement history |
| PUT | `/api/v1/products/[id]` | Update product details |
| GET | `/api/v1/inventory/movements` | List all stock movements |
| POST | `/api/v1/inventory/movements` | Add stock to product |
| GET | `/api/v1/invoices` | List invoices (search, filter, pagination) |
| POST | `/api/v1/invoices` | Create invoice (transactional) |
| GET | `/api/v1/invoices/[id]` | Get invoice with items, client, payment |
| PATCH | `/api/v1/invoices/[id]` | Cancel invoice (transactional restoration) |
| GET | `/api/v1/payments` | List payments (filter by status/client) |
| GET | `/api/v1/payments/[id]` | Get payment details |
| PUT | `/api/v1/payments/[id]` | Update payment amount/status |
| GET | `/api/v1/dashboard` | Dashboard stats (today's bills, pending, low stock, revenue) |

### Files created
```
src/modules/clients/validators.ts              — Zod schemas for client CRUD
src/modules/clients/repository.ts              — Client database operations
src/modules/inventory/validators.ts            — Zod schemas for product + stock
src/modules/inventory/repository.ts            — Product + stock + movement operations
src/modules/billing/validators.ts              — Zod schemas for invoice + payment
src/modules/billing/repository.ts              — Invoice lifecycle (create/cancel/list)
src/modules/payments/repository.ts             — Payment CRUD + aggregation

src/app/api/v1/clients/route.ts                — GET (list/search), POST (create)
src/app/api/v1/clients/[id]/route.ts           — GET, PUT, DELETE
src/app/api/v1/products/route.ts               — GET (list), POST (create)
src/app/api/v1/products/[id]/route.ts          — GET, PUT
src/app/api/v1/inventory/movements/route.ts    — GET (list), POST (add stock)
src/app/api/v1/invoices/route.ts               — GET (list), POST (create)
src/app/api/v1/invoices/[id]/route.ts          — GET, PATCH (cancel)
src/app/api/v1/payments/route.ts               — GET (list)
src/app/api/v1/payments/[id]/route.ts          — GET, PUT (update)
src/app/api/v1/dashboard/route.ts              — GET (stats aggregation)
```

---

## Phase 5 — Frontend: Layout Shell & Shared Components ⬜ PENDING

### Planned work
- Build the **App Shell layout** (`AppShell.tsx`) — fixed sidebar (240px) + top bar (56px) + scrollable content area.
- Build **Sidebar navigation** component — dark navy (#0F172A), Lucide icons, active/hover states, nav items: Dashboard, Create Bill, Previous Bills, Inventory, Payments, Clients, Settings.
- Build **TopBar** component — breadcrumb on left, primary action button on right.
- Build **shared reusable components:**
  - `DataTable.tsx` — TanStack Table wrapper with sorting, pagination, search
  - `StatusBadge.tsx` — Paid/Pending/Partial/Cancelled/InStock/LowStock badges
  - `CurrencyDisplay.tsx` — ₹-formatted amounts using Geist Mono
  - `EmptyState.tsx` — Contextual empty state illustrations per module
  - `ConfirmModal.tsx` — Reusable confirmation dialog
  - `PageHeader.tsx` — Page title + action buttons layout
- Integrate **Sonner toast notifications** into the root layout.

### Files to create
```
src/components/layout/AppShell.tsx
src/components/layout/Sidebar.tsx
src/components/layout/TopBar.tsx
src/components/shared/DataTable.tsx
src/components/shared/StatusBadge.tsx
src/components/shared/CurrencyDisplay.tsx
src/components/shared/EmptyState.tsx
src/components/shared/ConfirmModal.tsx
src/components/shared/PageHeader.tsx
```

---

## Phase 6 — Frontend: Feature Screens ⬜ PENDING

### Planned work

#### 6.1 Client Management Screen (`/clients`)
- Client listing table with GST, phone, city, last invoice, pending balance.
- Client detail drawer (right side, 640px) showing info + last 5 invoices + payment summary.
- Add/Edit client modal with form validation.

#### 6.2 Inventory Screen (`/inventory`)
- **Products tab:** Product table with stock status badges, add product modal, edit product modal, "+Stock" button per row.
- **Stock Movements tab:** Full movement history table with colour-coded types (sale=red, add=green, cancelled=green-dashed, adjustment=orange).
- Add Stock modal with quantity, reason dropdown, remarks.

#### 6.3 Create Bill Screen (`/billing/new`)
- Full-page billing form (NOT modal):
  - Section 1: Bill Header — auto invoice number, date picker, GST input with auto-fetch.
  - Section 2: Product Line Items — editable inline table with product name, HSN, qty, unit dropdown, rate, GST% dropdown, auto-calculated amount. Tab key navigation between cells.
  - Section 3: Totals Panel — subtotal, CGST/SGST or IGST, grand total, amount in words.
  - Section 4: Sticky action bar — Save Draft, Preview PDF, Generate Invoice.
- Generate flow: validate → save → reduce inventory → create payment → redirect to invoice view.

#### 6.4 Invoice View Page (`/billing/[id]`)
- A4-proportional invoice preview (left 65%) + action sidebar (right 35%).
- Actions: Print, Download PDF, Share WhatsApp, Edit, Cancel, Update Payment Status.
- Inventory/Payment confirmation indicators.

#### 6.5 Previous Bills Screen (`/billing/history`)
- Invoice history table with search (invoice no, client name), date range filter, status filter.
- Row actions: View, Edit, Download PDF, Print, Mark as Paid, Cancel.
- 20 rows per page pagination.

#### 6.6 Pending Payments Screen (`/payments`)
- Summary strip (total pending, overdue, this month).
- Payment table with colour-coded overdue rows (>30 days=red, 15-30=orange).
- Update Payment modal (amount, date, mode, reference, full/partial toggle).

### Files to create
```
src/components/billing/BillingForm.tsx
src/components/billing/LineItemsTable.tsx
src/components/billing/TotalsPanel.tsx
src/components/billing/InvoicePreview.tsx
src/components/billing/GSTFetchInput.tsx
src/components/inventory/ProductTable.tsx
src/components/inventory/AddStockModal.tsx
src/components/inventory/MovementHistory.tsx
src/components/payments/PaymentTable.tsx
src/components/payments/UpdatePaymentModal.tsx
src/components/clients/ClientTable.tsx
src/components/clients/ClientDrawer.tsx

src/app/billing/page.tsx              — Previous Bills
src/app/billing/new/page.tsx          — Create Bill
src/app/billing/[id]/page.tsx         — Invoice View
src/app/inventory/page.tsx            — Inventory
src/app/payments/page.tsx             — Pending Payments
src/app/clients/page.tsx              — Client Management
```

---

## Phase 7 — PDF Generation & Invoice Printing ⬜ PENDING

### Planned work
- Build **HTML invoice template** matching the client's paper format:
  - Header band (company logo + name + address | "TAX INVOICE" + invoice no + date)
  - Bill To / Ship To block
  - Line items table (Sr, Description, HSN, Qty, Unit, Rate, Taxable, GST%, Amount)
  - Tax summary block (subtotal, CGST/SGST/IGST, grand total, amount in words)
  - Footer (bank details | terms & conditions + signature line)
- Paper size: A4 (210mm × 297mm), 15mm margins, NotoSans font for GST compliance.
- Implement **Puppeteer API route** (`/api/v1/pdf/generate`) — render HTML → generate PDF → return binary.
- CSS `@media print` fallback for direct browser printing (`Ctrl + P`).
- WhatsApp share link generation (deep link with PDF URL).

### Files to create
```
src/modules/pdf/templates.ts           — HTML template builder
src/modules/pdf/renderer.ts            — Puppeteer PDF rendering engine
src/app/api/v1/pdf/route.ts            — PDF generation API endpoint
```

---

## Phase 8 — Dashboard, Settings, Polish & Deployment ⬜ PENDING

### Planned work

#### 8.1 Dashboard (`/` — home page)
- 4 stat cards: Today's Bills, Pending Payments, Low Stock Items, This Month Revenue.
- Recent bills table (last 10 invoices).
- Quick action: "+ New Bill" button.

#### 8.2 Settings Screen (`/settings`)
- Business Information: Company name, GST, address, state (dropdown with all Indian states), phone, email, logo upload.
- Invoice Settings: prefix, starting number, default due days, terms & conditions, bank details.
- Tax Settings: default GST rates, business type (Regular/Composition).
- Print Settings: paper size, logo toggle, bank details toggle, signature line toggle.

#### 8.3 Polish & UX
- Keyboard shortcuts (Ctrl+N, Ctrl+S, Ctrl+P, Tab navigation).
- Loading states (skeleton shimmer rows, button spinners, PDF overlay).
- Empty states per module with contextual CTAs.
- Responsive behaviour (1280px+ full layout, 1024-1280px compressed sidebar).
- Accessibility (labels, aria-labels, focus rings, semantic HTML).

#### 8.4 Deployment
- Deploy to **Vercel** (frontend + backend).
- Configure production environment variables.
- Verify Supabase connection in production.
- Final end-to-end testing.

### Files to create
```
src/app/page.tsx                       — Dashboard (replace default)
src/app/settings/page.tsx              — Settings
```

---

## Technology Stack Summary

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend Framework | Next.js 16 (App Router) | ✅ Installed |
| Language | TypeScript (strict mode) | ✅ Configured |
| Styling | Tailwind CSS v4 + custom design tokens | ✅ Configured |
| UI Components | ShadCN UI (base-nova) | ✅ Initialised |
| Icons | Lucide React | ✅ Installed |
| Forms | React Hook Form + @hookform/resolvers | ✅ Installed |
| Validation | Zod v4 | ✅ Installed + schemas written |
| State | Zustand | ✅ Installed + store created |
| Tables | TanStack Table | ✅ Installed |
| Dates | date-fns | ✅ Installed |
| Database | Supabase PostgreSQL | ✅ Connected + migrated |
| ORM | Prisma 7 + @prisma/adapter-pg | ✅ Schema + migration applied |
| PDF | Puppeteer | ✅ Installed (renderer pending) |
| Toast | Sonner | ✅ Installed (integration pending) |
| Linting | ESLint + eslint-config-next | ✅ Configured |
| Formatting | Prettier | ✅ Configured |

---

## Database Tables (Deployed to Supabase)

| # | Table | Records | Status |
|---|-------|---------|--------|
| 1 | `clients` | 1 (seed) | ✅ Live |
| 2 | `products` | 2 (seed) | ✅ Live |
| 3 | `invoices` | 0 | ✅ Live |
| 4 | `invoice_items` | 0 | ✅ Live |
| 5 | `payments` | 0 | ✅ Live |
| 6 | `inventory_movements` | 2 (opening stock) | ✅ Live |

---

## API Endpoints (All Implemented)

| # | Method | Endpoint | Status |
|---|--------|----------|--------|
| 1 | GET | `/api/v1/dashboard` | ✅ Built |
| 2 | GET/POST | `/api/v1/clients` | ✅ Built |
| 3 | GET/PUT/DELETE | `/api/v1/clients/[id]` | ✅ Built |
| 4 | GET/POST | `/api/v1/products` | ✅ Built |
| 5 | GET/PUT | `/api/v1/products/[id]` | ✅ Built |
| 6 | GET/POST | `/api/v1/inventory/movements` | ✅ Built |
| 7 | GET/POST | `/api/v1/invoices` | ✅ Built |
| 8 | GET/PATCH | `/api/v1/invoices/[id]` | ✅ Built |
| 9 | GET | `/api/v1/payments` | ✅ Built |
| 10 | GET/PUT | `/api/v1/payments/[id]` | ✅ Built |

---

## Key Business Rules Implemented

1. **Invoice is the central transaction object** — creating an invoice atomically reduces inventory, logs movements, and creates a payment record inside a single Prisma transaction.
2. **Cancellation restores everything** — cancelling an invoice restores stock, logs reversal movements, and updates the payment record, all inside a transaction.
3. **Inventory derives from movements** — `current_stock` is updated alongside `inventory_movements` records to maintain auditability.
4. **Invoice items are immutable snapshots** — product name, HSN, rate are captured at billing time and preserved even if the product is later edited.
5. **Payment auto-status** — the system automatically sets PENDING/PARTIAL/PAID based on `paidAmount` vs `totalAmount`.
6. **GST auto-routing** — CGST+SGST for intra-state; IGST for inter-state, determined by comparing supplier state vs customer state.

---

## Configuration Defaults (set via `.env`)

| Setting | Value |
|---------|-------|
| Invoice Prefix | `INV-` |
| Payment Due Days | 30 |
| Supplier State | `TAMILNADU` |
| Unit Options | Pcs, Kg, Ltr, Mtr, Box, Set, Nos (dropdown) |
| GST Rates | 0%, 5%, 12%, 18%, 28% (dropdown) |

---

## Next Step

**Phase 5 — Frontend Layout Shell & Shared Components** is ready to begin. This phase will create the visual application skeleton (sidebar, top bar, data tables, badges) that all feature screens will build upon.
