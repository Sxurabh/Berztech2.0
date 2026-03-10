# 🧪 Antigravity — Comprehensive Testing Strategy
> **Repository:** Antigravity (mobile_fixes branch)
> **Stack:** Next.js 14+ (App Router), Supabase (Auth + DB + Realtime + Storage), Tailwind CSS, Framer Motion
> **Author:** Senior Security Engineer & Next.js Architecture Specialist
> **Version:** 1.0.0
> **Last Updated:** March 2026

---

## Table of Contents

1. [Testing Philosophy](#1-testing-philosophy)
2. [Testing Stack Recommendation](#2-testing-stack-recommendation)
3. [Phase-Wise Implementation Plan](#3-phase-wise-implementation-plan)
4. [Example Test Cases](#4-example-test-cases)
5. [Folder Structure for Tests](#5-folder-structure-for-tests)
6. [CI/CD Integration](#6-cicd-integration)
7. [Test Coverage Strategy](#7-test-coverage-strategy)
8. [Security-Focused Test Checklist](#8-security-focused-test-checklist)
9. [Developer Workflow](#9-developer-workflow)

---

## 1. Testing Philosophy

### Why Testing Matters for This Application

This application manages sensitive multi-role workflows — admin users, authenticated clients, and anonymous visitors interact with a shared Supabase backend. The combination of role-based authorization (`isAdminEmail`), Row Level Security (RLS) policies, real-time notifications, file uploads, and a public-facing blog/contact surface makes undetected regressions genuinely dangerous. Without structured testing:

- A middleware change could silently expose the `/admin` panel to authenticated non-admin users
- A Supabase RLS misconfiguration could let clients read other clients' tasks
- A UI form change could break the contact flow that feeds the `requests` table
- A broken `auth/callback` route could lock all users out of the platform

### The Risks of No Structured Testing

| Risk Area | Consequence |
|---|---|
| Auth middleware regression | Unauthorized admin access |
| API route refactor | Broken client dashboard or data leaks |
| Component prop change | Silent UI breakage, empty states shown as valid |
| Supabase schema migration | Production data loss or stale cache served |
| Real-time subscription bug | Notifications not delivered, stale board state |
| File upload mutation | Unrestricted file types or size bypass |

### How Testing Protects Future Growth

Testing creates a **contractual safety net** around your existing behavior. When new features like payment integration, multi-workspace support, or a public API are added, the existing test suite acts as a regression barrier — catching breakage before it reaches production. Tests also serve as living documentation: a `describe` block for `POST /api/requests` tells the next developer exactly what valid input looks like, what the auth requirements are, and what edge cases are handled.

**Core Testing Principles for This Repo:**
- Test behavior, not implementation — avoid testing internal function calls
- Each test must be deterministic — no reliance on external services in unit/integration tests
- Prefer explicit over implicit — always assert exact status codes, response shapes, and UI states
- Tests should run in under 5 minutes for unit/integration, and under 15 minutes for full E2E

---

## 2. Testing Stack Recommendation

### Recommended Tools

| Layer | Tool | Why This Tool |
|---|---|---|
| Unit Testing | **Vitest** | Native ESM support, Vite-compatible, ~10x faster than Jest for Next.js projects. Works perfectly with `jsconfig.json` path aliases (`@/`) |
| Component Testing | **React Testing Library (RTL)** | Tests components as users interact with them — clicks, form input, visible text — not implementation details |
| Component Isolation | **Vitest + jsdom** | Lightweight DOM environment without a browser; ideal for pure component rendering tests |
| Integration Testing | **Vitest + MSW (Mock Service Worker)** | Intercepts fetch calls at the network level to mock Supabase API and internal API routes without modifying application code |
| E2E Testing | **Playwright** *(already configured)* | Already present in `playwright.config.js` and `tests/*.spec.js`. Supports Chromium, Firefox, WebKit. Best-in-class for Next.js App Router testing |
| API Testing | **Supertest + Vitest** | Tests Next.js API route handlers directly in Node.js; no browser needed |
| Security Testing | **OWASP ZAP (automated) + manual** | Automated DAST scanning for XSS, CSRF, IDOR, and injection; integrates with CI |
| Performance Testing | **Lighthouse CI** | Audits Core Web Vitals per page on every PR; catches performance regressions before merge |
| Load Testing | **k6** | Scripted load testing for API routes like `POST /api/requests`, `GET /api/admin/tasks`; low overhead, JavaScript-native |
| Visual Regression | **Playwright Screenshots** | Baseline screenshot comparison for critical UI surfaces (Home, Dashboard, Board) |

### Setup Commands

```bash
# Core testing dependencies
npm install --save-dev vitest @vitest/coverage-v8 jsdom
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev msw

# Playwright already installed — verify
npx playwright install

# Performance
npm install --save-dev @lhci/cli

# Load testing (install globally or via Docker)
brew install k6  # macOS
# OR: docker run --rm grafana/k6 run script.js
```

### Vitest Configuration

```javascript
// vitest.config.js (place in project root)
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
      include: [
        'src/lib/**',
        'src/components/**',
        'src/app/api/**',
        'src/config/**',
      ],
      exclude: [
        'src/**/*.stories.*',
        'src/app/**/layout.*',
        'src/app/**/page.*',   // Pages tested via E2E
        'src/assets/**',
        'src/fonts/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Test Setup File

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
// Reset handlers after each test (prevent test pollution)
afterEach(() => server.resetHandlers())
// Clean up after all tests
afterAll(() => server.close())
```

---

## 3. Phase-Wise Implementation Plan

Each phase builds on the last. Do not skip phases — Phase 1 failures will cascade through all higher phases.

---

### Phase 1 — Critical Foundation Tests
**Timeline:** Week 1–2 | **Priority:** P0 — Must complete before any new features

**Scope:** Core utility functions, authentication logic, admin guard helpers, API helper utilities, Supabase client factories.

**Files to Cover:**
- `src/lib/auth/AuthProvider.jsx` — `useAuth` hook, `signInWithEmail`, `signInWithOAuth`, `signOut`
- `src/config/admin.js` — `isAdminEmail` function
- `src/lib/supabase/client.js` — singleton client factory
- `src/lib/supabase/admin.js` — admin client factory
- `src/lib/supabase/middleware.js` — `updateSession`, route protection logic
- `src/lib/api/client.js` — API fetch wrapper helpers

**Key Test Targets:**
```
isAdminEmail() — boundary testing with exact match, case-insensitive, empty string, null
createClient() — returns null when env vars are missing
createAdminClient() — returns null when service role key is absent
updateSession() — redirects /admin when user is unauthenticated
updateSession() — redirects non-admin from /admin to /dashboard
updateSession() — allows authenticated non-admin on /dashboard
```

---

### Phase 2 — Component Testing
**Timeline:** Week 3–4 | **Priority:** P1

**Scope:** Reusable UI primitives, forms with validation, error states, loading states, conditional rendering based on auth/role state.

**Files to Cover:**
- `src/components/ui/` — `Button`, `Modal`, `Input`, `Select`, `Textarea`, `CornerFrame`, `DataTable`
- `src/components/features/contact/ContactForm.jsx` — full form validation
- `src/components/features/blog/Newsletter.jsx` — email subscription form
- `src/components/admin/BlogPostForm.jsx`, `ProjectForm.jsx`, `TestimonialForm.jsx`
- `src/components/admin/DeleteConfirmModal.jsx` — confirmation interaction

**Key Test Targets:**
```
ContactForm — renders, validates required fields, shows inline errors, submits correctly
Newsletter — email format validation, duplicate submission handling
DataTable — renders rows, sorts by column, empty state message
Modal — opens/closes, traps focus, renders children correctly
DeleteConfirmModal — confirm button calls onConfirm, cancel calls onClose
```

---

### Phase 3 — API and Integration Testing
**Timeline:** Week 5–6 | **Priority:** P1

**Scope:** All API route handlers under `src/app/api/`, database interaction patterns via MSW mocks, authentication middleware on API routes.

**Files to Cover:**
```
POST   /api/requests       — public contact form submission (zod validation)
GET    /api/requests       — authenticated user only, returns own requests
GET    /api/blog           — public: published only | admin: all posts
POST   /api/blog           — admin-only create
PUT    /api/blog/[id]      — admin-only update, field whitelisting
DELETE /api/blog/[id]      — admin-only delete
GET    /api/admin/tasks    — admin-only, optional requestId filter
POST   /api/admin/tasks    — admin-only, inherits clientid from request
PATCH  /api/admin/tasks/[id] — admin-only, order index update
DELETE /api/admin/tasks/[id] — admin-only
GET    /api/notifications  — authenticated user, filters by user.id
PATCH  /api/notifications/read — mark as read (single or all)
POST   /api/upload         — admin-only, type+size validation, rate limiting
POST   /api/subscribe      — email format, idempotent (no 409 on duplicate)
GET    /api/client/tasks   — client-only, filters by clientid === user.id
```

**MSW Handler Setup:**
```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock Supabase auth.getUser
  http.get('*/auth/v1/user', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || authHeader === 'Bearer invalid') {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({
      user: { id: 'user-123', email: 'client@example.com' }
    })
  }),
  // Add more handlers per test file as needed
]
```

---

### Phase 4 — End-to-End Testing
**Timeline:** Week 7–8 | **Priority:** P1

**Scope:** Full user journeys in a real browser against a test Supabase instance or staging environment. Playwright is already partially configured with `tests/contact.spec.js`, `tests/home.spec.js`, `tests/navigation.spec.js`.

**New E2E Flows to Add:**

```
✅ Already exists: navigation.spec.js — header nav links
✅ Already exists: home.spec.js — home page render
✅ Already exists: contact.spec.js — contact form

🆕 auth.spec.js:
   - Login with valid credentials → redirect to /dashboard (client) or /admin (admin)
   - Login with invalid credentials → inline error message displayed
   - Unauthenticated access to /dashboard → redirect to /auth/login?redirect=/dashboard
   - Unauthenticated access to /admin → redirect to /auth/login?redirect=admin
   - OAuth login button visibility

🆕 dashboard.spec.js:
   - Authenticated client sees their requests
   - Authenticated client sees tasks filtered to their clientid
   - New Request button navigates to /contact

🆕 admin-board.spec.js:
   - Admin can create a task from the board
   - Admin can drag a task between columns (or use move dropdown)
   - Admin can filter tasks by request
   - Task modal opens on card click

🆕 blog.spec.js:
   - Blog index shows only published posts for anonymous user
   - Blog post detail page renders title, content, author
   - Newsletter form submits and shows success state

🆕 work.spec.js:
   - Work page renders project cards
   - Project slug page renders correctly
   - Project gallery images load without broken src
```

**Playwright Config Additions:**

```typescript
// playwright.config.js — recommended additions
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['github']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } }, // Critical: mobile_fixes branch
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

---

### Phase 5 — Security Testing
**Timeline:** Week 9–10 | **Priority:** P0 for auth flows, P1 for rest

**Scope:** Authentication vulnerabilities, authorization bypass attempts, input injection, IDOR, rate limiting, sensitive data exposure.

**Automated Security Scanning:**
```bash
# Run OWASP ZAP baseline scan against staging
docker run --rm -v $(pwd):/zap/wrk   ghcr.io/zaproxy/zaproxy:stable   zap-baseline.py -t https://your-staging-url.vercel.app   -r zap-report.html -I
```

**Manual Security Test Checklist:**
```
AUTH:
□ Attempt to access /admin as authenticated non-admin → must return 401/redirect
□ Attempt to access /dashboard without session cookie → must redirect to login
□ Replay an expired Supabase JWT → must be rejected by getUser()
□ Test OAuth redirect_to param with external URL → must be blocked by validation

AUTHORIZATION (IDOR):
□ Client A calls GET /api/client/tasks with Client B's session → must only return Client A's tasks
□ Client calls GET /api/admin/tasks → must return 401
□ Client calls DELETE /api/admin/tasks/[id] → must return 401
□ Client calls PATCH /api/notifications/read with another user's notification ID → must fail silently or 403

INPUT VALIDATION:
□ POST /api/requests with message > 1000 chars → must return 400 (zod enforced)
□ POST /api/requests with XSS payload in name → stored value must be escaped on render
□ POST /api/blog with SQL injection in title → must be handled by Supabase parameterized queries
□ POST /api/upload with .exe file renamed to .jpg → must be rejected by MIME type check

RATE LIMITING:
□ POST /api/upload with 21+ requests in 1 minute from same IP → must return 429
□ Verify rate limit map resets after RATE_LIMIT_WINDOW_MS

DATA EXPOSURE:
□ GET /api/blog returns unpublished posts to anonymous user → must not
□ SUPABASE_SERVICE_ROLE_KEY must never appear in client-side bundle (check with: grep -r "service_role" .next/)
□ Verify /api/upload does not return internal file paths beyond public URL
□ Error responses must not include stack traces or SQL error messages in production
```

---

### Phase 6 — Performance and Stability Testing
**Timeline:** Week 11–12 | **Priority:** P2

**Lighthouse CI Setup:**
```bash
# Install
npm install --save-dev @lhci/cli

# lhci.config.js
module.exports = {
  ci: {
    collect: {
      url: ['/', '/blog', '/work', '/contact', '/about'],
      numberOfRuns: 3,
      startServerCommand: 'npm run start',
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

**k6 Load Test Script:**
```javascript
// tests/load/api-requests.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up to 20 users
    { duration: '1m', target: 20 },    // Stay at 20 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],  // 95% of requests under 800ms
    http_req_failed: ['rate<0.01'],    // Less than 1% failure rate
  },
}

export default function () {
  // Public endpoint load test
  const res = http.post('http://localhost:3000/api/requests', JSON.stringify({
    name: 'Load Test User',
    email: `loadtest+${__VU}@example.com`,
    message: 'Load test submission',
  }), {
    headers: { 'Content-Type': 'application/json' },
  })

  check(res, {
    'status is 201 or 400': (r) => r.status === 201 || r.status === 400,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  })
  sleep(1)
}
```

---

## 4. Example Test Cases

### 4.1 — Authentication Logic

```typescript
// tests/unit/lib/auth/isAdminEmail.test.ts
import { describe, it, expect } from 'vitest'
import { isAdminEmail } from '@/config/admin'

describe('isAdminEmail()', () => {
  it('returns true for the configured admin email (exact match)', () => {
    expect(isAdminEmail(process.env.ADMIN_EMAIL)).toBe(true)
  })

  it('returns true for admin email regardless of case', () => {
    const admin = process.env.ADMIN_EMAIL || 'admin@berztech.com'
    expect(isAdminEmail(admin.toUpperCase())).toBe(true)
    expect(isAdminEmail(admin.toLowerCase())).toBe(true)
  })

  it('returns false for non-admin email', () => {
    expect(isAdminEmail('client@example.com')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isAdminEmail('')).toBe(false)
  })

  it('returns false for null or undefined', () => {
    expect(isAdminEmail(null as any)).toBe(false)
    expect(isAdminEmail(undefined as any)).toBe(false)
  })

  it('returns false for email with admin domain but wrong user', () => {
    expect(isAdminEmail('notadmin@berztech.com')).toBe(false)
  })
})
```

### 4.2 — API Route: POST /api/requests

```typescript
// tests/integration/api/requests.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { server } from '../../mocks/server'
import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:3000'

describe('POST /api/requests', () => {
  it('returns 201 with valid payload (anonymous user)', async () => {
    server.use(
      http.post('*/rest/v1/requests', () =>
        HttpResponse.json([{ id: 'req-1', name: 'John Doe' }], { status: 201 })
      )
    )

    const res = await fetch(`${BASE}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'I need a website',
      }),
    })
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json).toHaveProperty('name', 'John Doe')
  })

  it('returns 400 when name is missing', async () => {
    const res = await fetch(`${BASE}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john@example.com' }),
    })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('error')
    expect(json).toHaveProperty('details')
  })

  it('returns 400 when email is invalid format', async () => {
    const res = await fetch(`${BASE}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John', email: 'not-an-email' }),
    })
    expect(res.status).toBe(400)
  })

  it('returns 400 when message exceeds 1000 characters', async () => {
    const res = await fetch(`${BASE}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John',
        email: 'john@example.com',
        message: 'x'.repeat(1001),
      }),
    })
    expect(res.status).toBe(400)
  })

  it('returns 400 for malformed JSON body', async () => {
    const res = await fetch(`${BASE}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ invalid json',
    })
    expect(res.status).toBe(400)
  })
})
```

### 4.3 — API Route: Admin Authorization Guard

```typescript
// tests/integration/api/admin-tasks.test.ts
import { describe, it, expect } from 'vitest'
import { server } from '../../mocks/server'
import { http, HttpResponse } from 'msw'

describe('GET /api/admin/tasks — Authorization', () => {
  it('returns 401 when no auth token is provided', async () => {
    server.use(
      http.get('*/auth/v1/user', () =>
        HttpResponse.json({ error: 'No auth' }, { status: 401 })
      )
    )
    const res = await fetch('/api/admin/tasks')
    expect(res.status).toBe(401)
  })

  it('returns 401 when authenticated as non-admin client', async () => {
    server.use(
      http.get('*/auth/v1/user', () =>
        HttpResponse.json({ user: { id: 'u1', email: 'client@example.com' } })
      )
    )
    const res = await fetch('/api/admin/tasks', {
      headers: { Authorization: 'Bearer client-token' },
    })
    expect(res.status).toBe(401)
  })

  it('returns 200 when authenticated as admin', async () => {
    server.use(
      http.get('*/auth/v1/user', () =>
        HttpResponse.json({ user: { id: 'admin-1', email: process.env.ADMIN_EMAIL } })
      ),
      http.get('*/rest/v1/tasks*', () =>
        HttpResponse.json([])
      )
    )
    const res = await fetch('/api/admin/tasks', {
      headers: { Authorization: 'Bearer admin-token' },
    })
    expect(res.status).toBe(200)
  })
})
```

### 4.4 — Component: ContactForm

```typescript
// tests/components/features/contact/ContactForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ContactForm from '@/components/features/contact/ContactForm'

describe('<ContactForm />', () => {
  it('renders all required form fields', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit|send/i })).toBeInTheDocument()
  })

  it('shows validation error when name is empty on submit', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.click(screen.getByRole('button', { name: /submit|send/i }))
    expect(await screen.findByText(/name.*required|required.*name/i)).toBeInTheDocument()
  })

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByLabelText(/name/i), 'John')
    await user.type(screen.getByLabelText(/email/i), 'bad-email')
    await user.click(screen.getByRole('button', { name: /submit|send/i }))
    expect(await screen.findByText(/valid email|invalid email/i)).toBeInTheDocument()
  })

  it('calls the API with correct payload on valid submission', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'req-1' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /submit|send/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/requests'),
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  it('shows success message after successful submission', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'req-1' }),
    }))
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByLabelText(/name/i), 'John')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /submit|send/i }))
    expect(await screen.findByText(/thank you|submitted|received/i)).toBeInTheDocument()
  })

  it('shows error message when API call fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed to submit request' }),
    }))
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.type(screen.getByLabelText(/name/i), 'John')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /submit|send/i }))
    expect(await screen.findByText(/failed|error|try again/i)).toBeInTheDocument()
  })
})
```

### 4.5 — E2E: Auth Flow

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('unauthenticated user is redirected to login from /dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
  })

  test('unauthenticated user is redirected to login from /admin', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('login page shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.getByText(/invalid email or password/i)).toBeVisible()
  })

  test('login form has OAuth buttons for Google and GitHub', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible()
  })
})
```

