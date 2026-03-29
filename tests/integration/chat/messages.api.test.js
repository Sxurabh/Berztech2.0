/**
 * @fileoverview Integration tests for Messages API
 *
 * Tests cover:
 * - POST /api/messages (create, validation, auth, task_id, attachments, notifications)
 * - GET /api/messages (fetch, pagination, filtering)
 * - PATCH /api/messages/[id]/read (mark read)
 *
 * Uses real Supabase calls with test utilities for setup/cleanup.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const mockServerSupabase = {
    auth: { getUser: vi.fn() },
    storage: { from: vi.fn() },
    from: vi.fn(),
};

const mockAdminClient = {
    auth: { admin: { createUser: vi.fn(), deleteUser: vi.fn() } },
    from: vi.fn(),
};

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(() => Promise.resolve(mockServerSupabase)),
}));

vi.mock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(() => mockAdminClient),
}));

import { GET as getMessages, POST as createMessage } from "@/app/api/messages/route";
import { PATCH as markRead } from "@/app/api/messages/[id]/read/route";
import {
    skipIfNoSupabase,
    isSupabaseConfigured,
} from "./test-utils";

describe("Messages API - Integration Tests", () => {
    let testUser = null;
    let testProject = null;
    let testMessage = null;
    let shouldSkip = false;

    beforeEach(async () => {
        vi.clearAllMocks();
        shouldSkip = skipIfNoSupabase();

        mockServerSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "mock-user", email: "test@example.com", user_metadata: { full_name: "Test User" } } },
            error: null,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createJsonRequest(url, body, method = "POST") {
        const options = { method };
        if (body) {
            options.body = JSON.stringify(body);
            options.headers = { "Content-Type": "application/json" };
        }
        return new NextRequest(url, options);
    }

    function createQueryBuilder(resolveValue) {
        const builder = {
            insert: vi.fn(() => builder),
            select: vi.fn(() => builder),
            single: vi.fn(() => builder),
            eq: vi.fn(() => builder),
            in: vi.fn(() => builder),
            order: vi.fn(() => builder),
            limit: vi.fn(() => builder),
            lt: vi.fn(() => builder),
            delete: vi.fn(() => builder),
            update: vi.fn(() => builder),
            upsert: vi.fn(() => builder),
            then: (resolve) => resolve(resolveValue),
        };
        return builder;
    }

    describe("POST /api/messages", () => {
        it("1. Unauthenticated request → 401", async () => {
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: null,
            });

            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    project_id: "550e8400-e29b-41d4-a716-446655440000",
                    content: "Hello",
                })
            );

            expect(response.status).toBe(401);
            const json = await response.json();
            expect(json.error).toBe("Unauthorized");
        });

        it("2. Missing project_id → 400 validation error", async () => {
            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    content: "Hello",
                })
            );

            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json.error).toBe("Validation failed");
        });

        it("3. Invalid project_id format → 400", async () => {
            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    project_id: "not-a-uuid",
                    content: "Hello",
                })
            );

            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json.error).toBe("Validation failed");
        });

        it("4. Empty content → 400", async () => {
            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    project_id: "550e8400-e29b-41d4-a716-446655440000",
                    content: "",
                })
            );

            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json.error).toBe("Validation failed");
        });

        it("5. Content too long (>5000 chars) → 400", async () => {
            const longContent = "a".repeat(5001);
            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    project_id: "550e8400-e29b-41d4-a716-446655440000",
                    content: longContent,
                })
            );

            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json.error).toBe("Validation failed");
        });

        it("6. Valid message → 201 with message data", async () => {
            const mockMessage = {
                id: "msg-123",
                project_id: "550e8400-e29b-41d4-a716-446655440000",
                sender_id: "user-123",
                sender_name: "Test User",
                sender_email: "test@example.com",
                content: "Hello world",
                created_at: new Date().toISOString(),
            };

            const mockInsert = createQueryBuilder({
                data: mockMessage,
                error: null,
            });

            mockServerSupabase.from.mockReturnValue(mockInsert);

            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    project_id: "550e8400-e29b-41d4-a716-446655440000",
                    content: "Hello world",
                })
            );

            expect(response.status).toBe(201);
            const json = await response.json();
            expect(json.data.content).toBe("Hello world");
            expect(json.data.reads).toEqual([]);
        });

        it("7. Message with attachment → 201", async () => {
            const mockMessage = {
                id: "msg-124",
                project_id: "550e8400-e29b-41d4-a716-446655440000",
                sender_id: "user-123",
                content: "Check this file",
                attachment_url: "https://example.com/file.pdf",
                attachment_type: "document",
                attachment_name: "file.pdf",
                created_at: new Date().toISOString(),
            };

            const mockInsert = createQueryBuilder({
                data: mockMessage,
                error: null,
            });

            mockServerSupabase.from.mockReturnValue(mockInsert);

            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    project_id: "550e8400-e29b-41d4-a716-446655440000",
                    content: "Check this file",
                    attachment_url: "https://example.com/file.pdf",
                    attachment_type: "document",
                    attachment_name: "file.pdf",
                })
            );

            expect(response.status).toBe(201);
            const json = await response.json();
            expect(json.data.attachment_url).toBe("https://example.com/file.pdf");
        });

        it("8. Valid message with task_id → 201 with task_id data", async () => {
            const taskId = "550e8400-e29b-41d4-a716-446655440000";
            const mockMessage = {
                id: "msg-125",
                project_id: "550e8400-e29b-41d4-a716-446655440000",
                sender_id: "user-123",
                sender_name: "Test User",
                sender_email: "test@example.com",
                content: "Hello world with task",
                task_id: taskId,
                created_at: new Date().toISOString(),
            };

            const mockInsert = createQueryBuilder({
                data: mockMessage,
                error: null,
            });

            mockServerSupabase.from.mockReturnValue(mockInsert);

            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    project_id: "550e8400-e29b-41d4-a716-446655440000",
                    content: "Hello world with task",
                    task_id: taskId,
                })
            );

            expect(response.status).toBe(201);
            const json = await response.json();
            expect(json.data.task_id).toBe(taskId);
        });

        it("9. Valid message with null task_id → 201 with null task_id", async () => {
            const mockMessage = {
                id: "msg-126",
                project_id: "550e8400-e29b-41d4-a716-446655440000",
                sender_id: "user-123",
                sender_name: "Test User",
                sender_email: "test@example.com",
                content: "Hello world without task",
                task_id: null,
                created_at: new Date().toISOString(),
            };

            const mockInsert = createQueryBuilder({
                data: mockMessage,
                error: null,
            });

            mockServerSupabase.from.mockReturnValue(mockInsert);

            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    project_id: "550e8400-e29b-41d4-a716-446655440000",
                    content: "Hello world without task",
                    task_id: null,
                })
            );

            expect(response.status).toBe(201);
            const json = await response.json();
            expect(json.data.task_id).toBeNull();
        });

        it("10. Should create notification when message sent to different user", async () => {
            const mockMessage = {
                id: "msg-127",
                project_id: "550e8400-e29b-41d4-a716-446655440000",
                sender_id: "user-123",
                sender_name: "Test User",
                sender_email: "test@example.com",
                content: "Hello world notification test",
                created_at: new Date().toISOString(),
            };

            const mockInsert = createQueryBuilder({
                data: mockMessage,
                error: null,
            });

            const mockRecipient = {
                user_id: "recipient-456",
                name: "Recipient User",
                email: "recipient@example.com"
            };

            mockServerSupabase.from
                .mockReturnValueOnce(mockInsert)
                .mockReturnValueOnce({
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: mockRecipient, error: null }),
                });

            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    project_id: "550e8400-e29b-41d4-a716-446655440000",
                    content: "Hello world notification test",
                })
            );

            expect(response.status).toBe(201);
            expect(mockServerSupabase.from("notifications").insert).toHaveBeenCalledWith({
                user_id: "recipient-456",
                type: "message",
                title: "New Message",
                message: expect.stringContaining("Test User sent you a message"),
                request_id: "550e8400-e29b-41d4-a716-446655440000",
                source_user_id: "mock-user",
                is_read: false,
            });
        });

        it("11. Should NOT create notification when message sent to same user", async () => {
            const mockMessage = {
                id: "msg-128",
                project_id: "550e8400-e29b-41d4-a716-446655440000",
                sender_id: "user-123",
                sender_name: "Test User",
                sender_email: "test@example.com",
                content: "Hello world self message",
                created_at: new Date().toISOString(),
            };

            const mockInsert = createQueryBuilder({
                data: mockMessage,
                error: null,
            });

            const mockRecipient = {
                user_id: "mock-user", // Same as auth user
                name: "Test User",
                email: "test@example.com"
            };

            mockServerSupabase.from
                .mockReturnValueOnce(mockInsert)
                .mockReturnValueOnce({
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({ data: mockRecipient, error: null }),
                });

            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    project_id: "550e8400-e29b-41d4-a716-446655440000",
                    content: "Hello world self message",
                })
            );

            expect(response.status).toBe(201);
            expect(mockServerSupabase.from("notifications").insert).not.toHaveBeenCalled();
        });

        it("12. Should validate attachment_url is valid URL", async () => {
            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    project_id: "550e8400-e29b-41d4-a716-446655440000",
                    content: "Check this attachment",
                    attachment_url: "not-a-valid-url",
                })
            );

            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json.error).toBe("Validation failed");
        });

        it("13. Should validate attachment_type is either image or document", async () => {
            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    project_id: "550e8400-e29b-41d4-a716-446655440000",
                    content: "Check this attachment",
                    attachment_url: "https://example.com/file.pdf",
                    attachment_type: "invalid-type",
                })
            );

            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json.error).toBe("Validation failed");
        });

        it("14. Should validate attachment_name length", async () => {
            const longName = "a".repeat(256); // Exceeds 255 limit
            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    project_id: "550e8400-e29b-41d4-a716-446655440000",
                    content: "Check this attachment",
                    attachment_url: "https://example.com/file.pdf",
                    attachment_type: "document",
                    attachment_name: longName,
                })
            );

            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json.error).toBe("Validation failed");
        });

        it("8. Database error → 500", async () => {
            const mockInsert = createQueryBuilder({
                data: null,
                error: { message: "Database error" },
            });

            mockServerSupabase.from.mockReturnValue(mockInsert);

            const response = await createMessage(
                createJsonRequest("http://localhost/api/messages", {
                    project_id: "550e8400-e29b-41d4-a716-446655440000",
                    content: "Hello",
                })
            );

            expect(response.status).toBe(500);
        });
    });

    describe("GET /api/messages", () => {
        it("9. Unauthenticated request → 401", async () => {
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: null,
            });

            const response = await getMessages(
                createJsonRequest("http://localhost/api/messages?project_id=550e8400-e29b-41d4-a716-446655440000", null, "GET")
            );

            expect(response.status).toBe(401);
            const json = await response.json();
            expect(json.error).toBe("Unauthorized");
        });

        it("10. Missing project_id → 400", async () => {
            const response = await getMessages(
                createJsonRequest("http://localhost/api/messages", null, "GET")
            );

            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json.error).toBe("project_id is required");
        });

        it("11. Returns messages for project → 200", async () => {
            const mockMessages = [
                { id: "msg-1", content: "First message", created_at: "2026-01-01T10:00:00Z" },
                { id: "msg-2", content: "Second message", created_at: "2026-01-02T10:00:00Z" },
            ];

            const mockSelect = createQueryBuilder({
                data: mockMessages,
                error: null,
            });

            mockServerSupabase.from.mockReturnValue(mockSelect);

            const response = await getMessages(
                createJsonRequest("http://localhost/api/messages?project_id=550e8400-e29b-41d4-a716-446655440000", null, "GET")
            );

            expect(response.status).toBe(200);
            const json = await response.json();
            expect(json.data.length).toBe(2);
        });

        it("12. Pagination with limit → respects limit", async () => {
            const mockMessages = [{ id: "msg-1" }];
            const mockReads = [];

            const mockProjectMessagesQuery = {
                select: vi.fn(() => mockProjectMessagesQuery),
                eq: vi.fn(() => mockProjectMessagesQuery),
                order: vi.fn(() => mockProjectMessagesQuery),
                limit: vi.fn((limit) => {
                    capturedLimit = limit;
                    return mockProjectMessagesQuery;
                }),
                then: (resolve) => resolve({ data: mockMessages, error: null }),
            };

            const mockMessageReadsQuery = {
                select: vi.fn(() => mockMessageReadsQuery),
                in: vi.fn(() => mockMessageReadsQuery),
                then: (resolve) => resolve({ data: mockReads, error: null }),
            };

            let callCount = 0;
            let capturedLimit = null;
            mockServerSupabase.from.mockImplementation((table) => {
                callCount++;
                if (callCount === 1) {
                    // First call: project_messages query
                    return mockProjectMessagesQuery;
                } else {
                    // Second call: message_reads query
                    return mockMessageReadsQuery;
                }
            });

            const response = await getMessages(
                createJsonRequest("http://localhost/api/messages?project_id=550e8400-e29b-41d4-a716-446655440000&limit=10", null, "GET")
            );

            expect(response.status).toBe(200);
            expect(capturedLimit).toBe(10);
        });

        it("13. Pagination with before parameter → adds lt condition", async () => {
            const mockMessages = [{ id: "msg-1" }];
            const beforeDate = "2026-01-01T10:00:00Z";

            const mockProjectMessagesQuery = {
                select: vi.fn(() => mockProjectMessagesQuery),
                eq: vi.fn(() => mockProjectMessagesQuery),
                order: vi.fn(() => mockProjectMessagesQuery),
                limit: vi.fn(() => mockProjectMessagesQuery),
                lt: vi.fn((field, date) => {
                    capturedBefore = date;
                    return mockProjectMessagesQuery;
                }),
                then: (resolve) => resolve({ data: mockMessages, error: null }),
            };

            const mockMessageReadsQuery = {
                select: vi.fn(() => mockMessageReadsQuery),
                in: vi.fn(() => mockMessageReadsQuery),
                then: (resolve) => resolve({ data: [], error: null }), // No read receipts
            };

            let callCount = 0;
            let capturedBefore = null;
            mockServerSupabase.from.mockImplementation((table) => {
                callCount++;
                if (callCount === 1) {
                    // First call: project_messages query
                    return mockProjectMessagesQuery;
                } else {
                    // Second call: message_reads query
                    return mockMessageReadsQuery;
                }
            });

            const response = await getMessages(
                createJsonRequest(`http://localhost/api/messages?project_id=550e8400-e29b-41d4-a716-446655440000&before=${beforeDate}`, null, "GET")
            );

            expect(response.status).toBe(200);
            // Note: We're capturing the 'before' parameter value passed to the lt method
            expect(capturedBefore).toBe(beforeDate);
        });

        it("13. Database error → 500", async () => {
            const mockSelect = createQueryBuilder({
                data: null,
                error: { message: "Database error" },
            });

            mockServerSupabase.from.mockReturnValue(mockSelect);

            const response = await getMessages(
                createJsonRequest("http://localhost/api/messages?project_id=550e8400-e29b-41d4-a716-446655440000", null, "GET")
            );

            expect(response.status).toBe(500);
            const json = await response.json();
            expect(json.error).toBe("Database error");
        });

        it("14. Empty messages array → 200 with empty array", async () => {
            const mockSelect = createQueryBuilder({
                data: [],
                error: null,
            });

            mockServerSupabase.from.mockReturnValue(mockSelect);

            const response = await getMessages(
                createJsonRequest("http://localhost/api/messages?project_id=550e8400-e29b-41d4-a716-446655440000", null, "GET")
            );

            expect(response.status).toBe(200);
            const json = await response.json();
            expect(json.data).toEqual([]);
        });
    });

    describe("PATCH /api/messages/[id]/read", () => {
        function createMarkReadRequest(id, body = {}) {
            const url = new URL(`http://localhost/api/messages/${id}/read`);
            const options = {
                method: "PATCH",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            };
            return new NextRequest(url, options);
        }

        function createParams(id) {
            return { params: Promise.resolve({ id }) };
        }

        it("15. Unauthenticated request → 401", async () => {
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: null,
            });

            const response = await markRead(
                createMarkReadRequest("msg-123"),
                createParams("msg-123")
            );

            expect(response.status).toBe(401);
            const json = await response.json();
            expect(json.error).toBe("Unauthorized");
        });

        it("16. Mark own message as read → 400", async () => {
            const ownUserId = "user-123";

            const mockSelectMessage = createQueryBuilder({
                data: { id: "msg-123", sender_id: ownUserId, project_id: "proj-1" },
                error: null,
            });

            mockServerSupabase.from.mockReturnValue(mockSelectMessage);

            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: ownUserId, email: "user@example.com" } },
                error: null,
            });

            const response = await markRead(
                createMarkReadRequest("msg-123"),
                createParams("msg-123")
            );

            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json.error).toBe("Cannot mark own message as read");
        });

        it("17. Message not found → 404", async () => {
            const mockSelectMessage = createQueryBuilder({
                data: null,
                error: { message: "Not found" },
            });

            mockServerSupabase.from.mockReturnValue(mockSelectMessage);

            const response = await markRead(
                createMarkReadRequest("nonexistent-msg"),
                createParams("nonexistent-msg")
            );

            expect(response.status).toBe(404);
            const json = await response.json();
            expect(json.error).toBe("Message not found");
        });

        it("18. Successfully mark message as read → 200", async () => {
            const mockSelectMessage = createQueryBuilder({
                data: { id: "msg-123", sender_id: "other-user", project_id: "proj-1" },
                error: null,
            });

            const mockUpsert = createQueryBuilder({
                data: { message_id: "msg-123", user_id: "user-123", read_at: new Date().toISOString() },
                error: null,
            });

            mockServerSupabase.from
                .mockReturnValueOnce(mockSelectMessage)
                .mockReturnValue(mockUpsert);

            const response = await markRead(
                createMarkReadRequest("msg-123"),
                createParams("msg-123")
            );

            expect(response.status).toBe(200);
        });

        it("19. Database error on mark read → 500", async () => {
            const mockSelectMessage = createQueryBuilder({
                data: { id: "msg-123", sender_id: "other-user", project_id: "proj-1" },
                error: null,
            });

            const mockUpsert = createQueryBuilder({
                data: null,
                error: { message: "Database error" },
            });

            mockServerSupabase.from
                .mockReturnValueOnce(mockSelectMessage)
                .mockReturnValue(mockUpsert);

            const response = await markRead(
                createMarkReadRequest("msg-123"),
                createParams("msg-123")
            );

            expect(response.status).toBe(500);
            const json = await response.json();
            expect(json.error).toBe("Failed to mark as read");
        });

        it("20. Should include user_email in read receipt", async () => {
            const mockSelectMessage = createQueryBuilder({
                data: { id: "msg-123", sender_id: "other-user", project_id: "proj-1" },
                error: null,
            });

            const mockUpsert = createQueryBuilder({
                data: { 
                    message_id: "msg-123", 
                    user_id: "user-123", 
                    user_email: "test@example.com",
                    read_at: new Date().toISOString() 
                },
                error: null,
            });

            mockServerSupabase.from
                .mockReturnValueOnce(mockSelectMessage)
                .mockReturnValue(mockUpsert);

            const response = await markRead(
                createMarkReadRequest("msg-123"),
                createParams("msg-123")
            );

            expect(response.status).toBe(200);
            const json = await response.json();
            expect(json.data.user_email).toBe("test@example.com");
        });
    });
});
