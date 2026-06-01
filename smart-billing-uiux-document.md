## UI/UX Design Document 

## Smart Billing & Inventory Management System 

**Version:** 1.0 (MVP) **Stack:** Next.js · TypeScript · Tailwind CSS · ShadCN UI **Design Philosophy:** Excel + Billing Book + Modern Browser App 

## 1. Design Principles 

|1. Design Principles|1. Design Principles|||
|---|---|---|---|
|**Principle**||**Description**||
|Speed First||Every action achievable in<br>3 clicks<br>≤||
|Operational Clarity||Data tables over cards; numbers over visuals||
|Print Readiness||Invoice screens mirror paper output||
|Workflow Familiarity||Mirrors existing manual billing book process||
|Zero Learning Curve||Business owner operates without a manual||
|||||
|2. Design Language<br>2.1 Color Palette<br>Base Palette||||
|**Token**|**Hex**||**Usage**|
|--color-primary|#0F172A||Sidebar background,<br>headings|
|--color-primary-light|#1E293B||Sidebar hover states|
|--color-accent|#3B82F6||Primary actions, active nav,<br>links|
|--color-accent-hover|#2563EB||Button hover|



|**Token**|**Hex**|**Usage**|
|---|---|---|
|--color-surface|#FFFFFF|Main content background|
|--color-surface-<br>secondary|#F8FAFC|Page background, table row<br>alt|
|--color-border|#E2E8F0|All borders, dividers|
|--color-border-strong|#CBD5E1|Table headers, input borders|



## Semantic Colors 

|Semantic Colors|||
|---|---|---|
|**Token**|**Hex**|**Usage**|
|--color-success|#16A34A|Paid status, stock available|
|--color-success-bg|#F0FDF4|Success badge background|
|--color-warning|#D97706|Partial payment, low stock|
|--color-warning-bg|#FFFBEB|Warning badge background|
|--color-danger|#DC2626|Pending overdue, out of stock|
|--color-danger-bg|#FEF2F2|Danger badge background|
|--color-muted|#64748B|Secondary text, labels|
|--color-muted-light|#94A3B8|Placeholder text, hints|



## GST Tax Colors 

|GST Tax Colors||
|---|---|
|**Tax**|**Color**|
|CGST|#6366F1(Indigo)|
|SGST|#8B5CF6(Violet)|
|IGST|#EC4899(Pink)|



## 2.2 Typography 

|**Role**|**Font**|**Size**|**Weight**|**Line Height**|
|---|---|---|---|---|
|Page Title|Geist Sans|20px|600|1.2|
|Section Heading|Geist Sans|16px|600|1.3|
|Table Header|Geist Sans|13px|500|1.4|
|Body Text|Geist Sans|14px|400|1.6|
|Small Label|Geist Sans|12px|400|1.4|
|Invoice Number|Geist Mono|14px|500|1.4|
|Currency<br>Amount|Geist Mono|14px|600|1.4|
|GST Number|Geist Mono|13px|400|1.4|
|Grand Total|Geist Mono|22px|700|1.2|



**Note:** Geist is Next.js native. Fall back to system-ui if unavailable. 

## 2.3 Spacing System 

Based on 4px base unit (Tailwind scale): 

|**Token**|**Value**|**Usage**|
|---|---|---|
|space-1|4px|Icon gaps, tight inline|
|space-2|8px|Input padding, small gaps|
|space-3|12px|Card internal padding|
|space-4|16px|Standard component spacing|
|space-5|20px|Section padding|
|space-6|24px|Card padding|
|space-8|32px|Page section gap|



|**Token**|**Value**|**Usage**|
|---|---|---|
|space-10|40px|Large vertical spacing|



## 2.4 Border Radius 

|2.4 Border Radius||
|---|---|
|**Context**|**Value**|
|Buttons|6px|
|Inputs|6px|
|Cards|8px|
|Modals|10px|
|Badges/Pills|9999px|
|Table|0px(no radius on table itself)|



## 2.5 Shadows 

|2.5 Shadows|||
|---|---|---|
|**Name**|**Value**|**Usage**|
|shadow-sm|0 1px 2px<br>rgba(0,0,0,0.06)|Inputs, table row hover|
|shadow-card|0 1px 4px<br>rgba(0,0,0,0.08)|Cards, dropdown|
|shadow-modal|0 8px 32px<br>rgba(0,0,0,0.12)|Modals, drawers|



