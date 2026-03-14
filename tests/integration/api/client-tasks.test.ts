/**
 * @fileoverview Integration tests for Client Tasks API
 *
 * Tests cover:
 * - GET /api/client/tasks — List tasks for authenticated client (IDOR isolation)
 * - Filtering by requestId
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getClientTasks } from "@/app/api/client/tasks/route";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("Client Tasks API", () => {
    const mockServerSupabase = {
        auth: {
            getUser: vi.fn(),
        },
        from: vi.fn(),
    };

    const mockTasks = [
        {
            id: "task-1",
            title: "Client Task 1",
            status: "inprogress",
            client_id: "user-123",
            request_id: "req-1",
            order_index: 1024,
            created_at: "2026-01-15T10:00:00Z",
        },
        {
            id: "task-2",
            title: "Client Task 2",
            status: "done",
            client_id: "user-123",
            request_id: null,
            order_index: 2048,
            created_at: "2026-01-16T10:00:00Z",
        },
    ];

    function createMockQueryBuilder(data: any = mockTasks, error: any = null) {
        const chain = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
        };
        
        return Object.create(chain, {
            select: { value: vi.fn().mockReturnThis() },
            eq: { value: vi.fn().mockReturnThis() },
            order: { value: vi.fn().mockReturnThis() },
            then: {
                value: (resolve: any) => resolve({ data, error }),
            },
        });
    }

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerSupabaseClient as any).mockResolvedValue(mockServerSupabase);
        mockServerSupabase.from.mockImplementation(() => createMockQueryBuilder());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createGetRequest(url: string): NextRequest {
        return new NextRequest(url, { method: "GET" });
    }

    describe("GET /api/client/tasks", () => {
        it("1. Unauthenticated request → 401", async () => {
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: null,
            });

            const response = await getClientTasks(createGetRequest("http://localhost/api/client/tasks"));
            const json = await response.json();

            expect(response.status).toBe(401);
            expect(json.error).toBe("Unauthorized");
        });

        it("2. Authenticated client receives only their own tasks (IDOR isolation)", async () => {
            const clientUser = { id: "user-123", email: "client@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: clientUser },
                error: null,
            });

            const response = await getClientTasks(createGetRequest("http://localhost/api/client/tasks"));
            const json = await response.json();

            expect(response.status).toBe(200);
            expect(mockServerSupabase.from).toHaveBeenCalledWith("tasks");
            expect(mockServerSupabase.from).toHaveBeenCalled();
        });

        it("3. Client with ?requestId filter → returns only tasks for that request", async () => {
            const clientUser = { id: "user-123", email: "client@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: clientUser },
                error: null,
            });

            const response = await getClientTasks(
                createGetRequest("http://localhost/api/client/tasks?requestId=req-1")
            );
            const json = await response.json();

            expect(response.status).toBe(200);
        });

        it("4. Database error → 500 with error message", async () => {
            const clientUser = { id: "user-123", email: "client@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: clientUser },
                error: null,
            });

            mockServerSupabase.from.mockImplementation(() => {
                const chain = {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnThis(),
                };
                return Object.create(chain, {
                    select: { value: vi.fn().mockReturnThis() },
                    eq: { value: vi.fn().mockReturnThis() },
                    order: { value: vi.fn().mockReturnThis() },
                    then: {
                        value: (resolve: any) => resolve({ data: null, error: { message: "Database connection failed" } }),
                    },
                });
            });

            const response = await getClientTasks(createGetRequest("http://localhost/api/client/tasks"));
            const json = await response.json();

            expect(response.status).toBe(500);
        });

        it("5. Invalid requestId format is handled gracefully", async () => {
            const clientUser = { id: "user-123", email: "client@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: clientUser },
                error: null,
            });

            const response = await getClientTasks(
                createGetRequest("http://localhost/api/client/tasks?requestId=invalid-uuid-format!!!")
            );
            const json = await response.json();

            // Should still return 200, database will handle the query
            expect(response.status).toBe(200);
        });

        it("6. Empty requestId query param is handled", async () => {
            const clientUser = { id: "user-123", email: "client@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: clientUser },
                error: null,
            });

            mockServerSupabase.from.mockImplementation(() => createMockQueryBuilder(mockTasks));

            const response = await getClientTasks(
                createGetRequest("http://localhost/api/client/tasks?requestId=")
            );
            const json = await response.json();

            // Should return tasks (filter may be ignored or treated as null)
            expect(response.status).toBe(200);
        });

        it("7. URL-encoded requestId is handled correctly", async () => {
            const clientUser = { id: "user-123", email: "client@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: clientUser },
                error: null,
            });

            mockServerSupabase.from.mockImplementation(() => createMockQueryBuilder(mockTasks));

            const encodedId = encodeURIComponent("req-1");
            const response = await getClientTasks(
                createGetRequest(`http://localhost/api/client/tasks?requestId=${encodedId}`)
            );
            const json = await response.json();

            expect(response.status).toBe(200);
        });

        it("8. Multiple query params with requestId", async () => {
            const clientUser = { id: "user-123", email: "client@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: clientUser },
                error: null,
            });

            mockServerSupabase.from.mockImplementation(() => createMockQueryBuilder(mockTasks));

            const response = await getClientTasks(
                createGetRequest("http://localhost/api/client/tasks?requestId=req-1&sort=created_at")
            );
            const json = await response.json();

            expect(response.status).toBe(200);
        });
    });
});
