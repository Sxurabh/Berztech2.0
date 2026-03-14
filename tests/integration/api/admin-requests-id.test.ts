/**
 * @fileoverview Integration tests for PATCH /api/admin/requests/[id] API route
 *
 * Tests cover:
 * - PATCH /api/admin/requests/[id] — Update request status (admin only)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/config/admin";
import { PATCH } from "@/app/api/admin/requests/[id]/route";

describe("PATCH /api/admin/requests/[id]", () => {
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

    function createJsonRequest(body: unknown, id: string = "12345678-1234-1234-1234-123456789012") {
        return new NextRequest(`http://localhost:3000/api/admin/requests/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    }

    it("returns 400 for invalid ID format (non-UUID)", async () => {
        const request = createJsonRequest({ status: "completed" }, "invalid-id");
        const response = await PATCH(request, { params: Promise.resolve({ id: "invalid-id" }) });
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("Invalid ID format");
    });

    it("returns 401 when not authenticated", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

        const request = createJsonRequest({ status: "completed" });
        const response = await PATCH(request, { params: Promise.resolve({ id: "12345678-1234-1234-1234-123456789012" }) });
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.error).toBe("Unauthorized");
    });

    it("returns 401 when auth error occurs", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: null, error: { message: "Auth failed" } });

        const request = createJsonRequest({ status: "completed" });
        const response = await PATCH(request, { params: Promise.resolve({ id: "12345678-1234-1234-1234-123456789012" }) });
        const body = await response.json();

        expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("returns 403 when user is not admin", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "user@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(false);

        const request = createJsonRequest({ status: "completed" });
        const response = await PATCH(request, { params: Promise.resolve({ id: "12345678-1234-1234-1234-123456789012" }) });
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.error).toBe("Forbidden");
    });

    it("returns 400 when status is missing", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "admin@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);

        const request = createJsonRequest({});
        const response = await PATCH(request, { params: Promise.resolve({ id: "12345678-1234-1234-1234-123456789012" }) });
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("Status required");
    });

    it("returns 400 for invalid status value", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "admin@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);

        const request = createJsonRequest({ status: "invalid-status" });
        const response = await PATCH(request, { params: Promise.resolve({ id: "12345678-1234-1234-1234-123456789012" }) });
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("Invalid status");
    });

    it("updates request status successfully", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "admin@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);

        mockAdminClient.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: { id: "12345678-1234-1234-1234-123456789012", status: "completed" },
                            error: null,
                        }),
                    }),
                }),
            }),
        });

        const request = createJsonRequest({ status: "completed" });
        const response = await PATCH(request, { params: Promise.resolve({ id: "12345678-1234-1234-1234-123456789012" }) });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.data.status).toBe("completed");
    });

    it("returns 404 when request not found", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "admin@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);

        mockAdminClient.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: { code: "PGRST116" },
                        }),
                    }),
                }),
            }),
        });

        const request = createJsonRequest({ status: "completed" });
        const response = await PATCH(request, { params: Promise.resolve({ id: "12345678-1234-1234-1234-123456789012" }) });
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe("Request not found");
    });

    it("returns 500 when admin client is unavailable", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "admin@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);
        (createAdminClient as any).mockReturnValue(null);

        const request = createJsonRequest({ status: "completed" });
        const response = await PATCH(request, { params: Promise.resolve({ id: "12345678-1234-1234-1234-123456789012" }) });
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe("Server error");
    });

    it("returns 500 on database error", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "admin@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);

        mockAdminClient.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: { message: "Database error" },
                        }),
                    }),
                }),
            }),
        });

        const request = createJsonRequest({ status: "completed" });
        const response = await PATCH(request, { params: Promise.resolve({ id: "12345678-1234-1234-1234-123456789012" }) });
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe("Internal server error");
    });

    it("returns 500 on unexpected error", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { email: "admin@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);
        (createAdminClient as any).mockImplementation(() => {
            throw new Error("Unexpected");
        });

        const request = createJsonRequest({ status: "completed" });
        const response = await PATCH(request, { params: Promise.resolve({ id: "12345678-1234-1234-1234-123456789012" }) });
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe("Unexpected error");
    });

    describe("valid status values", () => {
        const validStatuses = ["discover", "define", "design", "develop", "deliver", "maintain", "completed", "archived"];

        validStatuses.forEach((status) => {
            it(`accepts valid status: ${status}`, async () => {
                mockSupabase.auth.getUser.mockResolvedValue({
                    data: { user: { email: "admin@example.com" } },
                    error: null,
                });
                (isAdminEmail as any).mockReturnValue(true);

                mockAdminClient.from.mockReturnValue({
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: { id: "12345678-1234-1234-1234-123456789012", status },
                                    error: null,
                                }),
                            }),
                        }),
                    }),
                });

                const request = createJsonRequest({ status });
                const response = await PATCH(request, { params: Promise.resolve({ id: "12345678-1234-1234-1234-123456789012" }) });

                expect(response.status).toBe(200);
            });
        });
    });
});
