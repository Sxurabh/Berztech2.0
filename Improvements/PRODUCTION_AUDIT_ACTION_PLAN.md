# 🚀 Berztech 2.0 — Master Production Readiness Plan
> **Merged from 3 independent AI reviews** | Generated: March 2026  
> **Audit Consensus Score: ~5/10** — Not production-safe. Follow phases in strict order.  
> **Target:** Scalable, secure, maintainable system for 10k–100k users

---

## 📖 How to Use This Document

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Done |
| 🔴 | **Critical** — blocks production, do first |
| 🟠 | **Major** — degrades reliability at scale |
| 🟡 | **Optimization** — needed before 10k users |
| 🔵 | **Future-proofing** — do before team growth / Series A |

> ⚠️ **Rule:** Do not move to the next phase until all 🔴 items in the current phase are checked off.

---

## 📊 Phase Overview

| Phase | Focus | Priority | Est. Effort |
|-------|-------|----------|-------------|
| [Phase 0](#phase-0--baseline-stabilization) | Baseline Stabilization | 🔴 | 1–2 days |
| [Phase 1](#phase-1--critical-security-fixes) | Critical Security Fixes | 🔴 | 4–6 days |
| [Phase 2](#phase-2--architecture-foundation) | Architecture Foundation | 🔴 | 5–7 days |
| [Phase 3](#phase-3--data-integrity--database) | Data Integrity & Database | 🟠 | 2–3 days |
| [Phase 4](#phase-4--performance--caching) | Performance & Caching | 🟡 | 4–5 days |
| [Phase 5](#phase-5--observability--error-handling) | Observability & Error Handling | 🟠 | 3–4 days |
| [Phase 6](#phase-6--feature-completeness) | Feature Completeness | 🟠 | 6–8 days |
| [Phase 7](#phase-7--typescript-migration) | TypeScript Migration | 🔵 | 6–8 days |
| [Phase 8](#phase-8--testing-improvements) | Testing Improvements | 🟡 | 3–4 days |
| [Phase 9](#phase-9--background-jobs--async-processing) | Background Jobs & Async | 🔵 | 3–5 days |
| [Phase 10](#phase-10--scaling-strategy-10k--100k-users) | Scaling Strategy | 🔵 | Ongoing |
| [Phase 11](#phase-11--developer-experience--documentation) | DX & Documentation | 🔵 | 1–2 days |

---

---

## Phase 0 — Baseline Stabilization
> **Goal:** Freeze and stabilize the codebase before starting any refactor.  
> **Effort:** 1–2 days

### 0.1 — Freeze & Verify
- [ ] Freeze all new feature development
- [ ] Ensure CI is green — all tests pass
- [ ] Generate and verify a database backup
- [ ] Enable structured logging temporarily (console + file) to capture baseline behavior
- [ ] Commit and tag the current state: `git tag pre-refactor-baseline`

---

---

## Phase 1 — Critical Security Fixes
> **Goal:** Eliminate all vulnerabilities exploitable before you have real users.  
> **Effort:** 4–6 days  
> **Success Criteria:** No hardcoded credentials, XSS sanitized at write, Redis-backed rate limiting active, admin auth is role-based not email-string.

> 🚨 **Do NOT deploy to production until all 🔴 items below are checked off.**

---

### 1.1 — Remove Hardcoded Supabase Credentials 🔴
**File:** `tests/security/integration/api-client.js`

**Problem:** Real Supabase URL and anon key are hardcoded as fallback values in a committed file.

- [ ] Remove hardcoded `SUPABASE_URL` fallback from `api-client.js`
- [ ] Remove hardcoded `SUPABASE_ANON_KEY` fallback from `api-client.js`
- [ ] Make both lines throw if env vars are missing:
  ```js
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
  ```
- [ ] Add `tests/.env.test` to `.gitignore`
- [ ] Create `tests/.env.test.example` with placeholder values and commit it
- [ ] **Rotate your Supabase anon key immediately** via Supabase dashboard (treat old one as compromised)
- [ ] Scan for any other hardcoded keys: `grep -r "eyJhbGci" .`

**Done when:** `grep -r "eyJhbGci" . --include="*.js" --include="*.ts"` returns zero results.

---

### 1.2 — Replace In-Memory Rate Limiter with Redis-Backed Limiter 🔴
**Files:** `src/app/api/upload/route.js`, `src/app/api/requests/route.js`, `src/app/api/subscribe/route.js`, `src/middleware.js`

**Problem:** In-memory `Map` resets on every serverless cold start — the rate limiter is completely bypassable in production. Test suites mock rate limiting but no real limits are enforced.

- [ ] Install: `npm install @upstash/ratelimit @upstash/redis`
- [ ] Create Upstash Redis instance (free tier is sufficient) and add env vars:
  ```env
  UPSTASH_REDIS_REST_URL=
  UPSTASH_REDIS_REST_TOKEN=
  ```
- [ ] Implement in `src/middleware.js`:
  ```ts
  import { Ratelimit } from "@upstash/ratelimit";
  import { Redis } from "@upstash/redis";

  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "rl",
  });

  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await ratelimit.limit(ip);
  if (!success) return Response.json({ error: "Too many requests" }, { status: 429 });
  ```
- [ ] Define and enforce these specific limits:
  - `/api/requests` POST — 5 per IP per 10 minutes
  - `/api/subscribe` POST — 3 per IP per hour
  - `/api/upload` POST — 10 per IP per hour
  - `/api/admin/**` — 100 per IP per minute (brute-force protection)
- [ ] Return `Retry-After` header in all 429 responses
- [ ] Update integration tests to test real rate limiting (remove mocked rate limit tests)

**Done when:** Calling `/api/requests` 20 times in quick succession from the same IP returns `429` on the 6th call.

---

### 1.3 — Fix Admin Authorization: Email-String → Role-Based (DB-Enforced) 🔴
**Files:** `src/config/admin.js`, all `src/app/api/admin/**/*.js`, `supabase/schema.sql`

**Problem:** `isAdminEmail()` checks a string against an env var. Not enforced at DB level. Any OAuth misconfiguration or env var exposure = full admin access. No multi-admin support, requires redeploy to change.

- [ ] Add `role` column to your `profiles` / `users` table:
  ```sql
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'client';
  CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
  ```
- [ ] Create an `admin_users` table as the source of truth:
  ```sql
  CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```
- [ ] Set admin role for your account:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
  ```
- [ ] Add a Supabase Auth hook that embeds `role` in JWT claims (Supabase dashboard → Auth → Hooks)
- [ ] Create `src/lib/auth/getRole.ts`:
  ```ts
  export async function isAdmin(supabase: SupabaseClient): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase.from("admin_users")
      .select("is_active").eq("email", user.email).eq("is_active", true).single();
    return !!data;
  }
  ```
- [ ] Create `src/lib/withAuth.ts` with `withAuth` and `withAdmin` wrappers:
  ```ts
  export function withAdmin(handler: AuthedHandler) {
    return withAuth(async (req, ctx) => {
      if (!ctx.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return handler(req, ctx);
    });
  }
  ```
- [ ] Replace all 15 instances of copy-pasted auth boilerplate with the new wrappers
- [ ] Add RLS policies for admin-only tables:
  ```sql
  CREATE POLICY "admin_full_access" ON tasks
    USING (auth.jwt() ->> 'user_role' = 'admin');
  ```
- [ ] Keep `ADMIN_EMAIL` env var as a bootstrap fallback only — document this clearly
- [ ] Delete `isAdminEmail()` from `src/config/admin.js` after all routes are migrated

**Done when:** Removing `ADMIN_EMAIL` from `.env.local` still correctly denies admin access (role is enforced in DB).

---

### 1.4 — Sanitize XSS Payloads at Input Boundary (Write-Time) 🔴
**Files:** `src/app/api/requests/route.js`, `src/app/api/tasks/[id]/comments/route.js`, `src/app/api/blog/route.js`

**Problem:** XSS strings (e.g. `<script>alert(1)</script>`, `<img onerror=...>`) pass Zod validation and are stored raw in the database. If any value reaches an email template, PDF export, or `dangerouslySetInnerHTML`, it executes.

- [ ] Install: `npm install isomorphic-dompurify` (or `dompurify jsdom`)
- [ ] Create `lib/utils/sanitize.ts`:
  ```ts
  import DOMPurify from "isomorphic-dompurify";

  // Strip ALL HTML — for plain text fields (name, company, message)
  export const stripHtml = (str: string) => DOMPurify.sanitize(str, { ALLOWED_TAGS: [] });

  // Allow safe formatting — for rich text fields (blog content)
  export const sanitizeRichText = (str: string) => DOMPurify.sanitize(str);
  ```
- [ ] For blog `content` fields, use `sanitize-html` with an allowlist:
  ```ts
  npm install sanitize-html @types/sanitize-html
  // allowedTags: ["p","h1","h2","h3","strong","em","a","img","ul","ol","li","blockquote","pre","code"]
  ```
- [ ] Update Zod schemas to strip HTML from all plain-text fields:
  ```ts
  name: z.string().min(2).max(200).transform(stripHtml),
  company: z.string().optional().transform(v => v ? stripHtml(v) : v),
  ```
- [ ] Audit all admin-facing components that render user-supplied strings — confirm none use `dangerouslySetInnerHTML` without prior sanitization
- [ ] Update XSS test assertions: stored values must NOT contain `<script>` or `onerror` attributes

**Done when:** Submitting `<script>alert(1)</script>` as a name returns 201 but the stored value is empty or sanitized.

---

### 1.5 — Fix Open Redirect in `auth/callback` 🔴
**File:** `src/app/auth/callback/route.js`

**Problem:** `?next=https://evil.com` redirects users to an attacker-controlled page post-login.

- [ ] Add strict redirect validation:
  ```ts
  function isSafeRedirect(next: string | null): string {
    if (!next) return "/dashboard";
    if (/^(https?:)?\/\//i.test(next)) return "/dashboard"; // block external URLs
    if (!next.startsWith("/")) return "/dashboard";
    if (/[\r\n]/.test(next)) return "/dashboard"; // block CRLF injection
    return next;
  }
  const next = isSafeRedirect(req.nextUrl.searchParams.get("next"));
  return NextResponse.redirect(new URL(next, req.url));
  ```
- [ ] Update E2E tests to confirm all external redirects fall back to `/dashboard`
- [ ] Add test for CRLF injection: `?next=%0d%0aLocation:evil.com`

**Done when:** `?next=https://evil.com` and `?next=%0d%0aLocation:evil.com` both redirect to `/dashboard`.

---

### 1.6 — Add CORS + Full Security Headers 🔴
**File:** `next.config.js`

**Problem:** Without an explicit CORS origin allowlist, any website can make credentialed cross-origin requests to your API.

- [ ] Add security headers to `next.config.js`:
  ```js
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy",
        value: "default-src 'self'; script-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';"
      },
    ];
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_SITE_URL ?? "https://berztech.com" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PATCH,DELETE,OPTIONS" },
        ],
      },
    ];
  }
  ```
- [ ] Set `NEXT_PUBLIC_SITE_URL` in `.env.production`
- [ ] Re-run security header tests: `npm run test:security:live`

---

### 1.7 — Restrict Settings Endpoint to Allowlisted Keys 🔴
**File:** `src/app/api/settings/route.js`

**Problem:** The endpoint accepts any arbitrary `key` and writes it to the settings table with no validation.

- [ ] Define an explicit allowlist in `src/config/settings.ts`:
  ```ts
  export const ALLOWED_SETTING_KEYS = new Set([
    'about_hero_image', 'homepage_tagline', 'contact_email', 'hero_cta_text',
  ]);
  ```
- [ ] Add validation in the POST handler:
  ```ts
  if (!ALLOWED_SETTING_KEYS.has(key)) {
    return NextResponse.json({ error: 'Unknown setting key' }, { status: 400 });
  }
  ```
- [ ] Add per-key value validation (image URLs must be valid URLs, emails must be emails, etc.)
- [ ] Write test: `POST /api/settings` with `{ key: "admin_override", value: true }` must return `400`

---

### 1.8 — Validate File Content by Magic Bytes (Not Just MIME Type) 🔴
**File:** `src/app/api/upload/route.js`

**Problem:** Client-supplied MIME types are trivially spoofable. A renamed executable passes type checking.

- [ ] Install: `npm install file-type sharp`
- [ ] Validate magic bytes before upload:
  ```ts
  import { fileTypeFromBuffer } from 'file-type';

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);
  const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

  if (!detected || !ALLOWED.has(detected.mime)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }
  ```
- [ ] Enforce server-side file size limit:
  ```ts
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large' }, { status: 413 });
  ```
- [ ] Randomize uploaded filenames: `${crypto.randomUUID()}.${ext}`
- [ ] Strip EXIF metadata using `sharp` before upload:
  ```ts
  const stripped = await sharp(buffer).rotate().toBuffer(); // .rotate() auto-strips EXIF
  ```
- [ ] Enforce max image dimensions (e.g., 4000×4000) to prevent decompression bombs
- [ ] Add `Content-Disposition: attachment` header to uploaded file responses

**Done when:** Renaming a `.html` file to `.jpg` and uploading it is rejected with `400`.

---

### 1.9 — Add Max Length Validation to Zod Schemas 🔴
**File:** `src/app/api/requests/route.js`

**Problem:** 10,000-character `name` fields are accepted and stored. Documented as a `FINDING` in your own tests.

- [ ] Update all Zod schemas:
  ```ts
  name: z.string().min(2).max(200),       // was: .min(2) only
  company: z.string().optional().max(200),
  message: z.string().max(1000),           // ✅ already done
  ```
- [ ] Update tests: change `FINDING` assertions to `expect(response.status).toBe(400)`
- [ ] Re-run: `npx vitest run tests/integration/api/requests-input-limits.test.ts`

---

---

## Phase 2 — Architecture Foundation
> **Goal:** Eliminate duplication, establish clean patterns, and separate concerns.  
> **Effort:** 5–7 days  
> **Success Criteria:** No copy-pasted auth boilerplate, all list endpoints paginated, service/repository layers in place.

> ⚠️ **Do NOT skip this phase. Everything else (performance, testing, scaling) depends on it.**

---

### 2.1 — Extract Shared Auth Middleware (Kill Boilerplate) 🔴
**Files:** All `src/app/api/**/*.js` route handlers

**Problem:** Auth check + admin check is copy-pasted ~15 times across route files. One bug fix requires 15 edits.

- [ ] Create `src/lib/withAuth.ts` with `withAuth` and `withAdmin` HOF wrappers (see Phase 1.3 code)
- [ ] Add a custom `AuthError` class with status codes
- [ ] Migrate all admin routes to use `withAdmin(handler)`
- [ ] Migrate all authenticated (non-admin) routes to use `withAuth(handler)`
- [ ] Delete all copy-pasted auth boilerplate
- [ ] Verify all existing auth integration tests still pass

**Done when:** Adding a new admin route requires zero copy-pasted auth code.

---

### 2.2 — Create Service Layer 🔴
**Target:** `src/lib/services/`

**Problem:** Business logic (notification dispatch, validation, orchestration) lives in route handlers. Cannot be reused or unit-tested in isolation.

- [ ] Create `TaskService`:
  ```ts
  export class TaskService {
    async createTask(input: CreateTaskInput, actor: User): Promise<Task> { ... }
    async updateStatus(taskId: string, status: TaskStatus, actor: User): Promise<Task> { ... }
    async addComment(taskId: string, content: string, actor: User): Promise<Comment> { ... }
  }
  ```
- [ ] Create `RequestService` — handles request lifecycle, status changes, email triggers
- [ ] Create `NotificationService` — all notification creation logic in one place
- [ ] Create `ProjectService` — project CRUD, cache invalidation
- [ ] Update API route handlers to be thin wrappers: auth check → call service → return response
- [ ] Write unit tests for service methods directly (no HTTP layer)

**Done when:** Route handlers are under 30 lines each. All business logic lives in service classes.

---

### 2.3 — Create Repository Layer 🟠
**Target:** `src/lib/repositories/` or co-located `*.repo.ts` files

**Problem:** Supabase queries are scattered across routes and data files.

- [ ] Create `TaskRepository`, `RequestRepository`, `ProjectRepository`
- [ ] Centralize all Supabase queries into the repository layer
- [ ] Services call repositories — routes never call Supabase directly
- [ ] This enables easy mocking in unit tests

---

### 2.4 — Add Pagination to All List Endpoints 🟠
**Files:** `src/app/api/projects/route.js`, `src/app/api/blog/route.js`, `src/app/api/admin/requests/route.js`, `src/app/api/admin/tasks/route.js`, `src/app/api/testimonials/route.js`

**Problem:** All list queries are unbounded `SELECT *`. Will time out and OOM at scale.

- [ ] Implement cursor-based pagination (preferred for real-time data):
  ```ts
  // GET /api/admin/tasks?cursor=<last_created_at>&limit=50
  const cursor = req.nextUrl.searchParams.get("cursor");
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "50"), 100);

  let query = supabase.from("tasks").select("*").order("created_at", { ascending: false }).limit(limit);
  if (cursor) query = query.lt("created_at", cursor);

  const { data } = await query;
  const nextCursor = data?.length === limit ? data[data.length - 1].created_at : null;
  return Response.json({ data, nextCursor });
  ```
- [ ] Or use offset-based for simpler public endpoints:
  ```ts
  // GET /api/projects?page=1&limit=20
  export async function getProjects({ page = 1, limit = 20 } = {}) {
    const from = (page - 1) * limit;
    const { data, count } = await supabase.from('projects')
      .select('id, slug, title, client, category, image, featured, year', { count: 'exact' })
      .range(from, from + limit - 1)
      .order('created_at', { ascending: false });
    return { data, total: count, page, limit };
  }
  ```
- [ ] Return pagination metadata in all list responses: `{ data, total, page, limit, totalPages }`
- [ ] Set a hard maximum limit: `limit = Math.min(limit, 100)`
- [ ] Update all frontend hooks to handle paginated responses
- [ ] Add integration tests for pagination params

**Done when:** `GET /api/projects?page=1&limit=5` returns exactly 5 items with total count metadata.

---

### 2.5 — Fix N+1 Query in Comment/Notification Dispatch 🟠
**File:** `src/app/api/tasks/[id]/comments/route.js`

**Problem:** `adminClient.auth.admin.listUsers()` is called inside a comment loop — fetches ALL users on every comment iteration. 50 comments = 50 full user list fetches.

- [ ] Move `listUsers()` call BEFORE the loop:
  ```ts
  // Call ONCE before the loop
  const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
  const userMap = new Map(users.map(u => [u.id, u]));

  // O(1) lookup inside loop
  const author = userMap.get(comment.user_id);
  ```
- [ ] Add `auth_user_id` column to `admin_users` table to replace `listUsers()` entirely with a direct join
- [ ] Consider caching `userMap` with `unstable_cache` (TTL: 5 min)
- [ ] Add test: mock `listUsers` and assert it is called exactly **once** regardless of comment count

---

### 2.6 — Stop Fetching `SELECT *` — Define Minimal Column Sets 🟠
**Files:** All `src/lib/data/*.js`

**Problem:** Every query uses `select('*')`, returning all columns including heavy JSON fields not needed in list views.

- [ ] Audit each query and define minimal column sets:
  ```ts
  const PROJECT_LIST_FIELDS = 'id, slug, title, client, category, image, featured, year, created_at';
  const PROJECT_DETAIL_FIELDS = '*';
  ```
- [ ] Update `getProjects()`, `getBlogPosts()`, etc. to use list fields for list queries
- [ ] Confirm no frontend component breaks after narrowing field sets

**Done when:** `GET /api/projects` response payload is measurably smaller (verify in DevTools Network tab).

---

### 2.7 — Deduplicate Data Directories 🟠
**Files:** `src/data/`, `src/lib/data/`

**Problem:** Two `blogPosts.js` files, two `projects.js` files — different locations, overlapping purposes.

- [ ] Establish the rule: `src/data/` = static marketing content only; `src/lib/data/` = all DB access functions
- [ ] Move static content out of `src/lib/data/` into `src/data/`
- [ ] Delete duplicate files
- [ ] Update all imports across the codebase
- [ ] Document distinction in `CONTRIBUTING.md`
- [ ] Run full test suite to confirm no broken imports

---

### 2.8 — Validate & Whitelist All PATCH Body Fields (Prevent Mass Assignment) 🟠
**Files:** All PATCH route handlers

**Problem:** Fields like `role`, `isAdmin`, `user_id`, or `status` could be injected in a PATCH body if handlers spread `body` directly into `.update()`.

- [ ] Review all PATCH handlers — identify which pass raw body to `.update()`
- [ ] Create explicit Zod schemas for every PATCH endpoint:
  ```ts
  // BAD
  await supabase.from("tasks").update(body).eq("id", id);

  // GOOD
  const TaskUpdateSchema = z.object({
    title: z.string().min(1).max(300).optional(),
    status: z.enum(["backlog", "inprogress", "done"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
  });
  const parsed = TaskUpdateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
  await supabase.from("tasks").update(parsed.data).eq("id", id);
  ```
- [ ] Add tests: send `{ role: "admin", isAdmin: true }` in PATCH body — verify these are stripped

---

### 2.9 — Standardize API Response Format 🟠

**Problem:** Inconsistent error shapes across routes make frontend error handling brittle.

- [ ] Define standard response helpers in `src/lib/apiResponse.ts`:
  ```ts
  export const ApiError = (message: string, status: number, details?: object) =>
    Response.json({ error: message, ...(details && { details }) }, { status });

  export const ApiSuccess = (data: unknown, status = 200) =>
    Response.json({ data }, { status });
  ```
- [ ] Refactor all API routes to use `ApiError(...)` and `ApiSuccess(...)`
- [ ] Update all frontend fetch calls to handle the standardized `{ data }` / `{ error }` shape
- [ ] Update contract tests in `tests/contract/` to reflect the new schema

---

### 2.10 — Add API Versioning Prefix 🟡

**Problem:** All routes are at `/api/resource`. Any future schema change breaks all clients simultaneously.

- [ ] Create new directory structure: `src/app/api/v1/`
- [ ] Move all existing routes into the `v1/` subdirectory
- [ ] Update all `fetch('/api/...')` calls in frontend hooks
- [ ] Add redirect from old `/api/resource` to `/api/v1/resource` during transition
- [ ] Document the versioning policy in `README.md`

---

### 2.11 — Replace Fake Property Tests with Real Ones 🟠
**File:** `tests/property/api-validation.property.test.ts`

**Problem:** All property tests assert `typeof x === 'boolean'` — they are always true and test nothing about application code.

- [ ] Rewrite each test to actually call route handlers with generated inputs:
  ```ts
  it('rejects names over 200 chars', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 201, maxLength: 5000 }), async (name) => {
        const req = new NextRequest('http://localhost/api/requests', {
          method: 'POST', body: JSON.stringify({ name, email: 'test@test.com' }),
        });
        const { POST } = await import('@/app/api/requests/route');
        const res = await POST(req);
        expect(res.status).toBe(400);
      })
    );
  });
  ```
- [ ] Remove circuit-breaker and retry tests that only test JS language features, not your code
- [ ] Confirm mutant kill rate improves in Stryker after this change

---

### 2.12 — Delete Dead Config Files 🟠
**Files:** `vitest.workspace.js`, `vitest.integration.config.js`

- [ ] Delete `vitest.workspace.js`
- [ ] Delete `vitest.integration.config.js`
- [ ] Confirm `vitest.config.js` is the sole authoritative config
- [ ] Update `README.md` to remove references to these files
- [ ] Run `npm test` to confirm nothing breaks

---

---

## Phase 3 — Data Integrity & Database
> **Goal:** Prevent data loss and ensure DB performs under real load.  
> **Effort:** 2–3 days

---

### 3.1 — Implement Soft Delete for Tasks, Requests, Blog Posts 🟠

**Problem:** Hard deletes are irreversible. An admin misclick permanently destroys data.

- [ ] Run migrations:
  ```sql
  ALTER TABLE tasks ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  ALTER TABLE requests ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  ALTER TABLE blog_posts ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  ```
- [ ] Update all SELECT queries to filter: `.is("deleted_at", null)`
- [ ] Update all DELETE handlers:
  ```ts
  .update({ deleted_at: new Date().toISOString() }).eq("id", id)
  ```
- [ ] Create `GET /api/admin/trash` endpoint (list soft-deleted items)
- [ ] Create `POST /api/admin/trash/restore` endpoint
- [ ] Update RLS policies to exclude rows where `deleted_at IS NOT NULL`

---

### 3.2 — Fix Silent 404 Bug in DELETE Handlers 🟠
**Files:** `DELETE /api/admin/requests/[id]`, `DELETE /api/admin/blog/[id]`, `DELETE /api/admin/projects/[id]`

**Problem:** Supabase DELETE returns 200 even for non-existent IDs. Fixed for tasks but likely exists elsewhere.

- [ ] For each handler, verify row was actually affected:
  ```ts
  const { data } = await supabase.from("requests").delete().eq("id", id).select();
  if (!data || data.length === 0) return Response.json({ error: "Not found" }, { status: 404 });
  ```
- [ ] Add regression test for each: DELETE with a fake UUID must return `404`

---

### 3.3 — Enable Connection Pooling (PgBouncer) 🟠

**Problem:** Each serverless function invocation opens a new Postgres connection. At 100 concurrent users, you'll exhaust the connection limit.

- [ ] In Supabase Dashboard → Project Settings → Database → Connection Pooling:
  - Enable PgBouncer
  - Set mode: **Transaction** (best for serverless)
  - Copy the pooler connection string
- [ ] Update `SUPABASE_DB_URL` in env to use the pooler URL (port `6543`, not `5432`)
- [ ] Test that all Supabase server client operations still work after the switch

---

### 3.4 — Add Database Indexes for Common Query Patterns 🟡

**Problem:** No evidence of indexes on frequently filtered/sorted columns. At scale, full table scans will destroy query performance.

- [ ] Run in Supabase SQL Editor:
  ```sql
  CREATE INDEX idx_tasks_status ON tasks(status);
  CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
  CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
  CREATE INDEX idx_requests_status ON requests(status);
  CREATE INDEX idx_requests_user_id ON requests(user_id);
  CREATE INDEX idx_blog_posts_published ON blog_posts(published, created_at DESC);
  CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
  CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
  ```
- [ ] Run `EXPLAIN ANALYZE` on your top 5 most common queries to verify indexes are used
- [ ] Add index creation to a Supabase migration file (version controlled)

---

---

## Phase 4 — Performance & Caching
> **Goal:** Ensure the system doesn't degrade under real user load.  
> **Effort:** 4–5 days  
> **Success Criteria:** Kanban handles 200+ tasks, React Query configured with meaningful cache times, public endpoints cached.

---

### 4.1 — Cache Public Read Endpoints with `unstable_cache` 🟡
**Files:** `src/app/api/blog/route.js`, `src/app/api/projects/route.js`

**Problem:** Public pages re-fetch from Supabase on every request. 10k visitors = 10k DB reads per page load.

- [ ] Wrap public GET handlers:
  ```ts
  import { unstable_cache } from "next/cache";

  const getPublishedPosts = unstable_cache(
    async () => {
      const { data } = await supabase.from("blog_posts")
        .select("*").eq("published", true).order("created_at", { ascending: false });
      return data;
    },
    ["published-posts"],
    { revalidate: 60, tags: ["blog"] }
  );
  ```
- [ ] Call `revalidatePath("/blog")` and `revalidateTag("blog")` on blog create/update/delete
- [ ] Apply same pattern to `/api/projects` with tag `"projects"` and `revalidate: 120`
- [ ] Ensure admin preview of drafts bypasses cache

---

### 4.2 — Fix Realtime Subscription Cleanup (Memory/Connection Leak) 🟡
**Files:** `src/lib/hooks/useNotifications.js`, `src/lib/hooks/useProjectStats.js`

**Problem:** Missing `channel.unsubscribe()` in `useEffect` cleanup = subscription leak on every navigation. Each leak holds a Supabase WebSocket connection open.

- [ ] Audit every `useEffect` that calls `supabase.channel()`:
  ```ts
  useEffect(() => {
    const channel = supabase.channel("notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, handler)
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // ← REQUIRED
    };
  }, []);
  ```
- [ ] Write test: mount component 10 times, assert `removeChannel` called exactly 10 times on cleanup
- [ ] Add ESLint rule to warn on `supabase.channel()` calls without a cleanup return

---

### 4.3 — Configure React Query Properly 🟡
**Files:** `src/components/providers/QueryProvider.jsx`, all custom hooks

**Problem:** React Query is likely using default stale time (0ms), causing unnecessary refetches. Multiple components mounting simultaneously may fire duplicate requests.

- [ ] Configure global defaults in `QueryProvider.jsx`:
  ```tsx
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,       // 5 minutes
        gcTime: 10 * 60 * 1000,          // 10 minutes
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
  ```
- [ ] Define consistent query key factories in `lib/queryKeys.ts`:
  ```ts
  export const queryKeys = {
    projects: { all: ['projects'], list: (params: any) => ['projects', 'list', params] },
    tasks: { all: ['tasks'], byRequest: (id: string) => ['tasks', 'request', id] },
    notifications: { all: ['notifications'] },
  };
  ```
- [ ] Update all hooks to use the key factory
- [ ] Add server-side prefetching for the admin dashboard using `dehydrate`/`HydrationBoundary`
- [ ] Verify no duplicate requests fire using React Query DevTools

**Done when:** Opening the admin dashboard fires one request per data type, not multiple duplicates.

---

### 4.4 — Kanban Board Pagination and Virtual Rendering 🟡
**Files:** `src/components/admin/KanbanBoard.jsx`, `src/components/client/ClientKanbanBoard.jsx`

**Problem:** Renders all tasks in all columns simultaneously. Falls apart at 100+ tasks per column.

- [ ] Install: `npm install @tanstack/react-virtual`
- [ ] Implement column-level pagination with `useInfiniteQuery` per column
- [ ] Add "Load more" per column (or infinite scroll within columns)
- [ ] Implement optimistic updates on drag-and-drop:
  - Update local state immediately
  - Send PATCH request in background
  - Revert on failure with toast notification
- [ ] Limit initial load to 20 tasks per column; paginate on scroll
- [ ] Add a task count badge per column header

**Done when:** The board renders 500 tasks across columns with no visible lag.

---

### 4.5 — Reduce Initial Bundle Size (Framer Motion) 🟡
**Files:** Components in `src/components/sections/`, `src/app/about/AboutClient.jsx`

**Problem:** Framer Motion (~130KB gzipped) is imported in 15+ components including below-the-fold sections that don't affect LCP.

- [ ] For all animated components not in LCP critical path, use dynamic import:
  ```tsx
  const MotionDiv = dynamic(() => import('framer-motion').then(m => m.motion.div), { ssr: false });
  ```
- [ ] For simple animations (fade in, slide up on scroll), replace with CSS animations + Intersection Observer
- [ ] Enable Next.js bundle analyzer: `npm install @next/bundle-analyzer`
- [ ] Run `ANALYZE=true npm run build` and compare before/after

**Done when:** Lighthouse performance score improves and Framer Motion is not in the initial JS bundle for public pages.

---

### 4.6 — Strip EXIF Data from Uploaded Images 🟡
*(See Phase 1.8 — covered in the upload security fix using `sharp`)*

- [ ] Confirm `sharp` pipeline from Phase 1.8 also enforces max dimensions (4000×4000)
- [ ] Update file upload tests to confirm EXIF is not preserved in stored output

---

### 4.7 — Reduce Realtime Overuse 🟡
- [ ] Audit all Supabase Realtime subscriptions — identify those that can be replaced with polling
- [ ] Replace non-critical realtime with polling (e.g., 30s interval) to reduce WebSocket overhead
- [ ] Batch notification updates where possible

---

---

## Phase 5 — Observability & Error Handling
> **Goal:** Detect failures before users do.  
> **Effort:** 3–4 days

---

### 5.1 — Add Error Monitoring (Sentry) 🟠

**Problem:** Zero visibility into production errors. Console logs are invisible in serverless.

- [ ] Install Sentry:
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```
- [ ] Add `SENTRY_DSN` to `.env.production`
- [ ] Wrap all API route catch blocks:
  ```ts
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
  ```
- [ ] Configure `src/instrumentation.ts` for server-side Sentry init
- [ ] Set `tracesSampleRate: 0.1` (10%) in production to avoid quota burn
- [ ] Test: trigger a deliberate error, verify it appears in Sentry dashboard

---

### 5.2 — Structured Logging with RequestID 🟠

**Problem:** Errors in production cannot be correlated across request lifecycle.

- [ ] Add `requestId` middleware that generates and attaches a UUID to every request
- [ ] Log request start/end: method, path, status, duration for all API routes
- [ ] Include `requestId` in all error responses: `{ error: "...", requestId }`
- [ ] Set up a log drain in Vercel dashboard → Axiom, Datadog, or Logtail (all have free tiers)

**Done when:** A 500 error in production can be traced end-to-end using a `requestId` from the browser to the log aggregator.

---

### 5.3 — Add React Error Boundaries 🟠
**Files:** `src/components/admin/KanbanBoard.jsx`, `src/app/layout.jsx`, `src/components/client/ClientKanbanBoard.jsx`

**Problem:** Any uncaught error in a client component crashes the entire page.

- [ ] Create `src/components/ui/ErrorBoundary.tsx`:
  ```tsx
  'use client';
  import { Component } from 'react';

  export class ErrorBoundary extends Component {
    state = { hasError: false, error: null };
    static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
    componentDidCatch(error: Error, info: any) { console.error('Boundary caught:', error, info); }
    render() {
      if (this.state.hasError) return this.props.fallback ?? <div>Something went wrong.</div>;
      return this.props.children;
    }
  }
  ```
- [ ] Wrap `KanbanBoard`, `NotificationDropdown`, and `ClientKanbanBoard` with error boundaries
- [ ] Add a global error boundary in the root layout for the admin section
- [ ] Create `src/app/admin/error.tsx` (Next.js built-in error page for the admin segment)
- [ ] Test: throw an error in a child component and confirm the boundary catches it, showing a fallback

**Done when:** Intentionally throwing in `KanbanBoard` shows a fallback UI instead of a blank page.

---

### 5.4 — Add Alerts & Metrics 🟡
- [ ] Set up API latency monitoring (via Sentry Performance or Vercel Analytics)
- [ ] Set up DB query time monitoring
- [ ] Configure alerts for error rate spikes (> 1% of requests failing = alert)
- [ ] Add uptime monitoring (Better Uptime, Checkly, or similar — free tiers available)

---

---

## Phase 6 — Feature Completeness
> **Goal:** Add production-critical features that clients and operators need on day one.  
> **Effort:** 6–8 days

---

### 6.1 — Email Notifications for Request Status Changes 🟠

**Problem:** When admin updates a request status, the client has zero visibility without logging in.

- [ ] Install: `npm install resend` (recommended) or `postmark`
- [ ] Add env var: `RESEND_API_KEY=`
- [ ] Create `src/lib/email/send.ts` — thin wrapper around provider SDK
- [ ] Create email templates for: status change, new task assigned, comment received, project completed
- [ ] Trigger email in `PATCH /api/admin/requests/[id]` after status update:
  ```ts
  await sendEmail({
    to: request.email,
    subject: `Your project request has been updated`,
    template: 'statusChange',
    data: { clientName: request.name, newStatus: status, requestTitle: request.title }
  });
  ```
- [ ] Handle email failure gracefully — log error but don't fail the API response
- [ ] Add an unsubscribe mechanism (legal requirement in most jurisdictions)
- [ ] Test end-to-end with a real email address before release

**Done when:** Changing a request status in admin triggers a real email to the client's address.

---

### 6.2 — Audit Log for All Admin Actions 🟠

**Problem:** No record of who changed what. Cannot reconstruct incidents or provide accountability.

- [ ] Create `audit_logs` table:
  ```sql
  CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id),
    actor_email TEXT,
    action TEXT NOT NULL,        -- e.g. "task.status_updated", "request.approved"
    resource_type TEXT NOT NULL, -- e.g. "task", "request"
    resource_id TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```
- [ ] Create `src/lib/audit.ts` helper (see AUDIT doc P5.1 for full code)
- [ ] Call `logAction()` in ALL admin write endpoints: tasks, projects, requests, blog posts
- [ ] Create `GET /api/admin/audit-logs` endpoint (admin only, paginated)
- [ ] Add a read-only audit log view in the admin panel (sortable, filterable by resource)
- [ ] Add RLS: only `service_role` can insert; only admins can select
- [ ] Retain audit logs for a minimum of 90 days

**Done when:** Every admin CRUD operation produces a queryable audit log entry.

---

### 6.3 — Session Invalidation on Suspicious Activity 🟡

**Problem:** No mechanism to force-logout a user. Compromised admin sessions stay active indefinitely.

- [ ] Add "Sign out all devices" button in admin settings
- [ ] Implement server action:
  ```ts
  const { error } = await supabase.auth.admin.signOut(userId, 'global');
  ```
- [ ] Trigger automatic invalidation when: password is changed, admin role is revoked, account is flagged
- [ ] Add rate limiting specifically on the login endpoint (brute force protection)

---

### 6.4 — Feature Flags for Safe Rollout 🔵
- [ ] Choose a feature flag solution (simple: environment variable flags; advanced: LaunchDarkly, Flagsmith free tier)
- [ ] Implement a `getFlag(name)` utility that reads from config
- [ ] Wrap any new risky features behind a flag before release

---

### 6.5 — Retry Logic for Network + API Calls 🔵
- [ ] Add retry logic to email sending (3 retries with exponential backoff)
- [ ] Add retry logic to Supabase mutations that could experience transient failures
- [ ] Consider using a library like `p-retry` for consistency

---

---

## Phase 7 — TypeScript Migration
> **Goal:** Eliminate bugs caused by untyped Supabase responses and API payloads.  
> **Effort:** 6–8 days (incremental, file-by-file)  
> **Success Criteria:** Data layer, API routes, and hooks are fully typed.

---

### 7.1 — Generate Types from Supabase Schema 🔵

- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Generate TypeScript types: `supabase gen types typescript --linked > src/types/supabase.ts`
- [ ] Add to `package.json` scripts: `"types:gen": "supabase gen types typescript --linked > src/types/supabase.ts"`
- [ ] Add to CI/CD: run `types:gen` and fail build if generated file differs from committed (schema drift detection)

---

### 7.2 — Migrate Data Layer to TypeScript 🔵
**Files:** `src/lib/data/*.js` → `src/lib/data/*.ts`

- [ ] Convert `projects.js`, `blogPosts.js`, `testimonials.js` to TypeScript
- [ ] Use generated Supabase types for all return values
- [ ] Add explicit return types to all exported functions
- [ ] Run `tsc --noEmit` and fix all surfaced type errors

---

### 7.3 — Migrate API Routes to TypeScript 🔵
**Files:** `src/app/api/**/*.js` → `.ts`

- [ ] Convert all route handlers to TypeScript (start with most critical: admin, auth)
- [ ] Type all request bodies using Zod schema inference: `type RequestBody = z.infer<typeof requestSchema>`
- [ ] Type all response shapes

---

### 7.4 — Migrate Custom Hooks to TypeScript 🔵
**Files:** `src/lib/hooks/*.js` → `.ts`

- [ ] Convert `useNotifications.js`, `useProjectStats.js`, `useRequests.js`, `useTaskComments.js`
- [ ] Add explicit generics to React Query hooks: `useQuery<Project[], Error>(...)`

---

---

## Phase 8 — Testing Improvements
> **Goal:** High confidence, not high coverage numbers.  
> **Effort:** 3–4 days

---

### 8.1 — Expand Stryker Mutation Testing to API Routes 🟡
**File:** `stryker.config.js`

**Problem:** Stryker only mutates `src/config`. All API business logic is untested by mutation testing.

- [ ] Update `stryker.config.js`:
  ```js
  mutate: [
    "src/config/**/*.js",
    "src/app/api/**/*.js",  // ADD
    "src/lib/**/*.js",       // ADD
  ]
  ```
- [ ] Run: `npx stryker run`
- [ ] Target: mutation score > 60% on API routes
- [ ] Fix surviving mutations that represent real business logic

---

### 8.2 — Add Missing E2E Tests 🟡

- [ ] Create `tests/e2e/admin-blog.spec.ts`:
  - Admin creates post → appears on `/blog`
  - Admin publishes draft → visible to public
  - Admin deletes post → removed from listing
- [ ] Create `tests/e2e/client-idor.spec.ts`:
  - Client A tries to navigate to Client B's task URL → gets redirected
- [ ] Create `tests/e2e/kanban.spec.ts`:
  - Admin drags task from `backlog` to `inprogress` → verify DB update
- [ ] Run: `npm run test:e2e`

---

### 8.3 — Add Real-Time Hook Tests 🟡
**Files:** `useNotifications`, `useProjectStats`

**Problem:** These hooks have only 2 stub export tests. Subscription leaks and stale state bugs are invisible.

- [ ] Expand `tests/unit/hooks/useNotifications-realtime.test.tsx`:
  - Test: renders 0 notifications on mount
  - Test: shows new notification when Supabase INSERT event fires
  - Test: marks notification as read, removes from unread count
  - Test: `removeChannel` is called on unmount (cleanup check)
- [ ] Use MSW to simulate Supabase Realtime events

---

### 8.4 — Add Contract Tests and Load Tests 🔵
- [ ] Add contract tests for all public API endpoints (validate request/response shapes)
- [ ] Add failure scenario tests (what happens when DB is down, email fails, etc.)
- [ ] Add load testing with realistic data (use k6 or Artillery):
  - Target: simulate 500 concurrent users hitting admin dashboard
  - Acceptance: p95 latency < 800ms

---

---

## Phase 9 — Background Jobs & Async Processing
> **Goal:** Move heavy and I/O-bound work off the request-response cycle.  
> **Effort:** 3–5 days

---

### 9.1 — Introduce a Queue System 🔵

**Problem:** All operations are synchronous. Sending an email during a request cycle risks timeout, and failures are not retried.

- [ ] Choose: **BullMQ** (self-hosted, uses Redis) or **Cloud Tasks** (GCP, serverless-friendly)
- [ ] Move the following to async queues:
  - Email sending (status change emails, notifications)
  - Heavy DB writes (audit log batching)
  - Notification fan-out
- [ ] Add job retry logic with exponential backoff
- [ ] Add dead-letter queue for failed jobs
- [ ] Add queue health dashboard (BullBoard for BullMQ)

---

---

## Phase 10 — Scaling Strategy (10k → 100k Users)
> **Goal:** Ensure architecture can grow horizontally without rewrites.

---

### 10.1 — Add Redis Caching Layer 🔵
- [ ] Set up Redis (Upstash works — already in use for rate limiting)
- [ ] Cache frequently read, rarely changed data: user profiles, project lists, settings
- [ ] Define cache invalidation strategy per entity (tag-based or TTL)
- [ ] Use `unstable_cache` for Next.js server components (Phase 4.1 covers public endpoints)

---

### 10.2 — Modularize by Domain 🔵
**Target Structure:**
```
/src/modules
  /tasks
    task.service.ts
    task.repo.ts
    task.schema.ts
  /projects
  /auth
  /notifications
```
- [ ] Move components + hooks into domain modules
- [ ] Assign clear ownership per module
- [ ] Each module should be independently testable

---

### 10.3 — Split Admin vs Public Bundle 🔵
- [ ] Audit and separate admin-only dependencies from public-facing pages
- [ ] Use Next.js route groups to isolate admin bundle: `src/app/(admin)/`
- [ ] Ensure public pages have zero admin JS loaded

---

### 10.4 — API Layer Separation (Future) 🔵
- [ ] If scaling beyond monorepo: extract API into a standalone service
- [ ] Introduce API gateway for routing, auth, and rate limiting at edge
- [ ] Extract notification/email service if volume justifies dedicated infrastructure

---

---

## Phase 11 — Developer Experience & Documentation
> **Goal:** Enable a second developer to be productive on day one.  
> **Effort:** 1–2 days

---

### 11.1 — Create `CONTRIBUTING.md` 🔵

- [ ] Document how to run tests locally
- [ ] Enforce: all API routes must use `withAuth` or `withAdmin` wrapper
- [ ] Enforce: all POST/PATCH routes must have a Zod schema
- [ ] Enforce: all new routes must have integration tests before merge
- [ ] Document: how to add a new database table (migration + RLS policy + index)

---

### 11.2 — Create `docs/API_CONVENTIONS.md` 🔵

- [ ] Document request/response shapes
- [ ] Document error codes and meanings
- [ ] Document pagination format (cursor vs offset, metadata fields)
- [ ] Document versioning strategy (`/api/v1/`)

---

### 11.3 — Environment Variables Checklist

Ensure all of these exist in `.env.local` (never committed) and are configured in your deployment platform:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # Server-only — NEVER expose to client

# Auth
ADMIN_EMAIL=                    # Bootstrap only — replace with role-based auth (Phase 1.3)

# Rate Limiting (Phase 1.2)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email (Phase 6.1)
RESEND_API_KEY=

# Monitoring (Phase 5.1)
SENTRY_DSN=

# App
NEXT_PUBLIC_SITE_URL=           # e.g. https://berztech.com
```

---

---

## ✅ Final Production Readiness Checklist

Before deploying to production, ALL items below must be checked:

### 🔴 Security (Blocks Production)
- [ ] 1.1 — Hardcoded credentials removed and keys rotated
- [ ] 1.2 — Redis-backed rate limiting active on mutation endpoints
- [ ] 1.3 — Admin auth backed by DB role, not env var email
- [ ] 1.4 — XSS sanitization on write (requests + blog)
- [ ] 1.5 — Open redirect in `auth/callback` fixed
- [ ] 1.6 — CORS + security headers in `next.config.js`
- [ ] 1.7 — Settings endpoint key allowlist enforced
- [ ] 1.8 — File upload validates magic bytes + size limit
- [ ] 1.9 — Max length validation on all Zod schemas

### 🟠 Architecture (Required Before Scale)
- [ ] 2.1 — `withAuth` / `withAdmin` middleware extracted, boilerplate deleted
- [ ] 2.2 — Service layer created
- [ ] 2.4 — All list endpoints paginated (hard max limit enforced)
- [ ] 2.5 — N+1 query in comment loop fixed
- [ ] 2.8 — PATCH body field whitelisting (no mass assignment)
- [ ] 2.9 — Standardized API response format

### 🟠 Data Integrity
- [ ] 3.1 — Soft delete implemented for tasks, requests, blog posts
- [ ] 3.2 — All DELETE handlers return 404 for missing resources
- [ ] 3.3 — PgBouncer connection pooling enabled
- [ ] 3.4 — Database indexes created

### 🟠 Observability
- [ ] 5.1 — Sentry error monitoring active
- [ ] 5.2 — Structured logging with requestId
- [ ] 5.3 — React Error Boundaries on all critical components

### 🟠 Features
- [ ] 6.1 — Client email notifications working
- [ ] 6.2 — Audit log capturing all admin writes

---

## 📂 Quick Reference — Files Requiring the Most Work

| File | Issues | Phase |
|------|--------|-------|
| `tests/security/integration/api-client.js` | Hardcoded credentials | 1.1 |
| `src/config/admin.js` | Email-based admin auth | 1.3 |
| `src/middleware.js` | No real rate limiting | 1.2 |
| `src/app/api/requests/route.js` | No sanitization, no rate limit, no max-length | 1.2, 1.4, 1.9 |
| `src/app/api/upload/route.js` | In-memory rate limit, no magic byte check | 1.2, 1.8 |
| `src/app/api/settings/route.js` | No key allowlist | 1.7 |
| `src/app/auth/callback/route.js` | Open redirect | 1.5 |
| `next.config.js` | No CORS/security headers | 1.6 |
| `src/app/api/tasks/[id]/comments/route.js` | N+1 query, no sanitization | 1.4, 2.5 |
| `tests/property/api-validation.property.test.ts` | Fake tests | 2.11 |
| `vitest.workspace.js` | Dead file | 2.12 |
| `vitest.integration.config.js` | Dead file | 2.12 |
| `src/components/admin/KanbanBoard.jsx` | No pagination, no error boundary | 4.4, 5.3 |
| `src/components/providers/QueryProvider.jsx` | Default stale times | 4.3 |
| `src/lib/hooks/useNotifications.js` | Subscription leak | 4.2 |
| `src/lib/hooks/useProjectStats.js` | Subscription leak | 4.2 |
| `src/app/api/admin/**/*.js` (all) | Duplicated auth boilerplate | 2.1 |
| `src/lib/data/*.js` (all) | `SELECT *`, no pagination, JS not TS | 2.6, 7.2 |

---

*Last updated: March 2026 — Update this date whenever significant changes are made.*