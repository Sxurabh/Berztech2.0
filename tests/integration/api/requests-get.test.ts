/**
 * @fileoverview Integration tests for GET /api/requests
 *
 * Tests cover:
 * - GET /api/requests — Authenticated user receives own requests
 * - Auth guard — Unauthenticated → 401
 * - Database error → 500
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getRequests } from "@/app/api/requests/route";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("GET /api/requests", () => {
    const mockRequests = [
        { id: "req-1", name: "John", email: "john@example.com", status: "discover", created_at: "2026-01-15T10:00:00Z" },
        { id: "req-2", name: "John", email: "john@example.com", status: "inprogress", created_at: "2026-01-14T10:00:00Z" },
    ];

    function createQueryBuilder(resolveValue: any) {
        const builder: any = {
            select: vi.fn(() => builder),
            eq: vi.fn(() => builder),
            order: vi.fn(() => builder),
            then: (resolve: any) => resolve(resolveValue),
        };
        return builder;
    }

    const mockSupabase: any = {
        auth: { getUser: vi.fn() },
        from: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createGetRequest(): NextRequest {
        return new NextRequest("http://localhost/api/requests", { method: "GET" });
    }

    it("1. Unauthenticated request → 401", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: "No session" },
        });

        const response = await getRequests(createGetRequest());
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json.error).toBe("Unauthorized");
    });

    it("2. Authenticated user receives their own requests", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-123", email: "john@example.com" } },
            error: null,
        });
        mockSupabase.from.mockReturnValue(createQueryBuilder({ data: mockRequests, error: null }));

        const response = await getRequests(createGetRequest());
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.data).toEqual(mockRequests);
        expect(json.data).toHaveLength(2);
    });

    it("3. Database error → 500", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-123", email: "john@example.com" } },
            error: null,
        });
        mockSupabase.from.mockReturnValue(createQueryBuilder({ data: null, error: { message: "DB error" } }));

        const response = await getRequests(createGetRequest());
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.error).toBe("DB error");
    });

    it("4. Authenticated user with no requests returns empty array", async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-456", email: "new@example.com" } },
            error: null,
        });
        mockSupabase.from.mockReturnValue(createQueryBuilder({ data: [], error: null }));

        const response = await getRequests(createGetRequest());
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.data).toEqual([]);
    });
});
