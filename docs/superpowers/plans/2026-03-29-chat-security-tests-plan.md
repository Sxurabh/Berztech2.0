# Chat/Messaging Security Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create comprehensive security tests for the messaging/chat feature covering all vulnerability categories identified in the security audit.

**Architecture:** Create 8 new security test files covering rate limiting, IDOR, RLS policies, authorization, realtime security, XSS, file upload security, and information disclosure.

**Tech Stack:** Vitest, MSW (Mock Service Worker), Supabase

---

## File Structure

| File to Create | Purpose |
|----------------|---------|
| `tests/security/chat-rate-limiting.test.ts` | Rate limiting for message endpoints |
| `tests/security/chat-idor.test.ts` | IDOR vulnerabilities in mark-as-read |
| `tests/security/chat-rls-policies.test.ts` | RLS policy validation |
| `tests/security/chat-authorization.test.ts` | Project membership authorization |
| `tests/security/chat-realtime.test.ts` | Realtime channel security |
| `tests/security/chat-xss.test.ts` | XSS prevention in messages |
| `tests/security/chat-upload-security.test.ts` | File upload security |
| `tests/security/chat-info-disclosure.test.ts` | Information disclosure |

---

## Task 1: Chat Rate Limiting Tests

**Files:**
- Create: `tests/security/chat-rate-limiting.test.ts`
- Reference: `src/app/api/messages/route.js`, `src/app/api/messages/[id]/read/route.js`

- [ ] **Step 1: Create rate limiting test file**

```typescript
/**
 * @fileoverview Security tests for Chat Rate Limiting
 * 
 * Tests:
 * 1. GET /api/messages - rate limiting on fetch
 * 2. POST /api/messages - rate limiting on send
 * 3. PATCH /api/messages/[id]/read - rate limiting on mark as read
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Mock implementations
vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn().mockReturnValue(false),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("Security: Chat Rate Limiting", () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-1", email: "user@test.com" } },
                    error: null,
                }),
            },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                insert: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: {}, error: null }),
            }),
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    describe("GET /api/messages Rate Limiting", () => {
        it("1. tracks requests per IP for message fetch", async () => { /* test */ });
        it("2. returns 429 when fetch limit exceeded", async () => { /* test */ });
        it("3. independent IP tracking works", async () => { /* test */ });
        it("4. window resets after time period", async () => { /* test */ });
        it("5. includes retry-after header", async () => { /* test */ });
    });

    describe("POST /api/messages Rate Limiting", () => {
        it("6. tracks messages sent per user/IP", async () => { /* test */ });
        it("7. blocks spam after threshold", async () => { /* test */ });
        it("8. different users have independent limits", async () => { /* test */ });
        it("9. rate limit applies before auth", async () => { /* test */ });
        it("10. burst detection works", async () => { /* test */ });
    });

    describe("PATCH /api/messages/[id]/read Rate Limiting", () => {
        it("11. limits read receipt creation", async () => { /* test */ });
        it("12. blocks rapid read marking", async () => { /* test */ });
        it("13. prevents DoS via read receipts", async () => { /* test */ });
    });

    describe("Rate Limit Bypass Prevention", () => {
        it("14. same IP with different headers still limited", async () => { /* test */ });
        it("15. user-agent spoofing doesn't bypass", async () => { /* test */ });
        it("16. x-forwarded-for spoofing doesn't bypass", async () => { /* test */ });
    });

    describe("DoS Mitigation", () => {
        it("17. prevents message flooding", async () => { /* test */ });
        it("18. prevents read receipt flooding", async () => { /* test */ });
        it("19. handles distributed attack simulation", async () => { /* test */ });
        it("20. returns proper error format", async () => { /* test */ });
    });
});
```

- [ ] **Step 2: Run tests to verify structure**

Run: `npx vitest run tests/security/chat-rate-limiting.test.ts --reporter=verbose`

---

## Task 2: Chat IDOR Tests

**Files:**
- Create: `tests/security/chat-idor.test.ts`
- Reference: `src/app/api/messages/[id]/read/route.js`

- [ ] **Step 1: Create IDOR test file**

