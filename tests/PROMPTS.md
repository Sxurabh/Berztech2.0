# 🤖 AI Prompts — Antigravity Testing Strategy Implementation
> Use these prompts sequentially with any AI (Claude, Gemini, GPT-4). Always paste the relevant context section first.
> After each prompt session, update `tests/TEST-TRACKER.md` with results.

---

## 🔧 MASTER CONTEXT PROMPT
> Paste this at the START of every new AI session before any phase prompt.

```
You are a Senior Next.js Test Engineer working on the "Antigravity" project.

TECH STACK:
- Next.js 14+ App Router
- Supabase (Auth + PostgreSQL + Realtime + Storage)
- Tailwind CSS, Framer Motion
- Testing: Vitest + React Testing Library + MSW + Playwright

KEY PROJECT FACTS:
- Auth is handled via Supabase (email+password and OAuth Google/GitHub)
- Admin check: isAdminEmail() in src/config/admin.js
- Middleware: src/lib/supabase/middleware.js protects /admin and /dashboard routes
- Admin users go to /admin, clients go to /dashboard — middleware enforces this
- createAdminClient() uses SUPABASE_SERVICE_ROLE_KEY (never expose client-side)
- API routes return: { error: "message" } with HTTP status codes
- Zod validation is used on POST /api/requests route
- File upload has in-memory rate limiting (20 req/min per IP), MIME type check, 5MB max

FOLDER STRUCTURE (relevant to tests):
src/
  app/api/          → API route handlers
  lib/auth/         → AuthProvider.jsx (useAuth hook)
  lib/supabase/     → client.js, admin.js, middleware.js, server.js
  config/admin.js   → isAdminEmail() function
  components/       → UI, admin, features, layout, sections
tests/
  setup.ts
  mocks/
  unit/
  components/
  integration/
  e2e/
  security/
  load/

TESTING TRACKER: tests/TEST-TRACKER.md
Always update the tracker after completing work.
```

---

## PHASE 1 — Critical Foundation Tests

### Prompt 1.1 — Vitest Configuration Setup

```
Using the master context above, set up the complete Vitest testing infrastructure for this project.

Create the following files with full content:

1. vitest.config.js (project root)
   - jsdom environment
   - path alias @ → ./src
   - coverage with v8 provider
   - include: src/lib/**, src/app/api/**, src/config/**
   - thresholds: lines 70, functions 70, branches 65
   - setupFiles: ['./tests/setup.ts']

2. tests/setup.ts
   - Import @testing-library/jest-dom
   - Start MSW server (beforeAll), reset handlers (afterEach), close (afterAll)
   - Import server from ./mocks/server

3. tests/mocks/server.ts
   - MSW Node server setup with default handlers

4. tests/mocks/handlers.ts
   - Mock Supabase auth.getUser endpoint
   - Mock admin user response (use env var ADMIN_EMAIL)
   - Mock client user response

5. tests/mocks/fixtures/users.ts
   - Export: mockAdminUser, mockClientUser, mockAnonSession

6. tests/mocks/fixtures/tasks.ts
   - Export: mockTasks array (5 tasks with varied statuses: backlog, inprogress, done)

7. tests/mocks/fixtures/requests.ts
   - Export: mockRequests array (3 project requests with different statuses)

Also add to package.json scripts:
- "test": "vitest"
- "test:ci": "vitest run --coverage"
- "test:unit": "vitest run tests/unit tests/components"
- "test:integration": "vitest run tests/integration"
- "test:coverage": "vitest run --coverage --reporter=html"

After generating, tell me which files were created and any install commands needed.
```

---

### Prompt 1.2 — isAdminEmail Unit Tests

