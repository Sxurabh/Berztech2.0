# AGENTS.md — Berztech Development Guide

Guidelines for AI agents in this repository.

---

## 1. Commands

```bash
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm test             # All Vitest tests
npm run test:ci      # Tests with coverage
npm run test:unit    # Unit + component tests
npm run test:e2e     # Playwright E2E tests

# Single test
npx vitest run tests/unit/config/admin.test.ts
npx vitest run tests/unit/config/admin.test.ts -t "test name"
npx playwright test tests/e2e/auth.spec.ts
```

---

## 2. Project Structure

```
src/
├── app/              # Next.js App Router (api/, auth/, dashboard/, admin/)
├── components/       # ui/, admin/, features/, sections/
├── lib/              # supabase/, auth/, api/, hooks/
├── config/           # admin.js, colors.js
└── data/             # Static data

tests/
├── unit/, components/, integration/, e2e/, mocks/, security/
```

---

## 3. Code Style

- **Production:** JavaScript (`.js`/`.jsx`)
- **Tests:** TypeScript (`.ts`/`.tsx`) preferred
- **Path alias:** Use `@/` for `src/`

### Component Pattern
```javascript
"use client";
import { useState } from "react";
import clsx from "clsx";

export default function ComponentName({ prop1, prop2 = "default" }) {
  const [state, setState] = useState(null);
  return <div className={clsx("base", prop1 && "conditional")} />;
}
```

### Imports (ordered)
1. React/Next (`react`, `next/*`)
2. External (`@supabase/*`, `clsx`, `framer-motion`)
3. Internal (`@/lib/*`, `@/components/*`)
4. Relative (`./`, `../`)

### Naming
- Components: `PascalCase` (e.g., `Button.jsx`)
- Utilities: `camelCase` (e.g., `client.js`)
- Hooks: `use*Name` (e.g., `useAuth`)

### Tailwind CSS
- Use `clsx` for conditional styling
- Custom colors from `@/config/colors.js` (e.g., `text-primary`)
- Example: `className={clsx("px-4 py-2", isActive && "bg-blue-500")}`

### Error Handling
- Wrap async ops in try/catch
- Log: `console.error("Action error:", error)`
- Return user-friendly messages
- Use Zod for validation with details

---

## 4. API Routes

```javascript
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";

export async function GET(request) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await businessLogic();
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Handler error:", error);
    return NextResponse.json({ error: "Message" }, { status: 500 });
  }
}
```

### Zod Validation
```javascript
import { z } from "zod";

const CreateSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  status: z.enum(["draft", "published"]).default("draft"),
});

export async function POST(request) {
  const body = await request.json();
  const validation = CreateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.error.format() },
      { status: 400 }
    );
  }
}
```

### Auth Guards
- Protected: `supabase.auth.getUser()` → 401 if failed
- Admin: `isAdminEmail(user.email)` → 403 if false

---

## 5. React Query

```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/posts", { method: "POST", body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}
```

---

## 6. Testing

### Vitest
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Feature', () => {
  beforeEach(() => { vi.stubEnv('VAR', 'value'); });
  it('works', async () => {
    expect(await fn()).toBe(expected);
  });
});
```

### Playwright
```typescript
import { test, expect } from '@playwright/test';

test('flow', async ({ page }) => {
  await page.goto('/page');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL('/expected');
});
```

### MSW
- Mock in `tests/mocks/handlers.ts`
- Use `server.use()` to override

---

## 7. Config

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-only!
ADMIN_EMAIL=admin@domain.com
```

Admin check: `isAdminEmail(email)` in `src/config/admin.js`

---

## 8. Constraints

- Never commit secrets — use `.env.local`
- Never import `admin.js` in client components
- Coverage: 70% line/function, 65% branch
- Test isolation: mock external calls