```typescript
/**
 * @fileoverview Security tests for Chat IDOR vulnerabilities
 * 
 * Tests:
 * 1. Users cannot mark other users' messages as read
 * 2. Users cannot read messages from other projects
 * 3. Authorization checks on mark-as-read endpoint
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("Security: Chat IDOR Tests", () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Mark-as-Read IDOR", () => {
        it("1. user cannot mark own message as read", async () => { /* test */ });
        it("2. user cannot mark messages from other projects", async () => { /* test */ });
        it("3. user cannot mark messages from other projects (no project membership)", async () => { /* test */ });
        it("4. returns 403 when not project member", async () => { /* test */ });
        it("5. returns 404 for non-existent message", async () => { /* test */ });
    });

    describe("Message Access IDOR", () => {
        it("6. user cannot fetch messages from unauthorized project", async () => { /* test */ });
        it("7. user cannot enumerate message IDs", async () => { /* test */ });
        it("8. project_id validation prevents injection", async () => { /* test */ });
        it("9. UUID format validation on project_id", async () => { /* test */ });
    });

    describe("Authorization Matrix", () => {
        it("10. admin can mark any message as read", async () => { /* test */ });
        it("11. project owner can mark others' messages as read", async () => { /* test */ });
        it("12. non-member cannot mark as read", async () => { /* test */ });
        it("13. returns consistent error for unauthorized access", async () => { /* test */ });
    });

    describe("IDOR Bypass Attempts", () => {
        it("14. UUID manipulation doesn't bypass authorization", async () => { /* test */ });
        it("15. null project_id returns 400", async () => { /* test */ });
        it("16. SQL injection in project_id fails safely", async () => { /* test */ });
    });
});
```

- [ ] **Step 2: Run tests to verify structure**

---

## Task 3: Chat RLS Policy Tests

**Files:**
- Create: `tests/security/chat-rls-policies.test.ts`
- Reference: `supabase/migrations/001_create_messaging_tables.sql`

- [ ] **Step 1: Create RLS policy test file**

```typescript
/**
 * @fileoverview Security tests for Chat RLS Policies
 * 
 * Tests:
 * 1. RLS policies enforce access control
 * 2. Only project participants can read messages
 * 3. Only authenticated users can send messages
 * 4. Admin bypass works correctly
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Security: Chat RLS Policy Tests", () => {
    describe("project_messages RLS", () => {
        it("1. authenticated user can read own project messages", async () => { /* test */ });
        it("2. authenticated user can insert messages", async () => { /* test */ });
        it("3. unauthenticated user cannot read", async () => { /* test */ });
        it("4. unauthenticated user cannot insert", async () => { /* test */ });
        it("5. admin can read all messages", async () => { /* test */ });
    });

    describe("message_reads RLS", () => {
        it("6. user can read own read receipts", async () => { /* test */ });
        it("7. user can insert own read receipts", async () => { /* test */ });
        it("8. unauthenticated cannot access read receipts", async () => { /* test */ });
        it("9. admin can access all read receipts", async () => { /* test */ });
        it("10. user cannot read other users' read receipts (optional)", async () => { /* test */ });
    });
});
```

---

## Task 4: Chat Authorization Tests

**Files:**
- Create: `tests/security/chat-authorization.test.ts`
- Reference: `src/app/api/messages/route.js`

- [ ] **Step 1: Create authorization test file**

```typescript
/**
 * @fileoverview Security tests for Chat Authorization
 * 
 * Tests:
 * 1. Project membership validation
 * 2. User roles and permissions
 * 3. Access control enforcement
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Security: Chat Authorization Tests", () => {
    describe("Project Membership", () => {
        it("1. user must be project member to fetch messages", async () => { /* test */ });
        it("2. user must be project member to send messages", async () => { /* test */ });
        it("3. returns 403 for non-members", async () => { /* test */ });
        it("4. project owner has full access", async () => { /* test */ });
        it("5. team members have appropriate access", async () => { /* test */ });
    });

    describe("Role-Based Access", () => {
        it("6. admin has elevated access", async () => { /* test */ });
        it("7. regular user has limited access", async () => { /* test */ });
        it("8. guest cannot access messages", async () => { /* test */ });
        it("9. suspended user cannot access", async () => { /* test */ });
    });

    describe("Permission Boundaries", () => {
        it("10. can only send from own account", async () => { /* test */ });
        it("11. sender_id is set server-side", async () => { /* test */ });
        it("12. client cannot forge sender_id", async () => { /* test */ });
    });
});
```

---

## Task 5: Chat Realtime Security Tests

