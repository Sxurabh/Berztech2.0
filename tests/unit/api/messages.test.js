import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

describe("Messages API", () => {
    let mockSupabase;
    let mockAdminClient;
    let mockUser;

    beforeEach(() => {
        mockUser = { id: "user-1", email: "test@example.com" };
        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
            },
        };
        mockAdminClient = {
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                insert: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
        };
        
        createServerSupabaseClient.mockResolvedValue(mockSupabase);
        createAdminClient.mockReturnValue(mockAdminClient);
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
            const req = createJsonRequest("/api/messages?project_id=123", null, "GET");
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
            const req = createJsonRequest("/api/messages", { project_id: "123", content: "Hello" });
            const res = await POST(req);
            const json = await res.json();

            expect(res.status).toBe(401);
            expect(json.error).toBe("Unauthorized");
        });

        it("validates project_id is required", async () => {
            const { POST } = await import("@/app/api/messages/route");
            const req = createJsonRequest("/api/messages", { content: "Hello" });
            const res = await POST(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe("project_id is required");
        });

        it("validates message content or attachment is required", async () => {
            const { POST } = await import("@/app/api/messages/route");
            const req = createJsonRequest("/api/messages", { project_id: "123" });
            const res = await POST(req);
            const json = await res.json();

            expect(res.status).toBe(400);
            expect(json.error).toBe("Message content or attachment is required");
        });
    });
});
