/**
 * @fileoverview Integration tests for Settings API
 *
 * Tests cover:
 * - POST /api/settings — Admin-only upsert (auth guard, key validation)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as postSettings } from "@/app/api/settings/route";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";

describe("Settings API", () => {
    function createQueryBuilder(resolveValue: any) {
        const builder: any = {
            upsert: vi.fn(() => builder),
            then: (resolve: any) => resolve(resolveValue),
        };
        return builder;
    }

    const mockSupabase: any = {
        auth: { getUser: vi.fn() },
        from: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createJsonRequest(body: unknown): NextRequest {
        return new NextRequest("http://localhost/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
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

    function setupUnauthed() {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
        });
    }

    it("1. Unauthenticated → 401", async () => {
        setupUnauthed();

        const response = await postSettings(createJsonRequest({ key: "theme", value: "dark" }));

        expect(response.status).toBe(401);
    });

    it("2. Non-admin → 401", async () => {
        setupNonAdmin();

        const response = await postSettings(createJsonRequest({ key: "theme", value: "dark" }));

        expect(response.status).toBe(401);
    });

    it("3. Admin with valid key/value → 200 { success: true }", async () => {
        setupAdmin();
        mockSupabase.from.mockReturnValue(createQueryBuilder({ error: null }));

        const response = await postSettings(createJsonRequest({ key: "theme", value: "dark" }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.value).toBe("dark");
    });

    it("4. Admin missing key → 400", async () => {
        setupAdmin();

        const response = await postSettings(createJsonRequest({ value: "dark" }));
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.error).toBe("Key required");
    });

    it("5. Database upsert error → 500", async () => {
        setupAdmin();
        mockSupabase.from.mockReturnValue(createQueryBuilder({ error: { message: "DB error" } }));

        const response = await postSettings(createJsonRequest({ key: "theme", value: "dark" }));
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json.error).toBe("Server error");
    });

    it("6. Admin with null value is allowed", async () => {
        setupAdmin();
        mockSupabase.from.mockReturnValue(createQueryBuilder({ error: null }));

        const response = await postSettings(createJsonRequest({ key: "theme", value: null }));
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
    });
});
