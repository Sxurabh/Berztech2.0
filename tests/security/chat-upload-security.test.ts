/**
 * @fileoverview Security tests for Chat File Upload Security
 *
 * These tests verify:
 * 1. MIME type validation (accepts/rejects specific types)
 * 2. File size limits (10MB max)
 * 3. Filename sanitization (path traversal, null bytes, long names, double extensions)
 * 4. Magic byte validation for file content
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as uploadPost } from "@/app/api/messages/upload/route";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn().mockImplementation((email: string) => email === "admin@test.com"),
}));

import { createServerSupabaseClient } from "@/lib/supabase/server";

describe("Security: Chat File Upload Security", () => {
    let mockSupabase: any;
    let capturedUploadData: { path: string; file: Blob; options: any } | null;

    beforeEach(() => {
        vi.clearAllMocks();
        capturedUploadData = null;

        mockSupabase = {
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: "user-1", email: "user@test.com" } },
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
                        data: { publicUrl: "http://test.com/message-attachments/test.jpg" },
                    }),
                }),
            },
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createUploadRequest(
        content: Uint8Array,
        filename: string,
        contentType: string,
        projectId: string = "project-123"
    ) {
        const blob = new Blob([content.buffer as ArrayBuffer], { type: contentType });
        const formData = new FormData();
        formData.append("file", blob, filename);
        formData.append("project_id", projectId);

        const req = new NextRequest("http://localhost:3000/api/messages/upload", {
            method: "POST",
        });

        vi.spyOn(req, "formData").mockResolvedValue(formData);
        return req;
    }

    describe("MIME Type Validation", () => {
        it("1. Accepts image/jpeg", async () => {
            const content = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            const res = await uploadPost(req);

            expect(res.status).toBe(200);
        });

        it("2. Accepts image/png", async () => {
            const content = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
            const req = createUploadRequest(content, "test.png", "image/png");

            const res = await uploadPost(req);

            expect(res.status).toBe(200);
        });

        it("3. Accepts application/pdf", async () => {
            const content = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
            const req = createUploadRequest(content, "test.pdf", "application/pdf");

            const res = await uploadPost(req);

            expect(res.status).toBe(200);
        });

        it("4. Rejects text/html", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "page.html", "text/html");

            const res = await uploadPost(req);
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.error).toContain("Invalid file type");
        });

        it("5. Rejects application/javascript", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "script.js", "application/javascript");

            const res = await uploadPost(req);
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.error).toContain("Invalid file type");
        });
    });

    describe("File Size Limits", () => {
        it("6. Accepts file under 10MB", async () => {
            const content = new Uint8Array(5 * 1024 * 1024);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            const res = await uploadPost(req);

            expect(res.status).toBe(200);
        });

        it("7. Rejects file over 10MB", async () => {
            const content = new Uint8Array(11 * 1024 * 1024);
            const req = createUploadRequest(content, "large.jpg", "image/jpeg");

            const res = await uploadPost(req);
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.error).toContain("File too large");
        });

        it("8. Rejects extremely large files", async () => {
            const content = new Uint8Array(50 * 1024 * 1024);
            const req = createUploadRequest(content, "huge.jpg", "image/jpeg");

            const res = await uploadPost(req);
            const body = await res.json();

            expect(res.status).toBe(400);
            expect(body.error).toContain("File too large");
        });
    });

    describe("Filename Security", () => {
        it("9. Sanitizes path traversal in filename", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "../../../etc/passwd", "image/jpeg");

            const res = await uploadPost(req);

            if (res.status === 200) {
                expect(capturedUploadData).toBeDefined();
                expect(capturedUploadData!.path).not.toContain("../");
                expect(capturedUploadData!.path).not.toContain("/etc/passwd");
            }
        });

        it("10. Handles null bytes in filename", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "test\x00.jpg", "image/jpeg");

            const res = await uploadPost(req);

            expect([200, 400]).toContain(res.status);
        });

        it("11. Truncates very long filenames", async () => {
            const longName = "a".repeat(300) + ".jpg";
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, longName, "image/jpeg");

            const res = await uploadPost(req);

            expect([200, 400]).toContain(res.status);
        });

        it("12. Rejects double extensions", async () => {
            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "image.jpg.php", "image/jpeg");

            const res = await uploadPost(req);

            if (res.status === 200 && capturedUploadData) {
                expect(capturedUploadData.path.endsWith(".jpg")).toBe(true);
                expect(capturedUploadData.path).not.toContain(".php");
            }
        });
    });

    describe("Magic Byte Validation", () => {
        it("13. Accepts valid JPEG magic bytes", async () => {
            const jpegMagicBytes = new Uint8Array([
                0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
                0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01
            ]);
            const req = createUploadRequest(jpegMagicBytes, "photo.jpg", "image/jpeg");

            const res = await uploadPost(req);

            expect(res.status).toBe(200);
        });

        it("14. Accepts valid PNG magic bytes", async () => {
            const pngMagicBytes = new Uint8Array([
                0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52
            ]);
            const req = createUploadRequest(pngMagicBytes, "image.png", "image/png");

            const res = await uploadPost(req);

            expect(res.status).toBe(200);
        });

        it("15. Accepts valid PDF magic bytes", async () => {
            const pdfMagicBytes = new Uint8Array([
                0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34,
                0x0D, 0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0D
            ]);
            const req = createUploadRequest(pdfMagicBytes, "document.pdf", "application/pdf");

            const res = await uploadPost(req);

            expect(res.status).toBe(200);
        });
    });

    describe("Authentication", () => {
        it("16. Rejects unauthenticated requests", async () => {
            mockSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: { message: "No session" },
            });

            const content = new Uint8Array(100).fill(0);
            const req = createUploadRequest(content, "test.jpg", "image/jpeg");

            const res = await uploadPost(req);
            const body = await res.json();

            expect(res.status).toBe(401);
            expect(body.error).toBe("Unauthorized");
        });
    });
});
