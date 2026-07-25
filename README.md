# 🎓 Sector Educational Institute Management System

> **A Next-Generation Enterprise Management System Engineered for Educational Institutes**

The **Sector Educational Institute Management System** is a full-stack, enterprise-grade web application built to streamline operations, financial management, student admissions, attendance, and revenue share analytics for educational institutes.

Designed specifically for **Sector Educational Institute** (Panadura Campus, Sri Lanka), the system automates day-to-day administrative tasks—ranging from rapid student barcode attendance scanning to automated monthly fee invoicing, teacher commission split reconciliations, cashier counter billing, and instant printable PDF receipt generation.

---

## 🌟 Key Features

* **📊 Executive Analytics Dashboard**: Real-time KPI summaries including active student counts, net institute tuition commissions (after teacher payout splits), one-time admission revenues, and historical 6-month financial collection trends.
* **🎓 Student Roster & 360° Profile**: Complete student lifecycle management with multi-subject/class batch enrollments, guardian details, fee concession categories (Full Fee, Half Fee, Free Scheme), unpaid admission fee alerts, and invoice history.
* **👨‍🏫 Teacher Directory & Earnings Reconciliation**: Comprehensive teacher profiles with configurable tuition commission split percentages (e.g. 75%/25%), assigned subjects, and automated monthly payout statements.
* **⚡ Rapid Barcode Attendance Marking**: Daily student attendance entry supporting instant USB barcode scanner input, code lookups, and status toggles (Present, Absent, Late, Excused) with database persistence across reloads.
* **🧾 Cashier Billing Counter (F2)**: High-speed counter billing modal for Cash, Card, and Bank Transfer collections. Auto-links unpaid monthly invoices, pre-fills cashier inputs, updates financial metrics in real time, and auto-launches printable PDF receipts.
* **🔍 Global Command Palette Search (Ctrl + K)**: Universal quick search modal accessible via <kbd>Ctrl + K</kbd> or <kbd>Cmd + K</kbd> to search students, teachers, or trigger system shortcuts across the entire app.
* **📄 Printable PDF Receipts & Excel Reports**: Automated PDF receipt streaming powered by a headless Chrome engine, alongside one-click Excel (`.xlsx`) downloads for monthly fee collection logs and teacher payout reconciliation statements.

---

## 🛠️ Technology Stack

The project is architected with a decoupled full-stack TypeScript architecture (NestJS REST API Backend + React Vite Single-Page Application Frontend).

```
   ┌─────────────────────────────────────────────────────────┐
   │         Sector Educational Institute Platform           │
   └────────────────────────────┬────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌──────────────┐                                ┌──────────────┐
│ React (Vite) │ ◄────── REST API (JSON) ─────► │ NestJS (Node)│
└───────┬──────┘                                └───────┬──────┘
        │                                               │
        ▼                                               ▼
┌──────────────┐                                ┌──────────────┐
│  TailwindCSS │                                │  Prisma ORM  │
└──────────────┘                                └───────┬──────┘
                                                        │
                                                        ▼
                                                ┌──────────────┐
                                                │  PostgreSQL  │
                                                └──────────────┘
```

