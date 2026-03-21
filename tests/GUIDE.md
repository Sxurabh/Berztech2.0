# 📋 Antigravity Testing — Quick Start Guide

## Three Files, One System

| File | Purpose |
|------|---------|
| `TESTING_STRATEGY.md` | The master plan — what to build and why |
| `tests/PROMPTS.md` | Copy-paste prompts for AI implementation |
| `tests/TEST-TRACKER.md` | Live progress tracker — update after every session |

---

## 🚀 Starting From Scratch

**Step 1** — Open `tests/PROMPTS.md`

**Step 2** — Paste the **Master Context Prompt** at the top of your AI chat

**Step 3** — Run **Prompt 1.1** (Infrastructure Setup) — do this before anything else

**Step 4** — Install dependencies from the Install Checklist in `TEST-TRACKER.md`

**Step 5** — Run `npm test` to verify setup works

---

## 🔄 Resuming in a New AI Session / IDE

1. Open `tests/TEST-TRACKER.md`
2. Copy the entire file content
3. Open `tests/PROMPTS.md` and copy **Prompt T.2**
4. Paste Prompt T.2 into your new AI chat and fill in the tracker content
5. The AI will tell you exactly where to continue

---

## ✅ After Each Work Session

1. Run all tests: `npm run test:ci`
2. Note which tests passed and which failed
3. Copy **Prompt T.1** from `PROMPTS.md`
4. Fill in your results and run it with an AI
5. Replace `tests/TEST-TRACKER.md` with the AI's updated output
6. Commit the updated tracker: `git add tests/TEST-TRACKER.md && git commit -m "test: update tracker"`

---

## 🛠️ Test Commands

```bash
# No server needed — fast, self-contained
npm run test:offline           # 108 vitest files: unit, components, integration,
                               # property, contract, + stable security tests
                               # ~1254 tests, runs in ~30s

# Requires dev server + Supabase
npm run test:live              # 21 security integration tests + 6 standalone security
                               # tests (rate limiter isolation) + 26 E2E specs + cleanup
                               # Starts server, runs all tests, cleans DB

# Manual cleanup (also runs automatically after test:live)
npm run test:cleanup           # Deletes TEST_* records from Supabase DB + storage
                               # Requires SUPABASE_SERVICE_ROLE_KEY in tests/.env.test

# Other commands
npm run test                    # Watch mode (development)
npm run test:ci                # Full suite + coverage (use before pushing)
npm run test:unit              # Unit + component tests only
npm run test:integration       # API integration tests (vitest, mocked)
npm run test:e2e              # Playwright E2E (need app running)
npm run test:a11y              # Accessibility component tests
npm run test:visual           # Visual regression tests
npm run test:visual:update    # Update visual baselines
npx vitest run tests/unit/config/admin.test.ts   # Single file
```

### When to use which command

| Scenario | Command | Why |
|----------|---------|------|
| TDD / writing code | `npm test` | Watch mode, fast feedback |
| Before pushing / PR | `npm run test:ci` | Full suite + coverage gate |
| During development (no server) | `npm run test:offline` | Fast, no server needed |
| Security audit / full test | `npm run test:live` | Needs dev server + Supabase |
| Quick unit test | `npm run test:unit` | Only unit + component tests |

---

## 📸 Visual Regression Testing

Visual regression tests capture screenshots and compare them against baselines to detect unintended UI changes.

### Commands

```bash
npm run test:visual             # Run visual regression tests (compares against baselines)
npm run test:visual:update     # Update baseline screenshots (run after intentional UI changes)
```

### Test Location

- Visual tests: `tests/e2e/visual/`
- Snapshots: `tests/e2e/visual/__snapshots__/`

### Adding Visual Tests

1. Create a new `.spec.ts` file in `tests/e2e/visual/`
2. Use Playwright's `toHaveScreenshot()` matcher:

```typescript
import { test, expect } from '@playwright/test';

test('page matches baseline', async ({ page }) => {
  await page.goto('/page');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Wait for animations
  
  await expect(page).toHaveScreenshot('page-name.png', {
    maxDiffPixels: 50,
    threshold: 0.3,
  });
});
```

### Threshold Guidelines

| Page Type | Threshold | Rationale |
|-----------|-----------|-----------|
| Static (About, Contact) | 0.2 | Minimal dynamic content |
| Forms | 0.3 | Simple animations only |
| Dashboard | 0.4 | Data tables, counters |
| Homepage | 0.5 | Mouse-tracking, parallax |
| Animated sections | 0.3 | Framer Motion animations |

### Updating Baselines

After intentional UI changes:
1. Run `npm run test:visual:update`
2. Review new screenshots in `tests/e2e/visual/__snapshots__/`
3. Commit the updated baselines

### CI Behavior