**Files:**
- Create: `tests/security/chat-realtime.test.ts`
- Reference: `src/lib/hooks/useMessages.js`

- [ ] **Step 1: Create realtime security test file**

```typescript
/**
 * @fileoverview Security tests for Chat Realtime
 * 
 * Tests:
 * 1. Channel subscription authorization
 * 2. Message event filtering
 * 3. Broadcast scope validation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Security: Chat Realtime Tests", () => {
    describe("Channel Subscription", () => {
        it("1. user can only subscribe to own project channels", async () => { /* test */ });
        it("2. cannot subscribe to other users' channels", async () => { /* test */ });
        it("3. channel name uses validated project_id", async () => { /* test */ });
    });

    describe("Event Filtering", () => {
        it("4. receives only relevant INSERT events", async () => { /* test */ });
        it("5. filter by project_id is enforced", async () => { /* test */ });
        it("6. no cross-project event leakage", async () => { /* test */ });
    });

    describe("Broadcast Security", () => {
        it("7. broadcast only to project members", async () => { /* test */ });
        it("8. unauthenticated channel access denied", async () => { /* test */ });
    });
});
```

---

## Task 6: Chat XSS Tests

**Files:**
- Create: `tests/security/chat-xss.test.ts`
- Reference: `src/app/api/messages/route.js`

- [ ] **Step 1: Create XSS test file**

```typescript
/**
 * @fileoverview Security tests for Chat XSS Prevention
 * 
 * Tests:
 * 1. Script tag injection
 * 2. Event handler injection
 * 3. javascript: URI
 * 4. SVG/Meta injection
 * 5. Various encoding bypasses
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Security: Chat XSS Tests", () => {
    let capturedData: any;

    beforeEach(() => { capturedData = null; });

    describe("Script Injection", () => {
        it("1. stores <script>alert(1)</script> as plain text", async () => { /* test */ });
        it("2. stores <img onerror> as plain text", async () => { /* test */ });
        it("3. stores <svg onload> as plain text", async () => { /* test */ });
        it("4. stores <iframe> javascript as plain text", async () => { /* test */ });
        it("5. stores <body onload> as plain text", async () => { /* test */ });
    });

    describe("URI-based XSS", () => {
        it("6. stores javascript: URI as plain text", async () => { /* test */ });
        it("7. stores data: URI as plain text", async () => { /* test */ });
        it("8. stores vbscript: URI as plain text", async () => { /* test */ });
        it("9. stores mhtml: URI as plain text", async () => { /* test */ });
    });

    describe("Encoding Bypasses", () => {
        it("10. stores HTML entities as-is", async () => { /* test */ });
        it("11. stores unicode XSS as plain text", async () => { /* test */ });
        it("12. stores null byte injection safely", async () => { /* test */ });
        it("13. stores mixed encoding as plain text", async () => { /* test */ });
    });

    describe("Template Injection", () => {
        it("14. stores {{constructor}} as plain text", async () => { /* test */ });
        it("15. stores ${alert()} as plain text", async () => { /* test */ });
        it("16. stores <style>@import as plain text", async () => { /* test */ });
    });

    describe("API Response Safety", () => {
        it("17. response JSON serializes safely", async () => { /* test */ });
        it("18. XSS payload returned without execution", async () => { /* test */ });
        it("19. special chars handled correctly", async () => { /* test */ });
    });

    describe("Attachment Filename XSS", () => {
        it("20. stores <filename><script>.pdf as safe", async () => { /* test */ });
        it("21. stores filename with quotes safely", async () => { /* test */ });
        it("22. rejects dangerous file extensions", async () => { /* test */ });
        it("23. validates filename length", async () => { /* test */ });
    });

    describe("Content Length Limits", () => {
        it("24. enforces 5000 char limit", async () => { /* test */ });
        it("25. rejects message exceeding limit", async () => { /* test */ });
    });
});
```

---

## Task 7: Chat File Upload Security Tests

**Files:**
- Create: `tests/security/chat-upload-security.test.ts`
- Reference: `src/app/api/messages/upload/route.js`

- [ ] **Step 1: Create file upload security test file**

