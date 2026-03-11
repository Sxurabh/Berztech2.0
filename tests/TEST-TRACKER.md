# 🧪 Antigravity — Test Implementation Tracker
> **Project:** Antigravity (mobile_fixes branch)
> **Strategy Doc:** `TESTING_STRATEGY.md`
> **Last Updated:** 2026-03-12
> **Overall Progress:** 73% (33/45 test files complete)

---

## 📖 Quick Guide

1. **Starting a new AI session?** → Copy Prompt T.2 from [PROMPTS.md](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/PROMPTS.md:0:0-0:0), paste this file's content into it
2. **Finished a task?** → Change status from `⬜ TODO` to `🔄 IN PROGRESS` to `✅ DONE`
3. **Test failed?** → Add entry to [Failed Tests Log](#-failed-tests-log) section
4. **Test passed?** → Add entry to [Passed Tests Log](#-passed-tests-log) section
5. **Blocked?** → Add 🚫 status and note the blocker in the Notes column

### Status Legend
| Icon | Meaning |
|------|---------|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Complete — all tests passing |
| ❌ | Complete — has failing tests |
| 🚫 | Blocked |
| ⏭️ | Skipped (with reason) |

---

## 📊 Phase Summary

| Phase | Description | Files | Status | Progress |
|-------|-------------|-------|--------|----------|
| P0 | Infrastructure Setup | 7 | ✅ | 100% |
| P1 | Critical Foundation | 7 | ✅ | 100% (7/7 files, 68 tests) |
| P2 | Component Testing | 8 | ✅ | 100% (8/8 files, 54 tests) |
| P3 | API & Integration | 11 | ✅ | 100% (11/11 files, 130 tests) |
| P4 | End-to-End (E2E) | 7 | ⬜ | 0% |
| P5 | Security Testing | 4 | ⬜ | 0% |
| P6 | Performance | 4 | ⬜ | 0% |
| **TOTAL** | | **45** | | **73%** |

---

## 🏗️ PHASE 0 — Infrastructure Setup
> Use Prompt 1.1 from PROMPTS.md

| # | File | Description | Status | Notes |
|---|------|-------------|--------|-------|
| 0.1 | `vitest.config.js` | Vitest config with coverage thresholds | ✅ | Root level |
| 0.2 | [tests/setup.ts](cci:7://file:///i:/AntiGravity/Berztech2.0/tests/setup.ts:0:0-0:0) | MSW + jest-dom global setup | ✅ | |
| 0.3 | [tests/mocks/server.ts](cci:7://file:///i:/AntiGravity/Berztech2.0/tests/mocks/server.ts:0:0-0:0) | MSW Node server | ✅ | |
| 0.4 | [tests/mocks/handlers.ts](cci:7://file:///i:/AntiGravity/Berztech2.0/tests/mocks/handlers.ts:0:0-0:0) | Default Supabase auth mock handlers | ✅ | |
| 0.5 | [tests/mocks/fixtures/users.ts](cci:7://file:///i:/AntiGravity/Berztech2.0/tests/mocks/fixtures/users.ts:0:0-0:0) | mockAdminUser, mockClientUser, mockAnonSession | ✅ | |
| 0.6 | [tests/mocks/fixtures/tasks.ts](cci:7://file:///i:/AntiGravity/Berztech2.0/tests/mocks/fixtures/tasks.ts:0:0-0:0) | Mock tasks array (5 varied statuses) | ✅ | |
| 0.7 | [tests/mocks/fixtures/requests.ts](cci:7://file:///i:/AntiGravity/Berztech2.0/tests/mocks/fixtures/requests.ts:0:0-0:0) | Mock project requests array | ✅ | |
| 0.8 | `package.json scripts` | Add test, test:ci, test:unit, test:integration, test:coverage | ✅ | |

**Phase 0 Complete:** ✅ — `8/8 items done`

---

## 🔑 PHASE 1 — Critical Foundation Tests
> Use Prompts 1.2 → 1.5 from PROMPTS.md

| # | File | Covers | Status | Tests | Notes |
|---|------|--------|--------|-------|-------|
| 1.1 | [tests/unit/config/admin.test.ts](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/unit/config/admin.test.ts:0:0-0:0) | `isAdminEmail()` — 8 cases | ✅ | 8/8 | |
| 1.2 | [tests/unit/lib/supabase/client.test.ts](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/unit/lib/supabase/client.test.ts:0:0-0:0) | `createClient()` — null safety, singleton | ✅ | 5/5 | |
| 1.3 | [tests/unit/lib/supabase/admin.test.ts](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/unit/lib/supabase/admin.test.ts:0:0-0:0) | [createAdminClient()](cci:1://file:///I:/AntiGravity/Berztech2.0/src/lib/supabase/admin.js:7:0-20:1) — service role key guard | ✅ | 5/5 | Server-only guard tested |
| 1.4 | [tests/unit/lib/supabase/middleware.test.ts](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/unit/lib/supabase/middleware.test.ts:0:0-0:0) | Route protection — 10 redirect cases | ✅ | 13/13 | |
| 1.5 | [tests/unit/lib/auth/AuthProvider.test.tsx](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/unit/lib/auth/AuthProvider.test.tsx:0:0-0:0) | `useAuth()` hook — 10 cases | ✅ | 10/10 | |
| 1.6 | [tests/unit/lib/api/client.test.js](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/unit/lib/api/client.test.js:0:0-0:0) | API client — fetchJson, projectsApi, blogApi, uploadApi, testimonialsApi | ✅ | 23/23 | |
| 1.7 | [tests/unit/lib/supabase/server.test.js](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/unit/lib/supabase/server.test.js:0:0-0:0) | `createServerSupabaseClient()` — null safety | ✅ | 4/4 | |

**Phase 1 Complete:** ✅ — `7/7 files done`  `68/68 tests passing`

---

## 🧩 PHASE 2 — Component Testing
> Use Prompts 2.1 → 2.3 from PROMPTS.md

| # | File | Covers | Status | Tests | Notes |
|---|------|--------|--------|-------|-------|
| 2.1 | [tests/components/ui/Button.test.jsx](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/components/ui/Button.test.jsx:0:0-0:0) | Render, click, disabled, variant classes | ✅ | 7/7 | |
| 2.2 | [tests/components/ui/Modal.test.jsx](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/components/ui/Modal.test.jsx:0:0-0:0) | Open/close, children, escape key | ✅ | 5/5 | |
| 2.3 | [tests/components/ui/DataTable.test.jsx](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/components/ui/DataTable.test.jsx:0:0-0:0) | Headers, rows, empty state, search, sort | ✅ | 5/5 | |
| 2.4 | [tests/components/features/contact/ContactForm.test.jsx](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/components/features/contact/ContactForm.test.jsx:0:0-0:0) | Validation, submit, success, error | ✅ | 9/9 | Msg length tested |
| 2.5 | [tests/components/admin/DeleteConfirmModal.test.jsx](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/components/admin/DeleteConfirmModal.test.jsx:0:0-0:0) | Confirm, cancel, loading, bulk mode | ✅ | 5/5 | |
| 2.6 | [tests/components/admin/BlogPostForm.test.jsx](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/components/admin/BlogPostForm.test.jsx:0:0-0:0) | Create/edit modes, slug gen, submit | ✅ | 8/8 | All behaviors tested |
| 2.7 | `tests/components/features/blog/Newsletter.test.jsx` | Subscribe form — render, success/error, disabled states, fetch payload | ✅ | 7/7 | |
| 2.8 | `tests/components/admin/TestimonialForm.test.jsx` | Create/edit modes, API calls, featured toggle, embedded mode | ✅ | 8/8 | |

**Phase 2 Complete:** ✅ — `8/8 files done`  `54/54 tests passing`

---

## 🔗 PHASE 3 — API & Integration Testing
> Use Prompts 3.1 → 3.4 from PROMPTS.md

| # | File | Covers | Status | Tests | Notes |
|---|------|--------|--------|-------|-------|
| 3.1 | [tests/integration/api/requests.test.ts](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/integration/api/requests.test.ts:0:0-0:0) | POST /api/requests — Zod validation, 10 cases | ✅ | 15/15 | Includes auth user association & edge cases |
| 3.2 | [tests/integration/api/blog.test.ts](cci:7://file:///I:/AntiGravity/Berztech2.0/tests/integration/api/blog.test.ts:0:0-0:0) | Blog CRUD — auth guards, field whitelist, 16 cases | ✅ | 25/16 | Exceeded planned count with edge cases |
| 3.3 | `tests/integration/api/admin-tasks.test.ts` | Admin task CRUD — auth, clientid inheritance | ✅ | 20/16 | Exceeded planned count with edge cases |
| 3.4 | `tests/integration/api/client-tasks.test.ts` | GET /api/client/tasks — IDOR isolation | ✅ | 4/4 | |
| 3.5 | `tests/integration/api/upload.test.ts` | Upload — MIME, size, rate limit, admin-only | ✅ | 10/10 | |
| 3.6 | `tests/integration/api/subscribe.test.ts` | Newsletter — email validation, idempotency | ✅ | 9/5 | Exceeded planned count |
| 3.7 | `tests/integration/api/notifications.test.ts` | GET notifications, PATCH read single/all | ✅ | 8/6 | Exceeded planned count |
| 3.8 | `tests/integration/api/requests-get.test.ts` | GET /api/requests — auth guard, user isolation | ✅ | 4/4 | |
| 3.9 | `tests/integration/api/projects.test.ts` | Projects CRUD — auth, validation, field whitelist | ✅ | 16/16 | Full CRUD coverage |
| 3.10 | `tests/integration/api/testimonials.test.ts` | Testimonials CRUD — auth, validation | ✅ | 13/13 | Full CRUD coverage |
| 3.11 | `tests/integration/api/settings.test.ts` | POST /api/settings — admin-only upsert | ✅ | 6/6 | |

**Phase 3 Complete:** ✅ — `11/11 files done`  `130 tests passing`

---

## 🌐 PHASE 4 — End-to-End Testing
> Use Prompts 4.1 → 4.3 from PROMPTS.md

| # | File | Covers | Status | Tests | Notes |
|---|------|--------|--------|-------|-------|
| 4.1 | `tests/e2e/auth.spec.ts` | Login, redirects, OAuth, error states | ⬜ | 0/13 | Needs .env.test |
| 4.2 | `tests/e2e/navigation.spec.ts` | Migrate existing + mobile nav | ⬜ | 0/— | Existing file |
| 4.3 | `tests/e2e/home.spec.ts` | Migrate existing + mobile hero, CTA | ⬜ | 0/— | Existing file |
| 4.4 | `tests/e2e/contact.spec.ts` | Migrate existing + validation, success | ⬜ | 0/— | Existing file |
| 4.5 | `tests/e2e/blog.spec.ts` | Blog listing, post detail, newsletter | ⬜ | 0/6 | |
| 4.6 | `tests/e2e/dashboard.spec.ts` | Client dashboard flow | ⬜ | 0/5 | Needs auth state |
| 4.7 | `tests/e2e/admin-board.spec.ts` | Admin Kanban, task create/open | ⬜ | 0/9 | Needs admin auth |
| 4.8 | `tests/e2e/helpers/auth.setup.ts` | Auth state setup for Playwright | ⬜ | N/A | Prerequisite for 4.6, 4.7 |

**Phase 4 Complete:** ⬜ — `0/8 files done`

---

## 🔒 PHASE 5 — Security Testing
> Use Prompts 5.1 → 5.2 from PROMPTS.md

| # | File | Covers | Status | Tests | Notes |
|---|------|--------|--------|-------|-------|
| 5.1 | `tests/security/idor.test.ts` | Client data isolation, role bypass — 11 cases | ⬜ | 0/11 | |
| 5.2 | `tests/security/input-injection.test.ts` | XSS, oversized input, path traversal — 6 cases | ⬜ | 0/6 | |
| 5.3 | `tests/security/data-exposure.test.ts` | Bundle key exposure, error leak, draft leak — 5 cases | ⬜ | 0/5 | Manual check needed |
| 5.4 | `tests/security/auth-bypass.test.ts` | Open redirect in OAuth, middleware guard bypass | ⬜ | 0/6 | |

**Phase 5 Complete:** ⬜ — `0/4 files done`  `0/28 tests passing`

---

## ⚡ PHASE 6 — Performance & Load Testing
> Use Prompt 6.1 from PROMPTS.md

| # | File | Covers | Status | Notes |
|---|------|--------|--------|-------|
| 6.1 | `lhci.config.js` | Lighthouse CI config — 5 pages, thresholds | ⬜ | Root level |
| 6.2 | `.github/workflows/test.yml` | Full CI pipeline with all jobs | ⬜ | |
| 6.3 | `tests/load/api-requests.js` | k6 load test — POST /api/requests | ⬜ | |
| 6.4 | `tests/load/api-blog.js` | k6 load test — GET /api/blog | ⬜ | |

**Phase 6 Complete:** ⬜ — `0/4 files done`

---

## ✅ Passed Tests Log
> Add entries here after each session. Format: `DATE | FILE | TEST NAME | PASS`

| Date | File | Test Name | Status |
|------|------|-----------|--------|
| 2026-03-11 | admin.test.ts | returns true for configured admin email (exact match) | ✅ PASS |
| 2026-03-11 | admin.test.ts | returns true regardless of letter case (upper/lower) | ✅ PASS |
| 2026-03-11 | admin.test.ts | returns false for a random non-admin email | ✅ PASS |
| 2026-03-11 | admin.test.ts | returns false for empty string | ✅ PASS |
| 2026-03-11 | admin.test.ts | returns false for null | ✅ PASS |
| 2026-03-11 | admin.test.ts | returns false for undefined | ✅ PASS |
| 2026-03-11 | admin.test.ts | returns false for an email with the same domain but different username | ✅ PASS |
| 2026-03-11 | admin.test.ts | returns false for a string that contains the admin email but has extra characters | ✅ PASS |
| 2026-03-11 | client.test.ts | returns a valid Supabase client when env vars are set | ✅ PASS |
| 2026-03-11 | client.test.ts | returns null when NEXT_PUBLIC_SUPABASE_URL is missing | ✅ PASS |
| 2026-03-11 | client.test.ts | returns null when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing | ✅ PASS |
| 2026-03-11 | client.test.ts | is a singleton - calling twice returns the same instance | ✅ PASS |
| 2026-03-11 | client.test.ts | returns null when URL does not start with http | ✅ PASS |
| 2026-03-11 | admin.test.ts (supabase) | returns admin client when SUPABASE_SERVICE_ROLE_KEY is set | ✅ PASS |
| 2026-03-11 | admin.test.ts (supabase) | returns null when SUPABASE_SERVICE_ROLE_KEY is missing | ✅ PASS |
| 2026-03-11 | admin.test.ts (supabase) | returns null when NEXT_PUBLIC_SUPABASE_URL is missing | ✅ PASS |
| 2026-03-11 | admin.test.ts (supabase) | returns null when URL does not start with http | ✅ PASS |
| 2026-03-11 | middleware.test.ts | redirects to /auth/login when no user accesses /admin | ✅ PASS |
| 2026-03-11 | middleware.test.ts | redirects to /dashboard when non-admin user accesses /admin | ✅ PASS |
| 2026-03-11 | middleware.test.ts | allows admin user through to /admin | ✅ PASS |
| 2026-03-11 | middleware.test.ts | redirects to /auth/login when no user accesses /dashboard | ✅ PASS |
| 2026-03-11 | middleware.test.ts | redirects admin users to /admin when accessing /dashboard | ✅ PASS |
| 2026-03-11 | middleware.test.ts | allows regular user through to /dashboard | ✅ PASS |
| 2026-03-11 | middleware.test.ts | redirects to /auth/login when no user accesses /track | ✅ PASS |
| 2026-03-11 | middleware.test.ts | allows regular user through to /track | ✅ PASS |
| 2026-03-11 | middleware.test.ts | allows access to root / | ✅ PASS |
| 2026-03-11 | middleware.test.ts | allows access to /blog | ✅ PASS |
| 2026-03-11 | middleware.test.ts | allows access to /work | ✅ PASS |
| 2026-03-11 | middleware.test.ts | allows access to /contact | ✅ PASS |
| 2026-03-11 | middleware.test.ts | allows access to /about | ✅ PASS |
| 2026-03-11 | middleware.test.ts | allows access to /work | ✅ PASS |
| 2026-03-11 | AuthProvider.test.tsx | useAuth throws error when used outside AuthProvider | ✅ PASS |
| 2026-03-11 | AuthProvider.test.tsx | AuthProvider renders children without crashing | ✅ PASS |
| 2026-03-11 | AuthProvider.test.tsx | initial state: loading is true, then false after getUser resolves | ✅ PASS |
| 2026-03-11 | AuthProvider.test.tsx | signInWithEmail calls supabase.auth.signInWithPassword with correct args | ✅ PASS |
| 2026-03-11 | AuthProvider.test.tsx | signInWithEmail throws when credentials are wrong | ✅ PASS |
| 2026-03-11 | AuthProvider.test.tsx | signInWithOAuth called with google → calls supabase.auth.signInWithOAuth with provider google | ✅ PASS |
| 2026-03-11 | AuthProvider.test.tsx | signInWithOAuth validates the next redirect param — external URLs must be ignored | ✅ PASS |
| 2026-03-11 | AuthProvider.test.tsx | signOut calls supabase.auth.signOut | ✅ PASS |
| 2026-03-11 | AuthProvider.test.tsx | User state updates when auth state changes | ✅ PASS |
| 2026-03-11 | AuthProvider.test.tsx | When Supabase is null, loading becomes false without crashing | ✅ PASS |
| 2026-03-11 | client.test.js | fetchJson makes request to /api/projects endpoint | ✅ PASS |
| 2026-03-11 | client.test.js | fetchJson includes Content-Type header by default | ✅ PASS |
| 2026-03-11 | client.test.js | fetchJson throws error when response is not ok (4xx) | ✅ PASS |
| 2026-03-11 | client.test.js | fetchJson throws error when response is not ok (5xx) | ✅ PASS |
| 2026-03-11 | client.test.js | fetchJson throws error when response body is not valid JSON | ✅ PASS |
| 2026-03-11 | client.test.js | fetchJson handles empty response body | ✅ PASS |
| 2026-03-11 | client.test.js | fetchJson includes custom headers when provided | ✅ PASS |
| 2026-03-11 | client.test.js | projectsApi list calls GET /api/projects | ✅ PASS |
| 2026-03-11 | client.test.js | projectsApi get calls GET /api/projects/{id} | ✅ PASS |
| 2026-03-11 | client.test.js | projectsApi create calls POST /api/projects with JSON body | ✅ PASS |
| 2026-03-11 | client.test.js | projectsApi update calls PUT /api/projects/{id} | ✅ PASS |
| 2026-03-11 | client.test.js | projectsApi delete calls DELETE /api/projects/{id} | ✅ PASS |
| 2026-03-11 | client.test.js | blogApi list calls GET /api/blog | ✅ PASS |
| 2026-03-11 | client.test.js | blogApi get calls GET /api/blog/{id} | ✅ PASS |
| 2026-03-11 | client.test.js | blogApi create calls POST /api/blog | ✅ PASS |
| 2026-03-11 | client.test.js | blogApi update calls PUT /api/blog/{id} | ✅ PASS |
| 2026-03-11 | client.test.js | blogApi delete calls DELETE /api/blog/{id} | ✅ PASS |
| 2026-03-11 | client.test.js | uploadApi upload calls POST /api/upload with FormData | ✅ PASS |
| 2026-03-11 | client.test.js | testimonialsApi list calls GET /api/testimonials | ✅ PASS |
| 2026-03-11 | client.test.js | testimonialsApi get calls GET /api/testimonials/{id} | ✅ PASS |
| 2026-03-11 | client.test.js | testimonialsApi create calls POST /api/testimonials | ✅ PASS |
| 2026-03-11 | client.test.js | testimonialsApi update calls PUT /api/testimonials/{id} | ✅ PASS |
| 2026-03-11 | client.test.js | testimonialsApi delete calls DELETE /api/testimonials/{id} | ✅ PASS |
| 2026-03-11 | server.test.js | returns server client when env vars are set | ✅ PASS |
| 2026-03-11 | server.test.js | returns null when NEXT_PUBLIC_SUPABASE_URL is missing | ✅ PASS |
| 2026-03-11 | server.test.js | returns null when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing | ✅ PASS |
| 2026-03-11 | server.test.js | returns null when URL does not start with http | ✅ PASS |
| 2026-03-11 | Button.test.tsx | renders with correct label text | ✅ PASS |
| 2026-03-11 | Button.test.tsx | calls onClick handler when clicked | ✅ PASS |
| 2026-03-11 | Button.test.tsx | does not call onClick when disabled | ✅ PASS |
| 2026-03-11 | Button.test.tsx | applies correct variant classes for primary | ✅ PASS |
| 2026-03-11 | Button.test.tsx | applies correct variant classes for secondary | ✅ PASS |
| 2026-03-11 | Modal.test.tsx | does not render when isOpen is false | ✅ PASS |
| 2026-03-11 | Modal.test.tsx | renders children when isOpen is true | ✅ PASS |
| 2026-03-11 | Modal.test.tsx | renders the title prop correctly | ✅ PASS |
| 2026-03-11 | Modal.test.tsx | calls onClose when close button is clicked | ✅ PASS |
| 2026-03-11 | Modal.test.tsx | calls onClose when Escape key is pressed | ✅ PASS |
| 2026-03-11 | DataTable.test.tsx | renders column headers from columns prop | ✅ PASS |
| 2026-03-11 | DataTable.test.tsx | renders correct number of rows | ✅ PASS |
| 2026-03-11 | DataTable.test.tsx | shows emptyMessage when data array is empty | ✅ PASS |
| 2026-03-11 | DataTable.test.tsx | search input filters rows by searchKey | ✅ PASS |
| 2026-03-11 | DataTable.test.tsx | clicking sortable column header sorts the data | ✅ PASS |
| 2026-03-11 | DeleteConfirmModal.test.tsx | renders modal with itemName in the message | ✅ PASS |
| 2026-03-11 | DeleteConfirmModal.test.tsx | calls onConfirm when confirm button is clicked | ✅ PASS |
| 2026-03-11 | DeleteConfirmModal.test.tsx | calls onClose when cancel button is clicked | ✅ PASS |
| 2026-03-11 | DeleteConfirmModal.test.tsx | shows loading state when loading prop is true | ✅ PASS |
| 2026-03-11 | BlogPostForm.test.tsx | renders in create mode with empty fields | ✅ PASS |
| 2026-03-11 | admin.test.ts (supabase) | verifies the admin client is never imported or available in the browser context | ✅ PASS |
| 2026-03-11 | BlogPostForm.test.tsx | slug is auto-generated from title if not manually set | ✅ PASS |
| 2026-03-11 | BlogPostForm.test.tsx | slug is not auto-generated if manually set | ✅ PASS |
| 2026-03-11 | BlogPostForm.test.tsx | renders in "edit" mode with pre-filled data | ✅ PASS |
| 2026-03-11 | BlogPostForm.test.tsx | Title is required — shows error if empty on submit | ✅ PASS |
| 2026-03-11 | BlogPostForm.test.tsx | Published toggle changes the published boolean | ✅ PASS |
| 2026-03-11 | BlogPostForm.test.tsx | Submit in create mode calls POST /api/blog | ✅ PASS |
| 2026-03-11 | BlogPostForm.test.tsx | Submit in edit mode calls PUT /api/blog/:id | ✅ PASS |
| 2026-03-11 | ContactForm.test.jsx | enforces message length validation (max 1000 chars) | ✅ PASS |
| 2026-03-11 | requests.test.ts | 1. Valid minimal payload (name + email only) → 201 | ✅ PASS |
| 2026-03-11 | requests.test.ts | 2. Valid full payload → 201 with submitted data | ✅ PASS |
| 2026-03-11 | requests.test.ts | 3. Missing name → 400 with error.details | ✅ PASS |
| 2026-03-11 | requests.test.ts | 4. Missing email → 400 | ✅ PASS |
| 2026-03-11 | requests.test.ts | 5. Invalid email format → 400 | ✅ PASS |
| 2026-03-11 | requests.test.ts | 6. Message over 1000 characters → 400 | ✅ PASS |
| 2026-03-11 | requests.test.ts | 7. Malformed JSON body → 400 | ✅ PASS |
| 2026-03-11 | requests.test.ts | 8. Database insert failure → 500 | ✅ PASS |
| 2026-03-11 | requests.test.ts | 9. Empty body {} → 400 | ✅ PASS |
| 2026-03-11 | requests.test.ts | 10. Extra fields not in schema are accepted but stripped | ✅ PASS |
| 2026-03-11 | requests.test.ts | associates request with authenticated user when logged in | ✅ PASS |
| 2026-03-11 | requests.test.ts | handles name with exactly 2 characters (minimum) | ✅ PASS |
| 2026-03-11 | requests.test.ts | handles message with exactly 1000 characters (maximum) | ✅ PASS |
| 2026-03-11 | requests.test.ts | handles email with plus sign (subaddressing) | ✅ PASS |
| 2026-03-11 | requests.test.ts | rejects name with only 1 character | ✅ PASS |
| 2026-03-11 | blog.test.ts | GET /api/blog: Anonymous user receives only published posts | ✅ PASS |
| 2026-03-11 | blog.test.ts | GET /api/blog: Admin user receives ALL posts including drafts | ✅ PASS |
| 2026-03-11 | blog.test.ts | GET /api/blog: Posts are ordered by created_at descending | ✅ PASS |
| 2026-03-11 | blog.test.ts | GET /api/blog: Returns 500 when Supabase query fails | ✅ PASS |
| 2026-03-11 | blog.test.ts | POST /api/blog: Unauthenticated request → 401 | ✅ PASS |
| 2026-03-11 | blog.test.ts | POST /api/blog: Authenticated non-admin → 403 | ✅ PASS |
| 2026-03-11 | blog.test.ts | POST /api/blog: Admin with missing title → 400 | ✅ PASS |
| 2026-03-11 | blog.test.ts | POST /api/blog: Admin with valid payload → 201 | ✅ PASS |
| 2026-03-11 | blog.test.ts | POST /api/blog: Slug is auto-generated when not provided | ✅ PASS |
| 2026-03-11 | blog.test.ts | POST /api/blog: Malformed JSON → 400 | ✅ PASS |
| 2026-03-11 | blog.test.ts | GET /api/blog/[id]: returns post by UUID | ✅ PASS |
| 2026-03-11 | blog.test.ts | GET /api/blog/[id]: returns post by slug | ✅ PASS |
| 2026-03-11 | blog.test.ts | GET /api/blog/[id]: returns 404 when post not found | ✅ PASS |
| 2026-03-11 | blog.test.ts | PUT /api/blog/[id]: Admin can update by UUID | ✅ PASS |
| 2026-03-11 | blog.test.ts | PUT /api/blog/[id]: Admin can update by slug | ✅ PASS |
| 2026-03-11 | blog.test.ts | PUT /api/blog/[id]: Only whitelisted fields updated | ✅ PASS |
| 2026-03-11 | blog.test.ts | PUT /api/blog/[id]: Non-admin → 403 | ✅ PASS |
| 2026-03-11 | blog.test.ts | PUT /api/blog/[id]: Non-existent ID → 404 | ✅ PASS |
| 2026-03-11 | blog.test.ts | DELETE /api/blog/[id]: Admin deletes → 200 { success: true } | ✅ PASS |
| 2026-03-11 | blog.test.ts | DELETE /api/blog/[id]: Non-admin → 403 | ✅ PASS |
| 2026-03-11 | blog.test.ts | DELETE /api/blog/[id]: Unauthenticated → 401 | ✅ PASS |
| 2026-03-11 | blog.test.ts | DELETE /api/blog/[id]: Handles deletion by UUID | ✅ PASS |
| 2026-03-11 | blog.test.ts | Edge case: empty title with whitespace → 400 | ✅ PASS |
| 2026-03-11 | blog.test.ts | Edge case: preserves existing slug when provided | ✅ PASS |
| 2026-03-11 | blog.test.ts | Edge case: generates valid slug from special chars | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 1. Unauthenticated → 401 | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 2. Authenticated client (non-admin) → 401 | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 3. Admin without requestId filter → returns all tasks | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 4. Admin with ?requestId=xxx → returns only tasks for that request | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 5. Database error → 500 | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 6. Admin with valid payload (title required) → 201 | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 7. Admin missing title → 400 'Title is required' | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 8. Task linked to requestId automatically inherits the client_id from that request | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 9. New task gets correct orderindex (max existing + 1024) | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 10. Non-admin → 401 | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 11. Admin updates task status → 200 | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 12. Admin updates orderindex → 200 | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 13. Non-admin → 401 | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | syncs client_id when request_id changes to a new request | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 14. Admin deletes task → 200 { success: true } | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 15. Non-admin → 401 | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | 16. Non-existent task ID → 500 (if no row found, returns error) | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | handles request_id='undefined' as null | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | handles PATCH with request_id set to null (unlink) | ✅ PASS |
| 2026-03-11 | admin-tasks.test.ts | rejects empty title string | ✅ PASS |
| 2026-03-11 | client-tasks.test.ts | 1. Unauthenticated request → 401 | ✅ PASS |
| 2026-03-11 | client-tasks.test.ts | 2. Authenticated client receives only their own tasks (IDOR isolation) | ✅ PASS |
| 2026-03-11 | client-tasks.test.ts | 3. Client with ?requestId filter → returns only tasks for that request | ✅ PASS |
| 2026-03-11 | client-tasks.test.ts | 4. Database error → 500 with error message | ✅ PASS |
| 2026-03-11 | upload.test.ts | 1. Unauthenticated request → 401 | ✅ PASS |
| 2026-03-11 | upload.test.ts | 2. Authenticated non-admin → 403 | ✅ PASS |
| 2026-03-11 | upload.test.ts | 3. No file in formData → 400 | ✅ PASS |
| 2026-03-11 | upload.test.ts | 4. Valid JPEG file as admin → 200 with url and path | ✅ PASS |
| 2026-03-11 | upload.test.ts | 5. application/octet-stream MIME type → 400 Invalid file type | ✅ PASS |
| 2026-03-11 | upload.test.ts | 6. application/x-msdownload (.exe) → 400 | ✅ PASS |
| 2026-03-11 | upload.test.ts | 7. image/gif → 200 (allowed) | ✅ PASS |
| 2026-03-11 | upload.test.ts | 8. File > 5MB → 400 File too large | ✅ PASS |
| 2026-03-11 | upload.test.ts | 9. File exactly 5MB → 200 (boundary test) | ✅ PASS |
| 2026-03-11 | upload.test.ts | 10. 21st upload in same minute from same IP → 429 Rate limit exceeded | ✅ PASS |
| 2026-03-11 | subscribe.test.ts | 1. Valid email → 201 { success: true } | ✅ PASS |
| 2026-03-11 | subscribe.test.ts | 2. Invalid email format → 400 | ✅ PASS |
| 2026-03-11 | subscribe.test.ts | 3. Missing email field → 400 | ✅ PASS |
| 2026-03-11 | subscribe.test.ts | 4. Empty email string → 400 | ✅ PASS |
| 2026-03-11 | subscribe.test.ts | 5. Duplicate email (23505) → 201 (idempotent, no 409) | ✅ PASS |
| 2026-03-11 | subscribe.test.ts | 6. Database error (non-duplicate) → 500 | ✅ PASS |
| 2026-03-11 | subscribe.test.ts | 7. Malformed JSON → 500 | ✅ PASS |
| 2026-03-11 | subscribe.test.ts | 8. Email with valid surrounding whitespace in body still works | ✅ PASS |
| 2026-03-11 | subscribe.test.ts | 9. Email uppercase gets lowercased | ✅ PASS |
| 2026-03-11 | notifications.test.ts | 1. Unauthenticated request → 401 | ✅ PASS |
| 2026-03-11 | notifications.test.ts | 2. Authenticated user receives their notifications | ✅ PASS |
| 2026-03-11 | notifications.test.ts | 3. Database error → 500 with error message | ✅ PASS |
| 2026-03-11 | notifications.test.ts | 4. Unauthenticated request → 401 | ✅ PASS |
| 2026-03-11 | notifications.test.ts | 5. Mark single notification as read → 200 | ✅ PASS |
| 2026-03-11 | notifications.test.ts | 6. Mark all notifications as read → 200 | ✅ PASS |
| 2026-03-11 | notifications.test.ts | 7. No id or all provided → 400 | ✅ PASS |
| 2026-03-11 | notifications.test.ts | 8. Single mark read with invalid id → 500 | ✅ PASS |
| 2026-03-12 | Newsletter.test.jsx | 1. Renders heading, email input and subscribe button | ✅ PASS |
| 2026-03-12 | Newsletter.test.jsx | 2. Does not submit when email is empty (HTML required) | ✅ PASS |
| 2026-03-12 | Newsletter.test.jsx | 3. Successful subscription shows "Joined" and "Thanks for subscribing!" | ✅ PASS |
| 2026-03-12 | Newsletter.test.jsx | 4. Failed subscription does not show success message | ✅ PASS |
| 2026-03-12 | Newsletter.test.jsx | 5. Network error sets error status | ✅ PASS |
| 2026-03-12 | Newsletter.test.jsx | 6. Input and button are disabled while loading/after success | ✅ PASS |
| 2026-03-12 | Newsletter.test.jsx | 7. Calls fetch with correct URL and payload | ✅ PASS |
| 2026-03-12 | TestimonialForm.test.jsx | 1. Renders in create mode with empty fields and correct heading | ✅ PASS |
| 2026-03-12 | TestimonialForm.test.jsx | 2. Renders in edit mode and fetches existing data | ✅ PASS |
| 2026-03-12 | TestimonialForm.test.jsx | 3. Submit in create mode calls testimonialsApi.create | ✅ PASS |
| 2026-03-12 | TestimonialForm.test.jsx | 4. Submit in edit mode calls testimonialsApi.update | ✅ PASS |
| 2026-03-12 | TestimonialForm.test.jsx | 5. API error on create shows error toast | ✅ PASS |
| 2026-03-12 | TestimonialForm.test.jsx | 6. Featured checkbox toggles correctly | ✅ PASS |
| 2026-03-12 | TestimonialForm.test.jsx | 7. Embedded mode with onSuccess callback | ✅ PASS |
| 2026-03-12 | TestimonialForm.test.jsx | 8. Color select changes value | ✅ PASS |
| 2026-03-12 | requests-get.test.ts | 1. Unauthenticated request → 401 | ✅ PASS |
| 2026-03-12 | requests-get.test.ts | 2. Authenticated user receives their own requests | ✅ PASS |
| 2026-03-12 | requests-get.test.ts | 3. Database error → 500 | ✅ PASS |
| 2026-03-12 | requests-get.test.ts | 4. Authenticated user with no requests returns empty array | ✅ PASS |
| 2026-03-12 | projects.test.ts | 1. Returns all projects (public) | ✅ PASS |
| 2026-03-12 | projects.test.ts | 2. Returns 500 on service error | ✅ PASS |
| 2026-03-12 | projects.test.ts | 3. Unauthenticated → 401 | ✅ PASS |
| 2026-03-12 | projects.test.ts | 4. Non-admin → 403 | ✅ PASS |
| 2026-03-12 | projects.test.ts | 5. Admin with valid payload → 201 | ✅ PASS |
| 2026-03-12 | projects.test.ts | 6. Admin missing required fields → 400 | ✅ PASS |
| 2026-03-12 | projects.test.ts | 7. Admin with malformed JSON → 400 | ✅ PASS |
| 2026-03-12 | projects.test.ts | 8. Returns project by ID | ✅ PASS |
| 2026-03-12 | projects.test.ts | 9. Returns 404 when not found | ✅ PASS |
| 2026-03-12 | projects.test.ts | 10. Non-admin → 403 | ✅ PASS |
| 2026-03-12 | projects.test.ts | 11. Admin updates → 200 | ✅ PASS |
| 2026-03-12 | projects.test.ts | 12. No valid fields → 400 | ✅ PASS |
| 2026-03-12 | projects.test.ts | 13. Non-existent project → 404 | ✅ PASS |
| 2026-03-12 | projects.test.ts | 14. Unauthenticated → 401 | ✅ PASS |
| 2026-03-12 | projects.test.ts | 15. Non-admin → 403 | ✅ PASS |
| 2026-03-12 | projects.test.ts | 16. Admin deletes → 200 { success: true } | ✅ PASS |
| 2026-03-12 | testimonials.test.ts | 1. Returns all testimonials (public) | ✅ PASS |
| 2026-03-12 | testimonials.test.ts | 2. Returns 500 on service error | ✅ PASS |
| 2026-03-12 | testimonials.test.ts | 3. Non-admin → 403 | ✅ PASS |
| 2026-03-12 | testimonials.test.ts | 4. Admin with valid payload → 201 | ✅ PASS |
| 2026-03-12 | testimonials.test.ts | 5. Admin missing client → 400 | ✅ PASS |
| 2026-03-12 | testimonials.test.ts | 6. Admin missing content → 400 | ✅ PASS |
| 2026-03-12 | testimonials.test.ts | 7. Admin with empty client string → 400 | ✅ PASS |
| 2026-03-12 | testimonials.test.ts | 8. Returns testimonial by ID | ✅ PASS |
| 2026-03-12 | testimonials.test.ts | 9. Returns 404 when not found | ✅ PASS |
| 2026-03-12 | testimonials.test.ts | 10. Non-admin → 403 | ✅ PASS |
| 2026-03-12 | testimonials.test.ts | 11. Admin updates → 200 | ✅ PASS |
| 2026-03-12 | testimonials.test.ts | 12. Non-admin → 403 | ✅ PASS |
| 2026-03-12 | testimonials.test.ts | 13. Admin deletes → 200 { success: true } | ✅ PASS |
| 2026-03-12 | settings.test.ts | 1. Unauthenticated → 401 | ✅ PASS |
| 2026-03-12 | settings.test.ts | 2. Non-admin → 401 | ✅ PASS |
| 2026-03-12 | settings.test.ts | 3. Admin with valid key/value → 200 { success: true } | ✅ PASS |
| 2026-03-12 | settings.test.ts | 4. Admin missing key → 400 | ✅ PASS |
| 2026-03-12 | settings.test.ts | 5. Database upsert error → 500 | ✅ PASS |
| 2026-03-12 | settings.test.ts | 6. Admin with null value is allowed | ✅ PASS |

---

## ❌ Failed Tests Log
> Add entries here for any failing tests. Include error message. Format: `DATE | FILE | TEST NAME | ERROR`

| Date | File | Test Name | Error | Resolved? |
|------|------|-----------|-------|-----------|
| — | — | No failures! All tests passing. | — | ✅ |

---

## 🚫 Blockers & Notes

| Date | Phase | Issue | Resolution |
|------|-------|-------|------------|
| 2026-03-11 | P2 | ContactForm.test.jsx: 8 tests skipped due to mock issues with react-hot-toast module | Resolved - Added motion.span to framer-motion mock |
| 2026-03-11 | P2 | Button.test.jsx: 2 tests skipped (loading spinner, danger variant) - N/A per component implementation | Resolved - Added loading state and danger variant |
| 2026-03-11 | P2 | DeleteConfirmModal.test.jsx: 1 test skipped (bulkDelete prop) - N/A per component | Resolved - Implemented bulkDelete prop |
| 2026-03-11 | P2 | BlogPostForm.test.jsx: 1 test skipped (slug field) - N/A per component | Resolved - Added auto-generating slug field |
| 2026-03-11 | P1 | admin.test.ts: missing server-only guard | Resolved - Added check in wrapper and vitest context |
| 2026-03-11 | P2 | BlogPostForm.test.jsx: missing edit mode and API publish tests | Resolved - tests fully implemented |
| 2026-03-11 | P2 | ContactForm.test.jsx: missing max length validation | Resolved - test fully implemented |

---

## 🔑 Environment Variables Required for Tests

```bash
# tests/.env.test (DO NOT COMMIT)
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key
ADMIN_EMAIL=admin@yourdomain.com

# For E2E auth tests (Phase 4)
TEST_CLIENT_EMAIL=testclient@example.com
TEST_CLIENT_PASSWORD=testpassword123
TEST_ADMIN_EMAIL=admin@yourdomain.com
TEST_ADMIN_PASSWORD=adminpassword123
PLAYWRIGHT_BASE_URL=http://localhost:3000

```

---

## 📦 Install Checklist

```bash
# Run once before Phase 0
npm install --save-dev vitest @vitest/coverage-v8 jsdom
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev msw @vitejs/plugin-react
npm install --save-dev @lhci/cli

# Verify Playwright is installed
npx playwright install --with-deps chromium webkit
```

> ✅ Mark each install done by replacing `[ ]` with `[x]`
- [x] vitest + coverage
- [x] @testing-library suite
- [x] msw
- [x] @lhci/cli
- [x] playwright browsers verified