### 4.6 — File Upload Security

```typescript
// tests/integration/api/upload.test.ts
describe('POST /api/upload — Security', () => {
  it('rejects non-admin users with 401', async () => {
    // ... mock non-admin session
    const res = await uploadFile('test.jpg', 'image/jpeg')
    expect(res.status).toBe(401)
  })

  it('rejects executable file types even with valid auth', async () => {
    // ... mock admin session
    const res = await uploadFile('malware.exe', 'application/x-msdownload')
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/invalid file type/i)
  })

  it('rejects files disguised with wrong MIME type', async () => {
    // ... mock admin session
    // File named .jpg but MIME type is application/octet-stream
    const res = await uploadFile('fake.jpg', 'application/octet-stream')
    expect(res.status).toBe(400)
  })

  it('rejects files larger than 5MB', async () => {
    // ... mock admin session
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024) // 6MB
    const res = await uploadLargeFile(largeBuffer, 'image/jpeg')
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/too large/i)
  })

  it('returns 429 after 20+ uploads in one minute', async () => {
    // ... mock admin session, fire 21 requests
    const responses = await Promise.all(
      Array.from({ length: 21 }, () => uploadFile('test.jpg', 'image/jpeg'))
    )
    const rateLimited = responses.some(r => r.status === 429)
    expect(rateLimited).toBe(true)
  })
})
```

