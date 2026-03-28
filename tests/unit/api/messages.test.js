import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("Messages API", () => {
    let mockSupabase;
    let mockUser;

    beforeEach(() => {
        mockUser = { id: "user-1", email: "test@example.com" };
        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
            },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                insert: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
        };
        
        createServerSupabaseClient.mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    function createJsonRequest(url, body, method = "POST") {
        const options = { method };
        if (body) {
            options.body = JSON.stringify(body);
            options.headers = { "Content-Type": "application/json" };
        }
        const fullUrl = url.startsWith("http") ? url : `http://localhost${url}`;
        return new Request(fullUrl, options);
    }

    describe("GET /api/messages", () => {
        it("validates project_id is required", async () => {
            const { GET } = await import("@/app/api/messages/route");
            const req = createJsonRequest("/api/messages", null, "GET");
            const res = await GET(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe("project_id is required");
        });

        it("requires authentication", async () => {
            mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

            const { GET } = await import("@/app/api/messages/route");
            const req = createJsonRequest("/api/messages?project_id=550e8400-e29b-41d4-a716-446655440000", null, "GET");
            const res = await GET(req);
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe("Unauthorized");
        });
    });

    describe("POST /api/messages", () => {
        it("requires authentication", async () => {
            mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

            const { POST } = await import("@/app/api/messages/route");
            const req = createJsonRequest("/api/messages", { 
                project_id: "550e8400-e29b-41d4-a716-446655440000", 
                content: "Hello" 
            });
            const res = await POST(req);
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe("Unauthorized");
        });

        it("validates with Zod schema - project_id must be valid UUID", async () => {
            const { POST } = await import("@/app/api/messages/route");
            const req = createJsonRequest("/api/messages", { 
                project_id: "invalid-uuid", 
                content: "Hello" 
            });
            const res = await POST(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe("Validation failed");
        });

        it("validates with Zod schema - content cannot be empty", async () => {
            const { POST } = await import("@/app/api/messages/route");
            const req = createJsonRequest("/api/messages", { 
                project_id: "550e8400-e29b-41d4-a716-446655440000", 
                content: "" 
            });
            const res = await POST(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe("Validation failed");
        });
    });
});
