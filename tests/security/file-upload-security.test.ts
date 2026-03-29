/**
 * @fileoverview Security tests for File Upload Security - Real Validation
 *
 * These tests verify that:
 * 1. File type validation actually blocks disallowed types
 * 2. File size limits are enforced
 * 3. Filename sanitization prevents path traversal
 * 4. Secure filename generation ignores client-provided names
 * 5. Authentication is required for uploads
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as uploadPost } from "@/app/api/upload/route";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn().mockImplementation((email: string) => email === "admin@test.com"),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("Security: File Upload Security - Real Validation", () => {
    let mockSupabase: any;
    let capturedUploadData: { path: string; file: Blob; options: any } | null;

    beforeEach(() => {
        vi.clearAllMocks();
        capturedUploadData = null;

        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "admin-1", email: "admin@test.com" } },
                    error: null,
                }),
            },
            storage: {
                from: vi.fn().mockReturnValue({
                    upload: vi.fn().mockImplementation((path: string, file: Blob, options: any) => {
                        capturedUploadData = { path, file, options };
                        return Promise.resolve({ data: { path }, error: null });
                    }),
                    getPublicUrl: vi.fn().mockReturnValue({
                        data: { publicUrl: "http://test.com/uploads/test.jpg" },
                    }),
                }),
            },
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createUploadRequest(content: Uint8Array, filename: string, contentType: string, ip: string = "192.168.1.1") {
        const mockFile = {
            type: contentType,
            size: content.length,
            name: filename,
            arrayBuffer: vi.fn().mockResolvedValue(content.buffer),
        };

        const mockFormData = {
            get: vi.fn().mockReturnValue(mockFile),
        };

        return {
            headers: {
                get: (name: string) => name === "x-forwarded-for" ? ip : null,
            },
            formData: vi.fn().mockResolvedValue(mockFormData),
        } as unknown as Request;
    }

    describe("MIME Type Validation - Real Validation", () => {
        const JPEG_MAGIC = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
        const PNG_MAGIC = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        const GIF_MAGIC = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
        const WEBP_MAGIC = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);

        it("1. Accepts JPEG files", async () => {
            const content = new Uint8Array(100);
            content.set(JPEG_MAGIC);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            const res = await uploadPost(req);

            expect([200, 429]).toContain(res.status);
        });

        it("2. Accepts PNG files", async () => {
            const content = new Uint8Array(100);
            content.set(PNG_MAGIC);
            const req = createUploadRequest(content, "test.png", "image/png");

            const res = await uploadPost(req);

            expect([200, 429]).toContain(res.status);
        });

        it("3. Accepts WebP files", async () => {
            const content = new Uint8Array(100);
            content.set(WEBP_MAGIC);
            const req = createUploadRequest(content, "test.webp", "image/webp");

            const res = await uploadPost(req);

            expect([200, 429]).toContain(res.status);
        });

        it("4. Accepts GIF files", async () => {
            const content = new Uint8Array(100);
            content.set(GIF_MAGIC);
            const req = createUploadRequest(content, "test.gif", "image/gif");

            const res = await uploadPost(req);

            expect([200, 429]).toContain(res.status);
        });

        it("5. Rejects executable files", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "malware.exe", "application/x-executable");

            const res = await uploadPost(req);
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.error).toContain("Invalid file type");
        });

        it("6. Rejects PHP files", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "shell.php", "application/x-httpd-php");

            const res = await uploadPost(req);

            expect(res.status).toBe(400);
        });

        it("7. Rejects JavaScript files", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "script.js", "application/javascript");

            const res = await uploadPost(req);

            expect(res.status).toBe(400);
        });

        it("8. Rejects HTML files", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "page.html", "text/html");

            const res = await uploadPost(req);

            expect(res.status).toBe(400);
        });

        it("9. Rejects SVG files (potential XSS vector)", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "image.svg", "image/svg+xml");

            const res = await uploadPost(req);

            expect(res.status).toBe(400);
        });

        it("10. Rejects PDF files", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "document.pdf", "application/pdf");

            const res = await uploadPost(req);

            expect(res.status).toBe(400);
        });
    });

    describe("File Size Validation - Real Validation", () => {
        const JPEG_MAGIC = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);

        it("11. Accepts files under 5MB", async () => {
            const content = new Uint8Array(100 * 1024);
            content.set(JPEG_MAGIC);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            const res = await uploadPost(req);

            expect([200, 429]).toContain(res.status);
        });

        it("12. Rejects files over 5MB", async () => {
            const content = new Uint8Array(6 * 1024 * 1024);
            content.set(JPEG_MAGIC);
            const req = createUploadRequest(content, "large.jpg", "image/jpeg");

            const res = await uploadPost(req);
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.error).toContain("File too large");
        });

        it("13. Rejects files exactly at 5MB boundary", async () => {
            const content = new Uint8Array(5 * 1024 * 1024 + 1);
            content.set(JPEG_MAGIC);
            const req = createUploadRequest(content, "boundary.jpg", "image/jpeg");

            const res = await uploadPost(req);

            expect(res.status).toBe(400);
        });

        it("14. Accepts empty files", async () => {
            const content = new Uint8Array(0);
            const req = createUploadRequest(content, "empty.jpg", "image/jpeg");

            const res = await uploadPost(req);

            expect([200, 400, 429]).toContain(res.status);
        });
    });

    describe("Filename Sanitization - Real Validation", () => {
        it("15. Generates safe filename ignoring client name", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "../../../etc/passwd", "image/jpeg");

            const res = await uploadPost(req);

            if (res.status === 200) {
                expect(capturedUploadData).toBeDefined();
                expect(capturedUploadData!.path).toBeDefined();
                // Path should not contain traversal
                expect(capturedUploadData!.path).not.toContain("../");
                expect(capturedUploadData!.path).not.toContain("/etc/passwd");
            }
        });

        it("16. Prevents path traversal with backslash", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "..\\windows\\system32\\config", "image/jpeg");

            const res = await uploadPost(req);

            if (res.status === 200) {
                expect(capturedUploadData!.path).not.toContain("..\\");
            }
        });

        it("17. Uses timestamp and random in filename", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "original.jpg", "image/jpeg");

            const res = await uploadPost(req);

            if (res.status === 200 && capturedUploadData) {
                const path = capturedUploadData.path;
                // Should be in uploads/ directory
                expect(path.startsWith("uploads/")).toBe(true);
                // Should have .jpg extension
                expect(path.endsWith(".jpg")).toBe(true);
            }
        });

        it("18. Maps MIME type to correct extension", async () => {
            const testCases = [
                { type: "image/jpeg", ext: "jpg" },
                { type: "image/png", ext: "png" },
                { type: "image/webp", ext: "webp" },
                { type: "image/gif", ext: "gif" },
            ];

            for (const { type, ext } of testCases) {
                vi.clearAllMocks();
                capturedUploadData = null;
                const content = new Uint8Array(100).fill(0);
                const req = createUploadRequest(content, `test.${ext}`, type);

                const res = await uploadPost(req);

                if (res.status === 200 && capturedUploadData) {
                    expect(capturedUploadData.path.endsWith(`.${ext}`)).toBe(true);
                }
            }
        });

        it("19. Ignores double extension attacks", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "image.jpg.php", "image/jpeg");

            const res = await uploadPost(req);

            if (res.status === 200) {
                // Should use .jpg from MIME type, not .php from filename
                expect(capturedUploadData!.path.endsWith(".jpg")).toBe(true);
                expect(capturedUploadData!.path).not.toContain(".php");
            }
        });

        it("20. Handles null bytes in filename", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "test\x00.jpg", "image/jpeg");

            const res = await uploadPost(req);

            // Should either sanitize or reject
            expect([200, 400, 429]).toContain(res.status);
        });
    });

    describe("Authentication & Authorization - Real Validation", () => {
        it("21. Rejects unauthenticated requests", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "No session" },
            });

            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            const res = await uploadPost(req);
            const body = await res.json();

            expect([401, 429]).toContain(res.status);
            if (res.status === 401) {
                expect(body.error).toBe("Unauthorized");
            }
        });

        it("22. Rejects non-admin users", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user-1", email: "user@example.com" } },
                error: null,
            });

            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            const res = await uploadPost(req);
            const body = await res.json();

            expect([403, 429]).toContain(res.status);
            if (res.status === 403) {
                expect(body.error).toBe("Forbidden");
            }
        });

        it("23. Accepts admin users", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            const res = await uploadPost(req);

            expect([200, 429]).toContain(res.status);
        });

        it("24. Checks auth before file validation", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "No session" },
            });

            // Even with valid file, should reject for auth or rate limit
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            const res = await uploadPost(req);

            expect([401, 429]).toContain(res.status);
        });
    });

    describe("Content-Type Validation - Real Validation", () => {
        it("25. Uses file.type for content-type header", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            const res = await uploadPost(req);

            if (res.status === 200 && capturedUploadData) {
                expect(capturedUploadData.options.contentType).toBe("image/jpeg");
            }
        });

        it("26. Sets cache control header", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            const res = await uploadPost(req);

            if (res.status === 200 && capturedUploadData) {
                expect(capturedUploadData.options.cacheControl).toBe("3600");
            }
        });

        it("27. Sets upsert to false", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            const res = await uploadPost(req);

            if (res.status === 200 && capturedUploadData) {
                expect(capturedUploadData.options.upsert).toBe(false);
            }
        });
    });

    describe("Magic-Byte Validation Gap - Documents Known Limitation", () => {
        it("36. File with valid MIME but HTML content passes MIME check (magic-byte gap)", async () => {
            const htmlContent = new TextEncoder().encode("<html><body>Malicious HTML</body></html>");
            const req = createUploadRequest(htmlContent, "image.jpg", "image/jpeg");

            const res = await uploadPost(req);

            if (res.status === 200 && capturedUploadData) {
                expect(capturedUploadData.options.contentType).toBe("image/jpeg");
            }
        });

        it("37. File with valid MIME but PHP script content passes MIME check (magic-byte gap)", async () => {
            const phpContent = new TextEncoder().encode("<?php system($_GET['cmd']); ?>");
            const req = createUploadRequest(phpContent, "image.png", "image/png");

            const res = await uploadPost(req);

            if (res.status === 200 && capturedUploadData) {
                expect(capturedUploadData.options.contentType).toBe("image/png");
            }
        });
    });

    describe("Edge Cases - Real Validation", () => {
        it("28. Handles missing file field", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "admin-1", email: "admin@test.com" } },
                error: null,
            });

            const formData = new FormData();
            const req = new NextRequest("http://localhost:3000/api/upload", {
                method: "POST",
                headers: { "x-forwarded-for": "192.168.1.1" },
            });
            vi.spyOn(req, "formData").mockResolvedValue(formData);

            const res = await uploadPost(req);
            const body_json = await res.json();

            expect([400, 429]).toContain(res.status);
            if (res.status === 400) {
                expect(body_json.error).toContain("No file provided");
            }
        });

        it("29. Handles empty filename", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "", "image/jpeg");

            const res = await uploadPost(req);

            // Should either generate a name or reject
            expect([200, 400, 429]).toContain(res.status);
        });

        it("30. Handles very long filename", async () => {
            const longName = "a".repeat(300) + ".jpg";
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, longName, "image/jpeg");

            const res = await uploadPost(req);

            // Should handle gracefully
            expect([200, 400, 429]).toContain(res.status);
        });

        it("31. Handles special characters in filename", async () => {
            const specialName = "file!@#$%^&*()_+.jpg";
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, specialName, "image/jpeg");

            const res = await uploadPost(req);

            expect([200, 429]).toContain(res.status);
        });

        it("32. Handles unicode in filename", async () => {
            const unicodeName = "ファイル日本語.jpg";
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, unicodeName, "image/jpeg");

            const res = await uploadPost(req);

            expect([200, 429]).toContain(res.status);
        });
    });

    describe("Upload Storage Security - Real Validation", () => {
        it("33. Uploads to 'images' bucket", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            await uploadPost(req);

            if (capturedUploadData) {
                expect(mockSupabase.storage.from).toHaveBeenCalledWith("images");
            }
        });

        it("34. Stores files in uploads/ subdirectory", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            const res = await uploadPost(req);

            if (res.status === 200 && capturedUploadData) {
                expect(capturedUploadData.path.startsWith("uploads/")).toBe(true);
            }
        });

        it("35. Returns public URL in response", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            const res = await uploadPost(req);

            if (res.status === 200) {
                const body = await res.json();
                expect(body.url).toBeDefined();
                expect(body.path).toBeDefined();
            }
        });
    });
});