Visual tests run on PRs when:
- PR title contains: `visual`, `ui`, `component`, `design`, `css`, `style`
- Branch name starts with: `visual-`, `ui-`, `design-`

Visual tests are skipped on regular PRs to avoid false positives.

---

## 📏 Phase Order (Do NOT Skip)

```
P0 (Infrastructure) → P1 (Foundation) → P2 (Components)
→ P3 (API/Integration) → P4 (E2E) → P5 (Security) → P6 (Performance)
```

Each phase builds on the previous. P0 must be 100% done before P1.

---

## 🚦 CI Gate Rules

| Test Type | When It Runs | Fails Merge If |
|-----------|-------------|----------------|
| Unit + Integration | Every push | Any test fails OR coverage < threshold |
| E2E (Chromium) | PR to main | Any test fails |
| Mobile E2E | mobile_fixes branch + main | Any test fails |
| Lighthouse | PR to main | Accessibility < 0.90 |

---

## ❓ Troubleshooting

**"Cannot find module '@/...'"** → Check `vitest.config.js` has the `@` alias in `resolve.alias` pointing to `./src`

**"Vitest: Cannot find project for file"** → The file is not in any project's `include` pattern. Check `test.projects` in `vitest.config.js`.

**"MSW: Unhandled request"** → Add a handler in `tests/mocks/handlers.ts` for that Supabase endpoint

**"E2E: Auth redirect not working"** → Make sure `.env.test` has the correct Supabase test project credentials

**"Coverage below threshold"** → Run `npm run test:coverage` and open `coverage/index.html` to see which files need more tests. CI also runs `scripts/check-coverage.js` to fail PRs below 89.05% line coverage.

**"test:cleanup fails with missing env vars"** → Add `SUPABASE_SERVICE_ROLE_KEY=xxx` to `tests/.env.test`. Get this from Supabase Dashboard → Project Settings → API → `service_role` secret. This key has admin DB access and should never be committed.

**"test:live fails: could not list storage"** → The `images` storage bucket may not exist in the Supabase project. Create it via Supabase Dashboard → Storage → New bucket named `images` with public access.

**"Vitest: Cannot find project for file"** → The file is not in any project's `include` pattern. Check `test.projects` in `vitest.config.js`.

**Tests pass locally but fail in CI** → Check GitHub Actions env secrets match your `.env.test` variable names

---

## 🧪 Phase 22 Audit Conventions

These conventions were established during the external audit (Phase 22) and should be followed for all new tests.

### Factory-First Pattern
Prefer factory helper functions over inline object creation:
```js
const mockProject = (overrides = {}) => ({
    id: 'p1', title: 'Test', client: 'Client',
    created_at: '2025-01-15T00:00:00Z',
    ...overrides,
});
```
This keeps tests readable and makes it easy to test edge cases via overrides.

### No Trivial Assertions
Never assert things that are guaranteed to pass:
```js
// BAD
expect(data).toBeDefined();

// GOOD
expect(data.id).toBe('p1');
expect(screen.getByText('Test')).toBeInTheDocument();
```

### Deterministic Mocks
- Always `vi.clearAllMocks()` and `vi.restoreAllMocks()` in `beforeEach`
- Mock Supabase clients in `beforeEach`, not at module level
- Use static timestamps (e.g., `'2025-01-15T00:00:00Z'`) instead of `new Date()` in mock data
- Reset module state between test files

### Explicit Auth State Per Describe Block
Each `test.describe` block should set up its own auth state. Do not share cookies or storage state between blocks:
```js
test.describe('Authenticated admin', () => {
    test.beforeEach(async ({ page }) => {
        await adminLogin(page); // inline login helper
    });
    // tests...
});
```

### Mocking Pattern for Components
Use dynamic imports inside tests for mocked components:
```js
const DashboardRecentProjects = (await import('@/components/features/admin/DashboardRecentProjects')).default;
```
Always mock in this order: framer-motion, react-icons, CornerFrame, next/link.

### Vitest Workspace Structure
Tests run in two environments via `test.projects` in `vitest.config.js`:
- **jsdom project**: unit tests, component tests, security tests (not integration)
- **node project**: security integration tests (require real Supabase client)
```bash
npx vitest run                 # run all projects
npx vitest run tests/unit      # run unit tests only
```

### MSW Handler Scope
Add MSW handlers to `tests/mocks/handlers.ts`. Do not add inline handlers. If a handler is test-specific, create a test-local handler factory.

### Skipping Auth-Dependent Tests
If real Supabase credentials are not available, skip gracefully:
```js
const email = process.env.TEST_ADMIN_EMAIL;
if (!email) { test.skip(); return; }
```

### Skip Pattern for E2E Tests
Use `if (!email || !password) { test.skip(); return; }` inside `beforeEach` for E2E tests that require auth. This ensures the test suite passes when credentials are not configured.
