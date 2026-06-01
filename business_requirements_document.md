# Business Requirements Document (BRD)
# Smart Billing & Inventory Management System

---

# 1. Project Overview

## Project Name
Smart Billing & Inventory Management System

## Project Type
Business billing and inventory management application for small industrial and manufacturing businesses.

## Objective
The objective of this system is to replace the client’s current manual billing and inventory workflow with a digital system that:
- generates GST invoices automatically
- maintains inventory records
- tracks pending payments
- reduces repeated manual entry
- maintains printable invoice formats
- synchronizes billing, inventory, and payment data automatically

---

# 2. Business Goal

The business currently uses manual billing processes for:
- invoice generation
- GST calculations
- inventory management
- payment tracking

This creates operational problems such as:
- repeated customer data entry
- inventory mismatch
- manual calculation errors
- difficulty tracking payment delays
- slow invoice generation

The system should automate these workflows while preserving the business’s existing operational process.

---

# 3. Core Business Requirement

The entire system should behave as one interconnected workflow.

Any action performed in one module should automatically reflect in the related modules.

Example:
- creating a bill should reduce inventory
- cancelling a bill should restore inventory
- generating a bill should create a pending payment entry
- editing product prices should reflect in inventory records

The system should maintain synchronized operational data at all times.

---

# 4. User Type

## Primary User
Business Owner

The current version of the application does NOT require:
- user authentication
- multiple roles
- employee accounts
- permission management

The system is designed for direct owner/operator usage.

---

# 5. Business Scenarios

# Scenario 1 — Smart GST Billing Workflow

## Description
The owner creates a GST invoice for a customer.

---

## Workflow

### Step 1 — Open Billing Screen
The owner opens the billing application.

---

### Step 2 — Enter GST Number
The owner enters the customer GST number.

---

## Expected System Behavior

The system should automatically fetch previously saved customer details including:
- client name
- client address
- GST details
- contact information

This avoids repeated manual data entry.

---

### Step 3 — Add Product Details
The owner manually enters:
- product name
- HSN code
- quantity
- unit
- product price
- GST percentage

The product entry should remain flexible and editable.

---

### Step 4 — Automatic GST Calculation

The system should automatically calculate:
- subtotal
- CGST
- SGST
- IGST
- grand total invoice amount

---

### Step 5 — Invoice Generation

The system should:
- generate the final GST invoice
- prepare a print-friendly format
- allow PDF download
- allow invoice printing
- allow invoice sharing through WhatsApp

---

## Business Requirement Summary

The billing module should:
- reduce manual calculations
- speed up invoice generation
- preserve existing invoice workflow
- generate professional GST-compliant invoices

---

# Scenario 2 — Inventory Management Workflow

## Description
The owner manages inventory stock and product records.

---

## Workflow

### Step 1 — Open Inventory Module
The owner opens the inventory section.

---

### Step 2 — View Inventory Details

The inventory system should display:
- product name
- product category/type
- HSN code
- current quantity
- current product price
- last updated date/time

---

### Step 3 — Manual Inventory Update

The owner should be able to:
- add stock manually
- reduce stock manually
- edit current product price
- update product details

All changes should automatically synchronize with the stored data.

---

### Step 4 — Billing & Inventory Synchronization

The inventory system must remain interconnected with the billing module.

---

## Expected System Behavior

### Invoice Creation
When products are added in a bill:
- inventory quantity should automatically reduce

---

### Invoice Edit
When invoice quantities are modified:
- inventory quantities should automatically adjust

---

### Invoice Cancellation
When invoices are cancelled:
- inventory quantities should automatically restore

---

# Inventory History Requirement

The system should maintain inventory history records.

The owner should be able to view:
- what inventory was updated
- when it was updated
- quantity changes
- stock movement history

---

## Inventory Requirement Summary

The inventory module should:
- maintain accurate stock records
- synchronize with billing automatically
- maintain inventory history
- support manual stock management
- maintain editable product pricing

---

# Scenario 3 — Payment Delay Tracking Workflow

## Description
The owner tracks pending customer payments.

---

## Workflow

### Step 1 — Open Payment Tracking Module

The owner opens the payment tracking section.

---

### Step 2 — View Pending Payments

The system should display:
- customer name
- invoice number
- total bill amount
- pending amount
- payment delay duration
- number of delayed days

---

## Expected System Behavior

The system should automatically calculate:
- pending payment amounts
- payment aging/delay duration
- unpaid invoice status

No automatic reminder system is required in the current version.

---

## Payment Tracking Requirement Summary

The payment module should:
- track pending payments
- display overdue invoices
- calculate payment delays
- maintain payment records linked to invoices

---

# 6. Interconnected System Requirement

The billing system, inventory system, and payment tracking system must work as a single synchronized system.

---

# Central Workflow Relationship

```text
Invoice Created
    ├── Inventory Reduced
    ├── Payment Entry Created
    ├── GST Calculated
    └── Invoice Stored
```

---

# Invoice Edit Relationship

```text
Invoice Updated
    ├── Inventory Adjusted
    ├── Payment Updated
    └── Invoice Recalculated
```

---

# Invoice Cancellation Relationship

```text
Invoice Cancelled
    ├── Inventory Restored
    ├── Payment Entry Removed/Updated
    └── Invoice Status Updated
```

---

# 7. Functional Modules

The system will contain the following core modules:

| Module | Purpose |
|---|---|
| Billing Module | GST invoice generation |
| Client Module | Customer information management |
| Inventory Module | Stock management |
| Payment Module | Pending payment tracking |
| PDF/Print Module | Invoice printing and download |

---

# 8. Data Storage Requirements

The application requires database storage for operational data persistence.

---

## Data to be Stored

### Client Data
- GST number
- company name
- address
- contact details

---

### Product Data
- product name
- HSN code
- quantity
- current price
- unit type

---

### Invoice Data
- invoice number
- customer details
- product entries
- GST calculations
- invoice totals

---

### Inventory Data
- stock quantity
- inventory updates
- inventory movement history

---

### Payment Data
- pending amount
- paid amount
- overdue duration
- invoice payment status

---

# 9. User Experience Requirements

The application should prioritize:
- simplicity
- speed
- minimal clicks
- easy data entry
- operational clarity
- print readability

The application should NOT focus on:
- complex dashboards
- excessive visual effects
- unnecessary features

---

# 10. Future Scope (Not Included in Current Version)

Possible future enhancements:
- user authentication
- employee roles
- WhatsApp automation
- automated payment reminders
- analytics dashboard
- AI invoice OCR
- cloud backup
- mobile application

---

# 11. Final Business Objective

The final system should:
- digitize the current billing workflow
- reduce manual operational work
- reduce inventory mistakes
- simplify GST invoice generation
- improve payment tracking
- maintain synchronized business operations

The application should behave as a lightweight operational business tool rather than a complex ERP platform.
