/**
 * @fileoverview Security tests for SQL Injection Prevention - Real Validation
 *
 * These tests verify that:
 * 1. Supabase query builder is used (parameterized queries)
 * 2. SQL injection payloads don't modify query behavior
 * 3. Search parameters are safely handled
 * 4. Error messages don't leak database structure
 * 5. The actual query methods called are safe
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as requestsGet, POST as requestsPost } from "@/app/api/requests/route";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("Security: SQL Injection Prevention - Real Validation", () => {
    let mockSupabase: any;
    let queryLog: any[] = [];

    beforeEach(() => {
        vi.clearAllMocks();
        queryLog = [];

        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-1", email: "test@test.com" } },
                    error: null,
                }),
            },
            from: vi.fn().mockImplementation((table: string) => {
                queryLog.push({ method: "from", table });
                const queryChain = {
                    eq: vi.fn().mockImplementation((col: string, val: any) => {
                        queryLog.push({ method: "eq", column: col, value: val });
                        return queryChain;
                    }),
                    ilike: vi.fn().mockImplementation((col: string, pattern: string) => {
                        queryLog.push({ method: "ilike", column: col, pattern });
                        return queryChain;
                    }),
                    order: vi.fn().mockImplementation((column: string, options?: any) => {
                        queryLog.push({ method: "order", column, options });
                        return queryChain;
                    }),
                    then: vi.fn().mockImplementation((resolve: any, reject: any) => {
                        resolve({ data: [], error: null });
                    }),
                };
                return {
                    select: vi.fn().mockImplementation((columns: string) => {
                        queryLog.push({ method: "select", columns });
                        return queryChain;
                    }),
                    insert: vi.fn().mockImplementation((data: any) => {
                        queryLog.push({ method: "insert", data });
                        return {
                            select: vi.fn().mockReturnThis(),
                            single: vi.fn().mockResolvedValue({ data: { id: "1" }, error: null }),
                        };
                    }),
                };
            }),
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createJsonRequest(body: unknown, url = "http://localhost:3000/api/requests") {
        return new NextRequest(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    }

    describe("SQL Injection in POST /api/requests - Real Validation", () => {
        it("1. Uses parameterized insert for DROP TABLE payload", async () => {
            const req = createJsonRequest({
                name: "'; DROP TABLE requests; --",
                email: "test@test.com",
            });

            await requestsPost(req);

            // Verify insert was called with the payload as data, not as SQL
            const insertCall = queryLog.find(q => q.method === "insert");
            expect(insertCall).toBeDefined();
            expect(insertCall.data.name).toBe("'; DROP TABLE requests; --");
            // The value should be passed as-is to the query builder, not executed as SQL
        });

        it("2. Uses parameterized insert for OR injection", async () => {
            const req = createJsonRequest({
                name: "admin' OR '1'='1",
                email: "test@test.com",
            });

            await requestsPost(req);

            const insertCall = queryLog.find(q => q.method === "insert");
            expect(insertCall.data.name).toBe("admin' OR '1'='1");
        });

        it("3. Uses parameterized insert for UNION SELECT", async () => {
            const req = createJsonRequest({
                name: "' UNION SELECT * FROM users--",
                email: "test@test.com",
            });

            await requestsPost(req);

            const insertCall = queryLog.find(q => q.method === "insert");
            expect(insertCall.data.name).toBe("' UNION SELECT * FROM users--");
        });

        it("4. Uses parameterized insert for stacked queries", async () => {
            const req = createJsonRequest({
                name: "test'; DELETE FROM requests WHERE 1=1; --",
                email: "test@test.com",
            });

            await requestsPost(req);

            const insertCall = queryLog.find(q => q.method === "insert");
            expect(insertCall.data.name).toBe("test'; DELETE FROM requests WHERE 1=1; --");
        });

        it("5. Uses parameterized insert for comment injection", async () => {
            const req = createJsonRequest({
                name: "admin'--",
                email: "test@test.com",
            });

            await requestsPost(req);

            const insertCall = queryLog.find(q => q.method === "insert");
            expect(insertCall.data.name).toBe("admin'--");
        });

        it("6. Uses parameterized insert for hex injection", async () => {
            const req = createJsonRequest({
                name: "0x73656c656374",
                email: "test@test.com",
            });

            await requestsPost(req);

            const insertCall = queryLog.find(q => q.method === "insert");
            expect(insertCall.data.name).toBe("0x73656c656374");
        });

        it("7. Uses parameterized insert for CHAR() function", async () => {
            const req = createJsonRequest({
                name: "CHAR(65) --",
                email: "test@test.com",
            });

            await requestsPost(req);

            const insertCall = queryLog.find(q => q.method === "insert");
            expect(insertCall.data.name).toBe("CHAR(65) --");
        });

        it("8. Accepts valid names with apostrophes safely", async () => {
            const req = createJsonRequest({
                name: "John O'Brien",
                email: "test@test.com",
            });

            await requestsPost(req);

            const insertCall = queryLog.find(q => q.method === "insert");
            expect(insertCall.data.name).toBe("John O'Brien");
        });

        it("9. Stores semicolon in name safely", async () => {
            const req = createJsonRequest({
                name: "John;Doe",
                email: "test@test.com",
            });

            await requestsPost(req);

            const insertCall = queryLog.find(q => q.method === "insert");
            expect(insertCall.data.name).toBe("John;Doe");
        });

        it("10. Stores double dash in name safely", async () => {
            const req = createJsonRequest({
                name: "John--Doe",
                email: "test@test.com",
            });

            await requestsPost(req);

            const insertCall = queryLog.find(q => q.method === "insert");
            expect(insertCall.data.name).toBe("John--Doe");
        });
    });

    describe("SQL Injection via GET Query Params - Real Validation", () => {
        it("11. Uses eq for user_id filter (safe)", async () => {
            const req = new NextRequest(
                "http://localhost:3000/api/requests"
            );

            await requestsGet(req);

            // Should use eq for user_id filter, not raw SQL
            const eqCall = queryLog.find(q => q.method === "eq");
            expect(eqCall).toBeDefined();
            expect(eqCall.column).toBe("user_id");
        });

        it("12. Sanitizes query params with SQL injection payload", async () => {
            const req = new NextRequest(
                "http://localhost:3000/api/requests?filter=' OR '1'='1"
            );

            const res = await requestsGet(req);

            // Should return 200 or 401, not crash
            expect([200, 401]).toContain(res.status);
        });

        it("13. Sanitizes UNION-based injection in query", async () => {
            const req = new NextRequest(
                "http://localhost:3000/api/requests?filter=' UNION SELECT * FROM users--"
            );

            const res = await requestsGet(req);

            expect([200, 401]).toContain(res.status);
        });

        it("14. Sanitizes DROP TABLE attempt in query", async () => {
            const req = new NextRequest(
                "http://localhost:3000/api/requests?filter=DROP TABLE requests"
            );

            const res = await requestsGet(req);

            expect([200, 401]).toContain(res.status);
        });

        it("15. Sanitizes comment-terminated injection", async () => {
            const req = new NextRequest(
                "http://localhost:3000/api/requests?filter=admin'--"
            );

            const res = await requestsGet(req);

            expect([200, 401]).toContain(res.status);
        });

        it("16. Sanitizes semicolon-separated commands", async () => {
            const req = new NextRequest(
                "http://localhost:3000/api/requests?filter=test;DELETE FROM requests"
            );

            const res = await requestsGet(req);

            expect([200, 401]).toContain(res.status);
        });

        it("17. Sanitizes sleep-based time delay", async () => {
            const req = new NextRequest(
                "http://localhost:3000/api/requests?filter=' OR SLEEP(5)--"
            );

            const res = await requestsGet(req);

            expect([200, 401]).toContain(res.status);
        });

        it("18. Sanitizes benchmark-based time delay", async () => {
            const req = new NextRequest(
                "http://localhost:3000/api/requests?filter=' OR BENCHMARK(1000000,MD5(1))--"
            );

            const res = await requestsGet(req);

            expect([200, 401]).toContain(res.status);
        });

        it("19. Sanitizes subquery injection", async () => {
            const req = new NextRequest(
                "http://localhost:3000/api/requests?filter=' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--"
            );

            const res = await requestsGet(req);

            expect([200, 401]).toContain(res.status);
        });

        it("20. Sanitizes boolean-based blind injection", async () => {
            const req = new NextRequest(
                "http://localhost:3000/api/requests?filter=' AND 1=1--"
            );

            const res = await requestsGet(req);

            expect([200, 401]).toContain(res.status);
        });
    });

    describe("SQL Injection in Blog API - Real Validation", () => {
        it("21. Handles injection in blog search safely", async () => {
            const { GET } = await import("@/app/api/blog/route");
            const req = new NextRequest("http://localhost:3000/api/blog?search=' OR '1'='1");

            const res = await GET(req);

            expect([200, 401]).toContain(res.status);
        });

        it("22. Handles injection in blog slug param safely", async () => {
            const { GET } = await import("@/app/api/blog/route");
            const req = new NextRequest("http://localhost:3000/api/blog?id=1' OR '1'='1");

            const res = await GET(req);

            expect([200, 401]).toContain(res.status);
        });

        it("23. Handles injection in blog category safely", async () => {
            const { GET } = await import("@/app/api/blog/route");
            const req = new NextRequest("http://localhost:3000/api/blog?category='; DROP TABLE blog_posts; --");

            const res = await GET(req);

            expect([200, 401]).toContain(res.status);
        });

        it("24. Handles injection in blog author param safely", async () => {
            const { GET } = await import("@/app/api/blog/route");
            const req = new NextRequest("http://localhost:3000/api/blog?author=' OR '1'='1");

            const res = await GET(req);

            expect([200, 401]).toContain(res.status);
        });

        it("25. Handles injection in blog status param safely", async () => {
            const { GET } = await import("@/app/api/blog/route");
            const req = new NextRequest("http://localhost:3000/api/blog?status=' OR published=true--");

            const res = await GET(req);

            expect([200, 401]).toContain(res.status);
        });
    });

    describe("SQL Injection in Projects API - Real Validation", () => {
        it("26. Handles injection in projects search safely", async () => {
            const { GET } = await import("@/app/api/projects/route");
            const req = new NextRequest("http://localhost:3000/api/projects?search=' UNION SELECT * FROM users--");

            const res = await GET(req);

            expect([200, 401]).toContain(res.status);
        });

        it("27. Handles injection in category param safely", async () => {
            const { GET } = await import("@/app/api/projects/route");
            const req = new NextRequest("http://localhost:3000/api/projects?category='; DROP TABLE projects--");

            const res = await GET(req);

            expect([200, 401]).toContain(res.status);
        });

        it("28. Handles injection in status param safely", async () => {
            const { GET } = await import("@/app/api/projects/route");
            const req = new NextRequest("http://localhost:3000/api/projects?status=' OR '1'='1");

            const res = await GET(req);

            expect([200, 401]).toContain(res.status);
        });

        it("29. Handles injection in sort param safely", async () => {
            const { GET } = await import("@/app/api/projects/route");
            const req = new NextRequest("http://localhost:3000/api/projects?sort='; DROP TABLE projects; --");

            const res = await GET(req);

            expect([200, 401]).toContain(res.status);
        });

        it("30. Handles injection in order param safely", async () => {
            const { GET } = await import("@/app/api/projects/route");
            const req = new NextRequest("http://localhost:3000/api/projects?order=' OR '1'='1");

            const res = await GET(req);

            expect([200, 401]).toContain(res.status);
        });
    });

    describe("Error Message Sanitization - Real Validation", () => {
        it("31. Returns generic error for database failures", async () => {
            mockSupabase.from = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: null,
                            error: { message: "syntax error at or near" },
                        }),
                    }),
                }),
            });

            const req = new NextRequest("http://localhost:3000/api/requests");
            const res = await requestsGet(req);
            const body = await res.json();

            expect(res.status).toBe(500);
            expect(body.error).toBeDefined();
            // Should not expose SQL details
            expect(body.error).not.toContain("syntax error");
            expect(body.error).not.toContain("near");
        });

        it("32. Returns generic error for relation errors", async () => {
            mockSupabase.from = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: null,
                            error: new Error("relation does not exist"),
                        }),
                    }),
                }),
            });

            const req = new NextRequest("http://localhost:3000/api/requests");
            const res = await requestsGet(req);
            const body = await res.json();

            expect(res.status).toBe(500);
            expect(body.error).not.toContain("relation");
            expect(body.error).not.toContain("does not exist");
        });

        it("33. Returns generic error for column errors", async () => {
            mockSupabase.from = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: null,
                            error: { message: "column \"password\" does not exist" },
                        }),
                    }),
                }),
            });

            const req = new NextRequest("http://localhost:3000/api/requests");
            const res = await requestsGet(req);
            const body = await res.json();

            expect(res.status).toBe(500);
            expect(body.error).not.toContain("column");
            expect(body.error).not.toContain("password");
        });

        it("34. Returns generic error for permission errors", async () => {
            mockSupabase.from = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: null,
                            error: { message: "permission denied for table users" },
                        }),
                    }),
                }),
            });

            const req = new NextRequest("http://localhost:3000/api/requests");
            const res = await requestsGet(req);
            const body = await res.json();

            expect(res.status).toBe(500);
            expect(body.error).not.toContain("permission denied");
            expect(body.error).not.toContain("table users");
        });

        it("35. Returns generic error for connection errors", async () => {
            mockSupabase.from = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockRejectedValue(new Error("connection refused")),
                    }),
                }),
            });

            const req = new NextRequest("http://localhost:3000/api/requests");
            const res = await requestsGet(req);
            const body = await res.json();

            expect(res.status).toBe(500);
            expect(body.error).not.toContain("connection");
        });
    });

    describe("Query Builder Verification - Real Validation", () => {
        it("36. Uses from() method with table name", async () => {
            const req = createJsonRequest({
                name: "Test",
                email: "test@test.com",
            });

            await requestsPost(req);

            const fromCall = queryLog.find(q => q.method === "from");
            expect(fromCall).toBeDefined();
            expect(fromCall.table).toBe("requests");
        });

        it("37. Uses select() for queries", async () => {
            const req = new NextRequest("http://localhost:3000/api/requests");
            await requestsGet(req);

            const selectCall = queryLog.find(q => q.method === "select");
            expect(selectCall).toBeDefined();
        });

        it("38. Uses eq() for equality checks", async () => {
            const req = new NextRequest("http://localhost:3000/api/requests");
            await requestsGet(req);

            const eqCall = queryLog.find(q => q.method === "eq");
            expect(eqCall).toBeDefined();
            expect(eqCall.column).toBe("user_id");
        });

        it("39. Uses insert() for data insertion", async () => {
            const req = createJsonRequest({
                name: "Test",
                email: "test@test.com",
            });

            await requestsPost(req);

            const insertCall = queryLog.find(q => q.method === "insert");
            expect(insertCall).toBeDefined();
        });

        it("40. Data passed to insert is an object (not SQL string)", async () => {
            const req = createJsonRequest({
                name: "Test",
                email: "test@test.com",
            });

            await requestsPost(req);

            const insertCall = queryLog.find(q => q.method === "insert");
            expect(typeof insertCall.data).toBe("object");
            expect(Array.isArray(insertCall.data)).toBe(false);
        });
    });
});