### 4.7 — Middleware Route Protection

```typescript
// tests/unit/lib/supabase/middleware.test.ts
describe('updateSession() — Route Protection', () => {
  it('redirects unauthenticated request to /auth/login when accessing /admin', async () => {
    // Mock getUser returning null
    const request = mockRequest('/admin')
    const response = await updateSession(request)
    expect(response.headers.get('location')).toContain('/auth/login')
    expect(response.headers.get('location')).toContain('redirect=admin')
  })

  it('redirects authenticated non-admin from /admin to /dashboard', async () => {
    const request = mockRequest('/admin', { user: { email: 'client@example.com' } })
    const response = await updateSession(request)
    expect(response.headers.get('location')).toContain('/dashboard')
  })

  it('redirects admin from /dashboard to /admin', async () => {
    const adminEmail = process.env.ADMIN_EMAIL
    const request = mockRequest('/dashboard', { user: { email: adminEmail } })
    const response = await updateSession(request)
    expect(response.headers.get('location')).toContain('/admin')
  })

  it('allows authenticated non-admin to access /dashboard', async () => {
    const request = mockRequest('/dashboard', { user: { email: 'client@example.com' } })
    const response = await updateSession(request)
    expect(response.status).not.toBe(302)
  })

  it('skips Supabase entirely if env vars are not configured', async () => {
    // Temporarily remove env vars
    const request = mockRequest('/dashboard')
    const response = await updateSession(request) // should not throw
    expect(response).toBeDefined()
  })
})
```

