/**
 * @fileoverview Integration tests for Testimonials API
 *
 * Tests cover:
 * - GET /api/testimonials — Public listing
 * - POST /api/testimonials — Admin-only create (auth guard, validation)
 * - GET /api/testimonials/[id] — Single testimonial
 * - PUT /api/testimonials/[id] — Admin-only update (field whitelist)
 * - DELETE /api/testimonials/[id] — Admin-only delete
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn(),
}));

vi.mock("@/lib/data/testimonials", () => ({
    getTestimonials: vi.fn(),
    getTestimonialById: vi.fn(),
    createTestimonial: vi.fn(),
    updateTestimonial: vi.fn(),
    deleteTestimonial: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";
import { getTestimonials, getTestimonialById, createTestimonial, updateTestimonial, deleteTestimonial } from "@/lib/data/testimonials";
import { GET as listTestimonials, POST as createTestimonialRoute } from "@/app/api/testimonials/route";
import { GET as getTestimonial, PUT as updateTestimonialRoute, DELETE as deleteTestimonialRoute } from "@/app/api/testimonials/[id]/route";

describe("Testimonials API", () => {
    const mockSupabase: any = {
        auth: { getUser: vi.fn() },
    };

    const mockTestimonial = {
        id: "test-1",
        client: "Jane Doe",
        role: "CTO",
        company: "Acme",
        content: "Excellent work!",
        color: "blue",
        featured: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createJsonRequest(url: string, body?: unknown, method = "POST"): NextRequest {
        const options: any = { method };
        if (body) {
            options.body = JSON.stringify(body);
            options.headers = { "Content-Type": "application/json" };
        }
        return new NextRequest(url, options);
    }

    function setupAdmin() {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "admin-1", email: "admin@berztech.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);
    }

    function setupNonAdmin() {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: "user-1", email: "client@example.com" } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(false);
    }

    describe("GET /api/testimonials", () => {
        it("1. Returns all testimonials (public)", async () => {
            (getTestimonials as any).mockResolvedValue([mockTestimonial]);

            const response = await listTestimonials();
            const json = await response.json();

            expect(response.status).toBe(200);
            expect(json).toEqual([mockTestimonial]);
        });

        it("2. Returns 500 on service error", async () => {
            (getTestimonials as any).mockRejectedValue(new Error("DB failure"));

            const response = await listTestimonials();
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json.error).toBe("Internal Server Error");
        });
    });

    describe("POST /api/testimonials", () => {
        it("3. Non-admin → 403", async () => {
            setupNonAdmin();

            const response = await createTestimonialRoute(
                createJsonRequest("http://localhost/api/testimonials", { client: "Jane", content: "Great" })
            );

            expect(response.status).toBe(403);
        });

        it("4. Admin with valid payload → 201", async () => {
            setupAdmin();
            (createTestimonial as any).mockResolvedValue(mockTestimonial);

            const response = await createTestimonialRoute(
                createJsonRequest("http://localhost/api/testimonials", { client: "Jane Doe", content: "Excellent work!" })
            );
            const json = await response.json();

            expect(response.status).toBe(201);
            expect(json.client).toBe("Jane Doe");
        });

        it("5. Admin missing client → 400", async () => {
            setupAdmin();

            const response = await createTestimonialRoute(
                createJsonRequest("http://localhost/api/testimonials", { content: "Great work" })
            );
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toContain("Client name");
        });

        it("6. Admin missing content → 400", async () => {
            setupAdmin();

            const response = await createTestimonialRoute(
                createJsonRequest("http://localhost/api/testimonials", { client: "Jane" })
            );
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toContain("Content");
        });

        it("7. Admin with empty client string → 400", async () => {
            setupAdmin();

            const response = await createTestimonialRoute(
                createJsonRequest("http://localhost/api/testimonials", { client: "  ", content: "Great" })
            );

            expect(response.status).toBe(400);
        });
    });

    describe("GET /api/testimonials/[id]", () => {
        it("8. Returns testimonial by ID", async () => {
            (getTestimonialById as any).mockResolvedValue(mockTestimonial);

            const response = await getTestimonial(
                createJsonRequest("http://localhost/api/testimonials/test-1", null, "GET"),
                { params: Promise.resolve({ id: "test-1" }) }
            );
            const json = await response.json();

            expect(response.status).toBe(200);
            expect(json.client).toBe("Jane Doe");
        });

        it("9. Returns 404 when not found", async () => {
            (getTestimonialById as any).mockResolvedValue(null);

            const response = await getTestimonial(
                createJsonRequest("http://localhost/api/testimonials/missing", null, "GET"),
                { params: Promise.resolve({ id: "missing" }) }
            );

            expect(response.status).toBe(404);
        });
    });

    describe("PUT /api/testimonials/[id]", () => {
        it("10. Non-admin → 403", async () => {
            setupNonAdmin();

            const response = await updateTestimonialRoute(
                createJsonRequest("http://localhost/api/testimonials/test-1", { client: "Updated" }, "PUT"),
                { params: Promise.resolve({ id: "test-1" }) }
            );

            expect(response.status).toBe(403);
        });

        it("11. Admin updates → 200", async () => {
            setupAdmin();
            (updateTestimonial as any).mockResolvedValue({ ...mockTestimonial, client: "Updated" });

            const response = await updateTestimonialRoute(
                createJsonRequest("http://localhost/api/testimonials/test-1", { client: "Updated" }, "PUT"),
                { params: Promise.resolve({ id: "test-1" }) }
            );
            const json = await response.json();

            expect(response.status).toBe(200);
            expect(json.client).toBe("Updated");
        });
    });

    describe("DELETE /api/testimonials/[id]", () => {
        it("12. Non-admin → 403", async () => {
            setupNonAdmin();

            const response = await deleteTestimonialRoute(
                createJsonRequest("http://localhost/api/testimonials/test-1", null, "DELETE"),
                { params: Promise.resolve({ id: "test-1" }) }
            );

            expect(response.status).toBe(403);
        });

        it("13. Admin deletes → 200 { success: true }", async () => {
            setupAdmin();
            (deleteTestimonial as any).mockResolvedValue(undefined);

            const response = await deleteTestimonialRoute(
                createJsonRequest("http://localhost/api/testimonials/test-1", null, "DELETE"),
                { params: Promise.resolve({ id: "test-1" }) }
            );
            const json = await response.json();

            expect(response.status).toBe(200);
            expect(json.success).toBe(true);
        });
    });
});