```
Using the master context, create a complete unit test file:
File: tests/unit/config/admin.test.ts

The isAdminEmail() function is in src/config/admin.js.
I do NOT know the exact implementation — write tests based on these expected behaviors:

TEST CASES TO COVER:
1. Returns true for the configured admin email (exact match via process.env.ADMIN_EMAIL)
2. Returns true regardless of letter case (upper/lower)
3. Returns false for a random non-admin email
4. Returns false for empty string ""
5. Returns false for null (passed as any)
6. Returns false for undefined (passed as any)
7. Returns false for an email with the same domain but different username
8. Returns false for a string that contains the admin email but has extra characters

Use describe/it/expect from vitest.
Add a comment block at the top explaining what isAdminEmail protects.

After writing the file, provide the exact command to run only this test:
npx vitest run tests/unit/config/admin.test.ts

Then tell me: "Update TEST-TRACKER.md Phase 1 > isAdminEmail tests as IN PROGRESS"
```

---

### Prompt 1.3 — Supabase Client Factory Tests

```
Using the master context, create unit tests for the Supabase client factories.

File 1: tests/unit/lib/supabase/client.test.ts
Test: createClient() from src/lib/supabase/client.js
Cases:
- Returns a valid Supabase client when NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set
- Returns null when env vars are missing
- Is a singleton (calling twice returns the same instance)

File 2: tests/unit/lib/supabase/admin.test.ts
Test: createAdminClient() from src/lib/supabase/admin.js
Cases:
- Returns admin client when SUPABASE_SERVICE_ROLE_KEY is set
- Returns null or throws when SUPABASE_SERVICE_ROLE_KEY is missing
- CRITICAL: Verify the admin client is never imported or available in the browser context (check for "server-only" guard or similar pattern)

For env var mocking use:
import { vi } from 'vitest'
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
// restore after each test

Provide install command if any new packages are needed.
After completion: "Update TEST-TRACKER.md Phase 1 > Supabase client tests"
```

---

### Prompt 1.4 — Middleware Route Protection Tests

```
Using the master context, create comprehensive unit tests for the Next.js middleware.

File: tests/unit/lib/supabase/middleware.test.ts
Source: src/lib/supabase/middleware.js

The middleware (updateSession function) has these routing rules:
- /admin path + no user → redirect to /auth/login?redirect=admin
- /admin path + user but not admin email → redirect to /dashboard
- /admin path + admin email user → allow through (next())
- /dashboard path + no user → redirect to /auth/login?redirect=/dashboard
- /dashboard path + admin email user → redirect to /admin
- /dashboard path + regular user → allow through
- /track path + no user → redirect to /auth/login?redirect=/track
- Public paths (/, /blog, /work, /contact, /about) → always allow through

Create a mockRequest(pathname, user?) helper that creates a fake NextRequest.
Mock supabase.auth.getUser to return the provided user or null.

Write 10+ test cases covering all the routing rules above.
Each test should assert the response Location header or that no redirect occurred.

After completion: "Update TEST-TRACKER.md Phase 1 > Middleware tests"
```

---

### Prompt 1.5 — AuthProvider Hook Tests

```
Using the master context, create tests for the AuthProvider and useAuth hook.

File: tests/unit/lib/auth/AuthProvider.test.tsx
Source: src/lib/auth/AuthProvider.jsx

The AuthProvider exports:
- AuthProvider component (wraps children with context)
- useAuth() hook returning: { user, loading, signInWithEmail, signInWithOAuth, signOut }

TEST CASES:

1. useAuth() throws error when used outside AuthProvider
2. AuthProvider renders children without crashing
3. Initial state: loading is true, then false after getUser resolves
4. signInWithEmail calls supabase.auth.signInWithPassword with correct args
5. signInWithEmail throws when credentials are wrong (mock Supabase to return error)
6. signInWithOAuth called with 'google' → calls supabase.auth.signInWithOAuth with provider: 'google'
7. signInWithOAuth validates the 'next' redirect param — external URLs must be ignored
8. signOut calls supabase.auth.signOut
9. User state updates when auth state changes (simulate onAuthStateChange callback)
10. When Supabase is null (env vars missing), loading becomes false without crashing

Mock the Supabase client: vi.mock('../../src/lib/supabase/client')

After completion: "Update TEST-TRACKER.md Phase 1 > AuthProvider tests"
```

