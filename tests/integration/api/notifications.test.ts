/**
 * @fileoverview Integration tests for Notifications API
 *
 * Tests cover:
 * - GET /api/notifications — List notifications (auto-cleanup of old read)
 * - PATCH /api/notifications/read — Mark as read (single or all)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getNotifications } from "@/app/api/notifications/route";
import { PATCH as markRead } from "@/app/api/notifications/read/route";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

describe("Notifications API", () => {
    const mockServerSupabase = {
        auth: {
            getUser: vi.fn(),
        },
    };

    const mockAdminClient = {
        from: vi.fn(),
    };

    const mockNotifications = [
        {
            id: "notif-1",
            user_id: "user-123",
            title: "Task Updated",
            message: "Your task status changed",
            is_read: false,
            created_at: "2026-01-15T10:00:00Z",
            tasks: { title: "Fix bug", status: "inprogress" },
        },
        {
            id: "notif-2",
            user_id: "user-123",
            title: "New Comment",
            message: "Admin commented on your request",
            is_read: true,
            created_at: "2026-01-14T10:00:00Z",
            tasks: null,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerSupabaseClient as any).mockResolvedValue(mockServerSupabase);
        (createAdminClient as any).mockReturnValue(mockAdminClient);

        mockServerSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-123", email: "user@example.com" } },
            error: null,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createJsonRequest(url: string, body?: unknown, method = "POST"): NextRequest {
        const options: any = { method };
        if (body) {
            options.body = JSON.stringify(body);
            options.headers = { "Content-Type": "application/json" };
        }
        return new NextRequest(url, options);
    }

    function createQueryBuilder(resolveValue: any) {
        const builder: any = {
            delete: vi.fn(() => builder),
            update: vi.fn(() => builder),
            select: vi.fn(() => builder),
            eq: vi.fn(() => builder),
            lt: vi.fn(() => builder),
            order: vi.fn(() => builder),
            limit: vi.fn(() => builder),
            single: vi.fn(() => builder),
            then: (resolve: any) => resolve(resolveValue),
        };
        return builder;
    }

    function setupGetMocks(returnError = false) {
        const mockDelete = createQueryBuilder({ error: null });
        const mockSelect = createQueryBuilder({ 
            data: returnError ? null : mockNotifications, 
            error: returnError ? { message: "Database error" } : null 
        });

        mockAdminClient.from
            .mockReturnValueOnce(mockDelete)
            .mockReturnValue(mockSelect);
    }

    function setupPatchMocks(returnError = false) {
        mockAdminClient.from.mockReturnValue(createQueryBuilder({
            data: returnError ? null : { id: "notif-1", is_read: true },
            error: returnError ? { message: "No rows found" } : null,
        }));
    }

    describe("GET /api/notifications", () => {
        it("1. Unauthenticated request → 401", async () => {
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: null,
            });

            const response = await getNotifications(createJsonRequest("http://localhost/api/notifications", null, "GET"));
            const json = await response.json();

            expect(response.status).toBe(401);
            expect(json.error).toBe("Unauthorized");
        });

        it("2. Authenticated user receives their notifications", async () => {
            setupGetMocks(false);

            const response = await getNotifications(createJsonRequest("http://localhost/api/notifications", null, "GET"));
            const json = await response.json();

            expect(response.status).toBe(200);
            expect(json.data).toEqual(mockNotifications);
        });

        it("3. Database error → 500 with error message", async () => {
            setupGetMocks(true);

            const response = await getNotifications(createJsonRequest("http://localhost/api/notifications", null, "GET"));
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json.error).toBe("Database error");
        });
    });

    describe("PATCH /api/notifications/read", () => {
        it("4. Unauthenticated request → 401", async () => {
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: null,
            });

            const response = await markRead(createJsonRequest("http://localhost/api/notifications/read", { id: "notif-1" }));
            const json = await response.json();

            expect(response.status).toBe(401);
            expect(json.error).toBe("Unauthorized");
        });

        it("5. Mark single notification as read → 200", async () => {
            setupPatchMocks(false);

            const response = await markRead(createJsonRequest("http://localhost/api/notifications/read", { id: "notif-1" }));
            const json = await response.json();

            expect(response.status).toBe(200);
        });

        it("6. Mark all notifications as read → 200", async () => {
            mockAdminClient.from.mockReturnValue(createQueryBuilder({ error: null }));

            const response = await markRead(createJsonRequest("http://localhost/api/notifications/read", { all: true }));
            const json = await response.json();

            expect(response.status).toBe(200);
            expect(json.success).toBe(true);
        });

        it("7. No id or all provided → 400", async () => {
            const response = await markRead(createJsonRequest("http://localhost/api/notifications/read", {}));
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toBe("Provide 'id' or 'all: true'");
        });

        it("8. Single mark read with invalid id → 500", async () => {
            setupPatchMocks(true);

            const response = await markRead(createJsonRequest("http://localhost/api/notifications/read", { id: "invalid-id" }));
            const json = await response.json();

            expect(response.status).toBe(500);
        });
    });
});