---

## 5. Folder Structure for Tests

```
/tests
│
├── setup.ts                        # Global test setup (MSW, jest-dom, env)
│
├── mocks/
│   ├── server.ts                   # MSW Node server instance
│   ├── handlers.ts                 # Default MSW request handlers
│   ├── supabase.ts                 # Supabase-specific mock helpers
│   └── fixtures/                   # Reusable test data
│       ├── users.ts                # Mock user objects (admin, client, anonymous)
│       ├── tasks.ts                # Mock task arrays with various statuses
│       ├── requests.ts             # Mock project request objects
│       └── blogPosts.ts            # Mock blog post objects (published/draft)
│
├── unit/
│   ├── lib/
│   │   ├── auth/
│   │   │   └── AuthProvider.test.tsx
│   │   ├── supabase/
│   │   │   ├── client.test.ts
│   │   │   ├── admin.test.ts
│   │   │   └── middleware.test.ts
│   │   ├── data/
│   │   │   ├── blogPosts.test.ts
│   │   │   ├── projects.test.ts
│   │   │   └── testimonials.test.ts
│   │   └── hooks/
│   │       ├── useNotifications.test.ts
│   │       ├── useRequests.test.ts
│   │       └── useTaskComments.test.ts
│   └── config/
│       └── admin.test.ts           # isAdminEmail() tests
│
├── components/
│   ├── ui/
│   │   ├── Button.test.tsx
│   │   ├── Modal.test.tsx
│   │   ├── DataTable.test.tsx
│   │   ├── Input.test.tsx
│   │   └── CornerFrame.test.tsx
│   ├── admin/
│   │   ├── BlogPostForm.test.tsx
│   │   ├── ProjectForm.test.tsx
│   │   ├── DeleteConfirmModal.test.tsx
│   │   └── TestimonialForm.test.tsx
│   └── features/
│       ├── contact/
│       │   └── ContactForm.test.tsx
│       └── blog/
│           └── Newsletter.test.tsx
│
├── integration/
│   └── api/
│       ├── requests.test.ts
│       ├── blog.test.ts
│       ├── admin-tasks.test.ts
│       ├── client-tasks.test.ts
│       ├── notifications.test.ts
│       ├── upload.test.ts
│       ├── subscribe.test.ts
│       └── projects.test.ts
│
├── e2e/                            # Playwright tests (moved from /tests root)
│   ├── auth.spec.ts                # Login, logout, redirect flows
│   ├── navigation.spec.ts          # ✅ Exists — migrate here
│   ├── home.spec.ts                # ✅ Exists — migrate here
│   ├── contact.spec.ts             # ✅ Exists — migrate here
│   ├── dashboard.spec.ts           # Client dashboard flow
│   ├── admin-board.spec.ts         # Kanban board interactions
│   ├── blog.spec.ts                # Blog listing, post detail
│   └── work.spec.ts                # Portfolio/work page
│
├── security/
│   ├── auth-bypass.test.ts         # Middleware and route guard bypass attempts
│   ├── idor.test.ts                # Client accessing other client's data
│   ├── input-injection.test.ts     # XSS payloads, oversized inputs
│   └── upload-security.test.ts     # File type/size bypass attempts
│
└── load/
    ├── api-requests.js             # k6: POST /api/requests load test
    ├── api-blog.js                 # k6: GET /api/blog load test
    └── api-admin-tasks.js          # k6: Admin task board load test
```