---

## PHASE 2 — Component Testing

### Prompt 2.1 — UI Primitive Components

```
Using the master context, create React Testing Library tests for UI primitives.

File: tests/components/ui/Button.test.tsx
Source: src/components/ui/Button.jsx (or .tsx)
Cases:
- Renders with correct label text
- Calls onClick handler when clicked
- Does not call onClick when disabled
- Shows loading spinner when loading prop is true
- Applies correct variant classes (primary, secondary, danger if they exist)

File: tests/components/ui/Modal.test.tsx
Source: src/components/ui/Modal.jsx
Cases:
- Does not render when isOpen is false
- Renders children when isOpen is true
- Calls onClose when close button is clicked
- Renders the title prop correctly
- Pressing Escape key calls onClose (if implemented)

File: tests/components/ui/DataTable.test.tsx
Source: src/components/ui/DataTable.jsx
Cases:
- Renders column headers from columns prop
- Renders correct number of rows
- Shows emptyMessage when data array is empty
- Search input filters rows by searchKey
- Clicking sortable column header sorts the data

Use: render, screen, fireEvent, userEvent from @testing-library/react
Import: describe, it, expect, vi from vitest

After completion: "Update TEST-TRACKER.md Phase 2 > UI Component tests"
```

---

### Prompt 2.2 — ContactForm Component Tests

```
Using the master context, create thorough tests for the contact form.

File: tests/components/features/contact/ContactForm.test.tsx
Source: src/components/features/contact/ContactForm.jsx

This form submits to POST /api/requests with these fields:
- name (required, min 2 chars)
- email (required, valid email)
- company (optional)
- services (optional, array)
- budget (optional)
- message (optional, max 1000 chars)

Write these test cases:
1. Form renders with all expected fields visible
2. Submit without filling anything → shows "name required" or similar error
3. Submit with invalid email format → shows email validation error
4. Submit with message > 1000 chars → shows length error (if client-side validation exists)
5. Valid form submission → calls fetch('/api/requests') with POST method
6. Successful submission → shows success/thank you message, form may clear
7. API failure (mock fetch to return ok: false) → shows error message
8. Submit button shows loading state while request is in flight
9. Fields accept and display typed input correctly

Mock fetch with vi.fn() for API calls.
Use userEvent.setup() for realistic user interactions.

After completion: "Update TEST-TRACKER.md Phase 2 > ContactForm tests"
```

---

### Prompt 2.3 — Admin Form Components

```
Using the master context, create tests for admin CRUD forms.

File: tests/components/admin/DeleteConfirmModal.test.tsx
Source: src/components/admin/DeleteConfirmModal.jsx
Cases:
- Renders modal with itemName in the message
- Confirm button calls onConfirm
- Cancel button calls onClose
- Loading prop disables the confirm button and shows spinner
- "Delete All" scenario: renders correctly when bulkDelete is true

File: tests/components/admin/BlogPostForm.test.tsx
Source: src/components/admin/BlogPostForm.jsx
Cases:
- Renders in "create" mode with empty fields
- Renders in "edit" mode with pre-filled data (mock fetch for editId)
- Title field is required — shows error if empty on submit
- Slug is auto-generated from title if not manually set
- Published toggle changes the published boolean
- Submit in create mode calls POST /api/blog
- Submit in edit mode calls PUT /api/blog/:id
- Shows success callback after successful save

Mock fetch appropriately. Use MSW handlers for API responses.

After completion: "Update TEST-TRACKER.md Phase 2 > Admin Form tests"
```

---

## PHASE 3 — API & Integration Testing

### Prompt 3.1 — POST /api/requests Integration Tests

