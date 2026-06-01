
# Product Requirements Document (PRD)
# Smart Billing & Inventory Management System

## 1. Product Overview

### Product Name
Smart Billing & Inventory Management System

### Product Type
Lightweight business billing application for small manufacturing and industrial businesses.

### Primary Goal
Replace manual billing books and challan workflows with a fast, simple digital system that:
- generates GST invoices
- tracks inventory automatically
- maintains pending payment records
- generates printable PDFs
- reduces manual work and calculation errors

---

## 2. Business Problem

Currently, the client manages:
- handwritten invoices
- manual GST calculations
- stock tracking separately
- payment tracking manually
- printed challans and invoices

This causes:
- repeated data entry
- calculation mistakes
- inventory mismatch
- payment tracking difficulty
- slow invoice generation

The software should automate these workflows while preserving the existing invoice format and operational process.

---

## 3. Product Vision

The application should function as:

“A digital replacement for the existing paper billing workflow.”

The software should prioritize:
- speed
- simplicity
- operational accuracy
- print-friendly invoice generation
- automatic stock synchronization

The system should NOT behave like a complicated ERP.

---

## 4. Scope of Version 1 (MVP)

### Included Modules
1. Billing / Invoice Generation
2. Client Management
3. Inventory Management
4. Pending Payment Tracking
5. PDF & Print Management

### Excluded Modules (Future Scope)
- Role-based authentication
- Multi-user system
- Employee management
- Analytics dashboard
- AI features
- Advanced accounting
- Cloud multi-tenant architecture

---

## 5. Core Workflow

Enter GST Number
↓
Fetch Client Details Automatically
↓
Add Products Manually
↓
Automatic GST Calculation
↓
Generate Invoice
↓
Download PDF / Print / WhatsApp
↓
Inventory Automatically Reduced
↓
Pending Payment Entry Created

---

## 6. Functional Requirements

### 6.1 Client Management Module

#### Purpose
Store customer details and enable GST-based autofill.

#### Features
- Enter GST number
- Automatically fetch:
  - company name
  - address
  - GST details
- Store customer records
- Reuse customer details in future invoices

#### Data to Store
- GST number
- Company name
- Address
- Phone number
- Previous invoice references
- Pending balance

---

### 6.2 Billing / Invoice Module

#### Purpose
Generate GST-compliant invoices quickly.

#### Features
- Create new invoice
- Auto invoice numbering
- Add products manually
- Enter:
  - product name
  - quantity
  - unit
  - rate
  - GST percentage
- Automatic calculation:
  - subtotal
  - CGST
  - SGST
  - IGST
  - grand total
- Edit invoices
- Delete/cancel invoices
- Reprint invoices
- Download PDF
- Share invoice through WhatsApp

#### Important Requirement
Product entry should remain flexible.
Users should be able to type custom product names directly without mandatory product creation.

---

### 6.3 Inventory Management Module

#### Purpose
Automatically track stock movement.

#### Features
- Add stock manually
- Reduce stock automatically from invoices
- Restore stock when invoice is edited or cancelled
- View current stock
- View inventory history

#### Important Logic
Invoice Created → Stock Reduced

Invoice Edited → Stock Adjusted Automatically

Invoice Cancelled → Stock Restored

---

### 6.4 Inventory Movement Tracking

#### Purpose
Maintain accurate stock history.

#### Requirement
The system should NOT only store final stock quantity.

Instead, it should store inventory movement logs.

Example:
- Stock Added → +5000
- Invoice Sale → -100
- Invoice Cancelled → +100

This ensures:
- traceability
- stock consistency
- error recovery
- inventory audit history

---

### 6.5 Pending Payment Module

#### Purpose
Track unpaid invoices.

#### Features
- Mark invoices as:
  - Paid
  - Pending
  - Partial
- Track:
  - total amount
  - paid amount
  - pending amount
- Update payment status later

---

### 6.6 PDF & Print Module

#### Purpose
Generate printable invoices matching the client’s current paper format.

#### Features
- Generate PDF invoice
- Print invoice
- Download invoice
- WhatsApp-ready format
- Maintain same layout as existing manual invoice format

---

## 7. User Experience Requirements

### UI Expectations
The application should prioritize:
- fast data entry
- minimal clicks
- simple tables
- easy editing
- print readability

### UI Style
The interface should feel like:
“Excel + Billing Book + Modern Browser App”

The UI should NOT focus on:
- excessive animations
- complex dashboards
- unnecessary visual effects

---

## 8. Dashboard Requirements

### Main Actions
- Create New Bill
- Inventory
- Previous Bills
- Pending Payments
- Settings

---

## 9. Previous Bills Module

### Features
- View invoice history
- Search invoices
- Edit invoices
- Reprint invoices
- Download PDFs
- Delete/cancel invoices

---

## 10. System Behavior Requirements

### Central Business Logic

The invoice acts as the central transaction object.

Whenever an invoice changes:
- inventory changes
- payment records update
- PDF regenerates automatically

---

## 11. Database Requirements

A database is required because the system must persist and synchronize operational data.

### Core Data Entities
- Clients
- Products
- Invoices
- Invoice Items
- Inventory Movements
- Payments

---

## 12. Important Design Principles

### Simplicity First
The software should remain lightweight and easy to operate.

### Operational Accuracy
All modules must stay synchronized.

### Single Source of Truth
- inventory should derive from inventory movements
- payment status should derive from payment records
- invoice totals should derive from invoice items

Avoid duplicate manual updates.

---

## 13. Non-Functional Requirements

### Performance
- Fast invoice creation
- Instant calculations
- Quick PDF generation

### Reliability
- Accurate stock synchronization
- Accurate GST calculations
- Stable invoice history

### Usability
- Minimal training required
- Familiar workflow
- Print-friendly interface

---

## 14. Future Scope (Not Included in MVP)

Possible future enhancements:
- Multi-user authentication
- Cloud backup
- WhatsApp automation
- AI invoice OCR
- Voice billing
- Advanced reports
- Analytics dashboard
- Purchase order management
- Mobile application

---

## 15. Final Product Goal

The software should:
- reduce manual work
- speed up billing
- reduce inventory mistakes
- simplify payment tracking
- preserve the client’s familiar workflow

The product should behave as a practical operational tool rather than a complex enterprise ERP system.
