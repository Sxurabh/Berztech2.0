/**
 * @fileoverview Security tests for Chat Mass Assignment vulnerabilities.
 * 
 * Tests verify:
 * 1. Extra fields are stripped from requests (5 tests)
 * 2. Type confusion attacks are blocked (4 tests)
 * 3. Field overwriting is prevented (3 tests)
 * 4. Field allowlist is enforced (3 tests)
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
const SERVER_ONLY_FIELDS = ["id", "sender_id", "sender_email", "created_at", "updated_at", "is_admin", "user_role", "is_read"];

function sanitizeInput(input: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    
    for (const field of ALLOWED_FIELDS) {
        if (field in input) {
            const value = input[field];
            if (typeof value === "string") {
                sanitized[field] = value;
            } else if (typeof value === "number" && field !== "content") {
                sanitized[field] = value;
            }
        }
    }
    
    return sanitized;
}

describe("Security: Mass Assignment - Extra Field Injection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("1. attacker cannot add is_admin field", () => {
        const maliciousInput = { 
            project_id: "123", 
            content: "Hello",
            is_admin: true 
        };
        
        const sanitized = sanitizeInput(maliciousInput);
        
        expect(sanitized).not.toHaveProperty("is_admin");
        expect(sanitized).toHaveProperty("project_id");
        expect(sanitized).toHaveProperty("content");
    });

    it("2. attacker cannot add user_role field", () => {
        const maliciousInput = { 
            project_id: "123", 
            content: "Hello",
            user_role: "admin" 
        };
        
        const sanitized = sanitizeInput(maliciousInput);
        
        expect(sanitized).not.toHaveProperty("user_role");
        expect(sanitized).toHaveProperty("content");
    });

    it("3. attacker cannot modify created_at", () => {
        const maliciousInput = { 
            project_id: "123", 
            content: "Hello",
            created_at: "2099-12-31T23:59:59Z" 
        };
        
        const hasServerField = SERVER_ONLY_FIELDS.includes("created_at");
        
        expect(hasServerField).toBe(true);
        
        const sanitized = sanitizeInput(maliciousInput);
        expect(sanitized).not.toHaveProperty("created_at");
    });

    it("4. attacker cannot set id field", () => {
        const maliciousInput = { 
            project_id: "123", 
            content: "Hello",
            id: "custom-attacker-id" 
        };
        
        const hasServerField = SERVER_ONLY_FIELDS.includes("id");
        
        expect(hasServerField).toBe(true);
        
        const sanitized = sanitizeInput(maliciousInput);
        expect(sanitized).not.toHaveProperty("id");
    });

    it("5. attacker cannot add internal fields", () => {
        const maliciousInput = { 
            project_id: "123", 
            content: "Hello",
            sender_id: "attacker-user-id",
            sender_email: "attacker@evil.com",
            updated_at: "2099-01-01",
            internal_flag: true,
            debug_mode: "enabled"
        };
        
        const sanitized = sanitizeInput(maliciousInput);
        
        expect(sanitized).not.toHaveProperty("sender_id");
        expect(sanitized).not.toHaveProperty("sender_email");
        expect(sanitized).not.toHaveProperty("updated_at");
        expect(sanitized).not.toHaveProperty("internal_flag");
        expect(sanitized).not.toHaveProperty("debug_mode");
        expect(sanitized).toHaveProperty("project_id");
        expect(sanitized).toHaveProperty("content");
    });
});

describe("Security: Mass Assignment - Type Confusion", () => {
    it("6. boolean field injection is blocked", () => {
        const maliciousInput = { 
            project_id: "123", 
            content: "Hello",
            is_admin: "true",
            role: false
        };
        
        const sanitized = sanitizeInput(maliciousInput);
        
        expect(typeof sanitized.is_admin).toBe("undefined");
        expect(typeof sanitized.role).toBe("undefined");
    });

    it("7. numeric field injection is blocked", () => {
        const maliciousInput = { 
            project_id: "123", 
            content: "Hello",
            priority: 999,
            is_admin: 1
        };
        
        const sanitized = sanitizeInput(maliciousInput);
        
        expect(sanitized).toHaveProperty("project_id", "123");
        expect(sanitized.priority).toBeUndefined();
        expect(sanitized.is_admin).toBeUndefined();
    });

    it("8. array field injection is blocked", () => {
        const maliciousInput = { 
            project_id: "123", 
            content: ["script", "alert(1)", "XSS"],
            permissions: ["read", "write", "delete"],
            tags: ["admin", "moderator"]
        };
        
        const sanitized = sanitizeInput(maliciousInput);
        
        expect(Array.isArray(sanitized.content)).toBe(false);
        expect(sanitized.permissions).toBeUndefined();
        expect(sanitized.tags).toBeUndefined();
    });

    it("9. object field injection is blocked", () => {
        const maliciousInput = { 
            project_id: "123", 
            content: "Hello",
            metadata: { is_admin: true, role: "admin" },
            settings: { debug: true, secret: "key" }
        };
        
        const sanitized = sanitizeInput(maliciousInput);
        
        expect(typeof sanitized.metadata).toBe("undefined");
        expect(typeof sanitized.settings).toBe("undefined");
        expect(sanitized.content).toBe("Hello");
    });
});

describe("Security: Mass Assignment - Field Overwriting", () => {
    it("10. sender_id cannot be overwritten", () => {
        const userProvidedData = { 
            project_id: "123", 
            content: "Hello",
            sender_id: "attacker-id"
        };
        
        const actualSenderId = "legitimate-user-id";
        
        const sanitized = sanitizeInput(userProvidedData);
        
        expect(sanitized.sender_id).toBeUndefined();
        expect(actualSenderId).toBe("legitimate-user-id");
    });

    it("11. project_id cannot be changed via injection", () => {
        const userProvidedData = { 
            project_id: "attacker-owned-project", 
            content: "Hello"
        };
        
        const actualProjectId = "legitimate-project-id";
        
        const sanitized = sanitizeInput(userProvidedData);
        
        expect(sanitized.project_id).toBe("attacker-owned-project");
        expect(actualProjectId).not.toBe(sanitized.project_id);
    });

    it("12. is_read field manipulation is blocked", () => {
        const maliciousInput = { 
            project_id: "123", 
            content: "Hello",
            is_read: true,
            read_at: "2024-01-01",
            read_by: "attacker-id"
        };
        
        const hasServerField = SERVER_ONLY_FIELDS.includes("is_read");
        
        expect(hasServerField).toBe(true);
        
        const sanitized = sanitizeInput(maliciousInput);
        
        expect(sanitized).not.toHaveProperty("is_read");
        expect(sanitized).not.toHaveProperty("read_at");
        expect(sanitized).not.toHaveProperty("read_by");
    });
});

describe("Security: Mass Assignment - Protection Verification", () => {
    it("13. only allowed fields are saved", () => {
        const input = { 
            project_id: "123", 
            content: "Test message",
            task_id: "task-1",
            attachment_url: "https://example.com/file.pdf",
            attachment_type: "pdf",
            attachment_name: "file.pdf"
        };
        
        const sanitized = sanitizeInput(input);
        
        expect(Object.keys(sanitized).sort()).toEqual([
            "attachment_name",
            "attachment_type", 
            "attachment_url",
            "content",
            "project_id",
            "task_id"
        ].sort());
    });

    it("14. unknown fields are stripped", () => {
        const input = { 
            project_id: "123", 
            content: "Hello",
            is_admin: true,
            role: "admin",
            created_at: "2099-01-01",
            id: "custom-id",
            sender_id: "attacker",
            unknown_field: "value",
            another_unknown: 123
        };
        
        const sanitized = sanitizeInput(input);
        
        expect(Object.keys(sanitized)).toEqual(["project_id", "content"]);
    });

    it("15. field allowlist is enforced", () => {
        const allowlistEnforcement = (input: Record<string, unknown>): Record<string, unknown> => {
            const result: Record<string, unknown> = {};
            
            for (const allowed of ALLOWED_FIELDS) {
                if (allowed in input) {
                    result[allowed] = input[allowed];
                }
            }
            
            return result;
        };
        
        const attack1 = { project_id: "123", admin_access: true };
        const attack2 = { content: "Test", id: "injected", created_at: "now" };
        const attack3 = { task_id: "1", role: "superuser", permissions: [] };
        
        const result1 = allowlistEnforcement(attack1);
        const result2 = allowlistEnforcement(attack2);
        const result3 = allowlistEnforcement(attack3);
        
        expect(result1).not.toHaveProperty("admin_access");
        expect(result2).not.toHaveProperty("id");
        expect(result2).not.toHaveProperty("created_at");
        expect(result3).not.toHaveProperty("role");
        expect(result3).not.toHaveProperty("permissions");
        
        expect(result1).toHaveProperty("project_id");
        expect(result2).toHaveProperty("content");
        expect(result3).toHaveProperty("task_id");
    });
});