```
Using the master context, create integration tests for the requests API route.

File: tests/integration/api/requests.test.ts
Source: src/app/api/requests/route.js

This route uses Zod validation with this schema:
- name: string, min 2 chars (required)
- email: valid email format (required)
- company: string (optional)
- services: array of strings (optional)
- budget: string (optional)
- message: string, max 1000 chars (optional)

The POST handler:
- Parses JSON body (returns 400 for malformed JSON)
- Validates with Zod (returns 400 with details on failure)
- Inserts to Supabase 'requests' table
- Returns 201 with the created record
- Returns 500 on database error

Write these test cases using MSW to mock Supabase:
1. Valid minimal payload (name + email only) → 201
2. Valid full payload → 201, response contains submitted data
3. Missing name → 400 with error.details
4. Missing email → 400
5. Invalid email format → 400
6. Message over 1000 characters → 400
7. Malformed JSON body → 400
8. Database insert failure (MSW returns 500) → 500
9. Empty body {} → 400
10. Extra fields not in schema are accepted but stripped

Use server.use() to override handlers per test.

After completion: "Update TEST-TRACKER.md Phase 3 > POST /api/requests tests"
```

---

### Prompt 3.2 — Blog API Route Tests

```
Using the master context, write integration tests for the blog API.

File: tests/integration/api/blog.test.ts
Sources: src/app/api/blog/route.js and src/app/api/blog/[id]/route.js

Write these test cases:

GET /api/blog:
1. Anonymous user → receives only published:true posts
2. Admin user → receives ALL posts including drafts
3. Posts are ordered by created_at descending
4. Returns 500 when Supabase query fails

POST /api/blog:
5. Unauthenticated request → 401
6. Authenticated non-admin → 403
7. Admin with missing title → 400
8. Admin with valid payload → 201 with new post data
9. Slug is auto-generated when not provided
10. Malformed JSON → 400

PUT /api/blog/[id]:
11. Admin can update a post by UUID
12. Admin can update a post by slug
13. Only whitelisted fields are updated (extra fields ignored)
14. Non-admin → 403
15. Non-existent ID → 404 (if maybeSingle returns null)

DELETE /api/blog/[id]:
16. Admin deletes existing post → 200 { success: true }
17. Non-admin → 403

Set up MSW handlers for each scenario.

After completion: "Update TEST-TRACKER.md Phase 3 > Blog API tests"
```

---

### Prompt 3.3 — Admin Task API Tests

```
Using the master context, write integration tests for admin task management APIs.

File: tests/integration/api/admin-tasks.test.ts
Sources:
- src/app/api/admin/tasks/route.js
- src/app/api/admin/tasks/[id]/route.js

TEST CASES:

GET /api/admin/tasks:
1. Unauthenticated → 401
2. Authenticated client (non-admin) → 401
3. Admin without requestId filter → returns all tasks
4. Admin with ?requestId=xxx → returns only tasks for that request
5. Database error → 500

POST /api/admin/tasks:
6. Admin with valid payload (title required) → 201
7. Admin missing title → 400 "Title is required"
8. Task linked to requestId automatically inherits the clientid from that request
9. New task gets correct orderindex (max existing + 1024)
10. Non-admin → 401

PATCH /api/admin/tasks/[id]:
11. Admin updates task status → 200
12. Admin updates orderindex → 200
13. Non-admin → 401

DELETE /api/admin/tasks/[id]:
14. Admin deletes task → 200 { success: true }
15. Non-admin → 401
16. Non-existent task ID → 500 (if no row found, returns error)

Mock createAdminClient and createServerSupabaseClient via MSW or vi.mock.

After completion: "Update TEST-TRACKER.md Phase 3 > Admin Tasks API tests"
```

---

### Prompt 3.4 — Upload & Subscribe API Security Tests

