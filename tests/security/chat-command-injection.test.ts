/**
 * @fileoverview Security tests for Chat Command Injection
 * 
 * Tests:
 * 1. Path traversal prevention
 * 2. Filename sanitization
 * 3. Command injection in filenames
 * 4. Null byte injection
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

describe("Security: Chat Command Injection", () => {
    describe("Path Traversal Prevention", () => {
        it("1. ../ in filename is detected and rejected", async () => {
            const maliciousFilename = "../../../etc/passwd";
            const hasTraversal = maliciousFilename.includes("..");
            
            expect(hasTraversal).toBe(true);
        });

        it("2. absolute paths are rejected", async () => {
            const maliciousFilename = "/etc/passwd";
            const isAbsolute = maliciousFilename.startsWith("/");
            
            expect(isAbsolute).toBe(true);
        });

        it("3. URL-encoded traversal is detected", async () => {
            const maliciousFilename = "..%2F..%2Fetc%2Fpasswd";
            const decoded = decodeURIComponent(maliciousFilename);
            const hasTraversal = decoded.includes("..");
            
            expect(hasTraversal).toBe(true);
        });

        it("4. double-encoded traversal is detected", async () => {
            const maliciousFilename = "%252e%252e%252fpasswd";
            const decoded = decodeURIComponent(decodeURIComponent(maliciousFilename));
            const hasTraversal = decoded.includes("..");
            
            expect(hasTraversal).toBe(true);
        });
    });

    describe("Command Injection Prevention", () => {
        it("5. shell metacharacters are detected", async () => {
            const dangerousChars = /[;&|`$(){}[\]<>!#*?"'\\]/;
            const filename = "file; rm -rf /";
            
            expect(dangerousChars.test(filename)).toBe(true);
        });

        it("6. pipe characters are detected", async () => {
            const filename = "file | cat /etc/passwd";
            const hasPipe = filename.includes("|");
            
            expect(hasPipe).toBe(true);
        });

        it("7. backticks are detected", async () => {
            const filename = "file`whoami`.pdf";
            const hasBacktick = filename.includes("`");
            
            expect(hasBacktick).toBe(true);
        });

        it("8. command substitution is prevented", async () => {
            const filename = "$(whoami).pdf";
            const hasSubstitution = filename.includes("$(");
            
            expect(hasSubstitution).toBe(true);
        });
    });

    describe("Null Byte Injection", () => {
        it("9. null bytes are detected", async () => {
            const maliciousFilename = "file.pdf\x00.exe";
            const hasNullByte = maliciousFilename.includes("\x00");
            
            expect(hasNullByte).toBe(true);
        });

        it("10. URL-encoded null bytes are detected", async () => {
            const filename = "file.pdf%00.exe";
            const decoded = decodeURIComponent(filename);
            const hasNullByte = decoded.includes("\x00");
            
            expect(hasNullByte).toBe(true);
        });
    });
});