## 3. Layout Architecture 

## 3.1 App Shell 

┌─────────────────────────────────────────────────────────┐ 

- │  SIDEBAR (240px fixed)  │  MAIN CONTENT AREA (flex-1)   │ 

- │  ─────────────────────  │  ─────────────────────────    │ 

- │  Logo + App Name        │  Top Bar (breadcrumb + actions)│ 

- │                         │  ─────────────────────────    │ 

- │  Nav Items:             │                               │ 

- │  • Dashboard            │  Page Content                 │ 

- │  • Create Bill          │  (Tables / Forms / Invoice)   │ 

- │  • Previous Bills       │                               │ 

- │  • Inventory            │                               │ 

- │  • Payments             │                               │ │  • Clients              │                               │ 

- │  ─────────────────────  │                               │ 

- │  Settings (bottom)      │                               │ 

└─────────────────────────────────────────────────────────┘ 

## 3.2 Sidebar Specification 

- **Width:** 240px fixed, full height, no collapse on desktop 

- **Background:** #0F172A (dark navy) 

- **Logo area:** 64px height, logo + "SmartBill" text 

- **Nav item height:** 40px 

- **Nav item padding:** 12px 16px 

- **Active state:** #1E3A5F background + #3B82F6 left border (3px) + white text 

- **Hover state:** #1E293B background + #94A3B8 text 

- **Default state:** transparent + #64748B text 

- **Icon:** 16px Lucide icon, left-aligned, 8px gap to label 

## 3.3 Top Bar Specification 

- **Height:** 56px 

- **Background:** White 

- **Border:** 1px bottom #E2E8F0 

- **Left:** Breadcrumb (page title + parent context) 

- **Right:** Primary action button for current page 

## 3.4 Content Area 

- **Background:** #F8FAFC 

- **Padding:** 24px all sides 

- **Max width:** none (full width) 

- **Scroll:** vertical only on content area 

## 4. Component Library 

## 4.1 Buttons 

Primary Button 

Background: #3B82F6 

Text: White, 14px, 500 weight 

Padding: 8px 16px 

Border radius: 6px 

Height: 36px 

Hover: #2563EB background 

Active: scale(0.98) 

Icon: 16px Lucide, 6px gap 

## Secondary Button 

Background: White 

Border: 1px #E2E8F0 

Text: #0F172A, 14px, 500 weight Padding: 8px 16px 

Height: 36px 

Hover: #F8FAFC background 

Danger Button Background: #DC2626 

Text: White 

(Same sizing as Primary) Hover: #B91C1C 

Ghost Button (icon-only) Background: transparent 

Border: none 

Icon: 16px, #64748B 

Hover: #F1F5F9 background, border-radius 6px 

Size: 32x32px 

## 4.2 Form Inputs 

Text Input Height: 36px 

Border: 1px #CBD5E1 

Border radius: 6px 

Padding: 8px 12px 

Font: 14px regular 

Placeholder: #94A3B8 

Focus: border #3B82F6, ring 2px #DBEAFE 

Background: White 

Select / Dropdown (Same as text input) 

Right icon: ChevronDown 16px #64748B 

Number Input (for quantities, rates) 

Text-align: right 

Font: Geist Mono, 14px 

(Same border and sizing) 

Search Input 

Left icon: Search 16px #94A3B8 

Padding-left: 36px 

(Otherwise same as text input) 

## 4.3 Tables 

Data Table Structure 

Header row: 

- Height: 40px 

- Background: #F8FAFC 

- Border-bottom: 1px #E2E8F0 

- Text: 12px, 500 weight, #64748B uppercase 

Body row: 

- Height: 48px 

- Border-bottom: 1px #F1F5F9 

- Background: White 

- Hover: #F8FAFC 

Footer row (totals): 

- Background: #F8FAFC 

- Border-top: 2px #E2E8F0 

- Font: 14px, 600 weight 

Column alignment: 

- Text: left-aligned 

- Numbers/Currency: right-aligned 

- Status badges: center-aligned 

- Action buttons: right-aligned, always last column 

## 4.4 Status Badges 