### 💻 IDE & Developer Tooling
* **IDE**: [Visual Studio Code (VS Code)](https://code.visualstudio.com/)
* **Code Formatting & Linting**: ESLint, Prettier
* **Version Control**: Git & GitHub
* **API Testing & Documentation**: Swagger / OpenAPI (NestJS Swagger)

### 🏗️ Frameworks
* **Backend Framework**: [NestJS](https://nestjs.com/) (Node.js progressive TypeScript framework) built on top of **Express.js**
* **Frontend Framework**: [React (v18)](https://react.dev/)
* **Frontend Build Tool**: [Vite (v5)](https://vitejs.dev/)
* **CSS Framework**: [TailwindCSS (v3)](https://tailwindcss.com/) with Vanilla CSS custom utilities

### 🗄️ Database, ORM & Caching
* **Database**: [PostgreSQL 16](https://www.postgresql.org/)
* **ORM**: [Prisma ORM (v5)](https://www.prisma.io/) (Prisma Client, Prisma Schema & Migrations, Prisma Seeder)
* **In-Memory Store & Caching**: [Redis 7](https://redis.io/)
* **Async Job Queue**: [BullMQ](https://docs.bullmq.io/) with `ioredis`

### 📚 Frontend Libraries & State Management
* **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Auth & UI global stores)
* **Server State & Data Fetching**: [TanStack React Query (v5)](https://tanstack.com/query/latest)
* **Routing**: [React Router DOM (v6)](https://reactrouter.com/)
* **UI Components & Primitives**: [Radix UI](https://www.radix-ui.com/) (Dialog, Popover, Tabs, Select, Avatar, Tooltip, Checkbox, Radio Group)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Charts & Data Analytics**: [Recharts](https://recharts.org/) (Responsive Area & Trend Charts)
* **Notifications**: [Sonner](https://sonner.emilkowal.ski/) (Toast alerts)
* **Styling Utilities**: `clsx`, `tailwind-merge`, `class-variance-authority` (CVA), `tailwindcss-animate`

### 🔒 Security, Validation & Utilities
* **Authentication**: Passport.js with JWT Strategy (`passport-jwt`, `@nestjs/jwt`)
* **Password Hashing**: Argon2 (`argon2`)
* **HTTP Security**: Helmet (`helmet`), CORS configuration, Cookie Parser (`cookie-parser`)
* **Form Management & Validation**: React Hook Form, `@hookform/resolvers`, Zod (`zod`), `class-validator`, `class-transformer`
* **HTTP Client**: Axios (`axios`)

### 🖨️ Document Generation & Exports
* **PDF Engine**: [Puppeteer](https://pptr.dev/) (Headless Chromium PDF renderer)
* **Excel Exporter**: [ExcelJS](https://github.com/exceljs/exceljs) (`.xlsx` spreadsheet generation)

### 🐳 Containerization & Infrastructure
* **Containerization**: [Docker](https://www.docker.com/) & **Docker Compose** (PostgreSQL 16 & Redis 7 services)

---

## 🚀 How to Run the Project

Follow this step-by-step guide to run both the **Backend API** and **Frontend SPA** on your local environment.

### 📋 Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 or v20 LTS recommended)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [PostgreSQL](https://www.postgresql.org/download/) (v14+) OR [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

### 1️⃣ Database & Infrastructure Setup

If using **Docker Compose** to launch PostgreSQL and Redis automatically:

```bash
# Navigate to backend directory
cd backend

# Start PostgreSQL and Redis containers in background
docker-compose up -d
```

*(Alternatively, ensure your local PostgreSQL server is running on port `5432` with a database named `sector_db`)*.

---

### 2️⃣ Backend Setup (NestJS API)

```bash
# Navigate to backend directory
cd backend

# 1. Install Node.js dependencies
npm install

# 2. Configure Environment Variables
# Create a .env file in the backend/ directory with the following variables:
```

Create `backend/.env`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://sector_admin:sector_secure_password_2026@localhost:5432/sector_db?schema=public"
JWT_SECRET="super-secret-jwt-key-for-sector-educational-institute-2026"
JWT_EXPIRATION="7d"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

```bash
# 3. Apply Prisma Database Schema
npx prisma db push

# 4. Seed Initial Institute Data (Branches, Teachers, Subjects, Batches, Students)
npx prisma db seed

# 5. Start NestJS Backend in Development Mode
npm run start:dev
```

* 🟢 **Backend Server Running**: `http://localhost:3000`
* 📚 **Interactive Swagger API Docs**: `http://localhost:3000/api/docs`

---

### 3️⃣ Frontend Setup (React Vite SPA)

Open a **new terminal window** and run:

```bash
# Navigate to frontend directory
cd frontend

# 1. Install Node.js dependencies
npm install

# 2. Start Vite Development Server
npm run dev
```

* 🚀 **Frontend Web App Running**: `http://localhost:3000` (or `http://localhost:5173`)

---

## ⌨️ Useful Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> | **Global Quick Search** | Opens the command palette to search students, teachers, or pages |
| <kbd>F1</kbd> | **New Student Admission** | Triggers the Student Admission registration modal |
| <kbd>F2</kbd> | **Cashier Billing Counter** | Opens the instant fee payment collection & PDF printer modal |
| <kbd>Esc</kbd> | **Close Modal** | Closes active command palette or overlay modals |

---

## 🏢 Project Purpose & License

This software application was built exclusively for **Sector Educational Institute** to digitize campus operations, manage teacher revenue sharing, and provide transparent executive financial reporting.

© 2026 **Sector Educational Institute Management System**. All rights reserved.
