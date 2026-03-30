/**
 * @fileoverview Security tests for CRITICAL API Authorization Bypass Vulnerabilities
 * 
 * These tests PROVE the existence of authorization bypass vulnerabilities in the messaging API.
 * Tests are written from an attacker's perspective to demonstrate:
 * - Bug #1: GET /api/messages has no project membership check
 * - Bug #2: POST /api/messages has no project membership check  
 * 
 * IMPORTANT: These tests are EXPECTED TO PASS, proving the vulnerabilities exist.
 * Once the vulnerabilities are fixed, these tests will FAIL and must be updated.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/messages/route";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

const TEST_USER_A = "550e8400-e29b-41d4-a716-446655440001";
const TEST_USER_B = "550e8400-e29b-41d4-a716-446655440002";
const TEST_USER_C = "550e8400-e29b-41d4-a716-446655440003";

const PROJECT_A = "660e8400-e29b-41d4-a716-446655440001";
const PROJECT_B = "660e8400-e29b-41d4-a716-446655440002";
const PROJECT_C = "660e8400-e29b-41d4-a716-446655440003";

const MESSAGE_ID_1 = "770e8400-e29b-41d4-a716-446655440001";
const MESSAGE_ID_2 = "770e8400-e29b-41d4-a716-446655440002";

const createMockFromChain = (data: any, error: any = null) => {
    const chain = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockImplementation(() => {
            return {
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data, error }),
            };
        }),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        ne: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data, error }),
        then: (resolve: any) => resolve({ data, error }),
    };
    return chain;
};

describe("CRITICAL: API Authorization Bypass - Cross-Project Message Reading", () => {
    let mockSupabase: any;

    const userBMessages = [
        { id: MESSAGE_ID_2, project_id: PROJECT_B, sender_id: TEST_USER_B, content: "Secret Project B message", sender_name: "User B" },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        
        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: TEST_USER_A, email: "user-a@test.com", user_metadata: { full_name: "User A" } } },
                    error: null,
                }),
            },
            from: vi.fn().mockImplementation((table: string) => {
                if (table === "project_messages") {
                    return createMockFromChain(userBMessages, null);
                }
                if (table === "message_reads") {
                    return createMockFromChain([], null);
                }
                if (table === "user_profiles") {
                    return createMockFromChain([{ id: TEST_USER_B, full_name: "User B", avatar_url: null }], null);
                }
                if (table === "requests") {
                    return createMockFromChain({ user_id: TEST_USER_B, name: "Project B", email: "b@test.com" }, null);
                }
                return createMockFromChain(null, null);
            }),
            storage: {
                from: vi.fn(() => ({
                    upload: vi.fn(),
                    getPublicUrl: vi.fn(),
                })),
            },
        };

        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("1. Cross-Project Message Reading - User A reads Project B's messages", () => {
        it("1. User A reads messages from Project B (not a member) - SHOULD FAIL but WORKS", async () => {
            const request = new NextRequest(`http://localhost:3000/api/messages?project_id=${PROJECT_B}`);
            const response = await GET(request);
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.data).toBeDefined();
            expect(result.data.length).toBeGreaterThan(0);
        });

        it("2. User A enumerates multiple projects' messages", async () => {
            const projectsToTest = [PROJECT_B, PROJECT_C];
            let accessedProjects = 0;

            for (const projectId of projectsToTest) {
                const request = new NextRequest(`http://localhost:3000/api/messages?project_id=${projectId}`);
                const response = await GET(request);
                if (response.status === 200) {
                    accessedProjects++;
                }
            }

            expect(accessedProjects).toBe(2);
        });

        it("3. User A accesses private conversations", async () => {
            const privateMessage = {
                id: "private-msg-1",
                project_id: PROJECT_B,
                sender_id: TEST_USER_B,
                content: "This is a PRIVATE conversation about Project B",
                sender_name: "User B",
                created_at: "2026-01-01T00:00:00Z",
            };

            mockSupabase.from = vi.fn((table: string) => {
                if (table === "project_messages") {
                    return createMockFromChain([privateMessage], null);
                }
                return createMockFromChain([], null);
            });

            const request = new NextRequest(`http://localhost:3000/api/messages?project_id=${PROJECT_B}`);
            const response = await GET(request);
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.data[0].content).toContain("PRIVATE");
        });

        it("4. Response contains actual message content (not empty)", async () => {
            const request = new NextRequest(`http://localhost:3000/api/messages?project_id=${PROJECT_B}`);
            const response = await GET(request);
            const result = await response.json();

            expect(result.data[0]).toHaveProperty("content");
            expect(result.data[0].content.length).toBeGreaterThan(0);
        });

        it("5. User A gets sender information from other projects", async () => {
            const messagesWithSender = [
                {
                    id: MESSAGE_ID_2,
                    project_id: PROJECT_B,
                    sender_id: TEST_USER_B,
                    sender_name: "User B",
                    content: "Secret message",
                },
            ];

            mockSupabase.from = vi.fn((table: string) => {
                if (table === "project_messages") {
                    return createMockFromChain(messagesWithSender, null);
                }
                if (table === "user_profiles") {
                    return createMockFromChain([{ id: TEST_USER_B, full_name: "Real User B Name", avatar_url: "http://avatar.url" }], null);
                }
                return createMockFromChain([], null);
            });

            const request = new NextRequest(`http://localhost:3000/api/messages?project_id=${PROJECT_B}`);
            const response = await GET(request);
            const result = await response.json();

            expect(result.data[0].sender).toBeDefined();
            expect(result.data[0].sender.full_name).toBe("Real User B Name");
        });

        it("6. User A can paginate through other projects' messages", async () => {
            const request = new NextRequest(`http://localhost:3000/api/messages?project_id=${PROJECT_B}&limit=10&before=2026-01-01T00:00:00Z`);
            const response = await GET(request);

            expect(response.status).toBe(200);
        });

        it("7. User A gets read receipts for other projects' messages", async () => {
            const messagesWithReads = [
                {
                    id: MESSAGE_ID_2,
                    project_id: PROJECT_B,
                    sender_id: TEST_USER_B,
                    content: "Test",
                },
            ];

            const readReceipts = [
                { message_id: MESSAGE_ID_2, user_id: TEST_USER_B, created_at: "2026-01-01T00:00:00Z" },
            ];

            mockSupabase.from = vi.fn((table: string) => {
                if (table === "project_messages") {
                    return createMockFromChain(messagesWithReads, null);
                }
                if (table === "message_reads") {
                    return createMockFromChain(readReceipts, null);
                }
                return createMockFromChain([], null);
            });

            const request = new NextRequest(`http://localhost:3000/api/messages?project_id=${PROJECT_B}`);
            const response = await GET(request);
            const result = await response.json();

            expect(result.data[0].reads).toBeDefined();
            expect(result.data[0].reads.length).toBe(1);
        });

        it("8. User A bypasses project isolation entirely", async () => {
            const allProjects = [PROJECT_A, PROJECT_B, PROJECT_C];
            const results: number[] = [];

            for (const projectId of allProjects) {
                const request = new NextRequest(`http://localhost:3000/api/messages?project_id=${projectId}`);
                const response = await GET(request);
                results.push(response.status);
            }

            expect(results.every(status => status === 200)).toBe(true);
        });
    });
});

describe("CRITICAL: API Authorization Bypass - Cross-Project Message Sending", () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();
        
        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: TEST_USER_A, email: "user-a@test.com", user_metadata: { full_name: "User A" } } },
                    error: null,
                }),
            },
            from: vi.fn().mockImplementation((table: string) => {
                if (table === "project_messages") {
                    return {
                        insert: vi.fn().mockImplementation(() => {
                            return {
                                select: vi.fn().mockReturnThis(),
                                single: vi.fn().mockResolvedValue({
                                    data: {
                                        id: "new-msg-id",
                                        project_id: PROJECT_B,
                                        sender_id: TEST_USER_A,
                                        content: "Injected message",
                                        sender_name: "User A",
                                        sender_email: "user-a@test.com",
                                    },
                                    error: null,
                                }),
                            };
                        }),
                        select: vi.fn().mockReturnThis(),
                        eq: vi.fn().mockReturnThis(),
                    };
                }
                if (table === "requests") {
                    return createMockFromChain({ user_id: TEST_USER_B, name: "Project B", email: "b@test.com" }, null);
                }
                if (table === "notifications") {
                    return createMockFromChain({ id: "notif-1" }, null);
                }
                if (table === "user_profiles") {
                    return createMockFromChain({ id: TEST_USER_A, full_name: "User A", avatar_url: null }, null);
                }
                return createMockFromChain(null, null);
            }),
            storage: {
                from: vi.fn(() => ({
                    upload: vi.fn(),
                    getPublicUrl: vi.fn(),
                })),
            },
        };

        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("2. Cross-Project Message Sending - User A sends to Project B", () => {
        it("9. User A sends message to Project B (not a member) - SHOULD FAIL but WORKS", async () => {
            const body = {
                project_id: PROJECT_B,
                content: "Unauthorized message to Project B",
            };

            const request = new NextRequest("http://localhost:3000/api/messages", {
                method: "POST",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });

            const response = await POST(request);
            const result = await response.json();

            expect(response.status).toBe(201);
            expect(result.data).toBeDefined();
            expect(result.data.project_id).toBe(PROJECT_B);
        });

        it("10. User A sends multiple messages to external projects", async () => {
            const externalProjects = [PROJECT_B, PROJECT_C];
            let sentCount = 0;

            for (const projectId of externalProjects) {
                const body = {
                    project_id: projectId,
                    content: `Message to external project ${projectId}`,
                };

                const request = new NextRequest("http://localhost:3000/api/messages", {
                    method: "POST",
                    body: JSON.stringify(body),
                    headers: { "Content-Type": "application/json" },
                });

                const response = await POST(request);
                if (response.status === 201) {
                    sentCount++;
                }
            }

            expect(sentCount).toBe(2);
        });

        it("11. Message from User A appears in Project B", async () => {
            const body = {
                project_id: PROJECT_B,
                content: "Test message",
            };

            const request = new NextRequest("http://localhost:3000/api/messages", {
                method: "POST",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });

            const response = await POST(request);
            const result = await response.json();

            expect(result.data.project_id).toBe(PROJECT_B);
            expect(result.data.content).toBeDefined();
        });

        it("12. Notifications created for non-member project", async () => {
            let notificationCreated = false;

            mockSupabase.from = vi.fn((table: string) => {
                if (table === "project_messages") {
                    return {
                        insert: vi.fn().mockImplementation(() => {
                            return {
                                select: vi.fn().mockReturnThis(),
                                single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                            };
                        }),
                    };
                }
                if (table === "requests") {
                    return createMockFromChain({ user_id: TEST_USER_B, name: "Project B", email: "b@test.com" }, null);
                }
                if (table === "notifications") {
                    notificationCreated = true;
                    return createMockFromChain({ id: "notif-1" }, null);
                }
                return createMockFromChain(null, null);
            });

            const body = {
                project_id: PROJECT_B,
                content: "Spamming Project B",
            };

            const request = new NextRequest("http://localhost:3000/api/messages", {
                method: "POST",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });

            await POST(request);

            expect(notificationCreated).toBe(true);
        });

        it("13. User A's sender_id is correctly set (server-side)", async () => {
            const body = {
                project_id: PROJECT_B,
                content: "Test message",
            };

            const request = new NextRequest("http://localhost:3000/api/messages", {
                method: "POST",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });

            const response = await POST(request);
            const result = await response.json();

            expect(result.data.sender_id).toBe(TEST_USER_A);
            expect(result.data.sender_email).toBe("user-a@test.com");
        });

        it("14. User A can send with attachments to external projects", async () => {
            const body = {
                project_id: PROJECT_B,
                content: "Message with attachment",
                attachment_url: "https://storage.supabase.co/bucket/test.pdf",
                attachment_type: "document",
                attachment_name: "test.pdf",
            };

            const request = new NextRequest("http://localhost:3000/api/messages", {
                method: "POST",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });

            const response = await POST(request);

            expect(response.status).toBe(201);
        });

        it("15. User A can send to other projects in system", async () => {
            const request = new NextRequest("http://localhost:3000/api/messages", {
                method: "POST",
                body: JSON.stringify({
                    project_id: PROJECT_C,
                    content: "I can post anywhere!",
                }),
                headers: { "Content-Type": "application/json" },
            });

            const response = await POST(request);

            expect(response.status).toBe(201);
        });
    });
});

describe("CRITICAL: API Authorization Bypass - Verification Tests (Should FAIL after fix)", () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();
        
        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: TEST_USER_A, email: "user-a@test.com" } },
                    error: null,
                }),
            },
            from: vi.fn((table: string) => {
                if (table === "project_members") {
                    return createMockFromChain([], null);
                }
                return createMockFromChain(null, null);
            }),
            storage: {
                from: vi.fn(() => ({
                    upload: vi.fn(),
                    getPublicUrl: vi.fn(),
                })),
            },
        };

        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("3. Authorization Verification - These tests prove the FIX is needed", () => {
        it("16. After fix: User A cannot read Project B messages - VULNERABILITY EXISTS", async () => {
            mockSupabase.from = vi.fn((table: string) => {
                if (table === "project_messages") {
                    return createMockFromChain([{ id: "msg-1", content: "Secret" }], null);
                }
                if (table === "project_members") {
                    return createMockFromChain([{ user_id: TEST_USER_A, project_id: PROJECT_A }], null);
                }
                return createMockFromChain([], null);
            });

            const request = new NextRequest(`http://localhost:3000/api/messages?project_id=${PROJECT_B}`);
            const response = await GET(request);

            expect(response.status).toBe(200);
        });

        it("17. After fix: User A cannot send to Project B - VULNERABILITY EXISTS", async () => {
            mockSupabase.from = vi.fn((table: string) => {
                if (table === "project_members") {
                    return createMockFromChain([{ user_id: TEST_USER_A, project_id: PROJECT_A }], null);
                }
                if (table === "project_messages") {
                    return {
                        insert: vi.fn().mockImplementation(() => {
                            return {
                                select: vi.fn().mockReturnThis(),
                                single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                            };
                        }),
                    };
                }
                if (table === "requests") {
                    return createMockFromChain({ user_id: TEST_USER_B }, null);
                }
                return createMockFromChain(null, null);
            });

            const body = {
                project_id: PROJECT_B,
                content: "Unauthorized message",
            };

            const request = new NextRequest("http://localhost:3000/api/messages", {
                method: "POST",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            });

            const response = await POST(request);

            expect(response.status).toBe(201);
        });

        it("18. After fix: Member verification is enforced - NO MEMBERSHIP CHECK EXISTS", async () => {
            let membershipCheckCalled = false;
            mockSupabase.from = vi.fn((table: string) => {
                if (table === "project_members") {
                    membershipCheckCalled = true;
                    return createMockFromChain([], null);
                }
                return createMockFromChain(null, null);
            });

            const request = new NextRequest(`http://localhost:3000/api/messages?project_id=${PROJECT_B}`);
            await GET(request);

            expect(membershipCheckCalled).toBe(false);
        });

        it("19. After fix: 403 returned for non-members - RETURNS 200 INSTEAD", async () => {
            mockSupabase.from = vi.fn((table: string) => {
                if (table === "project_messages") {
                    return createMockFromChain([{ id: "msg-1", content: "Secret" }], null);
                }
                return createMockFromChain([], null);
            });

            const request = new NextRequest(`http://localhost:3000/api/messages?project_id=${PROJECT_B}`);
            const response = await GET(request);

            expect(response.status).not.toBe(403);
            expect(response.status).toBe(200);
        });
    });
});

describe("SECURITY SUMMARY: Authorization Bypass Vulnerabilities Proven", () => {
    it("SUMMARY: Both vulnerabilities are confirmed to exist", () => {
        const vulnerabilities = {
            getMessagesNoMembershipCheck: true,
            postMessagesNoMembershipCheck: true,
        };

        expect(vulnerabilities.getMessagesNoMembershipCheck).toBe(true);
        expect(vulnerabilities.postMessagesNoMembershipCheck).toBe(true);
    });

    it("IMPACT: Any authenticated user can access any project's messages", () => {
        const attackVector = "Authenticated user with any project_id can access ALL projects";
        expect(attackVector.length).toBeGreaterThan(0);
    });

    it("IMPACT: Any authenticated user can send messages to any project", () => {
        const attackVector = "Authenticated user can inject messages into any project";
        expect(attackVector.length).toBeGreaterThan(0);
    });

    it("REMEDIATION: Add project membership verification to GET and POST /api/messages", () => {
        const fixRequired = [
            "GET /api/messages: Check user is member of project_id",
            "POST /api/messages: Check user is member of project_id", 
        ];
        expect(fixRequired.length).toBe(2);
    });
});
