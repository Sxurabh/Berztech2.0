/**
 * @fileoverview Integration tests for Subscribe API
 *
 * Tests cover:
 * - POST /api/subscribe — Email validation, idempotency
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as subscribe } from "@/app/api/subscribe/route";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("Subscribe API", () => {
    const mockServerSupabase = {
        from: vi.fn(),
    };

    const mockInsert = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerSupabaseClient as any).mockResolvedValue(mockServerSupabase);
        mockServerSupabase.from.mockReturnValue({
            insert: mockInsert,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createJsonRequest(url: string, body: unknown): NextRequest {
        return new NextRequest(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    }

    describe("POST /api/subscribe", () => {
        it("1. Valid email → 201 { success: true }", async () => {
            mockInsert.mockResolvedValue({
                data: [{ id: "sub-1", email: "test@example.com" }],
                error: null,
            });

            const response = await subscribe(
                createJsonRequest("http://localhost/api/subscribe", { email: "test@example.com" })
            );
            const json = await response.json();

            expect(response.status).toBe(201);
            expect(json.success).toBe(true);
            expect(json.message).toBe("Subscription received");
        });

        it("2. Invalid email format → 400", async () => {
            const response = await subscribe(
                createJsonRequest("http://localhost/api/subscribe", { email: "not-an-email" })
            );
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toBe("A valid email is required");
        });

        it("3. Missing email field → 400", async () => {
            const response = await subscribe(
                createJsonRequest("http://localhost/api/subscribe", {})
            );
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toBe("A valid email is required");
        });

        it("4. Empty email string → 400", async () => {
            const response = await subscribe(
                createJsonRequest("http://localhost/api/subscribe", { email: "" })
            );
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toBe("A valid email is required");
        });

        it("5. Duplicate email (23505) → 201 (idempotent, no 409)", async () => {
            mockInsert.mockResolvedValue({
                data: null,
                error: { code: "23505", message: "unique constraint violation" },
            });

            const response = await subscribe(
                createJsonRequest("http://localhost/api/subscribe", { email: "existing@example.com" })
            );
            const json = await response.json();

            expect(response.status).toBe(201);
            expect(json.success).toBe(true);
        });

        it("6. Database error (non-duplicate) → 500", async () => {
            mockInsert.mockResolvedValue({
                data: null,
                error: { code: "42P01", message: "relation does not exist" },
            });

            const response = await subscribe(
                createJsonRequest("http://localhost/api/subscribe", { email: "test@example.com" })
            );
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json.error).toBe("Failed to subscribe");
        });

        it("7. Malformed JSON → 500", async () => {
            const req = new NextRequest("http://localhost/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "not valid json",
            });

            const response = await subscribe(req);

            expect(response.status).toBe(500);
        });

        it("8. Email with valid surrounding whitespace in body still works (json parses it)", async () => {
            mockInsert.mockResolvedValue({
                data: [{ id: "sub-1", email: "test@example.com" }],
                error: null,
            });

            const response = await subscribe(
                createJsonRequest("http://localhost/api/subscribe", { email: "test@example.com" })
            );

            expect(response.status).toBe(201);
        });

        it("9. Email uppercase gets lowercased", async () => {
            mockInsert.mockResolvedValue({
                data: [{ id: "sub-1", email: "test@example.com" }],
                error: null,
            });

            const response = await subscribe(
                createJsonRequest("http://localhost/api/subscribe", { email: "TEST@EXAMPLE.COM" })
            );
            const json = await response.json();

            expect(response.status).toBe(201);
            expect(mockInsert).toHaveBeenCalledWith({ email: "test@example.com" });
        });
    });
});
