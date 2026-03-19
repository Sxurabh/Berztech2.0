# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Berztech 2.0 is a high-performance portfolio and client management platform built with Next.js (App Router), Supabase (auth + database), Tailwind CSS, and Framer Motion. It includes an admin portal for managing projects/requests and a client dashboard for tracking work progress.

## Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint

# Testing
npm test             # Run all Vitest tests (unit + integration)
npm run test:ci      # Run tests with coverage
npm run test:unit    # Unit + component tests only
npm run test:integration  # Integration tests only
npm run test:coverage      # Generate HTML coverage report
npm run test:e2e     # Run Playwright E2E tests

# Single test execution
npx vitest run tests/unit/config/admin.test.ts
npx vitest run tests/unit/config/admin.test.ts -t "test name"
npx playwright test tests/e2e/auth.spec.ts
```

## Architecture

### Tech Stack
- **Framework:** Next.js 16 with App Router
- **Database/Auth:** Supabase (client.js, server.js, admin.js, middleware.js)
- **Styling:** Tailwind CSS 3.3.3
- **Animations:** Framer Motion 12
- **Forms:** Zod validation
- **State:** React Query (@tanstack/react-query)
- **Testing:** Vitest + MSW for unit/integration, Playwright for E2E

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (route.js files)
│   ├── admin/              # Admin portal pages
│   ├── dashboard/          # Client portal pages
│   ├── track/              # Client request tracking
│   ├── auth/               # Authentication pages
│   └── (public pages)      # Landing, Work, Blog, Contact, About, Process
├── components/
│   ├── ui/                 # Reusable: Button, Modal, Input, Select, DataTable, CornerFrame
│   ├── admin/              # Admin: KanbanBoard, TaskModal, ProjectForm, BlogPostForm
│   ├── client/             # Client: ClientKanbanBoard, ClientTaskModal
│   ├── features/           # Feature: blog, contact, work, track, admin dashboard
│   ├── layout/              # Header, Footer, RootLayout
│   └── sections/            # Hero, Services, StatsBar, BentoGrid
├── lib/
│   ├── supabase/           # client.js, server.js, admin.js, middleware.js
│   ├── hooks/              # useRequests, useProjectStats, useTaskComments, useNotifications
│   ├── api/                # API client utilities
│   ├── auth/               # AuthProvider.jsx
│   └── design-tokens.js    # Centralized design tokens (colors, spacing, typography)
├── config/                 # admin.js, colors.js
└── data/                   # Static content data
```

### Design System
- **Tokens First:** Never hardcode colors, spacing, or typography—use `src/lib/design-tokens.js`
- **Icons:** Strictly `react-icons/fi` (Feather Icons) only
- **Card UI:** Use `<CornerFrame>` component for all structural cards
- **Mobile-First:** Responsive from 375px to 1024px+
- **Typography:** Space Grotesk (headings), JetBrains Mono (body/code)
- **Service Colors:** Blue (Web Dev), Emerald (Growth), Purple (Mobile), Rose (Branding)

### API Pattern
```javascript
// src/app/api/resource/route.js
export async function POST(request) {
  try {
    const body = await request.json();
    // Business logic with Zod validation
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error("Handler error:", error);
    return NextResponse.json({ error: "message" }, { status: 500 });
  }
}
```

### Auth Guards
```javascript
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const { isAdminEmail } = require("@/config/admin");
if (!isAdminEmail(user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
```

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx        # Server-only!
ADMIN_EMAIL=admin@yourdomain.com
```

## Testing

### Coverage Thresholds
- Lines: 70%
- Functions: 70%
- Branches: 65%

### MSW
- Mock handlers in `tests/mocks/handlers.ts`
- Use `server.use()` to override per test

## Constraints

- **Never commit secrets** — use `.env.local`, never commit `.env`
- **Server-only code** — never import `admin.js` in client components
- **Test isolation** — each test independent; mock external calls