|4.4 Status Badges||||
|---|---|---|---|
|**Status**|**Background**|**Text Color**|**Label**|
|Paid|#F0FDF4|#16A34A|Paid<br>✓|
|Pending|#FEF2F2|#DC2626|Pending|
|Partial|#FFFBEB|#D97706|Partial|
|Cancelled|#F1F5F9|#64748B|Cancelled|
|In Stock|#F0FDF4|#16A34A|In Stock|
|Low Stock|#FFFBEB|#D97706|Low Stock|
|Out of Stock|#FEF2F2|#DC2626|Out of Stock|



Badge: font-size 12px, padding 3px 8px, border-radius 9999px, font-weight 500 

## 4.5 Cards 

Stat Card (Dashboard) 

Background: White 

Border: 1px #E2E8F0 

Border radius: 8px Padding: 20px 24px 

Min-height: 96px 

Label: 12px, #64748B, uppercase, 500 weight 

Value: 24px, Geist Mono, 700 weight, #0F172A 

Trend: 13px, success/danger color 

Content Card 

Background: White 

Border: 1px #E2E8F0 

Border radius: 8px 

Padding: 0 (header) + content 

Header: 48px, padding 0 24px, border-bottom 1px #E2E8F0 

Title: 15px, 600 weight 

Right slot: action buttons 

## 4.6 Modals & Drawers 

Modal (Confirmation / Small forms) 

Overlay: rgba(0,0,0,0.45) 

Container: White, 480px wide, border-radius 10px 

Header: 24px padding, border-bottom 1px #E2E8F0 

Body: 24px padding 

Footer: 16px 24px, border-top 1px #E2E8F0, right-aligned buttons 

Drawer (Billing Form) 

Position: right side 

Width: 640px 

Full height 

Overlay: rgba(0,0,0,0.3) 

Slides in from right on open 

## 5. Screen Designs 

## 5.1 Dashboard 

**Purpose:** Quick operational overview + fast access to primary actions. 

**Layout:** 2-column stat grid → Recent Bills table → Quick actions 

## Stat Cards (row of 4) 

|Stat Cards (row of 4)|||
|---|---|---|
|**Card**|**Value**|**Icon**|
|Today's Bills|Count + Total₹|FileText|
|Pending Payments|Total  overdue<br>₹|Clock|
|Low Stock Items|Count|Package|
|This Month Revenue|total<br>₹|TrendingUp|



## Recent Bills Table 

- Columns: Invoice No · Client Name · Date · Amount · Status · Actions 

- Show last 10 invoices 

- "View All" link to Previous Bills 

Quick Action Buttons (top right of page) 

- **+ New Bill** (Primary, blue) 

## 5.2 Create Bill Screen 

**Purpose:** Core billing workflow. Must be fast. 

**Layout:** Full-page form, NOT a modal/drawer. Dedicated route: /billing/new 

## Section 1: Bill Header 

**==> picture [436 x 292] intentionally omitted <==**

**----- Start of picture text -----**<br>
┌──────────────────────────────────────────────────────┐<br>│  Invoice Number (auto, read-only)  │  Date (today)   │<br>│  INV-2024-0041                     │  15 Jan 2025    │<br>├──────────────────────────────────────────────────────┤<br>│  GST Number Input                                    │<br>│  [Enter customer GST number...        ] [Fetch ]   │▶<br>├──────────────────────────────────────────────────────┤<br>│  Company Name (autofilled or manual)                 │<br>│  Address (autofilled or manual)                      │<br>│  Phone (autofilled or manual)                        │<br>└──────────────────────────────────────────────────────┘<br>**----- End of picture text -----**<br>


## **GST Fetch Behavior:** 

- On GST input + Enter/click → search saved clients 

- If found: autofill all fields, show green confirmation chip 

- If not found: show "New customer" label, all fields editable 

## Section 2: Product Line Items Table 

┌────┬──────────────────┬──────┬────────┬──────────┬───────┬ ──────────┬────────┐ 

│ #  │ Product Name     │ HSN  │  Qty   │  Unit    │  Rate │ GST %   │ Amount │ ├────┼──────────────────┼──────┼────────┼──────────┼───────┼ ──────────┼────────┤ │ 1  │ [text input    ] │[HSN] │ [num]  │[unit drp]│ [₹  ] │ [5/12/] │   —   │₹ │ 2  │ [text input    ] │[HSN] │ [num]  │[unit drp]│ [₹  ] │ [18/28] │   —   │₹ └────┴──────────────────┴──────┴────────┴──────────┴───────┴ ──────────┴────────┘ 