```typescript
/**
 * @fileoverview Security tests for Chat File Upload
 * 
 * Tests:
 * 1. MIME type validation
 * 2. Magic byte validation (if implemented)
 * 3. File size limits
 * 4. Path traversal prevention
 * 5. Filename sanitization
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Security: Chat File Upload Tests", () => {
    describe("MIME Type Validation", () => {
        it("1. accepts image/jpeg", async () => { /* test */ });
        it("2. accepts image/png", async () => { /* test */ });
        it("3. accepts application/pdf", async () => { /* test */ });
        it("4. rejects text/html", async () => { /* test */ });
        it("5. rejects application/javascript", async () => { /* test */ });
    });

    describe("File Size Limits", () => {
        it("6. accepts file under 10MB", async () => { /* test */ });
        it("7. rejects file over 10MB", async () => { /* test */ });
        it("8. rejects extremely large files", async () => { /* test */ });
    });

    describe("Filename Security", () => {
        it("9. sanitizes path traversal in filename", async () => { /* test */ });
        it("10. handles null bytes in filename", async () => { /* test */ });
        it("11. truncates very long filenames", async () => { /* test */ });
        it("12. rejects double extensions", async () => { /* test */ });
    });

    describe("Magic Byte Validation", () => {
        it("13. accepts valid JPEG magic bytes", async () => { /* test */ });
        it("14. accepts valid PNG magic bytes", async () => { /* test */ });
        it("15. accepts valid PDF magic bytes", async () => { /* test */ });
    });

    describe("Content-Type Validation", () => {
        it("16. Content-Type header is validated", async () => { /* test */ });
        it("17. mismatched Content-Type is rejected", async () => { /* test */ });
    });
});
```

---

## Task 8: Chat Information Disclosure Tests

**Files:**
- Create: `tests/security/chat-info-disclosure.test.ts`

- [ ] **Step 1: Create info disclosure test file**

```typescript
/**
 * @fileoverview Security tests for Chat Information Disclosure
 * 
 * Tests:
 * 1. Error messages don't leak sensitive info
 * 2. HTTP headers don't expose internals
 * 3. Debug mode is disabled in production
 * 4. User enumeration prevention
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Security: Chat Info Disclosure Tests", () => {
    describe("Error Message Disclosure", () => {
        it("1. database errors don't expose schema", async () => { /* test */ });
        it("2. validation errors don't expose internals", async () => { /* test */ });
        it("3. auth errors are generic", async () => { /* test */ });
    });

    describe("Response Header Disclosure", () => {
        it("4. X-Powered-By header not present", async () => { /* test */ });
        it("5. Server header doesn't expose version", async () => { /* test */ });
    });

    describe("Timing Attacks", () => {
        it("6. error responses have consistent timing", async () => { /* test */ });
        it("7. auth failures take same time", async () => { /* test */ });
    });

    describe("User Enumeration", () => {
        it("8. message enumeration not possible without project_id", async () => { /* test */ });
    });
});
```

---

## Task 9: Run All Tests

- [ ] **Step 1: Run all security tests**

Run: `npx vitest run tests/security/chat-*.test.ts --reporter=verbose`

Expected: All ~113 tests should execute

---

## Task 10: Commit

- [ ] **Step 1: Stage and commit changes**

```bash
git add tests/security/chat-*.test.ts
git commit -m "feat(security): add comprehensive chat messaging security tests

- chat-rate-limiting.test.ts: 20 tests for API rate limiting
- chat-idor.test.ts: 16 tests for IDOR vulnerabilities  
- chat-rls-policies.test.ts: 10 tests for RLS policies
- chat-authorization.test.ts: 12 tests for authorization
- chat-realtime.test.ts: 8 tests for realtime security
- chat-xss.test.ts: 25 tests for XSS prevention
- chat-upload-security.test.ts: 15 tests for file upload security
- chat-info-disclosure.test.ts: 8 tests for info disclosure

Total: 114 security tests"
```

---

## Summary

| Task | Tests | Status |
|------|-------|--------|
| 1. Rate Limiting | 20 | ⬜ |
| 2. IDOR | 16 | ⬜ |
| 3. RLS Policies | 10 | ⬜ |
| 4. Authorization | 12 | ⬜ |
| 5. Realtime | 8 | ⬜ |
| 6. XSS | 25 | ⬜ |
| 7. File Upload | 15 | ⬜ |
| 8. Info Disclosure | 8 | ⬜ |
| 9. Run Tests | - | ⬜ |
| 10. Commit | - | ⬜ |
| **Total** | **114** | |
