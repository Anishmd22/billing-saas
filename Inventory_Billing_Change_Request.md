# Inventory & Billing SaaS – Change Request Document

## Objective

Implement the requested fixes and enhancements **without affecting any currently working modules**. Changes should be isolated to the specified inventory and billing functionalities only.

---

# Phase 1 – Analysis & Clarification

## Inventory Module

### Issue 1: Add Stock – "Invalid Product ID"

#### Current Behavior

When a user clicks **Add Stock** and enters an additional quantity, the system returns:

```text
Invalid Product ID
```

#### Expected Behavior

The system should:

1. Validate the selected product.
2. Update the stock quantity.
3. Save the updated value in the database.
4. Reflect the updated stock in the UI immediately.

#### Investigation Checklist

- Verify Product ID mapping between frontend and backend.
- Verify API payload structure.
- Verify database references.
- Check for mismatched field names (`id`, `_id`, `productId`, etc.).
- Confirm inventory records exist for the selected product.

#### Issue 2: Edit Stock Updates But UI Does Not Reflect Changes

#### Current Behavior

Example:

```text
Aluminum = 200 pcs
```

User updates stock:

```text
+50 pcs
```

System displays:

```text
Updated Successfully
```

However, inventory still displays:

```text
200 pcs
```

#### Expected Behavior

After updating stock:

```text
200 + 50 = 250 pcs
```

The updated value should appear immediately in the inventory UI without requiring manual refresh.

#### Investigation Checklist

- Verify database update operation.
- Verify API response.
- Verify frontend state refresh.
- Verify cache invalidation.
- Verify inventory table re-rendering.

#### Questions

1. After page refresh, does the value change is not changing but the updation is happening only the chanegs didn't appear in frontend
2. Is state managed through React State, Context API, Redux, Zustand, or another method?
3. Is inventory data fetched after update completion?

---

# Billing Module

## Enhancement 1: Auto-Fetch Client Information

### Current Behavior

When selecting an existing client, only the client name is populated.

### Expected Behavior

When a saved client is selected, automatically fetch and populate:

- Client Address
- GST Number
- Phone Number (if available)
- Email (if available)

### Example Flow

```text
Select Client
      ↓
Fetch Client Record
      ↓
Populate Billing Form
      ↓
Address + GST + Contact Information Displayed
```

### Requirements

- Auto-fetch information from existing client records.
- Allow manual editing after auto-fill.
- Do not affect current billing calculations.

### Validation

Ensure the client schema contains:

```text
Client
├── id
├── name
├── address
├── gstNumber
├── phone
└── email
```

---

## Enhancement 2: PDF Download Functionality

### Current Behavior

Clicking **Download PDF** redirects to a blank screen or empty page.

### Expected Behavior

Clicking **Download PDF** should:

```text
Generate Invoice PDF
      ↓
Download File Automatically
      ↓
invoice.pdf saved locally
```

### Investigation Checklist

- Verify PDF generation service.
- Verify API endpoint.
- Verify response headers.
- Verify blob/file handling.
- Verify frontend download logic.

### Validation

Confirm:

- PDF content is generated correctly.
- PDF downloads directly.
- No blank page appears.
- Invoice formatting remains unchanged.

---

# Database & API Validation

Before implementation, verify the following schemas and API mappings.

## Product Schema

```text
Product
├── id
├── name
├── sku
├── unit
└── stock
```

---

## Inventory Schema

```text
Inventory
├── productId
├── quantity
└── updatedAt
```

---

## Client Schema

```text
Client
├── id
├── name
├── address
├── gstNumber
├── phone
└── email
```

---

## Invoice Schema

```text
Invoice
├── invoiceNumber
├── clientId
├── items
├── total
└── createdAt
```

---

# Phase 2 – Implementation

## Inventory Fixes

### Fix 1 – Add Stock

#### Tasks

- Correct Product ID mapping.
- Validate Product ID before update.
- Update inventory quantity correctly.
- Persist updates to database.
- Return successful API response.

#### Validation

```text
Existing Stock: 200
Added Stock: +50
Result: 250
```

Must update both database and UI.

---

### Fix 2 – Edit Stock

#### Tasks

- Update inventory record.
- Refresh frontend state.
- Refresh inventory table.
- Ensure updated value appears instantly.

#### Validation

```text
Before: 200 pcs
After : 250 pcs
```

No page refresh should be required.

---

# Billing Enhancements

## Feature 1 – Client Auto-Fetch

### Tasks

- Fetch selected client details.
- Populate:
  - Address
  - GST Number
  - Phone
  - Email
- Allow editing after population.

### API Example

```http
GET /clients/:id
```

---

## Feature 2 – PDF Download

### Tasks

- Fix PDF generation process.
- Fix API response handling.
- Fix frontend download handling.
- Download PDF directly instead of opening a blank page.

### Expected Result

```text
Click Download PDF
      ↓
invoice_XXXX.pdf downloaded
```

---

# Regression Protection Requirements

## Do Not Modify

The following modules must remain untouched and fully functional:

- Billing calculations
- Invoice numbering
- Client creation
- Product creation
- Authentication
- Dashboard
- Reports
- Existing working APIs
- Existing business logic

---

## Modify Only

The following areas are approved for modification:

### Inventory

- Add Stock workflow
- Edit Stock workflow

### Billing

- Client auto-fetch details
- PDF download functionality

---

# Testing Requirements

Perform complete testing before deployment.

## Inventory Testing

- Add stock
- Remove stock
- Edit stock
- Refresh validation
- Database validation
- UI validation

## Billing Testing

- Client selection
- GST auto-fill
- Address auto-fill
- Invoice generation
- PDF download

## Regression Testing

Confirm:

- Existing billing works correctly.
- Existing inventory works correctly.
- No new errors introduced.
- No working modules affected.

---

# Critical Instruction

Implement only the requested changes.

Do not refactor unrelated code, APIs, database structures, UI components, authentication flows, or business logic unless absolutely necessary to resolve the specified issues.

All changes must be backward-compatible and must not disrupt any currently functioning module.
