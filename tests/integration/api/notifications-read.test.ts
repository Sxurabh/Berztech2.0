/**
 * @fileoverview Integration tests for POST /api/notifications/read API route
 *
 * Tests cover:
 * - PATCH /api/notifications/read — Mark notifications as read
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PATCH } from "@/app/api/notifications/read/route";

describe("PATCH /api/notifications/read", () => {
    const mockSupabase: any = {
        auth: { getUser: vi.fn() },
    };

    const mockAdminClient: any = {
        from: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
        (createAdminClient as any).mockReturnValue(mockAdminClient);
    });

    function createJsonRequest(body: unknown) {
        return new NextRequest("http://localhost:3000/api/notifications/read", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    }

    it("returns 401 when not authenticated", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        const request = createJsonRequest({ id: "notif-1" });
        const response = await PATCH(request);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.error).toBe("Unauthorized");
    });

    it("returns 401 when auth error occurs", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: null, error: { message: "Auth failed" } });

        const request = createJsonRequest({ id: "notif-1" });
        const response = await PATCH(request);
        const body = await response.json();

        expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("marks single notification as read", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
        });

        mockAdminClient.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: { id: "notif-1", is_read: true },
                                error: null,
                            }),
                        }),
                    }),
                }),
            }),
        });

        const request = createJsonRequest({ id: "notif-1" });
        const response = await PATCH(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.data).toBeDefined();
    });

    it("marks all notifications as read when all: true", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
        });

        mockAdminClient.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        resolve: vi.fn().mockResolvedValue({ error: null }),
                    }),
                }),
            }),
        });

        const request = createJsonRequest({ all: true });
        const response = await PATCH(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
    });

    it("returns 400 when neither id nor all provided", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
        });

        const request = createJsonRequest({});
        const response = await PATCH(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("Provide 'id' or 'all: true'");
    });

    it("returns 500 when admin update fails", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
        });

        mockAdminClient.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: { message: "Update failed" },
                            }),
                        }),
                    }),
                }),
            }),
        });

        const request = createJsonRequest({ id: "notif-1" });
        const response = await PATCH(request);
        const body = await response.json();

        expect(response.status).toBe(500);
    });

    it("returns 500 on unexpected error", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-1" } },
            error: null,
        });

        mockAdminClient.from.mockImplementation(() => {
            throw new Error("Unexpected");
        });

        const request = createJsonRequest({ id: "notif-1" });
        const response = await PATCH(request);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe("Unexpected error");
    });
});