**Organization Principles:**
- `/unit` — pure logic tests, zero network calls, no DOM
- `/components` — component rendering tests using jsdom via RTL
- `/integration` — API route tests using MSW to intercept Supabase
- `/e2e` — full browser tests using Playwright against a running app
- `/security` — targeted adversarial tests for auth and data access
- `/load` — k6 scripts for throughput and latency benchmarking
- `mocks/fixtures/` — shared, reusable test data; never hardcode data inline in tests

---

## 6. CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop, mobile_fixes]
  pull_request:
    branches: [main, develop]

env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
  ADMIN_EMAIL: ${{ secrets.TEST_ADMIN_EMAIL }}

jobs:
  unit-and-integration:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Run Vitest
        run: npm run test:ci
      - name: Upload Coverage Report
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true

  e2e:
    name: E2E Tests (Playwright)
    runs-on: ubuntu-latest
    needs: unit-and-integration
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium
      - name: Build Application
        run: npm run build
      - name: Run Playwright Tests
        run: npx playwright test --project=chromium
      - name: Upload Playwright Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

  mobile-e2e:
    name: Mobile E2E Tests (Playwright)
    runs-on: ubuntu-latest
    needs: unit-and-integration
    # Only run on mobile_fixes branch or main
    if: github.ref == 'refs/heads/mobile_fixes' || github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium webkit
      - run: npm run build
      - name: Run Mobile Playwright Tests
        run: npx playwright test --project="Mobile Chrome" --project="Mobile Safari"

  lighthouse:
    name: Lighthouse Performance Audit
    runs-on: ubuntu-latest
    needs: unit-and-integration
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Run Lighthouse CI
        run: npx lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### Package.json Script Additions

