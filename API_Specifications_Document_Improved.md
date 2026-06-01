# API Specifications Document
# Smart Billing & Inventory Management System

**Version:** 1.0 (MVP)  
**Architecture:** Modular Monolith (Next.js + Prisma + Supabase PostgreSQL)

---

# Table of Contents

1. Introduction
2. Business Context
3. System Architecture
4. API Standards
5. API Versioning Strategy
6. Shared Data Models
7. Endpoint Catalog
8. Client APIs
9. Product APIs
10. Inventory APIs
11. Invoice APIs
12. Payment APIs
13. PDF APIs
14. Validation Rules
15. Business Rules
16. Transaction Flows
17. Sequence Diagrams
18. Error Catalog
19. Prisma Implementation Notes
20. Route Structure
21. Future Roadmap

---

# 1. Introduction

This document defines the complete API contract for the Smart Billing & Inventory Management System.

Goals:

- GST invoice generation
- Inventory synchronization
- Payment tracking
- PDF generation
- Operational consistency

---

# 2. Business Context

The Invoice is the central transaction object.

Invoice Created
→ Create Invoice Items
→ Reduce Inventory
→ Create Payment Record
→ Generate PDF

Invoice Updated
→ Reverse Previous Inventory Impact
→ Apply New Inventory Impact
→ Update Payment Record

Invoice Cancelled
→ Restore Inventory
→ Update Payment Status
→ Preserve Audit History

---

# 3. System Architecture

Frontend (Next.js)
↓
REST API Layer
↓
Service Layer
↓
Prisma ORM
↓
Supabase PostgreSQL

---

# 4. API Standards

Protocol: HTTPS

Content-Type:

```http
application/json
```

Success Response:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error Response:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

# 5. API Versioning Strategy

```text
/api/v1

Future:
/api/v2
```

---

# 6. Shared Data Models

## Client

| Field | Type | Required | Description |
|---------|---------|---------|---------|
| id | UUID | Yes | Primary Key |
| gst_number | String | Yes | GST Number |
| company_name | String | Yes | Customer Name |
| address | String | No | Customer Address |
| phone | String | No | Contact Number |

## Product

| Field | Type | Required | Description |
|---------|---------|---------|---------|
| id | UUID | Yes | Product ID |
| product_name | String | Yes | Product Name |
| hsn_code | String | No | HSN Code |
| current_stock | Decimal | Yes | Current Stock |
| selling_price | Decimal | Yes | Product Price |

## Invoice

| Field | Type | Required | Description |
|---------|---------|---------|---------|
| id | UUID | Yes | Invoice ID |
| invoice_number | String | Yes | Unique Number |
| total_amount | Decimal | Yes | Final Amount |
| status | Enum | Yes | Invoice Status |

---

# 7. Endpoint Catalog

## Clients

- POST /api/clients
- GET /api/clients
- GET /api/clients/:id
- PUT /api/clients/:id
- DELETE /api/clients/:id

## Products

- POST /api/products
- GET /api/products
- GET /api/products/:id
- PUT /api/products/:id
- DELETE /api/products/:id

## Inventory

- POST /api/inventory/movements
- GET /api/inventory/movements
- GET /api/inventory/summary

## Invoices

- POST /api/invoices
- GET /api/invoices
- GET /api/invoices/:id
- PUT /api/invoices/:id
- PATCH /api/invoices/:id/cancel

## Payments

- GET /api/payments
- PUT /api/payments/:id

## PDF

- POST /api/pdf/generate

---

# 8. Client APIs

## Create Client

Endpoint:

```http
POST /api/clients
```

Business Purpose:
Create customer records for GST billing.

Database Impact:

- INSERT clients

Validation:

- GST required
- Company name required
- GST unique

---

# 9. Product APIs

## Create Product

Endpoint:

```http
POST /api/products
```

Business Purpose:
Create inventory product.

Database Impact:

- INSERT products
- INSERT inventory_movements (initial stock)

---

# 10. Inventory APIs

## Record Inventory Movement

Endpoint:

```http
POST /api/inventory/movements
```

Business Purpose:
Maintain inventory audit trail.

Rule:

Current Stock =
Sum(All Inventory Movements)

---

# 11. Invoice APIs

## Create Invoice

Endpoint:

```http
POST /api/invoices
```

Transaction Flow:

BEGIN

1. Create Invoice
2. Create Invoice Items
3. Reduce Inventory
4. Create Inventory Movement
5. Create Payment Record

COMMIT

Affected Tables:

- invoices
- invoice_items
- inventory_movements
- products
- payments

---

## Invoice Lifecycle

DRAFT
↓
GENERATED
↓
PARTIAL_PAYMENT
↓
PAID

OR

GENERATED
↓
CANCELLED

---

# 12. Payment APIs

## Update Payment

Endpoint:

```http
PUT /api/payments/:id
```

Payment Lifecycle

PENDING
↓
PARTIAL
↓
PAID

Formula

pendingAmount =
totalAmount - paidAmount

---

# 13. PDF APIs

## Generate Invoice PDF

Endpoint:

```http
POST /api/pdf/generate
```

Flow:

Fetch Invoice
↓
Generate HTML
↓
Render PDF
↓
Upload Storage
↓
Return URL

---

# 14. Validation Rules

## Invoice

- Minimum one item
- Quantity > 0
- Rate > 0
- Client exists
- Sufficient stock

## Payment

- Paid amount cannot exceed total amount

## Inventory

- Stock cannot become negative

---

# 15. Business Rules

1. Invoice is the system orchestrator.
2. Inventory derives from movement records.
3. Payment status derives from payment records.
4. Historical invoice data must remain immutable.
5. Invoice cancellation must restore inventory.

---

# 16. Transaction Flows

## Invoice Creation

Invoice
↓
Invoice Items
↓
Inventory Movement
↓
Payment
↓
Commit

## Invoice Cancellation

Cancel Invoice
↓
Restore Stock
↓
Create Reversal Movement
↓
Update Payment

---

# 17. Sequence Diagrams

## Create Invoice

User
↓
Frontend
↓
Invoice API
↓
Invoice Service
↓
Inventory Service
↓
Payment Service
↓
Database

## Cancel Invoice

User
↓
Frontend
↓
Invoice API
↓
Restore Inventory
↓
Update Payment
↓
Database

---

# 18. Error Catalog

| Code | Status | Description |
|--------|--------|--------|
| ERR_CLIENT_NOT_FOUND | 404 | Client missing |
| ERR_PRODUCT_NOT_FOUND | 404 | Product missing |
| ERR_INSUFFICIENT_STOCK | 400 | Stock unavailable |
| ERR_DUPLICATE_GST | 409 | GST already exists |
| ERR_TX_FAILED | 500 | Transaction failed |
| ERR_PDF_TIMEOUT | 504 | PDF generation timeout |

---

# 19. Prisma Implementation Notes

Use Prisma Transactions for:

- Invoice Creation
- Invoice Update
- Invoice Cancellation

Never update stock without creating an inventory movement record.

---

# 20. Route Structure

```text
src/app/api/

clients/
products/
inventory/
invoices/
payments/
pdf/
```

---

# 21. Future Roadmap

- Authentication
- Multi-user support
- Role permissions
- WhatsApp automation
- Analytics dashboard
- AI OCR
- Mobile application
