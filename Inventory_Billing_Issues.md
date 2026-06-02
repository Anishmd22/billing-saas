# Inventory & Billing Integration Issues

## Priority: High

These issues directly impact inventory accuracy and business operations. The billing and inventory modules must function as a unified system.

---

# Issue 1: Missing Stock Removal Feature

## Current Behavior

The Inventory module currently provides only an **Add Stock (+)** action.

Users can increase stock quantities but cannot manually reduce stock when required.

---

## Expected Behavior

Users should be able to both:

- Add Stock (+)
- Remove Stock (-)

---

## Required Changes

### Add Stock (+)

Purpose:

- Increase product quantity
- Record stock-in transaction
- Update inventory immediately

### Remove Stock (-)

Purpose:

- Decrease product quantity
- Record stock-out transaction
- Update inventory immediately

Supported Reasons:

- Damaged
- Expired
- Lost
- Manual Adjustment
- Sample Usage
- Other

---

## Inventory History Requirement

Every stock movement must be recorded.

---

# Issue 2: Billing and Inventory Not Synced

## Current Behavior

When an invoice is created:

1. Products are added to the invoice.
2. Invoice is successfully generated.
3. Inventory quantity remains unchanged.

Result:

Inventory stock levels become inaccurate.

---

## Expected Behavior

Billing and Inventory should be fully integrated.

Whenever products are sold through an invoice, inventory must automatically update.

---

## Required Workflow

### Invoice Creation

1. User creates invoice.
2. User selects product(s).
3. User enters quantity.
4. Invoice is saved.
5. Inventory stock automatically decreases.

---

# Stock Validation Before Invoice Creation

Before creating an invoice:

Available Stock >= Invoice Quantity

If insufficient stock exists, prevent invoice creation and show:

"Insufficient stock available."

---

# Invoice Editing Logic

When an invoice is modified, inventory should adjust only by the difference between old and new quantities.

---

# Invoice Deletion Logic

Deleting an invoice should automatically restore inventory stock.

---

# Product Return Handling

Returned products should automatically increase inventory.

---

# Inventory Audit Trail

Maintain a complete stock movement history.

Required Fields:

- Date & Time
- Product
- Quantity Change
- Transaction Type
- Source Reference
- User

---

# Summary

## Feature Requests

- Add Remove Stock (-) functionality.
- Maintain stock movement history.
- Record stock adjustment reasons.

## Bug Fixes

- Automatically reduce inventory when invoices are created.
- Validate stock before invoice creation.
- Restore stock when invoices are deleted.
- Adjust stock correctly when invoices are edited.
- Increase stock automatically for returns.

## Goal

Create a reliable, fully synchronized Billing + Inventory workflow where inventory quantities always reflect actual stock levels.