```
Using the master context, write security-focused integration tests for upload and subscribe APIs.

File: tests/integration/api/upload.test.ts
Source: src/app/api/upload/route.js

The upload route has:
- Admin-only access (isAdminEmail check)
- Rate limiting: 20 uploads per IP per 60 seconds (in-memory map)
- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif only
- Max file size: 5MB
- Secure filename: timestamp + random string + extension from MIME map (ignores client filename)

TEST CASES:
1. Unauthenticated request → 401
2. Authenticated non-admin → 403
3. No file in formData → 400
4. Valid JPEG file as admin → 200 with { url, path }
5. application/octet-stream MIME type → 400 "Invalid file type"
6. application/x-msdownload (.exe) → 400
7. image/gif → 200 (allowed)
8. File > 5MB → 400 "File too large"
9. File exactly 5MB → 200 (boundary test)
10. 21st upload in same minute from same IP → 429 "Rate limit exceeded"

File: tests/integration/api/subscribe.test.ts
Source: src/app/api/subscribe/route.js
TEST CASES:
11. Valid email → 201 { success: true }
12. Invalid email format → 400
13. Missing email field → 400
14. Duplicate email (23505 Supabase error code) → 201 (idempotent, no 409)
15. Database error (non-duplicate) → 500

After completion: "Update TEST-TRACKER.md Phase 3 > Upload and Subscribe tests"
```

---

## PHASE 4 — End-to-End Testing

### Prompt 4.1 — Playwright Auth E2E Tests

```
Using the master context, create Playwright E2E tests for authentication flows.

File: tests/e2e/auth.spec.ts

SETUP: The playwright.config.js already exists. Tests run against http://localhost:3000.
Use test.use({ storageState: ... }) for authenticated state management.

Write these test scenarios:

UNAUTHENTICATED REDIRECTS:
1. Navigate to /dashboard → redirected to /auth/login (check URL)
2. Navigate to /admin → redirected to /auth/login (check URL)
3. Navigate to /track → redirected to /auth/login (check URL)
4. /auth/login page loads → shows "Welcome Back" heading
5. /auth/login shows Google and GitHub OAuth buttons

LOGIN FORM BEHAVIOR:
6. Fill wrong email + password → submit → inline error message appears
7. Error message does NOT say "user not found" or reveal if email exists
8. Submit button shows loading spinner during login attempt
9. Empty form submit → HTML5 required validation fires (no network call)

OAUTH BUTTONS:
10. Click "Continue with Google" → redirected to Google OAuth URL (check location starts with accounts.google.com)

POST-LOGIN ROUTING (use a test Supabase user):
11. Login as client user → redirected to /dashboard
12. Login as admin user → redirected to /admin

BACK LINK:
13. /auth/login page has "Back to site" link → clicking goes to /

Note: For tests 11-12, use environment variables TEST_CLIENT_EMAIL, TEST_CLIENT_PASSWORD, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD. Add a comment explaining these must be set in .env.test.

After completion: "Update TEST-TRACKER.md Phase 4 > Auth E2E tests"
```

---

### Prompt 4.2 — Navigation, Home, Blog E2E Tests

```
Using the master context, migrate and expand existing E2E tests.

EXISTING TESTS TO MIGRATE:
Move/refactor these existing files to the new structure:
- tests/navigation.spec.js → tests/e2e/navigation.spec.ts
- tests/home.spec.js → tests/e2e/home.spec.ts
- tests/contact.spec.js → tests/e2e/contact.spec.ts

For each, read the existing test and preserve all passing assertions.
Convert to TypeScript and add these new cases:

navigation.spec.ts additions:
- Header links work on mobile viewport (375x812)
- Mobile menu hamburger opens/closes navigation drawer
- Active link has correct visual indicator

home.spec.ts additions:
- Page loads with correct meta title
- Hero section renders on mobile (375px width)
- CTA button navigates to /contact
- Stats section numbers are visible

contact.spec.ts additions:
- Form shows validation errors without page reload
- Successful submission shows thank-you state
- Form fields clear after success (if implemented)

NEW FILE: tests/e2e/blog.spec.ts
- Blog index page loads and shows at least one post card
- Clicking a post card navigates to /blog/[slug]
- Blog post detail shows title, author, date
- Newsletter form accepts email and shows success state
- Back to Blog link works on post detail page

After completion: "Update TEST-TRACKER.md Phase 4 > Navigation/Home/Blog E2E tests"
```

---

### Prompt 4.3 — Dashboard and Admin Board E2E Tests

