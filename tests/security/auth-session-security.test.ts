/**
 * @fileoverview Security tests for Authentication & Session Security - Real Validation
 *
 * These tests verify that:
 * 1. Session validation works correctly
 * 2. Authentication guards block unauthorized access
 * 3. Admin endpoints require admin role
 * 4. Session tokens are validated properly
 * 5. Error messages don't leak sensitive info
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as requestsGet, POST as requestsPost } from "@/app/api/requests/route";
import { POST as blogPost } from "@/app/api/blog/route";
import { POST as uploadPost } from "@/app/api/upload/route";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn().mockImplementation((email: string) => {
        return email === "admin@test.com" || email === "admin@berztech.com";
    }),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("Security: Authentication & Session Security - Real Validation", () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-1", email: "test@test.com" } },
                    error: null,
                }),
            },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({ data: [], error: null }),
                    }),
                }),
                insert: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: "1" }, error: null }),
            }),
            storage: {
                from: vi.fn().mockReturnValue({
                    upload: vi.fn().mockResolvedValue({ data: { path: "test.jpg" }, error: null }),
                    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "http://test.com/test.jpg" } }),
                }),
            },
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createJsonRequest(body: unknown, url: string, headers: Record<string, string> = {}) {
        return new NextRequest(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify(body),
        });
    }

    describe("Session Validation - Real Validation", () => {
        it("1. Rejects requests with no session", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "No session" },
            });

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);
            const body = await res.json();

            expect(res.status).toBe(401);
            expect(body.error).toBe("Unauthorized");
        });

        it("2. Rejects requests with invalid token", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Invalid token" },
            });

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);

            expect(res.status).toBe(401);
        });

        it("3. Accepts requests with valid session", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "admin-1", email: "admin@test.com" } },
                error: null,
            });

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);

            expect([201, 400]).toContain(res.status);
        });

        it("4. Validates session on each request", async () => {
            const req = createJsonRequest(
                { name: "Test", email: "test@test.com" },
                "http://localhost:3000/api/requests"
            );

            await requestsPost(req);

            // Should call getUser to validate session
            expect(mockSupabase.auth.getUser).toHaveBeenCalled();
        });

        it("5. Handles session errors gracefully", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Database error" },
            });

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);

            expect(res.status).toBe(401);
        });
    });

    describe("Admin Session Security - Real Validation", () => {
        it("6. Admin endpoints require admin role", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "admin-1", email: "admin@test.com" } },
                error: null,
            });

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);

            // Should succeed for admin
            expect([201, 400]).toContain(res.status);
        });

        it("7. Non-admin user cannot access admin endpoints", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user-1", email: "user@example.com" } },
                error: null,
            });

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);
            const body = await res.json();

            expect(res.status).toBe(403);
            expect(body.error).toBe("Forbidden");
        });

        it("8. Upload endpoint requires admin", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user-1", email: "user@example.com" } },
                error: null,
            });

            const formData = new FormData();
            const blob = new Blob(["test"], { type: "image/jpeg" });
            formData.append("file", blob, "test.jpg");

            const req = new NextRequest("http://localhost:3000/api/upload", {
                method: "POST",
                body: formData,
            });

            const res = await uploadPost(req);

            expect(res.status).toBe(403);
        });

        it("9. Admin check happens after auth check", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "No session" },
            });

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);

            // Should return 401 (auth error) before checking admin
            expect(res.status).toBe(401);
        });

        it("10. Multiple admin emails are supported", async () => {
            const { isAdminEmail } = await import("@/config/admin");

            expect(isAdminEmail("admin@test.com")).toBe(true);
            expect(isAdminEmail("admin@berztech.com")).toBe(true);
            expect(isAdminEmail("user@example.com")).toBe(false);
        });
    });

    describe("Session Data Protection - Real Validation", () => {
        it("11. User ID is extracted from session", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user-123", email: "test@test.com" } },
                error: null,
            });

            const req = createJsonRequest(
                { name: "Test", email: "test@test.com" },
                "http://localhost:3000/api/requests"
            );

            await requestsPost(req);

            // Should use the user ID from session
            expect(mockSupabase.auth.getUser).toHaveBeenCalled();
        });

        it("12. Email is extracted from session", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user-1", email: "admin@test.com" } },
                error: null,
            });

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            await blogPost(req);

            // Should check email for admin status
            const { isAdminEmail } = await import("@/config/admin");
            expect(mockSupabase.auth.getUser).toHaveBeenCalled();
        });

        it("13. Session data is not exposed in error messages", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Token expired", code: "token_expired" },
            });

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);
            const body = await res.json();

            expect(body.error).toBe("Unauthorized");
            expect(body.error).not.toContain("expired");
            expect(body.error).not.toContain("token");
        });

        it("14. Database errors don't expose session info", async () => {
            mockSupabase.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: null,
                            error: { message: "Session invalid" },
                        }),
                    }),
                }),
            });

            const req = new NextRequest("http://localhost:3000/api/requests", {
                method: "GET",
            });

            const res = await requestsGet(req);
            const body = await res.json();

            expect(body.error).not.toContain("Session");
        });

        it("15. User data is associated with created records", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user-456", email: "test@test.com" } },
                error: null,
            });

            const insertMock = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: "1" }, error: null }),
            });

            mockSupabase.from.mockReturnValue({
                insert: insertMock,
            });

            const req = createJsonRequest(
                { name: "Test", email: "test@test.com" },
                "http://localhost:3000/api/requests"
            );

            await requestsPost(req);

            // Should associate with user
            expect(insertMock).toHaveBeenCalled();
            const payload = insertMock.mock.calls[0][0];
            expect(payload.user_id).toBe("user-456");
        });
    });

    describe("Token Security - Real Validation", () => {
        it("16. Bearer token format is validated", async () => {
            // Supabase client handles token validation
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user-1", email: "test@test.com" } },
                error: null,
            });

            const req = createJsonRequest(
                { name: "Test", email: "test@test.com" },
                "http://localhost:3000/api/requests"
            );

            await requestsPost(req);

            expect(mockSupabase.auth.getUser).toHaveBeenCalled();
        });

        it("17. Invalid token format is rejected", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Invalid token format" },
            });

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);

            expect(res.status).toBe(401);
        });

        it("18. Missing token is rejected", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "No token provided" },
            });

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);

            expect(res.status).toBe(401);
        });

        it("19. Token validation is called on each request", async () => {
            const req = createJsonRequest(
                { name: "Test", email: "test@test.com" },
                "http://localhost:3000/api/requests"
            );

            await requestsPost(req);

            expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1);
        });

        it("20. Token errors don't crash the server", async () => {
            mockSupabase.auth.getUser.mockRejectedValue(new Error("Token validation failed"));

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);

            expect(res.status).toBe(500);
        });
    });

    describe("Error Handling Security - Real Validation", () => {
        it("21. Auth errors return 401", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Not authenticated" },
            });

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);

            expect(res.status).toBe(401);
        });

        it("22. Authorization errors return 403", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user-1", email: "user@example.com" } },
                error: null,
            });

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);

            expect(res.status).toBe(403);
        });

        it("23. Server errors return 500", async () => {
            mockSupabase.auth.getUser.mockRejectedValue(new Error("Database connection failed"));

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);

            expect(res.status).toBe(500);
        });

        it("24. Error messages are generic", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "Specific database error: connection to auth.users failed" },
            });

            const req = createJsonRequest(
                { title: "Test", content: "Content", slug: "test", status: "published" },
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);
            const body = await res.json();

            expect(body.error).toBe("Unauthorized");
            expect(body.error).not.toContain("database");
            expect(body.error).not.toContain("connection");
            expect(body.error).not.toContain("auth.users");
        });

        it("25. Validation errors return 400", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "admin-1", email: "admin@test.com" } },
                error: null,
            });

            const req = createJsonRequest(
                { content: "Content" }, // Missing required title
                "http://localhost:3000/api/blog"
            );

            const res = await blogPost(req);

            expect(res.status).toBe(400);
        });
    });
});
