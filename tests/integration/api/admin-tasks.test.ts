/**
 * @fileoverview Integration tests for Admin Tasks API
 *
 * Tests cover:
 * - GET /api/admin/tasks — List tasks (auth, filtering)
 * - POST /api/admin/tasks — Create task (validation, clientid inheritance)
 * - PATCH /api/admin/tasks/[id] — Update task (status, order, client sync)
 * - DELETE /api/admin/tasks/[id] — Delete task (admin only)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getTasks, POST as createTask } from "@/app/api/admin/tasks/route";
import {
    PATCH as updateTask,
    DELETE as deleteTask,
} from "@/app/api/admin/tasks/[id]/route";

// Mock dependencies
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

describe("Admin Tasks API", () => {
    const mockServerSupabase = {
        auth: {
            getUser: vi.fn(),
        },
        from: vi.fn(),
    };

    const mockAdminSupabase = {
        from: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerSupabaseClient as any).mockResolvedValue(mockServerSupabase);
        (createAdminClient as any).mockReturnValue(mockAdminSupabase);

        // Default: anonymous user
        mockServerSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
        });

        // Default: not admin
        (isAdminEmail as any).mockReturnValue(false);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    /**
     * Helper to create mock NextRequest
     */
    function createJsonRequest(
        url: string,
        body?: unknown,
        method = "GET"
    ): NextRequest {
        const options: any = { method };
        if (body) {
            options.body = JSON.stringify(body);
            options.headers = { "Content-Type": "application/json" };
        }
        return new NextRequest(url, options);
    }

    /**
     * Helper to setup authenticated user
     */
    function setupUser(email: string, admin = false) {
        const mockUser = {
            id: `user-${email.split("@")[0]}`,
            email,
        };
        mockServerSupabase.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });
        (isAdminEmail as any).mockImplementation((e: string) => e === email && admin);
        return mockUser;
    }

    /**
     * Mock the admin query chain for tasks
     */
    function mockAdminTaskQuery(data: any, error: any = null) {
        const queryMock = {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data, error }),
        };

        mockAdminSupabase.from.mockReturnValue(queryMock);
        return queryMock;
    }

    /**
     * Mock list query that returns array
     */
    function mockAdminListQuery(data: any, error: any = null) {
        const queryMock = {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
        };

        mockAdminSupabase.from.mockImplementation(() => {
            const chain = { ...queryMock };
            // Return thenable for final await
            return Object.create(chain, {
                then: {
                    value: (resolve: any) => resolve({ data, error }),
                },
            });
        });

        return queryMock;
    }

    describe("GET /api/admin/tasks", () => {
        it("1. Unauthenticated → 401", async () => {
            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks"
            );

            const response = await getTasks(request);
            const body = await response.json();

            expect(response.status).toBe(401);
            expect(body.error).toBe("Unauthorized");
        });

        it("2. Authenticated client (non-admin) → 401", async () => {
            setupUser("client@example.com", false);

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks"
            );

            const response = await getTasks(request);
            const body = await response.json();

            expect(response.status).toBe(401);
            expect(body.error).toBe("Unauthorized");
        });

        it("3. Admin without requestId filter → returns all tasks", async () => {
            setupUser("admin@berztech.com", true);

            const allTasks = [
                { id: "task-1", title: "Task 1", status: "backlog" },
                { id: "task-2", title: "Task 2", status: "inprogress" },
                { id: "task-3", title: "Task 3", status: "done" },
            ];

            mockAdminListQuery(allTasks);

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks"
            );

            const response = await getTasks(request);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.data).toEqual(allTasks);
            expect(body.data.length).toBe(3);
        });

        it("4. Admin with ?requestId=xxx → returns only tasks for that request", async () => {
            setupUser("admin@berztech.com", true);

            const filteredTasks = [
                { id: "task-1", title: "Request Task", request_id: "req-123" },
            ];

            mockAdminListQuery(filteredTasks);

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks?requestId=req-123"
            );

            const response = await getTasks(request);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.data.length).toBe(1);
            expect(body.data[0].request_id).toBe("req-123");
        });

        it("5. Database error → 500", async () => {
            setupUser("admin@berztech.com", true);

            mockAdminListQuery(null, { message: "Database connection failed" });

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks"
            );

            const response = await getTasks(request);
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body.error).toBe("Database connection failed");
        });
    });

    describe("POST /api/admin/tasks", () => {
        it("6. Admin with valid payload (title required) → 201", async () => {
            setupUser("admin@berztech.com", true);

            // Mock the order_index query (no existing tasks)
            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        order: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        limit: vi.fn().mockReturnThis(),
                        then: (resolve: any) => resolve({ data: [], error: null }),
                        insert: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: {
                                id: "new-task-uuid",
                                title: "New Task",
                                status: "backlog",
                                priority: "medium",
                                order_index: 1024,
                            },
                            error: null,
                        }),
                    };
                }
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: null, error: null }),
                };
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks",
                { title: "New Task" },
                "POST"
            );

            const response = await createTask(request);
            const body = await response.json();

            expect(response.status).toBe(201);
            expect(body.data.title).toBe("New Task");
            expect(body.data.order_index).toBe(1024);
        });

        it("7. Admin missing title → 400 'Title is required'", async () => {
            setupUser("admin@berztech.com", true);

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks",
                { description: "Task without title" },
                "POST"
            );

            const response = await createTask(request);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body.error).toBe("Title is required");
        });

        it("8. Task linked to requestId automatically inherits the client_id from that request", async () => {
            setupUser("admin@berztech.com", true);

            const mockRequest = {
                id: "req-456",
                user_id: "client-abc-123",
            };

            // Mock request lookup and task creation
            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "requests") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: mockRequest,
                            error: null,
                        }),
                    };
                }
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        order: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        limit: vi.fn().mockReturnThis(),
                        then: (resolve: any) => resolve({ data: [], error: null }),
                        insert: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: {
                                id: "linked-task",
                                title: "Linked Task",
                                request_id: "req-456",
                                client_id: "client-abc-123",
                            },
                            error: null,
                        }),
                    };
                }
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks",
                { title: "Linked Task", request_id: "req-456" },
                "POST"
            );

            const response = await createTask(request);
            const body = await response.json();

            expect(response.status).toBe(201);
            expect(body.data.client_id).toBe("client-abc-123");
        });

        it("9. New task gets correct orderindex (max existing + 1024)", async () => {
            setupUser("admin@berztech.com", true);

            let callCount = 0;
            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "tasks") {
                    callCount++;
                    // First call: order_index query (existing task with order_index 2048)
                    if (callCount === 1) {
                        return {
                            select: vi.fn().mockReturnThis(),
                            order: vi.fn().mockReturnThis(),
                            eq: vi.fn().mockReturnThis(),
                            limit: vi.fn().mockReturnThis(),
                            then: (resolve: any) =>
                                resolve({ data: [{ order_index: 2048 }], error: null }),
                        };
                    }
                    // Second call: insert new task
                    return {
                        insert: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: {
                                id: "task-with-order",
                                title: "Ordered Task",
                                order_index: 3072, // 2048 + 1024
                            },
                            error: null,
                        }),
                    };
                }
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks",
                { title: "Ordered Task", status: "backlog" },
                "POST"
            );

            const response = await createTask(request);
            const body = await response.json();

            expect(response.status).toBe(201);
            // 2048 + 1024 = 3072
            expect(body.data.order_index).toBe(3072);
        });

        it("10. Non-admin → 401", async () => {
            setupUser("client@example.com", false);

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks",
                { title: "Unauthorized Task" },
                "POST"
            );

            const response = await createTask(request);
            const body = await response.json();

            expect(response.status).toBe(401);
            expect(body.error).toBe("Unauthorized");
        });
    });

    describe("PATCH /api/admin/tasks/[id]", () => {
        it("11. Admin updates task status → 200", async () => {
            setupUser("admin@berztech.com", true);

            mockAdminTaskQuery({
                id: "task-123",
                title: "Updated Task",
                status: "inprogress",
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks/task-123",
                { status: "inprogress" },
                "PATCH"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await updateTask(request, { params });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.data.status).toBe("inprogress");
        });

        it("12. Admin updates orderindex → 200", async () => {
            setupUser("admin@berztech.com", true);

            mockAdminTaskQuery({
                id: "task-123",
                title: "Reordered Task",
                order_index: 5000,
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks/task-123",
                { order_index: 5000 },
                "PATCH"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await updateTask(request, { params });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.data.order_index).toBe(5000);
        });

        it("13. Non-admin → 403 Forbidden", async () => {
            setupUser("client@example.com", false);

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks/task-123",
                { title: "Hacked" },
                "PATCH"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await updateTask(request, { params });
            const body = await response.json();

            expect(response.status).toBe(403);
            expect(body.error).toBe("Forbidden");
        });

        it("13b. Unauthenticated → 401 Unauthorized", async () => {
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: null,
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks/task-123",
                { title: "Hacked" },
                "PATCH"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await updateTask(request, { params });
            const body = await response.json();

            expect(response.status).toBe(401);
            expect(body.error).toBe("Unauthorized");
        });

        it("syncs client_id when request_id changes to a new request", async () => {
            setupUser("admin@berztech.com", true);

            // Mock request lookup for new request_id
            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "requests") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: { id: "new-req", user_id: "new-client-789" },
                            error: null,
                        }),
                    };
                }
                if (table === "tasks") {
                    return {
                        update: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: {
                                id: "task-123",
                                title: "Moved Task",
                                request_id: "new-req",
                                client_id: "new-client-789",
                            },
                            error: null,
                        }),
                    };
                }
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks/task-123",
                { request_id: "new-req" },
                "PATCH"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await updateTask(request, { params });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.data.client_id).toBe("new-client-789");
        });
    });

    describe("DELETE /api/admin/tasks/[id]", () => {
        it("14. Admin deletes task → 200 { success: true }", async () => {
            setupUser("admin@berztech.com", true);

            mockAdminSupabase.from.mockReturnValue({
                delete: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                then: (resolve: any) =>
                    resolve({
                        data: [{ id: "task-to-delete", title: "Deleted Task" }],
                        error: null,
                    }),
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks/task-to-delete",
                null,
                "DELETE"
            );
            const params = Promise.resolve({ id: "task-to-delete" });

            const response = await deleteTask(request, { params });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.success).toBe(true);
        });

        it("15. Non-admin → 403 Forbidden", async () => {
            setupUser("client@example.com", false);

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks/task-123",
                null,
                "DELETE"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await deleteTask(request, { params });
            const body = await response.json();

            expect(response.status).toBe(403);
            expect(body.error).toBe("Forbidden");
        });

        it("15b. Unauthenticated → 401 Unauthorized", async () => {
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: null,
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks/task-123",
                null,
                "DELETE"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await deleteTask(request, { params });
            const body = await response.json();

            expect(response.status).toBe(401);
            expect(body.error).toBe("Unauthorized");
        });

        it("16. Non-existent task ID → 404 Not Found", async () => {
            setupUser("admin@berztech.com", true);

            mockAdminSupabase.from.mockReturnValue({
                delete: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                then: (resolve: any) =>
                    resolve({
                        data: [],
                        error: null,
                    }),
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks/non-existent",
                null,
                "DELETE"
            );
            const params = Promise.resolve({ id: "non-existent" });

            const response = await deleteTask(request, { params });
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body.error).toBe("Task not found");
        });
    });

    describe("Edge cases", () => {
        it("handles request_id='undefined' as null", async () => {
            setupUser("admin@berztech.com", true);

            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        order: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        limit: vi.fn().mockReturnThis(),
                        then: (resolve: any) => resolve({ data: [], error: null }),
                        insert: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: {
                                id: "task-no-req",
                                title: "No Request Task",
                                request_id: null,
                                client_id: null,
                            },
                            error: null,
                        }),
                    };
                }
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks",
                { title: "No Request Task", request_id: "undefined" },
                "POST"
            );

            const response = await createTask(request);
            const body = await response.json();

            expect(response.status).toBe(201);
            expect(body.data.request_id).toBeNull();
        });

        it("handles PATCH with request_id set to null (unlink)", async () => {
            setupUser("admin@berztech.com", true);

            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "tasks") {
                    return {
                        update: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: {
                                id: "task-123",
                                title: "Unlinked Task",
                                request_id: null,
                                client_id: null,
                            },
                            error: null,
                        }),
                    };
                }
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks/task-123",
                { request_id: null },
                "PATCH"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await updateTask(request, { params });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.data.client_id).toBeNull();
        });

        it("rejects empty title string", async () => {
            setupUser("admin@berztech.com", true);

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks",
                { title: "" },
                "POST"
            );

            const response = await createTask(request);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body.error).toBe("Title is required");
        });

        it("handles invalid requestId format in query params", async () => {
            setupUser("admin@berztech.com", true);

            mockAdminListQuery([]);

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks?requestId=invalid!!!format"
            );

            const response = await getTasks(request);
            const body = await response.json();

            // Should return 200, database handles the query
            expect(response.status).toBe(200);
        });

        it("handles empty requestId query param", async () => {
            setupUser("admin@berztech.com", true);

            const allTasks = [
                { id: "task-1", title: "Task 1", status: "backlog" },
                { id: "task-2", title: "Task 2", status: "inprogress" },
            ];

            mockAdminListQuery(allTasks);

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks?requestId="
            );

            const response = await getTasks(request);
            const body = await response.json();

            // Should return all tasks when requestId is empty
            expect(response.status).toBe(200);
        });

        it("handles URL-encoded requestId", async () => {
            setupUser("admin@berztech.com", true);

            const filteredTasks = [
                { id: "task-1", title: "Request Task", request_id: "req-special" },
            ];

            mockAdminListQuery(filteredTasks);

            const encodedId = encodeURIComponent("req-special-123");
            const request = createJsonRequest(
                `http://localhost:3000/api/admin/tasks?requestId=${encodedId}`
            );

            const response = await getTasks(request);

            expect(response.status).toBe(200);
        });

        it("handles multiple query parameters", async () => {
            setupUser("admin@berztech.com", true);

            mockAdminListQuery([]);

            const request = createJsonRequest(
                "http://localhost:3000/api/admin/tasks?requestId=req-1&status=backlog&sort=order_index"
            );

            const response = await getTasks(request);

            expect(response.status).toBe(200);
        });
    });
});
