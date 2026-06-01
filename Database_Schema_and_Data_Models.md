# Database Schema & Data Models
## Smart Billing & Inventory Management System

**Version:** 1.0 (MVP)

---

Based on the BRD, PRD, Technology Stack, and Architecture documents, the **Invoice must be the central entity**, with Inventory and Payments derived from it.   

# Database Schema & Data Models

## Smart Billing & Inventory Management System

---

# 1. Entity Relationship Diagram (ERD)

```text
CLIENTS
│
├──< INVOICES
│         │
│         ├──< INVOICE_ITEMS >── PRODUCTS
│         │
│         ├── PAYMENTS
│         │
│         └── INVENTORY_MOVEMENTS
│
PRODUCTS
│
└──< INVENTORY_MOVEMENTS
```

---

# 2. Core Tables

## Clients

Stores customer information.

```sql
clients
```

| Field        | Type         | Constraint |
| ------------ | ------------ | ---------- |
| id           | UUID         | PK         |
| gst_number   | VARCHAR(20)  | UNIQUE     |
| company_name | VARCHAR(255) | NOT NULL   |
| address      | TEXT         |            |
| phone        | VARCHAR(20)  |            |
| email        | VARCHAR(255) | NULL       |
| created_at   | TIMESTAMP    |            |
| updated_at   | TIMESTAMP    |            |

---

### Relationships

```text
Client
   |
   └── Many Invoices
```

---

# Products

Master inventory table.

```sql
products
```

| Field         | Type          |
| ------------- | ------------- |
| id            | UUID          |
| product_name  | VARCHAR(255)  |
| hsn_code      | VARCHAR(50)   |
| unit          | VARCHAR(20)   |
| current_stock | DECIMAL(12,2) |
| selling_price | DECIMAL(12,2) |
| created_at    | TIMESTAMP     |
| updated_at    | TIMESTAMP     |

---

### Relationships

```text
Product
   |
   ├── Invoice Items
   └── Inventory Movements
```

---

# Invoices

Central business transaction.

```sql
invoices
```

| Field          | Type          |
| -------------- | ------------- |
| id             | UUID          |
| invoice_number | VARCHAR(50)   |
| client_id      | UUID FK       |
| invoice_date   | DATE          |
| subtotal       | DECIMAL(12,2) |
| cgst_amount    | DECIMAL(12,2) |
| sgst_amount    | DECIMAL(12,2) |
| igst_amount    | DECIMAL(12,2) |
| total_amount   | DECIMAL(12,2) |
| status         | ENUM          |
| notes          | TEXT          |
| created_at     | TIMESTAMP     |
| updated_at     | TIMESTAMP     |

---

### Invoice Status

```text
DRAFT
GENERATED
CANCELLED
```

---

### Relationships

```text
Invoice
   |
   ├── Many Invoice Items
   ├── One Payment Record
   └── Many Inventory Movements
```

---

# Invoice Items

Line items inside invoices.

```sql
invoice_items
```

| Field          | Type          |
| -------------- | ------------- |
| id             | UUID          |
| invoice_id     | UUID FK       |
| product_id     | UUID FK       |
| product_name   | VARCHAR(255)  |
| hsn_code       | VARCHAR(50)   |
| quantity       | DECIMAL(12,2) |
| unit           | VARCHAR(20)   |
| rate           | DECIMAL(12,2) |
| gst_percentage | DECIMAL(5,2)  |
| line_total     | DECIMAL(12,2) |
| created_at     | TIMESTAMP     |

---

### Why Store Product Name Here?

Invoice data must remain unchanged even if product details are edited later.

```text
Invoice Snapshot
```

---

# Payments

Tracks payment status.

```sql
payments
```

| Field             | Type           |
| ----------------- | -------------- |
| id                | UUID           |
| invoice_id        | UUID FK UNIQUE |
| total_amount      | DECIMAL(12,2)  |
| paid_amount       | DECIMAL(12,2)  |
| pending_amount    | DECIMAL(12,2)  |
| payment_status    | ENUM           |
| due_date          | DATE           |
| last_payment_date | DATE           |
| created_at        | TIMESTAMP      |
| updated_at        | TIMESTAMP      |

---

### Payment Status

```text
PENDING
PARTIAL
PAID
```

---

### Relationships

```text
Invoice
    |
    └── Payment
```

---

# Inventory Movements

Single source of truth for stock history.

```sql
inventory_movements
```

| Field           | Type          |
| --------------- | ------------- |
| id              | UUID          |
| product_id      | UUID FK       |
| invoice_id      | UUID FK NULL  |
| movement_type   | ENUM          |
| quantity_change | DECIMAL(12,2) |
| stock_before    | DECIMAL(12,2) |
| stock_after     | DECIMAL(12,2) |
| remarks         | TEXT          |
| created_at      | TIMESTAMP     |

---

### Movement Types

```text
STOCK_ADD
STOCK_REDUCE
SALE
ADJUSTMENT
INVOICE_CANCELLED
```

---

### Relationships

```text
Product
   |
   └── Many Inventory Movements

Invoice
   |
   └── Optional Inventory Movements
```

---

# 3. Complete ERD

```text
┌───────────────────┐
│      CLIENTS      │
└─────────┬─────────┘
          │
          │ 1:N
          ▼
┌───────────────────┐
│     INVOICES      │
└───────┬─────┬─────┘
        │     │
        │     │
      1:N    1:1
        │     │
        ▼     ▼
┌─────────────┐  ┌─────────────┐
│INVOICE_ITEMS│  │  PAYMENTS   │
└──────┬──────┘  └─────────────┘
       │
       │ N:1
       ▼
┌───────────────────┐
│     PRODUCTS      │
└─────────┬─────────┘
          │
          │ 1:N
          ▼
┌─────────────────────┐
│ INVENTORY_MOVEMENTS │
└─────────────────────┘
```

---

# 4. Prisma Model Definitions

```prisma
model Client {
  id            String   @id @default(uuid())
  gstNumber     String?  @unique
  companyName   String
  address       String?
  phone         String?

  invoices      Invoice[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Product {
  id            String   @id @default(uuid())
  productName   String
  hsnCode       String?
  unit          String
  currentStock  Decimal
  sellingPrice  Decimal

  invoiceItems  InvoiceItem[]
  movements     InventoryMovement[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Invoice {
  id            String   @id @default(uuid())
  invoiceNumber String   @unique

  clientId      String
  client        Client @relation(fields:[clientId], references:[id])

  subtotal      Decimal
  cgstAmount    Decimal
  sgstAmount    Decimal
  igstAmount    Decimal
  totalAmount   Decimal

  status        InvoiceStatus

  items         InvoiceItem[]
  payment       Payment?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

# 5. Business Rules

### Rule 1

```text
Invoice Created
      ↓
Create Invoice Items
      ↓
Reduce Inventory
      ↓
Create Payment Record
```

### Rule 2

```text
Invoice Updated
      ↓
Reverse Old Inventory
      ↓
Apply New Inventory
      ↓
Update Payment
```

### Rule 3

```text
Invoice Cancelled
      ↓
Restore Inventory
      ↓
Update Payment
      ↓
Mark Invoice Cancelled
```

### Rule 4

```text
Inventory Quantity
=
SUM(All Inventory Movements)
```

Never trust manual stock values as the source of truth.

---

# MVP Database Tables

```text
1. clients
2. products
3. invoices
4. invoice_items
5. payments
6. inventory_movements
```

These six tables are sufficient for Version 1 and fully support the invoice-driven workflow defined in your BRD, PRD, and architecture documents.   
