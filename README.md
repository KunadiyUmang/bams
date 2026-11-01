# BAMS — Business Account Management System

A production-ready, multi-business financial management platform.

## Three Applications

| App | URL | Description |
|-----|-----|-------------|
| **Employee PWA** | http://localhost:3001 | Mobile-first app for employees |
| **Owner PWA** | http://localhost:3002 | Mobile-first app for business owners |
| **Admin Dashboard** | http://localhost:3003 | Desktop dashboard for Super Admin |
| **Backend API** | http://localhost:4000 | NestJS REST + WebSocket API |
| **API Docs** | http://localhost:4000/api/docs | Swagger documentation |
| **pgAdmin** | http://localhost:5050 | PostgreSQL database admin |

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@bams.com | Admin@123 |
| Business Owner | owner@bams.com | Owner@123 |
| Employee 1 | employee1@bams.com | Emp@123 |
| Employee 2 | employee2@bams.com | Emp@123 |

## Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop
- npm 9+

### 1. Start the Database

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432 and pgAdmin on port 5050.

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up the Backend

```bash
cd backend
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

### 4. Start All Applications

Open four terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Employee App:**
```bash
cd apps/employee-app
npm run dev
```

**Terminal 3 — Owner App:**
```bash
cd apps/owner-app
npm run dev
```

**Terminal 4 — Admin Dashboard:**
```bash
cd apps/admin-dashboard
npm run dev
```

### 5. Or Start Everything Together (Turborepo)

```bash
npm run dev
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, CSS Custom Properties |
| State Management | Zustand, TanStack Query |
| Charts | Recharts |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Authentication | JWT + Refresh Tokens |
| Real-time | Socket.io WebSocket |
| Reports | Puppeteer (PDF), docx (Word), ExcelJS (Excel) |
| File Upload | Multer (local storage) |
| i18n | English + Gujarati |

## Features

- ✅ Three-level RBAC (Super Admin, Business Owner, Employee)
- ✅ Multi-business data isolation
- ✅ Complete transaction CRUD with approval workflow
- ✅ Real-time notifications (WebSocket + in-app)
- ✅ PDF, Word (.docx), Excel (.xlsx), CSV report generation
- ✅ English + Gujarati bilingual support
- ✅ Dark/Light mode
- ✅ PWA (installable on Android/iOS from browser)
- ✅ Immutable audit logging
- ✅ Precise financial calculations (Decimal arithmetic)

## Project Structure

```
bams/
├── apps/
│   ├── employee-app/      # Next.js PWA — Employee (port 3001)
│   ├── owner-app/         # Next.js PWA — Owner (port 3002)
│   └── admin-dashboard/   # Next.js — Super Admin (port 3003)
├── backend/               # NestJS API (port 4000)
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── businesses/
│   │   ├── transactions/
│   │   ├── categories/
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── audit/
│   │   ├── uploads/
│   │   └── daily-reports/
│   └── prisma/
├── packages/
│   └── types/             # Shared TypeScript types
├── docker-compose.yml
└── turbo.json
```

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and update:

```env
DATABASE_URL=postgresql://bams_user:bams_password@localhost:5432/bams_db
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
PORT=4000
```

## API Documentation

Swagger UI is available at http://localhost:4000/api/docs when the backend is running.

## Report Generation

Reports support both English and Gujarati. Pass `?language=GU` to generate Gujarati reports.

Formats:
- **PDF**: Uses Puppeteer to render HTML with embedded Gujarati fonts
- **Word (.docx)**: Genuine editable Word documents via `docx` package
- **Excel (.xlsx)**: Formatted spreadsheets via ExcelJS
- **CSV**: Raw comma-separated values

## Security Notes

- All financial calculations are server-side
- Business-level data isolation enforced in every API endpoint
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire in 15 minutes; refresh tokens in 7 days
- Input validation on all endpoints via class-validator
- Rate limiting: 10 requests/second per IP
- Audit trail for all financial operations (immutable)

## License

Private — All rights reserved.