```
Using the master context, create E2E tests for authenticated flows.

These tests require authenticated sessions. Use Playwright's storageState to save and reuse session cookies.

First, create: tests/e2e/helpers/auth.setup.ts
- Logs in as admin → saves state to tests/e2e/.auth/admin.json
- Logs in as client → saves state to tests/e2e/.auth/client.json
- Add to playwright.config.js as globalSetup or setup project

File: tests/e2e/dashboard.spec.ts
Uses client auth state.
TEST CASES:
1. /dashboard loads without redirect
2. Page shows the client's submitted requests (or empty state)
3. Track board link exists and works
4. Notifications dropdown is visible in header
5. Logout button exists and clicking it redirects to /auth/login

File: tests/e2e/admin-board.spec.ts
Uses admin auth state.
TEST CASES:
6. /admin loads without redirect
7. Admin sidebar shows Blog, Projects, Requests, Board, Testimonials links
8. /admin/board page loads Kanban columns (Backlog, In Progress, etc.)
9. "Create Task" button opens task modal
10. Task modal has title input, description, priority fields
11. Creating a task with a title → card appears on the board
12. Clicking an existing task card → opens task detail modal
13. Request filter dropdown is visible and can be changed
14. Admin can navigate to /admin/blog → blog posts table renders

After completion: "Update TEST-TRACKER.md Phase 4 > Dashboard and Admin E2E tests"
```

---

## PHASE 5 — Security Testing

### Prompt 5.1 — Authorization / IDOR Tests

```
Using the master context, create security-focused integration tests targeting authorization bypass and IDOR vulnerabilities.

File: tests/security/idor.test.ts

SCENARIO: Client A should NEVER access Client B's data.

Mock two different user sessions:
- clientA: { id: 'client-a-uuid', email: 'clienta@example.com' }
- clientB: { id: 'client-b-uuid', email: 'clientb@example.com' }

TEST CASES:

1. GET /api/client/tasks with clientA session:
   - MSW mock returns tasks where clientid is 'client-a-uuid'
   - Assert response only contains tasks for clientA
   - Assert tasks for clientB are NOT in the response

2. Client tries to access /api/admin/tasks → must get 401

3. Client tries to access /api/admin/requests → must get 401

4. PATCH /api/notifications/read with clientA trying to mark clientB's notification:
   - Mock notification belongs to clientB
   - ClientA session should NOT be able to mark it read
   - Expect 401 or the notification remains unread

5. GET /api/tasks/[id]/comments where task.clientid !== user.id:
   - Mock task where clientid is a different user
   - Request as clientA → must get 403

6. POST /api/tasks/[id]/comments on a task not owned by the user:
   - Same setup as above → must get 403

7. Non-admin calls DELETE /api/admin/tasks/[id] → 401
8. Non-admin calls POST /api/admin/tasks → 401
9. Non-admin calls PUT /api/blog/[id] → 403
10. Non-admin calls DELETE /api/blog/[id] → 403
11. Non-admin calls POST /api/settings → 401

After completion: "Update TEST-TRACKER.md Phase 5 > IDOR / Authorization tests"
```

---

### Prompt 5.2 — Input Injection & Data Exposure Tests

