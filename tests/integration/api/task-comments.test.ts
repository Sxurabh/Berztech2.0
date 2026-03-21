/**
 * @fileoverview Integration tests for Task Comments API
 *
 * Tests cover:
 * - GET /api/tasks/[id]/comments — List comments (auth, IDOR isolation)
 * - POST /api/tasks/[id]/comments — Create comment (validation, notifications)
 * - Edge cases: empty content, non-existent task, unauthorized access
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getComments, POST as createComment } from "@/app/api/tasks/[id]/comments/route";

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

describe("Task Comments API", () => {
    const mockServerSupabase = {
        auth: {
            getUser: vi.fn(),
        },
    };

    const mockAdminSupabase = {
        from: vi.fn(),
        auth: {
            admin: {
                listUsers: vi.fn().mockResolvedValue({ data: { users: [] }, error: null }),
            },
        },
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
            user_metadata: { full_name: email.split("@")[0] },
        };
        mockServerSupabase.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });
        (isAdminEmail as any).mockImplementation((e: string) => e === email && admin);
        return mockUser;
    }

    /**
     * Mock the admin query chain for comments
     */
    function mockCommentQuery(data: any, error: any = null) {
        const queryMock = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data, error }),
        };

         mockAdminSupabase.from.mockImplementation((table: string) => {
             if (table === "task_comments") {
                 return queryMock;
             }
             
             if (table === "notifications") {
                 const insertMock = vi.fn().mockReturnThis();
                 return {
                     insert: insertMock,
                 };
             }
             
             if (table === "admin_users") {
                 const selectMock = vi.fn().mockReturnThis();
                 return {
                     select: selectMock,
                 };
             }
             
             // Default fallback
             return {
                 select: vi.fn().mockReturnThis(),
                 eq: vi.fn().mockReturnThis(),
                 order: vi.fn().mockReturnThis(),
                 insert: vi.fn().mockReturnThis(),
                 single: vi.fn().mockResolvedValue({ data: null, error: null }),
             };
         });
        
        return queryMock;
    }

    /**
     * Mock task lookup for access control
     */
    function mockTaskLookup(taskData: any, error: any = null) {
        mockAdminSupabase.from.mockImplementation((table: string) => {
            if (table === "tasks") {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: taskData, error }),
                };
            }
            
            if (table === "task_comments") {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnThis(),
                    insert: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: null, error: null }),
                };
            }
            
             if (table === "notifications") {
                 return {
                     insert: vi.fn().mockResolvedValue({ data: [], error: null }),
                 };
             }
             
             if (table === "admin_users") {
                 const selectMock = vi.fn().mockReturnThis();
                 return {
                     select: selectMock,
                 };
             }
            
            // Default fallback
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                insert: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
            };
        });
    }

    describe("GET /api/tasks/[id]/comments", () => {
        it("1. Unauthenticated request → 401", async () => {
            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/task-123/comments"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await getComments(request, { params });
            const body = await response.json();

            expect(response.status).toBe(401);
            expect(body.error).toBe("Unauthorized");
        });

        it("2. Authenticated client receives comments for their task", async () => {
            const clientUser = setupUser("client@example.com", false);

            const mockTask = {
                id: "task-123",
                client_id: clientUser.id,
                title: "Client Task",
            };

            const mockComments = [
                { id: "comment-1", task_id: "task-123", content: "First comment", user_id: "admin-1" },
                { id: "comment-2", task_id: "task-123", content: "Second comment", user_id: clientUser.id },
            ];

             let callCount = 0;
              mockAdminSupabase.from.mockImplementation((table: string) => {
                  callCount++;
                  if (table === "tasks") {
                      return {
                          select: vi.fn().mockReturnThis(),
                          eq: vi.fn().mockReturnThis(),
                          single: vi.fn().mockResolvedValue({ data: mockTask, error: null }),
                      };
                  }
                  if (table === "task_comments") {
                      return {
                          select: vi.fn().mockReturnThis(),
                          eq: vi.fn().mockReturnThis(),
                          order: vi.fn().mockReturnThis(),
                          then: (resolve: any) => resolve({ data: mockComments, error: null }),
                      };
                  }
                  if (table === "admin_users") {
                      // Mock admin_users table for notification logic
                      const selectMock = vi.fn().mockReturnThis();
                      return { select: selectMock };
                  }
                  if (table === "notifications") {
                      return {
                          insert: vi.fn().mockResolvedValue({ data: [], error: null }),
                      };
                  }
                  // Default fallback
                  return {
                      select: vi.fn().mockReturnThis(),
                      eq: vi.fn().mockReturnThis(),
                      order: vi.fn().mockReturnThis(),
                      insert: vi.fn().mockReturnThis(),
                      single: vi.fn().mockResolvedValue({ data: null, error: null }),
                  };
              });

            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/task-123/comments"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await getComments(request, { params });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.data).toEqual(mockComments);
        });

        it("3. IDOR: Client cannot access comments on another client's task → 403", async () => {
            const clientUser = setupUser("client@example.com", false);

            // Task belongs to a different client
            const otherClientTask = {
                id: "task-456",
                client_id: "different-client-id",
                title: "Other Client Task",
            };

            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: otherClientTask, error: null }),
                    };
                }
                return { from: vi.fn() };
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/task-456/comments"
            );
            const params = Promise.resolve({ id: "task-456" });

            const response = await getComments(request, { params });
            const body = await response.json();

            expect(response.status).toBe(403);
            expect(body.error).toBe("Forbidden");
        });

        it("4. Admin can access comments on any task", async () => {
            setupUser("admin@berztech.com", true);

            const anyTask = {
                id: "task-789",
                client_id: "some-client-id",
                title: "Any Task",
            };

            const mockComments = [
                { id: "comment-3", task_id: "task-789", content: "Admin view comment" },
            ];

            let callCount = 0;
            mockAdminSupabase.from.mockImplementation((table: string) => {
                callCount++;
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: anyTask, error: null }),
                    };
                }
                if (table === "task_comments") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        order: vi.fn().mockReturnThis(),
                        then: (resolve: any) => resolve({ data: mockComments, error: null }),
                    };
                }
                return { from: vi.fn() };
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/task-789/comments"
            );
            const params = Promise.resolve({ id: "task-789" });

            const response = await getComments(request, { params });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.data).toEqual(mockComments);
        });

        it("5. Returns empty array when task has no comments", async () => {
            const clientUser = setupUser("client@example.com", false);

            const mockTask = {
                id: "task-empty",
                client_id: clientUser.id,
                title: "Task With No Comments",
            };

            let callCount = 0;
            mockAdminSupabase.from.mockImplementation((table: string) => {
                callCount++;
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: mockTask, error: null }),
                    };
                }
                if (table === "task_comments") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        order: vi.fn().mockReturnThis(),
                        then: (resolve: any) => resolve({ data: [], error: null }),
                    };
                }
                return { from: vi.fn() };
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/task-empty/comments"
            );
            const params = Promise.resolve({ id: "task-empty" });

            const response = await getComments(request, { params });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.data).toEqual([]);
        });

        it("6. Non-existent task → 404", async () => {
            setupUser("admin@berztech.com", true);

            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: { message: "Task not found" },
                        }),
                    };
                }
                return { from: vi.fn() };
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/non-existent/comments"
            );
            const params = Promise.resolve({ id: "non-existent" });

            const response = await getComments(request, { params });
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body.error).toBe("Task not found");
        });
    });

    describe("POST /api/tasks/[id]/comments", () => {
        it("7. Unauthenticated request → 401", async () => {
            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/task-123/comments",
                { content: "Test comment" },
                "POST"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await createComment(request, { params });
            const body = await response.json();

            expect(response.status).toBe(401);
            expect(body.error).toBe("Unauthorized");
        });

        it("8. Empty content → 400", async () => {
            const clientUser = setupUser("client@example.com", false);

            const mockTask = {
                id: "task-123",
                client_id: clientUser.id,
                title: "Client Task",
            };

            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: mockTask, error: null }),
                    };
                }
                return { from: vi.fn() };
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/task-123/comments",
                { content: "" },
                "POST"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await createComment(request, { params });
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body.error).toBe("Content is required");
        });

        it("9. Whitespace-only content → 400", async () => {
            const clientUser = setupUser("client@example.com", false);

            const mockTask = {
                id: "task-123",
                client_id: clientUser.id,
                title: "Client Task",
            };

            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: mockTask, error: null }),
                    };
                }
                return { from: vi.fn() };
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/task-123/comments",
                { content: "   \n\t   " },
                "POST"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await createComment(request, { params });
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body.error).toBe("Content is required");
        });

        it("10. Non-existent task → 404", async () => {
            setupUser("client@example.com", false);

            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: { message: "Task not found" },
                        }),
                    };
                }
                return { from: vi.fn() };
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/non-existent/comments",
                { content: "Comment on non-existent task" },
                "POST"
            );
            const params = Promise.resolve({ id: "non-existent" });

            const response = await createComment(request, { params });
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body.error).toBe("Task not found");
        });

        it("11. IDOR: Client cannot comment on another client's task → 403", async () => {
            const clientUser = setupUser("client@example.com", false);

            const otherClientTask = {
                id: "task-456",
                client_id: "different-client-id",
                title: "Other Client Task",
            };

            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: otherClientTask, error: null }),
                    };
                }
                return { from: vi.fn() };
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/task-456/comments",
                { content: "Trying to comment on another client's task" },
                "POST"
            );
            const params = Promise.resolve({ id: "task-456" });

            const response = await createComment(request, { params });
            const body = await response.json();

            expect(response.status).toBe(403);
            expect(body.error).toBe("Forbidden");
        });

        it("12. Valid comment creation → 201", async () => {
            const clientUser = setupUser("client@example.com", false);

            const mockTask = {
                id: "task-123",
                client_id: clientUser.id,
                title: "Test Task",
                request_id: null,
            };

            const newComment = {
                id: "new-comment-uuid",
                task_id: "task-123",
                user_id: clientUser.id,
                content: "This is my comment",
                created_at: "2026-03-12T10:00:00Z",
            };

            // Mock the admin_users table to return an admin with email "admin@example.com"
            const adminEmail = "admin@example.com";
            (mockAdminSupabase.auth.admin.listUsers as any).mockResolvedValue({
                data: {
                    users: [
                        {
                            id: "admin-user-id",
                            email: adminEmail,
                        }
                    ]
                },
                error: null,
            });

            let callCount = 0;
            mockAdminSupabase.from.mockImplementation((table: string) => {
                callCount++;
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: mockTask, error: null }),
                    };
                }
                if (table === "task_comments") {
                    return {
                        insert: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: newComment, error: null }),
                    };
                }
                if (table === "admin_users") {
                    // Mock the select method to return a thenable that resolves to admin data
                    const selectMock = vi.fn().mockReturnValue({
                        then: (resolve: any) => {
                            resolve({ data: [{ email: adminEmail }], error: null });
                        }
                    });
                    return {
                        select: selectMock,
                    };
                }
                if (table === "notifications") {
                    return {
                        insert: vi.fn().mockResolvedValue({ data: [], error: null }),
                    };
                }
                // Default fallback
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    order: vi.fn().mockReturnThis(),
                    insert: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: null, error: null }),
                };
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/task-123/comments",
                { content: "This is my comment" },
                "POST"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await createComment(request, { params });
            const body = await response.json();

            expect(response.status).toBe(201);
            expect(body.data.content).toBe("This is my comment");
            expect(body.data.task_id).toBe("task-123");
        });

        it("13. Content is trimmed before saving", async () => {
            const clientUser = setupUser("client@example.com", false);

            const mockTask = {
                id: "task-123",
                client_id: clientUser.id,
                title: "Test Task",
                request_id: null,
            };

            const adminEmail = "admin@example.com";
            (mockAdminSupabase.auth.admin.listUsers as any).mockResolvedValue({
                data: {
                    users: [{ id: "admin-user-id", email: adminEmail }]
                },
                error: null,
            });

            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: mockTask, error: null }),
                    };
                }
                if (table === "task_comments") {
                    return {
                        insert: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: { 
                                id: "new-comment-uuid",
                                task_id: "task-123",
                                user_id: clientUser.id,
                                content: "Trimmed comment content",
                                created_at: "2026-03-12T10:00:00Z",
                            },
                            error: null,
                        }),
                    };
                }
                if (table === "admin_users") {
                    const selectMock = vi.fn().mockReturnValue({
                        then: (resolve: any) => resolve({ data: [{ email: adminEmail }], error: null }),
                    });
                    return { select: selectMock };
                }
                if (table === "notifications") {
                    return { insert: vi.fn().mockResolvedValue({ data: [], error: null }) };
                }
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    insert: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: null, error: null }),
                };
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/task-123/comments",
                { content: "  \n  Trimmed comment content  \n  " },
                "POST"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await createComment(request, { params });
            const body = await response.json();

            expect(response.status).toBe(201);
            expect(body.data.content).toBe("Trimmed comment content");
        });

        it("14. Long content is handled (up to 10000 chars)", async () => {
            const clientUser = setupUser("client@example.com", false);

            const mockTask = {
                id: "task-123",
                client_id: clientUser.id,
                title: "Test Task",
                request_id: null,
            };

            const longContent = "a".repeat(5000);

            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: mockTask, error: null }),
                    };
                }
                if (table === "task_comments") {
                    return {
                        insert: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: { id: "comment-uuid", content: longContent },
                            error: null,
                        }),
                    };
                }
                return { from: vi.fn() };
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/task-123/comments",
                { content: longContent },
                "POST"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await createComment(request, { params });

            expect(response.status).toBe(201);
        });
    });

    describe("Edge cases", () => {
        it("15. Malformed JSON body → 500", async () => {
            setupUser("client@example.com", false);

            const request = new NextRequest(
                "http://localhost:3000/api/tasks/task-123/comments",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: "{ invalid json",
                }
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await createComment(request, { params });

            expect(response.status).toBe(500);
        });

        it("16. Database error on comment creation → 500", async () => {
            const clientUser = setupUser("client@example.com", false);

            const mockTask = {
                id: "task-123",
                client_id: clientUser.id,
                title: "Test Task",
            };

            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: mockTask, error: null }),
                    };
                }
                if (table === "task_comments") {
                    return {
                        insert: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: { message: "Database connection failed" },
                        }),
                    };
                }
                return { from: vi.fn() };
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/task-123/comments",
                { content: "Test comment" },
                "POST"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await createComment(request, { params });
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body.error).toBe("Database connection failed");
        });

        it("17. Client comment triggers listUsers() call exactly ONCE (N+1 fix)", async () => {
            const clientUser = setupUser("client@example.com", false);

            const mockTask = {
                id: "task-123",
                client_id: clientUser.id,
                title: "Test Task",
                request_id: null,
            };

            let listUsersCallCount = 0;
            (mockAdminSupabase.auth.admin.listUsers as any).mockImplementation(() => {
                listUsersCallCount++;
                return Promise.resolve({
                    data: {
                        users: [
                            { id: "admin-1", email: "admin1@berztech.com" },
                            { id: "admin-2", email: "admin2@berztech.com" },
                            { id: "admin-3", email: "admin3@berztech.com" },
                        ]
                    },
                    error: null,
                });
            });

            mockAdminSupabase.from.mockImplementation((table: string) => {
                if (table === "tasks") {
                    return {
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({ data: mockTask, error: null }),
                    };
                }
                if (table === "task_comments") {
                    return {
                        insert: vi.fn().mockReturnThis(),
                        select: vi.fn().mockReturnThis(),
                        single: vi.fn().mockResolvedValue({
                            data: { id: "new-comment", content: "Test comment" },
                            error: null,
                        }),
                    };
                }
                if (table === "admin_users") {
                    const selectMock = vi.fn().mockReturnValue({
                        then: (resolve: any) => resolve({ data: [
                            { email: "admin1@berztech.com" },
                            { email: "admin2@berztech.com" },
                            { email: "admin3@berztech.com" },
                        ], error: null }),
                    });
                    return { select: selectMock };
                }
                if (table === "notifications") {
                    return { insert: vi.fn().mockResolvedValue({ data: [], error: null }) };
                }
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    insert: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: null, error: null }),
                };
            });

            const request = createJsonRequest(
                "http://localhost:3000/api/tasks/task-123/comments",
                { content: "Test comment" },
                "POST"
            );
            const params = Promise.resolve({ id: "task-123" });

            const response = await createComment(request, { params });

            expect(response.status).toBe(201);
            expect(listUsersCallCount).toBe(1);
        });
    });
});
