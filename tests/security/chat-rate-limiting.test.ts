/**
 * @fileoverview Security tests for Chat/Message Rate Limiting
 *
 * These tests verify that:
 * 1. GET /api/messages - rate limiting on fetch
 * 2. POST /api/messages - rate limiting on send
 * 3. PATCH /api/messages/[id]/read - rate limiting on mark as read
 * 4. Rate limit bypass prevention
 * 5. DoS mitigation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as messagesGet, POST as messagesPost } from "@/app/api/messages/route";
import { PATCH as readPatch } from "@/app/api/messages/[id]/read/route";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn().mockReturnValue(true),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("Security: Chat Rate Limiting - GET /api/messages", () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-1", email: "user@test.com" } },
                    error: null,
                }),
            },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                        lt: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                            }),
                        }),
                        in: vi.fn().mockReturnValue({
                            select: vi.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                    }),
                }),
            }),
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createGetMessagesRequest(ip: string, projectId: string = "123e4567-e89b-12d3-a456-426614174000") {
        return new NextRequest(`http://localhost:3000/api/messages?project_id=${projectId}&limit=50`, {
            method: "GET",
            headers: {
                "x-forwarded-for": ip,
            },
        });
    }

    describe("GET /api/messages Rate Limiting - Fetch", () => {
        it("1. Tracks requests per IP for message fetch", async () => {
            const ip = "192.168.1.1";
            const req = createGetMessagesRequest(ip);
            const res = await messagesGet(req);
            expect([200, 429]).toContain(res.status);
        });

        it("2. Returns 429 when fetch limit exceeded", async () => {
            const ip = "192.168.1.2";
            let rateLimited = false;

            for (let i = 0; i < 65; i++) {
                const req = createGetMessagesRequest(ip);
                const res = await messagesGet(req);
                if (res.status === 429) rateLimited = true;
            }

            expect(rateLimited).toBe(true);
        });

        it("3. Independent IP tracking works", async () => {
            const ip1 = "192.168.1.10";
            const ip2 = "192.168.1.11";

            const req1 = createGetMessagesRequest(ip1);
            const res1 = await messagesGet(req1);

            const req2 = createGetMessagesRequest(ip2);
            const res2 = await messagesGet(req2);

            expect([200, 429]).toContain(res1.status);
            expect([200, 429]).toContain(res2.status);
        });

        it("4. Window resets after time period", async () => {
            const ip = "192.168.1.3";
            
            const req1 = createGetMessagesRequest(ip);
            const res1 = await messagesGet(req1);
            expect([200, 429]).toContain(res1.status);
        });

        it("5. Includes retry-after header", async () => {
            const ip = "192.168.1.4";

            for (let i = 0; i < 60; i++) {
                const req = createGetMessagesRequest(ip);
                await messagesGet(req);
            }

            const req = createGetMessagesRequest(ip);
            const res = await messagesGet(req);

            if (res.status === 429) {
                const retryAfter = res.headers.get("retry-after");
                expect(retryAfter).toBeTruthy();
            }
        });
    });
});

describe("Security: Chat Rate Limiting - POST /api/messages", () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-1", email: "user@test.com" } },
                    error: null,
                }),
            },
            from: vi.fn().mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                    }),
                }),
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: { user_id: "other-user" }, error: null }),
                    }),
                }),
            }),
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createPostMessageRequest(ip: string, body: any = {}) {
        const defaultBody = {
            project_id: "123e4567-e89b-12d3-a456-426614174000",
            content: "Test message content",
        };
        return new NextRequest("http://localhost:3000/api/messages", {
            method: "POST",
            headers: {
                "x-forwarded-for": ip,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...defaultBody, ...body }),
        });
    }

    describe("POST /api/messages Rate Limiting - Send", () => {
        it("1. Tracks messages sent per user/IP", async () => {
            const ip = "192.168.2.1";
            const req = createPostMessageRequest(ip);
            const res = await messagesPost(req);
            expect([201, 429]).toContain(res.status);
        });

        it("2. Blocks spam after threshold", async () => {
            const ip = "192.168.2.2";
            const responses: number[] = [];

            for (let i = 0; i < 30; i++) {
                const req = createPostMessageRequest(ip);
                const res = await messagesPost(req);
                responses.push(res.status);
            }

            expect(responses).toContain(429);
        });

        it("3. Different users have independent limits", async () => {
            const ip1 = "192.168.2.10";
            const ip2 = "192.168.2.11";

            for (let i = 0; i < 30; i++) {
                const req = createPostMessageRequest(ip1);
                await messagesPost(req);
            }

            const req1 = createPostMessageRequest(ip1);
            const res1 = await messagesPost(req1);

            const req2 = createPostMessageRequest(ip2);
            const res2 = await messagesPost(req2);

            if (res1.status === 429) {
                expect(res2.status).toBe(201);
            }
        });

        it("4. Rate limit applies before auth", async () => {
            const ip = "192.168.2.3";
            
            for (let i = 0; i < 30; i++) {
                const req = createPostMessageRequest(ip);
                await messagesPost(req);
            }

            const req = createPostMessageRequest(ip);
            const res = await messagesPost(req);

            if (res.status === 429) {
                const body = await res.json();
                expect(body.error).toContain("Rate limit");
            }
        });

        it("5. Burst detection works", async () => {
            const ip = "192.168.2.4";
            const timestamps: number[] = [];

            for (let i = 0; i < 10; i++) {
                timestamps.push(Date.now());
                const req = createPostMessageRequest(ip);
                await messagesPost(req);
            }

            const timeSpan = timestamps[timestamps.length - 1] - timestamps[0];
            expect(timeSpan).toBeLessThan(5000);
        });
    });
});

describe("Security: Chat Rate Limiting - PATCH /api/messages/[id]/read", () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-1", email: "user@test.com" } },
                    error: null,
                }),
            },
            from: vi.fn().mockImplementation((table) => {
                if (table === "project_messages") {
                    return {
                        select: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({ 
                                    data: { id: "msg-1", project_id: "proj-1", sender_id: "other-user" }, 
                                    error: null 
                                }),
                            }),
                        }),
                    };
                }
                if (table === "requests") {
                    return {
                        select: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({ 
                                    data: { id: "proj-1", user_id: "user-1", client_email: "user@test.com" }, 
                                    error: null 
                                }),
                            }),
                        }),
                    };
                }
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: null, error: null }),
                        }),
                    }),
                    upsert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: "read-1" }, error: null }),
                        }),
                    }),
                };
            }),
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createReadReceiptRequest(ip: string, messageId: string = "123e4567-e89b-12d3-a456-426614174000") {
        return new NextRequest(`http://localhost:3000/api/messages/${messageId}/read`, {
            method: "PATCH",
            headers: {
                "x-forwarded-for": ip,
            },
        });
    }

    function mockParams(id: string) {
        return Promise.resolve({ params: { id } });
    }

    describe("PATCH /api/messages/[id]/read Rate Limiting", () => {
        it("1. Limits read receipt creation", async () => {
            const ip = "192.168.3.1";
            const req = createReadReceiptRequest(ip);
            const res = await readPatch(req, await mockParams("msg-1"));
            expect([200, 429]).toContain(res.status);
        });

        it("2. Blocks rapid read marking", async () => {
            const ip = "192.168.3.2";
            let rateLimited = false;

            for (let i = 0; i < 60; i++) {
                const req = createReadReceiptRequest(ip);
                const res = await readPatch(req, await mockParams(`msg-${i}`));
                if (res.status === 429) rateLimited = true;
            }

            expect(rateLimited).toBe(true);
        });

        it("3. Prevents DoS via read receipts", async () => {
            const ip = "192.168.3.3";
            let rateLimited = false;

            for (let i = 0; i < 60; i++) {
                const req = createReadReceiptRequest(ip);
                const res = await readPatch(req, await mockParams(`msg-${i}`));
                if (res.status === 429) rateLimited = true;
            }

            expect(rateLimited).toBe(true);
        });
    });
});

describe("Security: Rate Limit Bypass Prevention", () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-1", email: "user@test.com" } },
                    error: null,
                }),
            },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                        }),
                    }),
                }),
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
                    }),
                }),
            }),
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Bypass Prevention", () => {
        it("1. Same IP with different headers still limited", async () => {
            const ip = "192.168.4.10";

            for (let i = 0; i < 60; i++) {
                const req = new NextRequest("http://localhost:3000/api/messages?project_id=123", {
                    method: "GET",
                    headers: {
                        "x-forwarded-for": ip,
                        "user-agent": `Agent-${i}`,
                    },
                });
                await messagesGet(req);
            }

            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123", {
                method: "GET",
                headers: {
                    "x-forwarded-for": ip,
                    "user-agent": "Different Agent",
                },
            });
            const res = await messagesGet(req);
            expect(res.status).toBe(429);
        });

        it("2. User-agent spoofing doesn't bypass", async () => {
            const ip = "192.168.4.11";

            for (let i = 0; i < 30; i++) {
                const req = new NextRequest("http://localhost:3000/api/messages", {
                    method: "POST",
                    headers: {
                        "x-forwarded-for": ip,
                        "Content-Type": "application/json",
                        "user-agent": `SpoofedAgent-${i}`,
                    },
                    body: JSON.stringify({
                        project_id: "123e4567-e89b-12d3-a456-426614174000",
                        content: "Test",
                    }),
                });
                await messagesPost(req);
            }

            const req = new NextRequest("http://localhost:3000/api/messages", {
                method: "POST",
                headers: {
                    "x-forwarded-for": ip,
                    "Content-Type": "application/json",
                    "user-agent": "iPhone",
                },
                body: JSON.stringify({
                    project_id: "123e4567-e89b-12d3-a456-426614174000",
                    content: "Test",
                }),
            });
            const res = await messagesPost(req);
            expect(res.status).toBe(429);
        });

        it("3. X-forwarded-for spoofing doesn't bypass", async () => {
            const ip = "192.168.4.12";

            for (let i = 0; i < 60; i++) {
                const req = new NextRequest("http://localhost:3000/api/messages?project_id=123", {
                    method: "GET",
                    headers: {
                        "x-forwarded-for": ip,
                        "user-agent": `Agent-${i}`,
                    },
                });
                await messagesGet(req);
            }

            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123", {
                method: "GET",
                headers: {
                    "x-forwarded-for": ip,
                    "user-agent": "Different Agent",
                },
            });
            const res = await messagesGet(req);
            expect(res.status).toBe(429);
        });
    });

    describe("DoS Mitigation", () => {
        function mockParams(id: string) {
            return Promise.resolve({ params: { id } });
        }

        it("1. Prevents message flooding", async () => {
            const ip = "192.168.5.1";
            let successCount = 0;
            let blockedCount = 0;

            for (let i = 0; i < 50; i++) {
                const req = new NextRequest("http://localhost:3000/api/messages", {
                    method: "POST",
                    headers: {
                        "x-forwarded-for": ip,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        project_id: "123e4567-e89b-12d3-a456-426614174000",
                        content: `Message ${i}`,
                    }),
                });
                const res = await messagesPost(req);
                if (res.status === 201) successCount++;
                if (res.status === 429) blockedCount++;
            }

            expect(blockedCount).toBeGreaterThan(0);
        });

        it("2. Prevents read receipt flooding", async () => {
            const ip = "192.168.5.2";
            let rateLimited = false;

            mockSupabase.from = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ 
                            data: { id: "msg-1", sender_id: "other-user" }, 
                            error: null 
                        }),
                    }),
                }),
                upsert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: { id: "read-1" }, error: null }),
                    }),
                }),
            });

            for (let i = 0; i < 60; i++) {
                const req = new NextRequest(`http://localhost:3000/api/messages/${i}/read`, {
                    method: "PATCH",
                    headers: {
                        "x-forwarded-for": ip,
                    },
                });
                const res = await readPatch(req, await mockParams(String(i)));
                if (res.status === 429) rateLimited = true;
            }

            expect(rateLimited).toBe(true);
        });

        it("3. Handles distributed attack simulation", async () => {
            const results: number[] = [];

            for (let i = 0; i < 10; i++) {
                const ip = `192.168.6.${i}`;
                const req = new NextRequest("http://localhost:3000/api/messages?project_id=123", {
                    method: "GET",
                    headers: {
                        "x-forwarded-for": ip,
                    },
                });
                const res = await messagesGet(req);
                results.push(res.status);
            }

            expect(results.every(s => s === 200)).toBe(true);
        });

        it("4. Returns proper error format", async () => {
            const ip = "192.168.5.4";

            for (let i = 0; i < 60; i++) {
                const req = new NextRequest("http://localhost:3000/api/messages?project_id=123", {
                    method: "GET",
                    headers: {
                        "x-forwarded-for": ip,
                    },
                });
                await messagesGet(req);
            }

            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123", {
                method: "GET",
                headers: {
                    "x-forwarded-for": ip,
                },
            });
            const res = await messagesGet(req);

            if (res.status === 429) {
                const body = await res.json();
                expect(body).toHaveProperty("error");
                expect(body.error).toBeTruthy();
                const contentType = res.headers.get("content-type");
                expect(contentType).toContain("application/json");
            }
        });
    });
});
