# System Architecture (C4 Model)
# Smart Billing & Inventory Management System

**Version:** 1.0 (MVP)  
**Architecture Style:** Modular Monolith  
**Technology Stack:** Next.js + Supabase + Prisma  
**Business Domain:** Billing, Inventory Management, Payment Tracking

---

# 1. C4 Model Overview

The system follows the C4 Model architecture approach:

| Level | Description |
|---------|-------------|
| Context | How external users interact with the system |
| Containers | Major deployable applications and services |
| Components | Internal modules inside the application |
| Code | Source code organization and implementation structure |

---

# Level 1 — System Context Diagram

## Purpose

The Smart Billing & Inventory Management System digitizes billing, inventory management, and payment tracking for small manufacturing businesses.

---

## Primary User

### Business Owner

Responsible for:

- Creating GST invoices
- Managing inventory
- Tracking pending payments
- Managing customer records
- Printing and sharing invoices

---

## External Systems

### WhatsApp

Used for invoice sharing.

### PDF Viewer / Printer

Used for invoice printing and downloading.

### Supabase Database

Stores all application data.

---

## Context Diagram

```text
+--------------------+
|   Business Owner   |
+---------+----------+
          |
          |
          v
+------------------------------------------------+
| Smart Billing & Inventory Management System    |
+------------------------------------------------+
|                                                |
|  Billing                                        |
|  Inventory                                      |
|  Clients                                        |
|  Payments                                       |
|  PDF Generation                                 |
|                                                |
+------------------------------------------------+
          |
          |
    +-----+------+
    |            |
    v            v
Supabase      PDF / WhatsApp
Database      Sharing
## Level 2 — Container Diagram

### Purpose

Shows the major deployable containers of the application.

Container Architecture
+-------------------------------------------------------------+
|                         User Browser                        |
+-------------------------------------------------------------+
                     |
                     | HTTPS
                     v

+-------------------------------------------------------------+
|                     Next.js Application                     |
|-------------------------------------------------------------|
| Frontend UI                                                 |
| React Components                                            |
| Billing Screens                                              |
| Inventory Screens                                            |
| Client Screens                                               |
| Payment Screens                                              |
+-------------------------------------------------------------+
                     |
                     | Internal API Calls
                     v

+-------------------------------------------------------------+
|                   Next.js Backend Layer                     |
|-------------------------------------------------------------|
| API Routes                                                  |
| Server Actions                                              |
| Business Logic                                               |
| Validation                                                   |
+-------------------------------------------------------------+
                     |
                     | Prisma ORM
                     v

+-------------------------------------------------------------+
|                  Supabase PostgreSQL                        |
|-------------------------------------------------------------|
| Clients                                                     |
| Products                                                    |
| Invoices                                                    |
| Invoice Items                                               |
| Inventory Movements                                         |
| Payments                                                    |
+-------------------------------------------------------------+

                     |
                     v

+-------------------------------------------------------------+
|                    PDF Generation Service                   |
|-------------------------------------------------------------|
| Puppeteer                                                   |
| Invoice Templates                                           |
| PDF Rendering                                               |
+-------------------------------------------------------------+
Container Responsibilities
Container	Responsibility
Browser UI	User interaction
Next.js Frontend	Screens and forms
Next.js Backend	Business rules and APIs
Supabase PostgreSQL	Data persistence
PDF Service	Invoice generation
## Level 3 — Component Diagram

### Purpose

Shows internal components inside the application container.

Core Modules
Next.js Application

├── Billing Module
├── Client Module
├── Inventory Module
├── Payment Module
├── PDF Module
├── Shared Core Services
└── Database Layer
Billing Module
Responsibilities
Invoice creation
GST calculation
Invoice editing
Invoice cancellation
Components
Billing Module
│
├── Invoice Controller
├── GST Calculator
├── Invoice Service
├── Invoice Validator
└── Invoice Repository
Client Module
Responsibilities
Customer management
GST lookup
Customer history
Components
Client Module
│
├── Customer Controller
├── Customer Service
├── GST Validation Service
├── Search Service
└── Customer Repository
Inventory Module
Responsibilities
Stock management
Inventory synchronization
Movement history
Components
Inventory Module
│
├── Product Service
├── Inventory Service
├── Stock Adjustment Service
├── Movement Logger
└── Inventory Repository
Payment Module
Responsibilities
Pending payment tracking
Payment updates
Delay calculations
Components
Payment Module
│
├── Payment Service
├── Payment Calculator
├── Aging Calculator
└── Payment Repository
PDF Module
Responsibilities
Invoice rendering
PDF generation
Print formatting
Components
PDF Module
│
├── Invoice Template Engine
├── PDF Renderer
├── Download Service
└── Print Service
Shared Core Components
Core Services
│
├── Prisma Client
├── Validation Layer
├── Utility Functions
├── Date Utilities
└── Error Handler
Module Interaction Flow
Invoice Creation
Billing Module
      |
      v
Inventory Module
      |
      v
Payment Module
      |
      v
PDF Module
Business Flow
Create Invoice
      |
      v
Calculate GST
      |
      v
Save Invoice
      |
      v
Reduce Inventory
      |
      v
Create Payment Record
      |
      v
Generate PDF
## Level 4 — Code Diagram

### Purpose

Represents actual source code organization.

Project Structure
src/

├── app/
│   ├── api/
│   │
│   ├── billing/
│   ├── inventory/
│   ├── clients/
│   ├── payments/
│   └── invoices/
│

├── modules/
│
│   ├── billing/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── validators/
│   │   └── types/
│   │
│   ├── clients/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── validators/
│   │
│   ├── inventory/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── validators/
│   │   └── movements/
│   │
│   ├── payments/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── validators/
│   │
│   └── pdf/
│       ├── services/
│       ├── templates/
│       └── renderers/
│

├── core/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── utils/
│   ├── constants/
│   └── types/
│

├── prisma/
│   ├── schema.prisma
│   └── migrations/
│

└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
Database Code Structure
Client
│
├── Invoices

Invoice
│
├── InvoiceItems
├── Payment
└── InventoryMovements

Product
│
├── InvoiceItems
└── InventoryMovements
Core Architectural Rules
Rule 1 — Invoice Driven System

Invoice is the central transaction object.

Invoice Created
      |
      ├── Inventory Reduced
      ├── Payment Created
      └── PDF Generated
Rule 2 — Inventory Synchronization
Invoice Created
    → SALE Movement

Invoice Updated
    → ADJUSTMENT Movement

Invoice Cancelled
    → CANCELLED_INVOICE Movement

Manual Update
    → ADD / ADJUSTMENT Movement
Rule 3 — Transaction Consistency

All critical operations must execute inside a Prisma Transaction.

BEGIN TRANSACTION

Create Invoice
Create Invoice Items
Reduce Inventory
Create Payment Record

COMMIT
## Final Architecture Summary
C4 Level	Description
Context	Business Owner interacting with Billing System
Containers	Next.js Frontend, Backend, Database, PDF Service
Components	Billing, Clients, Inventory, Payments, PDF
Code	Feature-based Modular Monolith Structure

The architecture follows a Modular Monolith pattern where the Invoice acts as the central business transaction, automatically synchronizing inventory, payment tracking, and PDF generation while maintaining transactional consistency across the entire system.