- [+ Add Item] 

## **Product Row Behavior:** 

- Product Name: free-text input (no mandatory lookup) 

- HSN Code: optional text input 

- Qty: numeric input, right-aligned 

- Unit: dropdown (Pcs, Kg, Ltr, Mtr, Box, Set, Nos) 

- Rate: numeric input, right-aligned,  prefix₹ 

- GST %: dropdown (0%, 5%, 12%, 18%, 28%) 

- Amount: auto-calculated, read-only, Geist Mono 

- Delete row: trash icon on hover (right side) 

- Tab key: moves to next cell inline 

Section 3: Totals Panel (Right-aligned sidebar within form) 

- ┌──────────────────────────────────┐ │  Subtotal               12,000  │₹ │  CGST (9%)               1,080  │₹ │  SGST (9%)               1,080  │₹ │  ─────────────────────────────── │ 

- │  Grand Total            14,160  │₹ │  Amount in words:                │ │  Fourteen Thousand One Hundred  │ 

- │  Sixty Rupees Only               │ 

└──────────────────────────────────┘ 

## **Tax Logic:** 

- Intra-state: CGST + SGST (split equally) 

- Inter-state: IGST (full amount) 

- Determined by: supplier state vs customer state in settings 

## Section 4: Action Bar (sticky bottom) 

[Save as Draft]  [Preview PDF]  [Generate Invoice ]▶ 

## **Generate Invoice Flow:** 

1. Validate all required fields 

2. Save invoice to DB 

3. Reduce inventory automatically 

4. Create pending payment entry 

5. Redirect to Invoice View page 

6. Show: Print / Download PDF / Share on WhatsApp buttons 

## 5.3 Invoice View Page 

**Purpose:** View generated invoice + perform post-generation actions. 

**Layout:** Invoice preview (A4 proportional) + action sidebar 

## Invoice Preview (Left, 65% width) 

Matches paper invoice format: 

┌──────────────────────────────────────────────────────┐ 

- │  [Company Logo]         TAX INVOICE                  │ 

- │  [Your Company Name]    Invoice No: INV-2024-0041    │ 

- │  [Your Address]         Date: 15 Jan 2025            │ 

│  GST: [Your GST No]     Due Date: 30 Jan 2025        │ 

├──────────────────────────────────────────────────────┤ 

│  Bill To:               Ship To: (if different)      │ │  [Client Name]                                       │ │  [Address]                                           │ │  GST: [Client GST]                                   │ ├──────────────────────────────────────────────────────┤ │  # │ Description │ HSN │ Qty │ Unit │ Rate │ Amount  │ │  1 │ Product A   │ ... │  10 │  Kg  │  50 │   500  │₹ ₹ ├──────────────────────────────────────────────────────┤ │                              Subtotal:   12,000    │₹ │                              CGST 9%:     1,080    │₹ │                              SGST 9%:     1,080    │₹ │                              TOTAL:      14,160    │₹ │  Amount in Words: Fourteen Thousand One Sixty Only   │ ├──────────────────────────────────────────────────────┤ │  Bank Details:           │  Terms & Conditions:      │ │  [Bank Name]             │  Payment due in 15 days   │ │  A/C: [Number]           │                           │ │  IFSC: [Code]            │  Authorised Signatory:    │ └──────────────────────────────────────────────────────┘ 

Action Sidebar (Right, 35% width) 

- [🖨 Print Invoice]        (full-width primary button) 

```
[⬇ Download PDF]          (full-width secondary button)
```

[💬 Share on WhatsApp]    (full-width green button) 

───────────────────────────── 

Payment Status: [Pending ▼] 

Change to: Paid / Partial / Pending 

───────────────────────────── 

[✏ Edit Invoice] 

[✕ Cancel Invoice] 

───────────────────────────── 

Inventory Updated: ✓ 

Payment Record Created: ✓ 

## 5.4 Previous Bills Screen 

**Purpose:** Invoice history browser with search, filter, actions. 

## **URL:** /billing/history 

## Top Bar 

- Search input (by invoice no, client name) 

- Filter: Date range picker 

