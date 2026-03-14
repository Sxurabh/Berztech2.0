# AGENTS.md — Berztech Development Guide

Guidelines for AI agents operating in this repository.

---

## 1. Commands

### Development
```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
```

### Linting
```bash
npm run lint         # Run ESLint (next lint)
```

### Testing
```bash
npm test             # Run all Vitest tests (unit + integration)
npm run test:ci      # Run tests with coverage
npm run test:unit    # Unit + component tests only
npm run test:integration  # Integration tests only
npm run test:coverage     # Generate HTML coverage report
npm run test:e2e     # Run Playwright E2E tests
```

### Single Test Execution
```bash
# Vitest (single file)
npx vitest run tests/unit/config/admin.test.ts

# Vitest (single test by name)
npx vitest run tests/unit/config/admin.test.ts -t "returns true for configured admin email"

# Playwright (single file)
npx playwright test tests/e2e/auth.spec.ts

# Playwright (single test)
npx playwright test tests/e2e/auth.spec.ts -t "Navigate to /dashboard"
```

---

## 2. Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── api/          # API routes (route.js)
│   ├── auth/         # Auth pages
│   ├── dashboard/    # Client dashboard
│   ├── admin/        # Admin panel
│   └── page.jsx      # Homepage
├── components/
│   ├── ui/           # Reusable UI (Button, Modal, DataTable)
│   ├── admin/        # Admin-specific components
│   ├── features/     # Feature components (blog, contact, work)
│   └── sections/     # Page sections (Hero, StatsBar)
├── lib/
│   ├── supabase/     # client.js, server.js, admin.js, middleware.js
│   ├── auth/         # AuthProvider.jsx
│   ├── api/          # API client utilities
│   └── hooks/        # Custom React hooks
├── config/           # Configuration (admin.js, colors.js)
└── data/             # Static data
```

---

## 3. Code Style

### Languages
- **Production:** JavaScript (`.js`/`.jsx`)
- **Tests:** TypeScript (`.ts`/`.tsx`) preferred
- **Path alias:** Use `@/` for imports from `src/`

### Component Pattern
```javascript
"use client";
import { useState } from "react";
import clsx from "clsx";

export default function ComponentName({ prop1, prop2 = "default" }) {
  const [state, setState] = useState(null);
  return <div className={clsx("base-class", prop1 && "conditional")} />;
}
```

### Imports
- **External:** `import { something } from "package"`
- **Internal:** `import { something } from "@/lib/supabase/client"`
- **Relative:** `import Component from "./Component"` (co-located files only)

### Naming
- Components: `PascalCase` (e.g., `Button.jsx`, `BlogPostForm.jsx`)
- Utilities: `camelCase` (e.g., `client.js`, `middleware.js`)
- Tests: `*.test.ts` or `*.test.js`

---

## 4. API Routes

### Pattern
```javascript
export async function Handler(request) {
  try {
    // Business logic
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error("Handler error:", error);
    return NextResponse.json(
      { error: "User-friendly message" },
      { status: 500 }
    );
  }
}
```

### Validation
- Use **Zod** for request body validation
- Return structured errors: `{ error: "message", details: ... }`

### Auth Guards
```javascript
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const { isAdminEmail } = require("@/config/admin");
if (!isAdminEmail(user.email)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

---

## 5. Testing

### Vitest
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('FeatureName', () => {
  beforeEach(() => {
    vi.stubEnv('VAR_NAME', 'test-value');
  });

  it('does something specific', async () => {
    const result = await functionUnderTest();
    expect(result).toBe(expected);
  });
});
```

### Playwright
```typescript
import { test, expect } from '@playwright/test';

test('user flow', async ({ page }) => {
  await page.goto('/page');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL('/expected');
});
```

### MSW
- Mock Supabase in `tests/mocks/handlers.ts`
- Use `server.use()` to override per test

---

## 6. Configuration

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx        # Server-only!
ADMIN_EMAIL=admin@yourdomain.com
```

### Admin Check
- Function: `isAdminEmail(email)` in `src/config/admin.js`
- Compares lowercase email against `ADMIN_EMAIL` env var

---

## 7. Common Tasks

### Add API Route
1. Create `src/app/api/resource/route.js`
2. Implement GET/POST/PATCH/DELETE handlers
3. Add auth guards using Supabase
4. Add Zod validation schema
5. Write tests in `tests/integration/api/resource.test.ts`

### Add Component
1. Create in appropriate `src/components/` folder
2. Use `"use client"` if it uses hooks
3. Export as default
4. Write tests in `tests/components/`

---

## 8. Constraints

- **Never commit secrets** — use `.env.local`, never commit `.env`
- **Server-only code** — never import `admin.js` in client components
- **Coverage thresholds** — 70% line/function, 65% branch
- **Test isolation** — each test independent; mock external calls