```
Using the master context, create security tests for input validation and data exposure.

File: tests/security/input-injection.test.ts

TEST CASES — Input Injection:
1. POST /api/requests with XSS in name: '<script>alert(1)</script>'
   → API returns 201 (stored)
   → Assert the stored value contains the literal string, not executed
   → Assert rendered output (if testable) is HTML-escaped

2. POST /api/blog (admin) with XSS in title: '<img src=x onerror=alert(1)>'
   → Should store safely; Supabase parameterized queries prevent SQL injection
   → Assert status 201, title stored as-is (escaping is rendering-layer responsibility)

3. POST /api/upload with filename '../../etc/passwd'
   → Assert the response URL does NOT contain the original filename
   → Assert the generated path uses the timestamp-random pattern only

4. POST /api/requests with extremely long name (10,000 chars)
   → Zod min(2) passes but no max on name — check if 400 or 201
   → Document the result as a finding if no max length exists

5. POST /api/blog with null values for required fields
   → Assert 400 "Title is required"

File: tests/security/data-exposure.test.ts

TEST CASES — Data Exposure:
6. GET /api/blog as anonymous user
   → Assert NO post in response has published: false

7. Verify SUPABASE_SERVICE_ROLE_KEY is not in client bundle:
   Create a test that reads .next/static/ files (if build exists)
   and asserts none contain the service_role key value
   (Skip if .next/ doesn't exist — note as manual check)

8. API error responses must not contain stack traces:
   Mock a DB error and assert the 500 response body only has { error: "..." }
   and NOT a stacktrace string

9. GET /api/notifications as unauthenticated → 401
   Assert response body has only { error: "Unauthorized" }, nothing else

10. POST /api/subscribe with duplicate email → 201 (not 409)
    Assert response does NOT contain "already subscribed" or similar disclosure

After completion: "Update TEST-TRACKER.md Phase 5 > Input Injection & Data Exposure tests"
```

---

## PHASE 6 — Performance Testing

### Prompt 6.1 — Lighthouse CI Setup

```
Using the master context, set up Lighthouse CI for performance regression testing.

1. Create: lhci.config.js (project root)
   - Collect URLs: /, /blog, /work, /contact, /about
   - 3 runs per URL
   - startServerCommand: "npm run start"
   - Assertions:
     * Performance score ≥ 0.85 (warn)
     * Accessibility score ≥ 0.90 (error — blocks CI)
     * FCP ≤ 2000ms (warn)
     * LCP ≤ 3500ms (error)
     * CLS ≤ 0.1 (error)
     * TBT ≤ 300ms (warn)

2. Update .github/workflows/test.yml
   Add a new job: "lighthouse"
   - Runs after unit-and-integration job
   - Only on PRs to main
   - Uses Node 20
   - Runs: npx lhci autorun
   - Uploads report as artifact

3. Add to package.json:
   "test:lighthouse": "lhci autorun"

4. Create: tests/load/api-requests.js (k6 script)
   Load test for POST /api/requests:
   - Stages: ramp to 20 users over 30s, hold 1min, ramp down 30s
   - Threshold: p95 < 800ms, error rate < 1%
   - Payload: valid request body with dynamic email per VU

5. Create: tests/load/api-blog.js (k6 script)
   Load test for GET /api/blog:
   - Stages: ramp to 50 users over 30s, hold 2min
   - Threshold: p95 < 400ms (GET should be fast with ISR caching)

Provide all file contents and the k6 run command.

After completion: "Update TEST-TRACKER.md Phase 6 > Performance tests setup"
```

---

## TRACKER UPDATE PROMPTS

### Prompt T.1 — After Each Phase (Run at end of every session)

```
I have just completed [PHASE NAME] tests for the Antigravity project.

Here are my results:
PASSED: [list test file names and test counts]
FAILED: [list failed test names and error messages]
SKIPPED: [list any skipped tests and reason]

Please update the tests/TEST-TRACKER.md file with:
1. Status change for all completed items in this phase
2. Add all passed tests to the "## ✅ Passed Tests Log" section
3. Add all failed tests to the "## ❌ Failed Tests Log" section with error details
4. Update the Phase Progress percentage
5. Update the "Last Updated" timestamp
6. Note any blockers or items needing follow-up in the Notes column

Output the full updated tracker content so I can replace the file.
```

---

### Prompt T.2 — Session Start (Run at beginning of every new AI session)

```
I am resuming work on the Antigravity project testing implementation.

Here is the current content of my tests/TEST-TRACKER.md:
[PASTE FULL TRACKER CONTENT HERE]

Based on this tracker:
1. What phases have been completed?
2. What is the next pending item I should work on?
3. Are there any failed tests I should fix first?
4. What is the overall completion percentage?

Then, load the master context and be ready to help me continue from where I left off.
```