```json
{
  "scripts": {
    "test": "vitest",
    "test:ci": "vitest run --coverage",
    "test:unit": "vitest run tests/unit tests/components",
    "test:integration": "vitest run tests/integration",
    "test:security": "vitest run tests/security",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:mobile": "playwright test --project='Mobile Chrome' --project='Mobile Safari'",
    "test:coverage": "vitest run --coverage --reporter=html",
    "test:lighthouse": "lhci autorun"
  }
}
```

### Failure Conditions (CI Pipeline)

| Condition | Action |
|---|---|
| Any unit or integration test fails | Block merge — `required` status check |
| Coverage drops below thresholds | Block merge — fail CI |
| Any E2E test fails on main branch | Block merge |
| E2E test fails on feature branch | Warn — post report, do not block |
| Lighthouse performance score < 0.85 | Warn — post to PR comment |
| Lighthouse accessibility score < 0.90 | Block merge |
| OWASP ZAP high-severity finding | Block merge — notify security channel |

### When Tests Run

```
On every push to any branch:      Unit + Integration tests
On PR to main or develop:         All tests including E2E (Chromium)
On PR merge to main:              Full suite including mobile E2E + Lighthouse
On mobile_fixes branch push:      Unit + Integration + Mobile E2E
On schedule (nightly on main):    Full suite + OWASP ZAP scan + k6 load tests
```