- Filter: Status dropdown (All / Paid / Pending / Partial / Cancelled) 

- Export button (optional MVP) 

## Table Columns 

|**#**|**Invoice**<br>**No**|**Client**<br>**Name**|**Date**|**Items**|**Amount**|**Status**|**Actions**|
|---|---|---|---|---|---|---|---|
|-|INV-2024<br>-0041|Client Co.|15 Jan|3 items|14,160<br>₹|[Paid]|View /<br>Print /⋮|



## **Row Actions (⋮ menu):** 

- View Invoice 

- Edit Invoice 

- Download PDF 

- Print 

- Mark as Paid 

- Cancel Invoice 

**Pagination:** 20 rows per page, page numbers at bottom 

## 5.5 Inventory Screen 

**Purpose:** Stock management + movement history. 

## **URL:** /inventory 

**Layout:** Tab navigation: Products | Stock Movements 

## Products Tab 

## **Top Bar:** 

- Search input 

- [+ Add Product] button 

**Products Table:** | Product Name | HSN | Unit | Current Stock | Rate | Last Updated | Actions | |-------------|-----|------|--------------|------|--------------|---------| | Product A | 1234 | Kg | 850 kg | 120 | ₹ 2h ago | Edit / +Stock / History | 

## **Stock Status Logic:** 

   - 20% of max: Green "In Stock" 

- 10-20%: Orange "Low Stock" 

- 0-10%: Red "Out of Stock" 

## **Add/Edit Product Modal:** 

Product Name*    [____________] 

HSN Code         [____________] 

Unit*            [Pcs ▼       ] Opening Stock*   [____________] 

Rate*            [₹__________] 

Min Stock Alert  [____________] 

## **Add Stock Modal (+ Stock button):** 

Product: [Name auto-filled] 

Current Stock: 850 kg 

Add Quantity*   [____________] 

Reason          [Purchase / Adjustment ▼] 

Remarks         [____________] 

[Add Stock] 

## Stock Movements Tab 

**Table Columns:** | Date | Product | Type | Qty Change | Reference | Balance | |------|---------|------|-----------|-----------|---------| | 15 Jan 10:30 | Product A | Invoice Sale | -100 kg | INV-0041 | 850 kg | | 14 Jan 09:00 | Product A | Stock Added | +500 kg | Manual | 950 kg | 

## **Movement Types (colored):** 

- Invoice Sale → Red (-) 

- Stock Added → Green (+) 

- Invoice Cancelled → Green (+, dashed) 

- Manual Adjustment → Orange (±) 

## 5.6 Pending Payments Screen 

**Purpose:** Track overdue and pending invoices. 

## **URL:** /payments 

## Summary Strip (top of page) 

[Total Pending: 2,45,000]  [Overdue: 89,000]  [This Month: 1,56,000]₹ ₹ ₹ 

## Filters 

- Search by client name 

- Filter by: All / Overdue / Pending / Partial 

- Sort by: Amount / Days Overdue / Client Name 

## Payments Table 

|**Client**|**Invoice**<br>**No**|**Invoice**<br>**Date**|**Due**<br>**Date**|**Total**|**Paid**|**Pendin**<br>**g**|**Days**<br>**Overdu**<br>**e**|**Actions**|
|---|---|---|---|---|---|---|---|---|
|ABC<br>Co.|INV-004<br>1|01 Jan|15 Jan|14,160<br>₹|0<br>₹|14,160<br>₹|30 days|Update /<br>View|



## **Row Coloring:** 

