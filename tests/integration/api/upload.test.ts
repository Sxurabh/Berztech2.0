/**
 * @fileoverview Integration tests for Upload API
 *
 * Tests cover:
 * - POST /api/upload — Admin-only, MIME validation, size limits, rate limiting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as uploadFile } from "@/app/api/upload/route";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";

describe("Upload API", () => {
    const mockServerSupabase = {
        auth: {
            getUser: vi.fn(),
        },
        storage: {
            from: vi.fn(),
        },
    };

    const mockStorageUpload = vi.fn();
    const mockStorageGetPublicUrl = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (createServerSupabaseClient as any).mockResolvedValue(mockServerSupabase);

        mockServerSupabase.storage.from.mockReturnValue({
            upload: mockStorageUpload,
            getPublicUrl: mockStorageGetPublicUrl,
        });

        mockStorageUpload.mockResolvedValue({
            data: { path: "uploads/test.jpg" },
            error: null,
        });

        mockStorageGetPublicUrl.mockReturnValue({
            data: { publicUrl: "https://example.com/uploads/test.jpg" },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createMockFile(name: string, type: string, size: number): File {
        const content = size > 0 ? "x".repeat(size) : "";
        return new File([content], name, { type });
    }

    async function createUploadRequest(
        urlStr: string,
        file: File | null,
        isAdmin: boolean = false,
        ip: string = "127.0.0.1"
    ): Promise<NextRequest> {
        const url = new URL(urlStr);
        
        const formData = new FormData();
        if (file) {
            formData.set("file", file);
        }

        const req = new NextRequest(url.toString(), {
            method: "POST",
            headers: {
                "x-forwarded-for": ip,
            },
        });

        vi.spyOn(req, "formData").mockImplementation(async () => {
            const fd = new FormData();
            if (file) {
                fd.set("file", file);
            }
            return fd;
        });

        const adminUser = { id: "user-123", email: "admin@example.com" };
        mockServerSupabase.auth.getUser.mockResolvedValue({
            data: { user: isAdmin ? adminUser : null },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(isAdmin);

        return req;
    }

    describe("POST /api/upload", () => {
        it("1. Unauthenticated request → 401", async () => {
            const file = createMockFile("test.jpg", "image/jpeg", 1000);
            const req = await createUploadRequest("http://localhost/api/upload", file, false);

            const response = await uploadFile(req);
            const json = await response.json();

            expect(response.status).toBe(401);
            expect(json.error).toBe("Unauthorized");
        });

        it("2. Authenticated non-admin → 403", async () => {
            const nonAdminUser = { id: "user-123", email: "client@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: nonAdminUser },
                error: null,
            });
            (isAdminEmail as any).mockReturnValue(false);

            const file = createMockFile("test.jpg", "image/jpeg", 1000);
            const url = new URL("http://localhost/api/upload");
            const req = new NextRequest(url.toString(), {
                method: "POST",
                headers: { "x-forwarded-for": "127.0.0.1" },
            });
            vi.spyOn(req, "formData").mockResolvedValue(new FormData());

            const response = await uploadFile(req);
            const json = await response.json();

            expect(response.status).toBe(403);
            expect(json.error).toBe("Forbidden");
        });

        it("3. No file in formData → 400", async () => {
            const adminUser = { id: "user-123", email: "admin@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: adminUser },
                error: null,
            });
            (isAdminEmail as any).mockReturnValue(true);

            const url = new URL("http://localhost/api/upload");
            const req = new NextRequest(url.toString(), {
                method: "POST",
                headers: { "x-forwarded-for": "127.0.0.1" },
            });
            
            vi.spyOn(req, "formData").mockResolvedValue(new FormData());

            const response = await uploadFile(req);
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toBe("No file provided");
        });

        it("4. Valid JPEG file as admin → 200 with url and path", async () => {
            const file = createMockFile("test.jpg", "image/jpeg", 1000);
            const url = new URL("http://localhost/api/upload");
            const req = new NextRequest(url.toString(), {
                method: "POST",
                headers: { "x-forwarded-for": "127.0.0.1" },
            });
            
            const fd = new FormData();
            fd.set("file", file);
            vi.spyOn(req, "formData").mockResolvedValue(fd);

            const adminUser = { id: "user-123", email: "admin@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: adminUser },
                error: null,
            });
            (isAdminEmail as any).mockReturnValue(true);

            const response = await uploadFile(req);
            const json = await response.json();

            expect(response.status).toBe(200);
            expect(json.url).toBe("https://example.com/uploads/test.jpg");
            expect(json.path).toMatch(/^uploads\/\d+-.*\.jpg$/);
        });

        it("5. application/octet-stream MIME type → 400 Invalid file type", async () => {
            const file = createMockFile("test.bin", "application/octet-stream", 1000);
            const url = new URL("http://localhost/api/upload");
            const req = new NextRequest(url.toString(), {
                method: "POST",
                headers: { "x-forwarded-for": "127.0.0.1" },
            });
            
            const fd = new FormData();
            fd.set("file", file);
            vi.spyOn(req, "formData").mockResolvedValue(fd);

            const adminUser = { id: "user-123", email: "admin@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: adminUser },
                error: null,
            });
            (isAdminEmail as any).mockReturnValue(true);

            const response = await uploadFile(req);
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toContain("Invalid file type");
        });

        it("6. application/x-msdownload (.exe) → 400", async () => {
            const file = createMockFile("malware.exe", "application/x-msdownload", 1000);
            const url = new URL("http://localhost/api/upload");
            const req = new NextRequest(url.toString(), {
                method: "POST",
                headers: { "x-forwarded-for": "127.0.0.1" },
            });
            
            const fd = new FormData();
            fd.set("file", file);
            vi.spyOn(req, "formData").mockResolvedValue(fd);

            const adminUser = { id: "user-123", email: "admin@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: adminUser },
                error: null,
            });
            (isAdminEmail as any).mockReturnValue(true);

            const response = await uploadFile(req);
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toContain("Invalid file type");
        });

        it("7. image/gif → 200 (allowed)", async () => {
            const file = createMockFile("animation.gif", "image/gif", 1000);
            const url = new URL("http://localhost/api/upload");
            const req = new NextRequest(url.toString(), {
                method: "POST",
                headers: { "x-forwarded-for": "127.0.0.1" },
            });
            
            const fd = new FormData();
            fd.set("file", file);
            vi.spyOn(req, "formData").mockResolvedValue(fd);

            const adminUser = { id: "user-123", email: "admin@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: adminUser },
                error: null,
            });
            (isAdminEmail as any).mockReturnValue(true);

            const response = await uploadFile(req);
            const json = await response.json();

            expect(response.status).toBe(200);
            expect(json.path).toMatch(/\.gif$/);
        });

        it("8. File > 5MB → 400 File too large", async () => {
            const file = createMockFile("large.jpg", "image/jpeg", 6 * 1024 * 1024);
            const url = new URL("http://localhost/api/upload");
            const req = new NextRequest(url.toString(), {
                method: "POST",
                headers: { "x-forwarded-for": "127.0.0.1" },
            });
            
            const fd = new FormData();
            fd.set("file", file);
            vi.spyOn(req, "formData").mockResolvedValue(fd);

            const adminUser = { id: "user-123", email: "admin@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: adminUser },
                error: null,
            });
            (isAdminEmail as any).mockReturnValue(true);

            const response = await uploadFile(req);
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toContain("File too large");
        });

        it("9. File exactly 5MB → 200 (boundary test)", async () => {
            const file = createMockFile("exact.jpg", "image/jpeg", 5 * 1024 * 1024);
            const url = new URL("http://localhost/api/upload");
            const req = new NextRequest(url.toString(), {
                method: "POST",
                headers: { "x-forwarded-for": "127.0.0.1" },
            });
            
            const fd = new FormData();
            fd.set("file", file);
            vi.spyOn(req, "formData").mockResolvedValue(fd);

            const adminUser = { id: "user-123", email: "admin@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: adminUser },
                error: null,
            });
            (isAdminEmail as any).mockReturnValue(true);

            const response = await uploadFile(req);

            expect(response.status).toBe(200);
        });

        it("10. 21st upload in same minute from same IP → 429 Rate limit exceeded", async () => {
            const adminUser = { id: "user-123", email: "admin@example.com" };
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: adminUser },
                error: null,
            });
            (isAdminEmail as any).mockReturnValue(true);

            const file = createMockFile("test.jpg", "image/jpeg", 1000);
            const fd = new FormData();
            fd.set("file", file);

            let lastResponse: Response | null = null;
            for (let i = 0; i < 21; i++) {
                const url = new URL("http://localhost/api/upload");
                const req = new NextRequest(url.toString(), {
                    method: "POST",
                    headers: { "x-forwarded-for": "192.168.1.1" },
                });
                vi.spyOn(req, "formData").mockResolvedValue(fd);

                const response = await uploadFile(req);
                lastResponse = response;
            }

            expect(lastResponse?.status).toBe(429);
            const json = await lastResponse?.json();
            expect(json?.error).toContain("Rate limit");
        });
    });
});