---

## 7. Test Coverage Strategy

### Coverage Targets

| Layer | Target | Rationale |
|---|---|---|
| `src/lib/` (utilities, hooks, data) | **85%** | Core business logic — high confidence required |
| `src/app/api/` (route handlers) | **80%** | Auth and data mutation paths must be tested |
| `src/components/ui/` | **75%** | Reusable primitives, must be stable |
| `src/components/features/` | **65%** | Complex stateful components, prioritize critical paths |
| `src/config/` | **90%** | Small, critical — `isAdminEmail` must be 100% |
| `src/app/**/page.*` | **0%** *(via E2E)* | Pages tested holistically in E2E, not unit |
| `src/app/**/layout.*` | **0%** *(via E2E)* | Layout wrappers — E2E covers rendering |

### Always Cover

- **All authentication and authorization decision points** — `isAdminEmail`, middleware guards, API route auth checks
- **All data mutation API routes** — POST, PUT, PATCH, DELETE handlers including field whitelisting
- **All input validation logic** — Zod schemas, custom validators
- **All error handling branches** — 400, 401, 403, 404, 500 return paths
- **All utility functions in `src/lib/`** — edge cases, null inputs, unexpected types
- **All custom React hooks** — `useNotifications`, `useTaskComments`, `useRequests`

### Does Not Need Unit Coverage

- Static configuration files that don't contain logic (`navigation.js`, `colors.js`, `stats.js`)
- Pure UI layout components with no logic (`layout.jsx`, `page.jsx` shells)
- Auto-generated migration files (`supabase/migrations/*.sql`)
- Asset files, fonts, SVGs
- `seed.js` — tested manually against staging

### Coverage Enforcement

```javascript
// vitest.config.js — coverage thresholds enforced as CI gate
coverage: {
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 65,
    statements: 70,
    // Per-file thresholds for critical modules
    perFile: true,
  },
  include: ['src/lib/**', 'src/app/api/**', 'src/config/**'],
}
```

---

## 8. Security-Focused Test Checklist

### Authentication Security

```
□ Login with correct credentials redirects to correct role destination (/admin or /dashboard)
□ Login with incorrect password shows error — does NOT reveal if email exists
□ Login with non-existent email shows same generic error (no user enumeration)
□ Multiple failed login attempts do not lock out (Supabase handles rate limiting — verify behavior)
□ Session cookie is HttpOnly and Secure in production headers
□ Auth callback /auth/callback validates `next` redirect param — no open redirect to external URLs
□ OAuth signInWithOAuth validates redirect_to — only allows internal paths starting with /
□ Expired Supabase JWT is rejected by getUser() with 401, not served stale data
□ signOut() properly clears session and cannot be reused with old token
```

### Authorization Validation (IDOR Prevention)

```
□ Client user CANNOT access GET /api/admin/tasks
□ Client user CANNOT access POST /api/admin/tasks
□ Client user CANNOT access GET /api/admin/requests
□ Client user CAN access GET /api/client/tasks — only receives their own tasks (clientid === user.id)
□ Client user CANNOT read another client's tasks by guessing task ID
□ Client user CANNOT read another client's notifications
□ PATCH /api/notifications/read/:id — user can only mark their OWN notification as read
□ RLS policies: authenticated user SELECT on requests returns only userid === auth.uid()
□ Admin-only routes return 401/403 for authenticated clients (not 404 — avoid info leak)
```

### Input Sanitization

```
□ POST /api/requests name field with <script>alert(1)</script> → stored safely, rendered as escaped text
□ POST /api/blog content with JavaScript URL in href → must not execute on render
□ POST /api/upload filename containing path traversal (../../etc/passwd) → sanitized, custom filename used
□ POST /api/upload MIME type mismatch (file is .exe, MIME says image/jpeg) → rejected
□ All POST bodies return 400 for malformed JSON, not 500
□ Blog slug auto-generation strips non-alphanumeric characters safely
□ Task content in comments is sanitized before storage and display
```

