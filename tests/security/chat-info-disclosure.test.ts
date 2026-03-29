/**
 * @fileoverview Security tests for Chat/Messaging Information Disclosure
 *
 * Tests verify:
 * - Error messages don't leak sensitive info (schema, internals, stack traces)
 * - Debug mode is disabled
 * - Response headers don't expose server info
 * - Timing attacks are prevented
 * - User enumeration is not possible
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

describe("Security: Chat Information Disclosure - Error Messages", () => {
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
            }),
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("1. Database errors don't expose schema", () => {
        it("1. database connection failures return generic message", async () => {
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
                                limit: vi.fn().mockResolvedValue({
                                    data: null,
                                    error: { message: "relation \"project_messages\" does not exist at character 15", code: "42P01" }
                                }),
                            }),
                        }),
                    }),
                }),
            };
            (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);

            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            const res = await messagesGet(req);

            expect(res.status).toBe(500);
            const body = await res.json();
            expect(body.error).toBe("Database error");
            expect(body.error).not.toContain("relation");
            expect(body.error).not.toContain("character");
            expect(body.error).not.toContain("42P01");
            expect(body.error).not.toContain("schema");
        });

        it("2. database permission errors return generic message", async () => {
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
                                limit: vi.fn().mockResolvedValue({
                                    data: null,
                                    error: { message: "permission denied for table project_messages", code: "42501" }
                                }),
                            }),
                        }),
                    }),
                }),
            };
            (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);

            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            const res = await messagesGet(req);

            expect(res.status).toBe(500);
            const body = await res.json();
            expect(body.error).toBe("Database error");
            expect(body.error).not.toContain("permission");
            expect(body.error).not.toContain("table");
            expect(body.error).not.toContain("42501");
        });

        it("3. SQL injection errors are sanitized", async () => {
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
                                limit: vi.fn().mockResolvedValue({
                                    data: null,
                                    error: { message: "syntax error at or near \"DROP\"", hint: "DROP TABLE users" }
                                }),
                            }),
                        }),
                    }),
                }),
            };
            (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);

            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            const res = await messagesGet(req);

            expect(res.status).toBe(500);
            const body = await res.json();
            expect(body.error).toBe("Database error");
            expect(body.error).not.toContain("DROP");
            expect(body.error).not.toContain("syntax error");
            expect(body.hint).toBeUndefined();
        });
    });

    describe("2. Validation errors don't expose internals", () => {
        it("1. validation errors should not expose details (VULNERABILITY DETECTED: API returns details field)", async () => {
            const invalidBody = {
                project_id: "not-a-uuid",
                content: "test",
            };
            const req = new NextRequest("http://localhost:3000/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(invalidBody),
            });

            const res = await messagesPost(req);

            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body.error).toBe("Validation failed");
            expect(body.details).toBeUndefined();
        });

        it("2. missing fields don't expose schema details", async () => {
            const req = new NextRequest("http://localhost:3000/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });

            const res = await messagesPost(req);

            expect(res.status).toBe(400);
            const body = await res.json();
            const responseStr = JSON.stringify(body);
            expect(responseStr).not.toContain("project_messages");
            expect(responseStr).not.toContain("sender_id");
            expect(responseStr).not.toContain("uuid");
        });
    });

    describe("3. Auth errors are generic", () => {
        it("1. responses should not expose token details", async () => {
            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            const res = await messagesGet(req);

            const body = await res.json();
            const responseStr = JSON.stringify(body);
            expect(responseStr).not.toContain("JWT");
            expect(responseStr).not.toContain("signature");
            expect(responseStr).not.toContain("jwt_signature");
            expect(responseStr).not.toContain("expired");
            expect(responseStr).not.toContain("token");
        });

        it("2. auth errors don't expose auth implementation", async () => {
            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            const res = await messagesGet(req);

            const body = await res.json();
            const responseStr = JSON.stringify(body);
            expect(responseStr).not.toContain("Supabase");
            expect(responseStr).not.toContain("supabase");
            expect(responseStr).not.toContain("provider");
        });

        it("3. error responses follow consistent format", async () => {
            const req1 = new NextRequest("http://localhost:3000/api/messages");
            const res1 = await messagesGet(req1);

            const body1 = await res1.json();

            expect(body1.error).toBeDefined();
            expect(typeof body1.error).toBe("string");
        });
    });

    describe("4. Stack traces not exposed", () => {
        it("1. catch block errors don't leak stack", async () => {
            mockSupabase = {
                auth: {
                    getUser: vi.fn().mockImplementation(() => {
                        throw new Error("ReferenceError: Cannot access undefined variable");
                    }),
                },
            };
            (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);

            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            const res = await messagesGet(req);

            expect(res.status).toBe(500);
            const body = await res.json();
            expect(body.error).toBe("Unexpected error");
            const responseStr = JSON.stringify(body);
            expect(responseStr).not.toContain("ReferenceError");
            expect(responseStr).not.toContain("at ");
            expect(responseStr).not.toContain("stack");
        });

        it("2. async errors don't expose internal paths", async () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({
                        data: { user: { id: "user-1", email: "user@test.com" } },
                        error: null,
                    }),
                },
                from: vi.fn().mockImplementation(() => {
                    throw new Error("/path/to/node_modules/supabase/index.js:45:30");
                }),
            };
            (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);

            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            const res = await messagesGet(req);

            expect(res.status).toBe(500);
            const body = await res.json();
            expect(body.error).toBe("Unexpected error");
            const responseStr = JSON.stringify(body);
            expect(responseStr).not.toContain("/path/to");
            expect(responseStr).not.toContain("node_modules");

            consoleSpy.mockRestore();
        });
    });
});

describe("Security: Chat Information Disclosure - Response Headers", () => {
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
            }),
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("1. X-Powered-By header not present", () => {
        it("1. responses don't include X-Powered-By header", async () => {
            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            const res = await messagesGet(req);

            const xPoweredBy = res.headers.get("X-Powered-By");
            expect(xPoweredBy).toBeNull();
        });
    });

    describe("2. Server header doesn't expose version", () => {
        it("1. responses don't expose server version", async () => {
            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            const res = await messagesGet(req);

            const server = res.headers.get("Server");
            expect(server).toBeNull();
        });
    });

    describe("3. X-Debug header not present", () => {
        it("1. responses don't include X-Debug header", async () => {
            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            const res = await messagesGet(req);

            const xDebug = res.headers.get("X-Debug");
            expect(xDebug).toBeNull();
        });

        it("2. verbose logging not enabled in responses", async () => {
            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            const res = await messagesGet(req);
            const body = await res.json();

            const responseStr = JSON.stringify(body);
            expect(responseStr).not.toContain("debug");
            expect(responseStr).not.toContain("query_time");
            expect(responseStr).not.toContain("execution_time");
        });
    });
});

describe("Security: Chat Information Disclosure - Timing Attacks", () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("1. Error responses have consistent timing", () => {
        it("1. database errors have similar timing to success", async () => {
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
                }),
            };
            (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);

            const start1 = Date.now();
            const req1 = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            await messagesGet(req1);
            const successTime = Date.now() - start1;

            mockSupabase.from = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            limit: vi.fn().mockResolvedValue({
                                data: null,
                                error: { message: "Database error" }
                            }),
                        }),
                    }),
                }),
            });

            const start2 = Date.now();
            const req2 = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174001");
            await messagesGet(req2);
            const errorTime = Date.now() - start2;

            const timeDiff = Math.abs(successTime - errorTime);
            expect(timeDiff).toBeLessThan(100);
        });

        it("2. validation vs auth errors have consistent timing", async () => {
            mockSupabase = {
                auth: {
                    getUser: vi.fn().mockResolvedValue({
                        data: { user: { id: "user-1", email: "user@test.com" } },
                        error: null,
                    }),
                },
            };
            (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);

            const start1 = Date.now();
            const req1 = new NextRequest("http://localhost:3000/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: "test" }),
            });
            await messagesPost(req1);
            const validationTime = Date.now() - start1;

            mockSupabase.auth.getUser = vi.fn().mockResolvedValue({
                data: null,
                error: null,
            });

            const start2 = Date.now();
            const req2 = new NextRequest("http://localhost:3000/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ project_id: "123e4567-e89b-12d3-a456-426614174000", content: "test" }),
            });
            await messagesPost(req2);
            const authTime = Date.now() - start2;

            const timeDiff = Math.abs(validationTime - authTime);
            expect(timeDiff).toBeLessThan(100);
        });
    });

    describe("2. Auth failures take same time", () => {
        it("1. invalid user vs valid user auth check timing", async () => {
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
                }),
            };
            (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);

            const start1 = Date.now();
            const req1 = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            await messagesGet(req1);
            const validUserTime = Date.now() - start1;

            mockSupabase.auth.getUser = vi.fn().mockResolvedValue({
                data: null,
                error: null,
            });

            const start2 = Date.now();
            const req2 = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            await messagesGet(req2);
            const noUserTime = Date.now() - start2;

            const timeDiff = Math.abs(validUserTime - noUserTime);
            expect(timeDiff).toBeLessThan(100);
        });

        it("2. different auth errors have same timing", async () => {
            const errorTypes = [
                { message: "Invalid JWT", code: "jwt_invalid" },
                { message: "Token expired", code: "jwt_expired" },
                { message: "User not found", code: "user_not_found" },
            ];

            const times: number[] = [];

            for (const err of errorTypes) {
                mockSupabase = {
                    auth: {
                        getUser: vi.fn().mockResolvedValue({
                            data: null,
                            error: err,
                        }),
                    },
                };
                (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);

                const start = Date.now();
                const req = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
                await messagesGet(req);
                times.push(Date.now() - start);
            }

            const maxDiff = Math.max(...times) - Math.min(...times);
            expect(maxDiff).toBeLessThan(100);
        });
    });
});

describe("Security: Chat Information Disclosure - User Enumeration", () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("1. Message enumeration not possible without project_id", () => {
        it("1. missing project_id returns 400 without enumeration", async () => {
            const req = new NextRequest("http://localhost:3000/api/messages");
            const res = await messagesGet(req);

            expect(res.status).toBe(400);
            const body = await res.json();
            expect(body.error).toBe("project_id is required");
        });

        it("2. invalid project_id format should not expose internal details", async () => {
            const req = new NextRequest("http://localhost:3000/api/messages?project_id=invalid-id");
            const res = await messagesGet(req);

            const body = await res.json();
            const responseStr = JSON.stringify(body);
            expect(responseStr).not.toContain("project_messages");
            expect(responseStr).not.toContain("schema");
        });

        it("3. cannot enumerate messages across projects", async () => {
            const projects = [
                "123e4567-e89b-12d3-a456-426614174000",
                "123e4567-e89b-12d3-a456-426614174001",
                "123e4567-e89b-12d3-a456-426614174002",
            ];

            for (const projectId of projects) {
                const req = new NextRequest(`http://localhost:3000/api/messages?project_id=${projectId}`);
                const res = await messagesGet(req);
                expect([200, 401, 403, 500]).toContain(res.status);
            }
        });
    });

    describe("2. User existence not revealed through errors", () => {
        it("1. database errors should not expose error codes", async () => {
            const req = new NextRequest("http://localhost:3000/api/messages?project_id=999e4567-e89b-12d3-a456-426614174999");
            const res = await messagesGet(req);

            const body = await res.json();
            const responseStr = JSON.stringify(body);
            expect(responseStr).not.toContain("PGRST116");
            expect(responseStr).not.toContain("does not exist");
        });

        it("2. auth errors should not reveal user existence", async () => {
            const req = new NextRequest("http://localhost:3000/api/messages?project_id=123e4567-e89b-12d3-a456-426614174000");
            const res = await messagesGet(req);

            const body = await res.json();
            const responseStr = JSON.stringify(body);
            expect(responseStr).not.toContain("not found");
            expect(responseStr).not.toContain("user_not_found");
        });

        it("3. responses don't expose internal project details", async () => {
            const existingProject = "123e4567-e89b-12d3-a456-426614174000";

            const req = new NextRequest(`http://localhost:3000/api/messages?project_id=${existingProject}`);
            const res = await messagesGet(req);

            const body = await res.json();
            const responseStr = JSON.stringify(body);

            expect(responseStr).not.toContain("PGRST");
            expect(responseStr).not.toContain("relation");
            expect(responseStr).not.toContain("table");
        });
    });
});
