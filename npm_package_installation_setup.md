# Smart Billing System
# Required Package Installation Setup

---

# Frontend Setup

## Create Next.js App

```bash
npx create-next-app@latest smart-billing-frontend --typescript
```

---

# Frontend Packages

## Core Packages

```bash
npm install axios
npm install react-hook-form
npm install zod
npm install @hookform/resolvers
npm install dayjs
```

---

## UI Packages

```bash
npm install lucide-react
npm install clsx
npm install tailwind-merge
npm install sonner
```

---

## PDF & Printing Packages

```bash
npm install html2pdf.js
npm install react-to-print
npm install jspdf
```

---

## Tailwind CSS Setup

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## ShadCN UI Setup

```bash
npx shadcn@latest init
```

---

# Backend Setup

```bash
mkdir smart-billing-backend
cd smart-billing-backend
npm init -y
```

---

# Backend Packages

## Core Backend Packages

```bash
npm install express
npm install cors
npm install dotenv
npm install zod
npm install dayjs
```

---

## Database Packages

```bash
npm install prisma
npm install @prisma/client
npm install pg
```

---

## Authentication Packages (Future Safe)

```bash
npm install bcryptjs
npm install jsonwebtoken
```

---

# Development Dependencies

```bash
npm install -D typescript
npm install -D ts-node
npm install -D nodemon
npm install -D @types/node
npm install -D @types/express
npm install -D @types/cors
npm install -D @types/jsonwebtoken
npm install -D @types/bcryptjs
```

---

# TypeScript Initialization

```bash
npx tsc --init
```

---

# Prisma Initialization

```bash
npx prisma init
```

---

# Formatting & Linting Tools

```bash
npm install -D eslint
npm install -D prettier
npm install -D eslint-config-prettier
npm install -D eslint-plugin-import
```

---

# Run Frontend

```bash
npm run dev
```

---

# Run Backend

```bash
npx nodemon src/server.ts
```

---

# Recommended Global Installations

```bash
npm install -g nodemon
npm install -g typescript
```

---

# Required Database

Install:

- PostgreSQL
- pgAdmin

---

# Recommended VS Code Extensions

```text
Prisma
ESLint
Prettier
Tailwind CSS IntelliSense
Thunder Client
PostgreSQL
```