- Overdue > 30 days: subtle red row background (#FEF2F2) 

- Overdue 15-30 days: subtle orange row background (#FFFBEB) 

- Recent/normal: white 

## **Update Payment Modal:** 

Invoice: INV-2024-0041 

Client: ABC Company 

Total Amount: 14,160₹ 

Amount Paid:  [________]₹ 

Payment Date: [________] 

Payment Mode: [Cash / NEFT / UPI / Cheque ▼] 

Reference No: [________] 

Mark as:      [● Full Payment  ○ Partial  ○ Adjust] 

[Save Payment] 

## 5.7 Client Management Screen 

**Purpose:** Manage customer master data. 

## **URL:** /clients 

## Clients Table 

|**Client**<br>**Name**|**GST**<br>**Number**|**Phone**|**City**|**Last**<br>**Invoice**|**Pending**<br>**Balance**|**Actions**|
|---|---|---|---|---|---|---|
|ABC Pvt<br>Ltd|29ABCDE..<br>.|987654321<br>0|Bangalore|15 Jan|14,160<br>₹|View / Edit|



## Client Detail View (drawer from right) 

── Client Info ────────────────────────────── 

Company Name: ABC Private Limited 

GST Number:   29ABCDE1234F1Z5 

Address:      123 Industrial Area, Bangalore 

Phone:        +91 98765 43210 

Email:        billing@abcpvtltd.com 

── Invoice History ────────────────────────── 

[Mini table of last 5 invoices] 

── Payment Summary ────────────────────────── 

Total Billed:   2,45,000₹ 

Total Paid:     2,00,000₹ 

Pending:        45,000₹ 

## 5.8 Settings Screen 

**Purpose:** Configure business info and system defaults. 

**URL:** /settings 

## **Sections:** 

## Business Information 

- 

   - Company Name 

- GST Number 

- Address 

- State (for CGST/SGST vs IGST logic) 

- Phone / Email 

- Company Logo (upload) 

## Invoice Settings 

- Invoice Prefix (INV-, BILL-, etc.) 

- Starting Invoice Number 

- Default Due Days 

- Default Terms & Conditions 

- Bank Account Details (for invoice footer) 

## Tax Settings 

- Default GST Rates (checkbox list to configure commonly used rates) 

- Business Type: Regular / Composition 

## Print Settings 

- Paper Size: A4 / A5 / Letter 

- Show Logo on Invoice: Yes / No 

- Show Bank Details: Yes / No 

- Show Signature Line: Yes / No 

## 6. User Flows 

## 6.1 Primary Billing Flow 

Dashboard 

## ↓ Click "New Bill" 

Create Bill Page 

- ↓ Enter GST Number → [Fetch Client] 

- ↓ Client auto-filled / manual entry 

- ↓ Add product line items 

- ↓ GST auto-calculated 

- ↓ Click "Generate Invoice" 

Invoice Generated 

- ↓ Inventory auto-reduced 

- ↓ Payment entry auto-created 

Invoice View Page 

- ↓ Print / Download PDF / WhatsApp 

Done 

## 6.2 Payment Update Flow 

Pending Payments Screen 

- ↓ Find client invoice 

- ↓ Click "Update Payment" 

- ↓ Modal: Enter amount paid 

- ↓ Select: Full / Partial 

- ↓ Save 

Payment status updated on Invoice 

- ↓ If partial → Pending balance updated 

- ↓ If full → Marked as Paid 

## 6.3 Stock Addition Flow 

Inventory Screen → Products Tab 

- ↓ Click "+Stock" on product row 

- ↓ Modal: Enter quantity, reason 

↓ Save 

Stock Quantity Updated 

Inventory Movement Log Created (+) 

## 6.4 Invoice Cancellation Flow 

Previous Bills → Find Invoice 

- ↓ ⋮ Menu → Cancel Invoice 

- ↓ Confirmation modal 

- ↓ Confirm 

Invoice Status → Cancelled 

Stock Restored (movement log created) 

Payment Record Updated/Removed 

## 7. Invoice PDF Layout Specification 

**Paper Size:** A4 (210mm × 297mm) 

**Margins:** 15mm all sides 

**Fonts in PDF:** NotoSans (GST-compliant, supports Indian characters) 

## **Sections (top to bottom):** 

1. **Header Band** (full-width, navy background) 

   - Left: Company Logo + Name + Address 

   - Right: "TAX INVOICE" heading + Invoice No + Date 

2. **Bill To / Ship To** (two-column) 

   - Client name, address, GST number 

## 3. **Line Items Table** 

- Header: Sr. | Description | HSN | Qty | Unit | Rate | Taxable | GST% | Amount 

- Rows: product line items 

- Footer: Subtotals row 

## 4. **Tax Summary Block** (right-aligned) 

- Taxable Amount 

- CGST + SGST / IGST 

- Grand Total (larger font) 

- Amount in words (full width) 

## 5. **Footer** 

- Left: Bank Details 

- Right: Terms + Signature line 

## 8. Keyboard Navigation & Shortcuts 

|**Shortcut**|**Action**|
|---|---|
|Ctrl + N|New Bill|
|Ctrl + S|Save/Generate Invoice (on billing page)|
|Ctrl + P|Print current invoice|
|Tab|Next field in billing table|
|Shift + Tab|Previous field|
|Enter|Confirm GST fetch|
|Delete|Remove selected line item|
|Escape|Close modal/drawer|



## 9. Responsive Behavior 

**Target:** Desktop-first (1280px+) 

## **Minimum supported:** 1024px width 

## **No mobile support in MVP** (per product scope) 

## **Breakpoints:** 

- 1280px+: Full layout (sidebar 240px) 

- 1024-1280px: Sidebar 200px, content area compressed 

- < 1024px: Not supported in v1 

## 10. Loading & Empty States 

## Loading States 

- Table loading: skeleton rows (shimmer animation) 

- Form submit: button spinner, disable all inputs 

- PDF generation: full overlay with "Generating PDF..." message 

- GST fetch: input spinner 

## Empty States 

Each module should show a contextual empty state: 

|**Screen**|**Empty State Message**|**CTA**|
|---|---|---|
|Previous Bills|"No invoices yet. Create your<br>first bill."|+ New Bill|
|Inventory|"No products added yet."|+ Add Product|
|Payments|"No pending payments. All<br>clear!"|—|
|Clients|"No clients saved yet."|+ Add Client|



## Error States 

- Form validation: red border + helper text below field 

- GST fetch fail: "Client not found. Enter details manually." (non-blocking) 

- Save fail: Toast notification (top-right, red) 

## 11. Notification System (Toasts) 

Using **Sonner** (already in tech stack): 

|**Type**|**Color**|**Trigger**|
|---|---|---|
|Success|Green|Invoice generated, payment<br>updated, stock added|
|Error|Red|Save failed, validation error|
|Warning|Orange|Low stock alert, overdue<br>payment reminder|
|Info|Blue|Invoice already exists, draft<br>saved|



Position: Top-right, auto-dismiss 4 seconds 

## 12. Component File Structure 

src/ 

├── components/ 

- │   ├── ui/                  (ShadCN base components) 

- │   ├── billing/ 

- │   │   ├── BillingForm.tsx 

- │   │   ├── LineItemsTable.tsx 

- │   │   ├── TotalsPanel.tsx 

- │   │   ├── InvoicePreview.tsx 

- │   │   └── GSTFetchInput.tsx 

- │   ├── inventory/ 

- │   │   ├── ProductTable.tsx 

- │   │   ├── AddStockModal.tsx 

- │   │   └── MovementHistory.tsx 

- │   ├── payments/ 

- │   │   ├── PaymentTable.tsx 

- │   │   └── UpdatePaymentModal.tsx 

- │   ├── clients/ 

- │   │   ├── ClientTable.tsx 

- │   │   └── ClientDrawer.tsx 

- │   ├── shared/ 

- │   │   ├── StatusBadge.tsx 

- │   │   ├── CurrencyDisplay.tsx 

- │   │   ├── DataTable.tsx 

- │   │   ├── EmptyState.tsx 

- │   │   ├── PageHeader.tsx 

- │   │   └── ConfirmModal.tsx 

- │   └── layout/ 

- │       ├── Sidebar.tsx 

- │       ├── TopBar.tsx 

- │       └── AppShell.tsx 

## 13. Accessibility 

- All form inputs have associated <label> elements 

- Tables use <thead>, <tbody>, <th scope="col"> 

- Buttons have descriptive aria-label when icon-only 

- Color is never the sole indicator of status (always paired with text) 

- Focus rings visible on all interactive elements 

- Tab order follows reading order 

- Error messages announced via aria-live="polite" 

## 14. Design Checklist (Pre-Development) 

Confirm invoice format with client (paper invoice scan) Confirm GST state (intra vs inter-state tax logic) Confirm invoice prefix format (INV- / BILL- / custom) Collect company logo for invoice header Confirm bank details for invoice footer Confirm unit types used (Pcs, Kg, Mtr, Ltr, Box, etc.) Confirm default GST rates used most often Confirm due date default (15 days / 30 days) Collect existing paper invoice for PDF template matching 

_End of UI/UX Design Document — Smart Billing & Inventory Management System v1.0_ 

