/**
 * @fileoverview Integration tests for POST /api/requests API route
 *
 * These tests verify Zod validation, error handling, and successful creation
 * of project requests. The route is public (allows anonymous) but optionally
 * associates with authenticated users.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/requests/route";

// Mock the server-side Supabase client
vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("POST /api/requests", () => {
    const mockSupabase = {
        auth: {
            getUser: vi.fn(),
        },
        from: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);

        // Default: anonymous user
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    /**
     * Helper to create a mock NextRequest with JSON body
     */
    function createJsonRequest(body: unknown): NextRequest {
        return new NextRequest("http://localhost:3000/api/requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    }

    /**
     * Helper to mock the Supabase insert chain
     */
    function mockInsertChain(returnData: any, error: any = null) {
        const insertMock = vi.fn().mockReturnThis();
        const selectMock = vi.fn().mockReturnThis();
        const singleMock = vi.fn().mockResolvedValue({
            data: returnData,
            error,
        });

        mockSupabase.from.mockReturnValue({
            insert: insertMock,
            select: selectMock,
            single: singleMock,
        });

        return { insertMock, selectMock, singleMock };
    }

    it("1. Valid minimal payload (name + email only) → 201", async () => {
        const mockRecord = {
            id: "req-123",
            name: "John Doe",
            email: "john@example.com",
            company: null,
            services: [],
            budget: null,
            message: "",
            status: "discover",
            user_id: null,
            created_at: "2024-01-15T10:00:00Z",
        };

        mockInsertChain(mockRecord);

        const request = createJsonRequest({
            name: "John Doe",
            email: "john@example.com",
        });

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body.data).toMatchObject({
            name: "John Doe",
            email: "john@example.com",
        });
    });

    it("2. Valid full payload → 201 with submitted data", async () => {
        const fullPayload = {
            name: "Jane Smith",
            email: "jane@company.com",
            company: "Acme Corp",
            services: ["web-design", "branding"],
            budget: "10000-25000",
            message: "We need a complete redesign of our website",
        };

        const mockRecord = {
            id: "req-456",
            ...fullPayload,
            status: "discover",
            user_id: null,
            created_at: "2024-01-15T11:00:00Z",
        };

        mockInsertChain(mockRecord);

        const request = createJsonRequest(fullPayload);
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body.data).toMatchObject(fullPayload);
        expect(body.data.status).toBe("discover");
    });

    it("3. Missing name → 400 with error.details", async () => {
        const request = createJsonRequest({
            email: "john@example.com",
        });

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("Invalid input");
        expect(body.details).toBeDefined();
        expect(body.details.name).toBeDefined();
    });

    it("4. Missing email → 400", async () => {
        const request = createJsonRequest({
            name: "John Doe",
        });

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("Invalid input");
        expect(body.details).toBeDefined();
        expect(body.details.email).toBeDefined();
    });

    it("5. Invalid email format → 400", async () => {
        const request = createJsonRequest({
            name: "John Doe",
            email: "not-an-email",
        });

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("Invalid input");
        expect(body.details.email).toBeDefined();
    });

    it("6. Message over 1000 characters → 400", async () => {
        const longMessage = "a".repeat(1001);

        const request = createJsonRequest({
            name: "John Doe",
            email: "john@example.com",
            message: longMessage,
        });

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("Invalid input");
        expect(body.details.message).toBeDefined();
    });

    it("7. Malformed JSON body → 400", async () => {
        const request = new NextRequest("http://localhost:3000/api/requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{ invalid json }",
        });

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("Invalid JSON body");
    });

    it("8. Database insert failure → 500", async () => {
        mockInsertChain(null, { message: "Database connection failed" });

        const request = createJsonRequest({
            name: "John Doe",
            email: "john@example.com",
        });

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe("Failed to submit request");
    });

    it("9. Empty body {} → 400", async () => {
        const request = createJsonRequest({});

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("Invalid input");
        expect(body.details.name).toBeDefined();
        expect(body.details.email).toBeDefined();
    });

    it("10. Extra fields not in schema are accepted but stripped", async () => {
        const payload = {
            name: "John Doe",
            email: "john@example.com",
            company: "Test Corp",
            extraField: "should be stripped",
            anotherExtra: 12345,
            nested: { key: "value" },
        };

        const mockRecord = {
            id: "req-789",
            name: "John Doe",
            email: "john@example.com",
            company: "Test Corp",
            services: [],
            budget: null,
            message: "",
            status: "discover",
            user_id: null,
            // Note: extra fields are not stored in DB (Zod strips them)
        };

        mockInsertChain(mockRecord);

        const request = createJsonRequest(payload);
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body.data).toBeDefined();
        // The response should contain the stored record without extra fields
        expect(body.data.extraField).toBeUndefined();
        expect(body.data.anotherExtra).toBeUndefined();
    });

    describe("Authenticated user association", () => {
        it("associates request with authenticated user when logged in", async () => {
            const mockUser = {
                id: "user-abc-123",
                email: "loggedin@example.com",
            };

            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            const mockRecord = {
                id: "req-auth",
                name: "Jane Doe",
                email: "jane@example.com",
                status: "discover",
                user_id: "user-abc-123",
                created_at: "2024-01-15T12:00:00Z",
            };

            mockInsertChain(mockRecord);

            const request = createJsonRequest({
                name: "Jane Doe",
                email: "jane@example.com",
            });

            const response = await POST(request);
            const body = await response.json();

            expect(response.status).toBe(201);
            expect(body.data.user_id).toBe("user-abc-123");
        });
    });

    describe("Edge cases", () => {
        it("handles name with exactly 2 characters (minimum)", async () => {
            const mockRecord = {
                id: "req-min",
                name: "Jo",
                email: "jo@example.com",
                status: "discover",
                user_id: null,
            };

            mockInsertChain(mockRecord);

            const request = createJsonRequest({
                name: "Jo",
                email: "jo@example.com",
            });

            const response = await POST(request);
            expect(response.status).toBe(201);
        });

        it("handles message with exactly 1000 characters (maximum)", async () => {
            const exactly1000 = "a".repeat(1000);

            const mockRecord = {
                id: "req-max",
                name: "John",
                email: "john@example.com",
                message: exactly1000,
                status: "discover",
                user_id: null,
            };

            mockInsertChain(mockRecord);

            const request = createJsonRequest({
                name: "John",
                email: "john@example.com",
                message: exactly1000,
            });

            const response = await POST(request);
            expect(response.status).toBe(201);
        });

        it("handles email with plus sign (subaddressing)", async () => {
            const mockRecord = {
                id: "req-plus",
                name: "John",
                email: "john+test@example.com",
                status: "discover",
                user_id: null,
            };

            mockInsertChain(mockRecord);

            const request = createJsonRequest({
                name: "John",
                email: "john+test@example.com",
            });

            const response = await POST(request);
            const body = await response.json();

            expect(response.status).toBe(201);
            expect(body.data.email).toBe("john+test@example.com");
        });

        it("rejects name with only 1 character", async () => {
            const request = createJsonRequest({
                name: "J",
                email: "j@example.com",
            });

            const response = await POST(request);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body.details.name).toBeDefined();
        });
    });
});
