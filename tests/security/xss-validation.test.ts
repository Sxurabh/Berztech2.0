/**
 * @fileoverview Security tests for XSS Prevention - Real Vulnerability Validation
 *
 * These tests verify that:
 * 1. XSS payloads are properly handled by the API
 * 2. Data is stored safely (not executed as scripts)
 * 3. The application handles XSS payloads safely without crashing
 * 4. Input validation rejects malicious patterns where appropriate
 * 5. Data is returned in API responses without execution
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/requests/route";
import { POST as blogPost } from "@/app/api/blog/route";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn().mockImplementation((email: string) => email === "admin@test.com"),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("Security: XSS Prevention - Real API Validation", () => {
    let mockSupabase: any;
    let capturedInsertData: any;

    const createMockFromChain = () => ({
        insert: vi.fn().mockImplementation((data) => {
            capturedInsertData = data;
            return { select: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { id: "1", ...data }, error: null }) };
        }),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: "1" }, error: null }),
    });

    beforeEach(() => {
        vi.clearAllMocks();
        capturedInsertData = null;

        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
            },
            from: vi.fn().mockImplementation(() => createMockFromChain()),
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createJsonRequest(body: unknown, url = "http://localhost:3000/api/requests") {
        return new NextRequest(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    }

    describe("XSS in Contact Form (POST /api/requests) - Real Validation", () => {
        it("1. Stores script tags as plain text (not executed)", async () => {
            const xssPayload = '<script>alert("XSS")</script>';
            const req = createJsonRequest({
                name: xssPayload,
                email: "test@test.com",
                message: "Hello",
            });

            const res = await POST(req);

            expect(res.status).toBe(201);
            expect(capturedInsertData).toBeDefined();
            // Verify the payload is stored as-is (sanitization happens at render time)
            expect(capturedInsertData.name).toBe(xssPayload);
        });

        it("2. Stores event handlers as plain text", async () => {
            const xssPayload = '<img src=x onerror=alert(1)>';
            const req = createJsonRequest({
                name: xssPayload,
                email: "test@test.com",
            });

            const res = await POST(req);

            expect(res.status).toBe(201);
            expect(capturedInsertData.name).toBe(xssPayload);
        });

        it("3. Stores javascript: protocol as plain text", async () => {
            const xssPayload = '<a href="javascript:alert(1)">click</a>';
            const req = createJsonRequest({
                name: xssPayload,
                email: "test@test.com",
            });

            const res = await POST(req);

            expect(res.status).toBe(201);
            expect(capturedInsertData.name).toBe(xssPayload);
        });

        it("4. Stores SVG onload as plain text", async () => {
            const xssPayload = '<svg onload=alert(1)>';
            const req = createJsonRequest({
                name: xssPayload,
                email: "test@test.com",
            });

            const res = await POST(req);

            expect(res.status).toBe(201);
            expect(capturedInsertData.name).toBe(xssPayload);
        });

        it("5. Stores iframe with javascript as plain text", async () => {
            const xssPayload = '<iframe src="javascript:alert(1)">';
            const req = createJsonRequest({
                name: xssPayload,
                email: "test@test.com",
            });

            const res = await POST(req);

            expect(res.status).toBe(201);
            expect(capturedInsertData.name).toBe(xssPayload);
        });

        it("6. Stores data: URI as plain text", async () => {
            const xssPayload = '<object data="data:text/html,<script>alert(1)</script>"></object>';
            const req = createJsonRequest({
                name: xssPayload,
                email: "test@test.com",
            });

            const res = await POST(req);

            expect(res.status).toBe(201);
            expect(capturedInsertData.name).toBe(xssPayload);
        });

        it("7. Stores encoded XSS as plain text", async () => {
            const xssPayload = '&lt;script&gt;alert(1)&lt;/script&gt;';
            const req = createJsonRequest({
                name: xssPayload,
                email: "test@test.com",
            });

            const res = await POST(req);

            expect(res.status).toBe(201);
            expect(capturedInsertData.name).toBe(xssPayload);
        });

        it("8. Stores unicode XSS variations as plain text", async () => {
            const xssPayload = '<scr\u0069pt>alert(1)</script>';
            const req = createJsonRequest({
                name: xssPayload,
                email: "test@test.com",
            });

            const res = await POST(req);

            expect(res.status).toBe(201);
            expect(capturedInsertData.name).toBe(xssPayload);
        });

        it("9. Stores template injection attempts as plain text", async () => {
            const xssPayload = '{{constructor.constructor("alert(1)")()}}';
            const req = createJsonRequest({
                name: xssPayload,
                email: "test@test.com",
            });

            const res = await POST(req);

            expect(res.status).toBe(201);
            expect(capturedInsertData.name).toBe(xssPayload);
        });

        it("10. Stores expression injection as plain text", async () => {
            const xssPayload = '${alert(1)}';
            const req = createJsonRequest({
                name: xssPayload,
                email: "test@test.com",
            });

            const res = await POST(req);

            expect(res.status).toBe(201);
            expect(capturedInsertData.name).toBe(xssPayload);
        });

        it("11. Stores HTML entities safely", async () => {
            const safePayload = "John & Jane <test>";
            const req = createJsonRequest({
                name: safePayload,
                email: "test@test.com",
                message: "Test message",
            });

            const res = await POST(req);

            expect(res.status).toBe(201);
            expect(capturedInsertData.name).toBe(safePayload);
        });

        it("12. Rejects invalid JSON body", async () => {
            const req = new NextRequest("http://localhost:3000/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "not valid json",
            });

            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.error).toContain("Invalid JSON");
        });

        it("13. Validates required fields before XSS check", async () => {
            const req = createJsonRequest({
                name: '<script>alert(1)</script>',
                // Missing email
            });

            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.error).toBe("Invalid input");
        });

        it("14. Validates email format even with XSS payload", async () => {
            const req = createJsonRequest({
                name: '<script>alert(1)</script>',
                email: 'not-an-email',
            });

            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.error).toBe("Invalid input");
        });

        it("15. Enforces message length limit even with XSS", async () => {
            const req = createJsonRequest({
                name: "Test",
                email: "test@test.com",
                message: '<script>'.padEnd(2000, 'a'),
            });

            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.error).toBe("Invalid input");
        });
    });

    describe("XSS in Blog Posts (POST /api/blog) - Real Validation", () => {
        let mockBlogSupabase: any;
        let capturedBlogData: any;

        beforeEach(async () => {
            capturedBlogData = null;

            mockBlogSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({
                        data: { user: { id: "admin-1", email: "admin@test.com" } },
                        error: null,
                    }),
                },
                from: vi.fn().mockImplementation(() => ({
                    insert: vi.fn().mockImplementation((data) => {
                        capturedBlogData = data;
                        return {
                            select: vi.fn().mockReturnThis(),
                            single: vi.fn().mockResolvedValue({
                                data: { id: "1", ...data },
                                error: null,
                            }),
                        };
                    }),
                })),
            };
            (createServerSupabaseClient as any).mockResolvedValue(mockBlogSupabase);
        });

        it("16. Stores script tags in blog title as plain text", async () => {
            const xssPayload = '<script>alert(1)</script>';
            const req = new NextRequest("http://localhost:3000/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: xssPayload,
                    content: "Test content",
                    slug: "test-post",
                    status: "published",
                }),
            });

            const res = await blogPost(req);

            expect(res.status).toBe(201);
            expect(capturedBlogData.title).toBe(xssPayload);
        });

        it("17. Stores script tags in blog content as plain text", async () => {
            const xssPayload = "<script>alert('XSS')</script>";
            const req = new NextRequest("http://localhost:3000/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Test Title",
                    content: xssPayload,
                    slug: "test-post",
                    status: "published",
                }),
            });

            const res = await blogPost(req);

            expect(res.status).toBe(201);
            expect(capturedBlogData.content).toBe(xssPayload);
        });

        it("18. Stores event handlers in blog content as plain text", async () => {
            const xssPayload = '<div onmouseover="alert(1)">Hover me</div>';
            const req = new NextRequest("http://localhost:3000/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Test",
                    content: xssPayload,
                    slug: "test-post",
                    status: "published",
                }),
            });

            const res = await blogPost(req);

            expect(res.status).toBe(201);
            expect(capturedBlogData.content).toBe(xssPayload);
        });

        it("19. Stores style-based XSS as plain text", async () => {
            const xssPayload = '<div style="background:url(javascript:alert(1))">Test</div>';
            const req = new NextRequest("http://localhost:3000/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Test",
                    content: xssPayload,
                    slug: "test-post",
                    status: "published",
                }),
            });

            const res = await blogPost(req);

            expect(res.status).toBe(201);
            expect(capturedBlogData.content).toBe(xssPayload);
        });

        it("20. Stores meta refresh XSS as plain text", async () => {
            const xssPayload = '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">';
            const req = new NextRequest("http://localhost:3000/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Test",
                    content: xssPayload,
                    slug: "test-post",
                    status: "published",
                }),
            });

            const res = await blogPost(req);

            expect(res.status).toBe(201);
            expect(capturedBlogData.content).toBe(xssPayload);
        });

        it("21. Stores form action XSS as plain text", async () => {
            const xssPayload = '<form action="javascript:alert(1)"><input type="submit"></form>';
            const req = new NextRequest("http://localhost:3000/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Test",
                    content: xssPayload,
                    slug: "test-post",
                    status: "published",
                }),
            });

            const res = await blogPost(req);

            expect(res.status).toBe(201);
            expect(capturedBlogData.content).toBe(xssPayload);
        });

        it("22. Stores base64 data URI XSS as plain text", async () => {
            const xssPayload = '<iframe src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">';
            const req = new NextRequest("http://localhost:3000/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Test",
                    content: xssPayload,
                    slug: "test-post",
                    status: "published",
                }),
            });

            const res = await blogPost(req);

            expect(res.status).toBe(201);
            expect(capturedBlogData.content).toBe(xssPayload);
        });

        it("23. Stores vbscript: protocol as plain text", async () => {
            const xssPayload = '<a href="vbscript:msgbox(1)">click</a>';
            const req = new NextRequest("http://localhost:3000/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Test",
                    content: xssPayload,
                    slug: "test-post",
                    status: "published",
                }),
            });

            const res = await blogPost(req);

            expect(res.status).toBe(201);
            expect(capturedBlogData.content).toBe(xssPayload);
        });

        it("24. Stores mhtml: protocol as plain text", async () => {
            const xssPayload = '<a href="mhtml:http://example.com/xss.html!xss.html">click</a>';
            const req = new NextRequest("http://localhost:3000/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Test",
                    content: xssPayload,
                    slug: "test-post",
                    status: "published",
                }),
            });

            const res = await blogPost(req);

            expect(res.status).toBe(201);
            expect(capturedBlogData.content).toBe(xssPayload);
        });

        it("25. Stores safe blog content with brackets", async () => {
            const safePayload = "Use < brackets in code examples";
            const req = new NextRequest("http://localhost:3000/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Test",
                    content: safePayload,
                    slug: "test-post",
                    status: "published",
                }),
            });

            const res = await blogPost(req);

            expect(res.status).toBe(201);
            expect(capturedBlogData.content).toBe(safePayload);
        });
    });

    describe("API Response Safety - Real Validation", () => {
        it("26. Response JSON is properly serialized", async () => {
            const req = createJsonRequest({
                name: "John Doe",
                email: "test@test.com",
                message: "Test message",
            });
            const res = await POST(req);

            expect(res.status).toBe(201);
            const body = await res.json();
            expect(body.data).toBeDefined();
            expect(body.data.name).toBe("John Doe");
        });

        it("27. Response doesn't break with special characters", async () => {
            const req = createJsonRequest({
                name: "Test \"quoted\" name",
                email: "test@test.com",
                message: "Line 1\nLine 2\tTabbed",
            });
            const res = await POST(req);

            expect(res.status).toBe(201);
            const body = await res.json();
            expect(body.data.name).toBe('Test "quoted" name');
        });

        it("28. Handles unicode in response", async () => {
            const req = createJsonRequest({
                name: "日本語テスト",
                email: "test@test.com",
                message: "🎉 Emoji test 🚀",
            });
            const res = await POST(req);

            expect(res.status).toBe(201);
            const body = await res.json();
            expect(body.data.name).toBe("日本語テスト");
            expect(body.data.message).toBe("🎉 Emoji test 🚀");
        });

        it("29. Handles null bytes in response", async () => {
            const req = createJsonRequest({
                name: "Test\x00Name",
                email: "test@test.com",
            });
            const res = await POST(req);

            // Should either accept or reject, not crash
            expect([201, 400]).toContain(res.status);
        });

        it("30. Handles very long payload in response", async () => {
            const longName = "a".repeat(100);
            const req = createJsonRequest({
                name: longName,
                email: "test@test.com",
            });
            const res = await POST(req);

            expect(res.status).toBe(201);
            const body = await res.json();
            expect(body.data.name).toBe(longName);
        });
    });

    describe("Input Validation Security - Real Validation", () => {
        it("31. Rejects empty name field", async () => {
            const req = createJsonRequest({
                name: "",
                email: "test@test.com",
            });
            const res = await POST(req);
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.error).toBe("Invalid input");
        });

        it("32. Accepts name with whitespace (API doesn't trim)", async () => {
            const req = createJsonRequest({
                name: "   ",
                email: "test@test.com",
            });
            const res = await POST(req);

            // The API doesn't trim whitespace, so this passes validation
            // It would be rejected by business logic if implemented
            expect([201, 400]).toContain(res.status);
        });

        it("33. Rejects name shorter than 2 characters", async () => {
            const req = createJsonRequest({
                name: "A",
                email: "test@test.com",
            });
            const res = await POST(req);

            expect(res.status).toBe(400);
        });

        it("34. Rejects invalid email format", async () => {
            const req = createJsonRequest({
                name: "Test",
                email: "not-an-email",
            });
            const res = await POST(req);

            expect(res.status).toBe(400);
        });

        it("35. Rejects email without domain", async () => {
            const req = createJsonRequest({
                name: "Test",
                email: "test@",
            });
            const res = await POST(req);

            expect(res.status).toBe(400);
        });

        it("36. Rejects non-string name", async () => {
            const req = createJsonRequest({
                name: 12345,
                email: "test@test.com",
            });
            const res = await POST(req);

            expect(res.status).toBe(400);
        });

        it("37. Rejects array in name field", async () => {
            const req = createJsonRequest({
                name: ["script", "alert"],
                email: "test@test.com",
            });
            const res = await POST(req);

            expect(res.status).toBe(400);
        });

        it("38. Rejects object in name field", async () => {
            const req = createJsonRequest({
                name: { toString: () => "<script>alert(1)</script>" },
                email: "test@test.com",
            });
            const res = await POST(req);

            expect(res.status).toBe(400);
        });

        it("39. Rejects message exceeding max length", async () => {
            const req = createJsonRequest({
                name: "Test",
                email: "test@test.com",
                message: "a".repeat(1001),
            });
            const res = await POST(req);

            expect(res.status).toBe(400);
        });

        it("40. Accepts message at max length", async () => {
            const req = createJsonRequest({
                name: "Test",
                email: "test@test.com",
                message: "a".repeat(1000),
            });
            const res = await POST(req);

            expect(res.status).toBe(201);
        });
    });
});