### API Protection

```
□ SUPABASE_SERVICE_ROLE_KEY is never exposed in client-side JavaScript bundles
   Run: grep -r "service_role" .next/static/
□ All admin API routes require isAdminEmail check AFTER getUser() — not before
□ POST /api/upload enforces rate limiting (429 after 20 req/min per IP)
□ API error responses in production do not include stack traces or SQL error details
□ Field whitelisting is enforced on all PUT/PATCH routes — extra fields are silently dropped
□ POST /api/subscribe does not leak whether an email is already subscribed (returns 201 either way)
□ Supabase admin client (createAdminClient) is NEVER imported in client-side components
```

### Sensitive Data Exposure

```
□ GET /api/blog returns only published:true posts for unauthenticated users
□ GET /api/projects does not expose internal admin-only fields (clientid of users)
□ HTTP response headers include security headers: X-Content-Type-Options, X-Frame-Options
□ Verify next.config.js has headers() config with security headers set
□ Console.error calls in API routes do not log user PII (passwords, full tokens) to server logs
□ .env.local is in .gitignore and SUPABASE_SERVICE_ROLE_KEY is not committed to git history
   Run: git log --all -S "service_role" -- .env.local
```

---

## 9. Developer Workflow

### Writing Tests for a New Feature

Every new feature that is merged to `main` must include tests. Follow this checklist:

```
Before writing any code:
□ Write failing test cases that describe the expected behavior (TDD encouraged but not required)
□ Identify which layer the feature lives in (utility → unit test, component → RTL, API → integration, full flow → E2E)

During development:
□ Run related tests in watch mode: npm test -- --watch src/lib/hooks/useNewHook
□ Ensure all existing tests still pass before pushing: npm run test:unit

After implementation:
□ Write or update unit tests for any new utility functions
□ Write RTL tests for any new UI components with forms, validation, or conditional rendering
□ Write integration tests for any new API routes
□ Add E2E test scenarios to the relevant spec file for new user-facing flows
□ Run npm run test:coverage and verify no critical files dropped below threshold
□ Add security assertions if the feature involves auth, file handling, or external input
```

### Updating Tests When Features Change

```
□ If a function signature changes → update ALL unit tests for that function
□ If an API route's input schema changes → update integration tests to test new and old inputs
□ If a component's props change → update component tests, not just the component
□ If a redirect rule in middleware changes → update middleware.test.ts immediately
□ NEVER delete a test because it is failing — fix it or open an issue
□ If a test is flaky (passes/fails randomly) → mark as test.skip with a GitHub issue link, fix within 1 sprint
```

### Running Tests Locally

```bash
# Run all unit and component tests (fast, ~10-30s)
npm run test:unit

# Run in watch mode during development
npm test

# Run integration tests
npm run test:integration

# Run specific file
npx vitest tests/unit/config/admin.test.ts

# Run E2E tests (requires app to be built or running)
npm run build
npm run test:e2e

# Run E2E with visual browser (debugging)
npm run test:e2e:ui

# Run mobile-specific E2E (critical for mobile_fixes branch)
npm run test:e2e:mobile

# View coverage report
npm run test:coverage
open coverage/index.html

# Check for service role key exposure (security check)
grep -r "service_role" .next/static/ 2>/dev/null && echo "⚠️ KEY EXPOSED" || echo "✅ Safe"
```

### Avoiding Breaking Existing Tests

```
□ Run the full test suite before pushing to any shared branch: npm run test:ci
□ Do NOT modify test mock fixtures without updating all tests that use them
□ Do NOT rename exported functions without updating their imports in test files
□ When modifying Supabase schema → update relevant fixture objects in tests/mocks/fixtures/
□ When updating ADMIN_EMAIL config → update test environment variable and all assertions
□ Keep MSW handlers in tests/mocks/handlers.ts aligned with actual Supabase response shapes
□ If you add a new required field to a Zod schema, update all tests that POST to that route
□ Review test failure output carefully — a failing test on a branch you "didn't touch" often indicates a real regression you introduced indirectly
```

### Pre-Push Hook (Recommended)

```bash
# Install husky and lint-staged for automated pre-push checks
npm install --save-dev husky lint-staged
npx husky init

# .husky/pre-push
#!/bin/sh
npm run test:unit
npm run test:integration
echo "✅ All unit and integration tests passed"
```

---

*This document is a living specification. Update it when the architecture changes, new test patterns are adopted, or new security requirements are identified. Review and revise quarterly or after each major feature release.*
