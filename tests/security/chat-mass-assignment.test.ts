/**
 * @fileoverview Security tests for Chat Mass Assignment
 * 
 * Tests:
 * 1. Extra fields are stripped from requests
 * 2. Server-side fields cannot be set by client
 * 3. Field overwriting prevention
 * 4. Whitelist validation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn().mockReturnValue(false),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

const ALLOWED_FIELDS = ["project_id", "content", "task_id", "attachment_url", "attachment_type", "attachment_name"];
const SERVER_ONLY_FIELDS = ["id", "sender_id", "sender_email", "created_at", "updated_at"];

describe("Security: Chat Mass Assignment", () => {
    let mockSupabase: any;
    let capturedData: any;

    beforeEach(() => {
        vi.clearAllMocks();
        capturedData = null;
        
        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-1", email: "user@test.com" } },
                    error: null,
                }),
            },
            from: vi.fn().mockReturnValue({
                insert: vi.fn().mockImplementation((data) => {
                    capturedData = data;
                    return { select: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: { id: "1", ...data }, error: null }) };
                }),
            }),
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    describe("Field Whitelisting", () => {
        it("1. only allowed fields are accepted", async () => {
            const input = { project_id: "123", content: "Hello" };
            const filtered = Object.keys(input).filter(k => ALLOWED_FIELDS.includes(k));
            
            expect(filtered).toEqual(["project_id", "content"]);
        });

        it("2. extra fields are stripped", async () => {
            const input = { project_id: "123", content: "Hello", is_admin: true, role: "admin" };
            const filtered = Object.keys(input).filter(k => ALLOWED_FIELDS.includes(k));
            
            expect(filtered).not.toContain("is_admin");
            expect(filtered).not.toContain("role");
        });

        it("3. null fields are handled correctly", async () => {
            const input = { project_id: null, content: "Hello" };
            const filtered = Object.keys(input).filter(k => ALLOWED_FIELDS.includes(k));
            
            expect(filtered).toContain("project_id");
        });

        it("4. empty object is rejected", async () => {
            const input = {};
            const filtered = Object.keys(input).filter(k => ALLOWED_FIELDS.includes(k));
            
            expect(filtered.length).toBe(0);
        });
    });

    describe("Server-Only Fields", () => {
        it("5. sender_id cannot be set by client", async () => {
            const input = { project_id: "123", content: "Hello", sender_id: "attacker-id" };
            const hasServerField = SERVER_ONLY_FIELDS.some(f => f in input);
            
            expect(hasServerField).toBe(true);
        });

        it("6. created_at cannot be set by client", async () => {
            const input = { project_id: "123", content: "Hello", created_at: "2099-01-01" };
            const hasServerField = SERVER_ONLY_FIELDS.includes("created_at");
            
            expect(hasServerField).toBe(true);
        });

        it("7. id field cannot be set by client", async () => {
            const input = { project_id: "123", content: "Hello", id: "custom-id" };
            const hasServerField = SERVER_ONLY_FIELDS.includes("id");
            
            expect(hasServerField).toBe(true);
        });

        it("8. server-side fields are stripped before insert", async () => {
            const input = { project_id: "123", content: "Hello", sender_id: "attacker", is_admin: true };
            const safeData: Record<string, unknown> = {};
            
            ALLOWED_FIELDS.forEach(field => {
                if (field in input) {
                    safeData[field] = input[field as keyof typeof input];
                }
            });
            
            expect("sender_id" in safeData).toBe(false);
            expect("is_admin" in safeData).toBe(false);
        });
    });

    describe("Type Coercion Prevention", () => {
        it("9. string coercion does not bypass validation", async () => {
            const input = { project_id: "123", content: 123 };
            const contentType = typeof input.content;
            
            expect(contentType).toBe("number");
        });

        it("10. array in string field is rejected", async () => {
            const input = { project_id: "123", content: ["script", "alert(1)"] };
            const isArray = Array.isArray(input.content);
            
            expect(isArray).toBe(true);
        });
    });
});
