/**
 * @fileoverview Integration tests for Message Attachment Upload API
 *
 * Tests cover:
 * - POST /api/messages/upload (file upload for messages)
 * - File type validation (images and documents)
 * - Size limits (10MB)
 * - Proper storage path generation
 * - Public URL return
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as uploadMessageAttachment } from "@/app/api/messages/upload/route";
import { createServerSupabaseClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock("@/config/admin", () => ({
    isAdminEmail: vi.fn(),
}));

describe("Message Attachment Upload API", () => {
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
        createServerSupabaseClient.mockResolvedValue(mockServerSupabase);

        mockServerSupabase.storage.from.mockReturnValue({
            upload: mockStorageUpload,
            getPublicUrl: mockStorageGetPublicUrl,
        });

        mockStorageUpload.mockResolvedValue({
            data: { path: "message-attachments/test.jpg" },
            error: null,
        });

        mockStorageGetPublicUrl.mockImplementation((filePath) => {
            // Extract filename from path and return appropriate URL
            const fileName = filePath.split('/').pop();
            return {
                data: { publicUrl: `https://example.com/message-attachments/${fileName}` },
            };
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createMockFile(name, type, size) {
        const content = size > 0 ? "x".repeat(size) : "";
        return new File([content], name, { type });
    }

    async function createUploadRequest(file, projectId = "550e8400-e29b-41d4-a716-446655440000") {
        const url = new URL("http://localhost/api/messages/upload");
        
        const formData = new FormData();
        if (file) {
            formData.set("file", file);
        }
        formData.set("project_id", projectId);

        const req = new NextRequest(url.toString(), {
            method: "POST",
        });

        vi.spyOn(req, "formData").mockImplementation(async () => {
            const fd = new FormData();
            if (file) {
                fd.set("file", file);
            }
            fd.set("project_id", projectId);
            return fd;
        });

        const user = { id: "user-123", email: "user@example.com" };
        mockServerSupabase.auth.getUser.mockResolvedValue({
            data: { user },
            error: null,
        });

        return req;
    }

    describe("POST /api/messages/upload", () => {
        it("1. Unauthenticated request → 401", async () => {
            const file = createMockFile("test.jpg", "image/jpeg", 1000);
            const req = await createUploadRequest(file);
            
            // Mock unauthenticated user
            mockServerSupabase.auth.getUser.mockResolvedValue({
                data: { user: null },
                error: null,
            });

            const response = await uploadMessageAttachment(req);
            const json = await response.json();

            expect(response.status).toBe(401);
            expect(json.error).toBe("Unauthorized");
        });

        it("2. No file in formData → 400", async () => {
            const req = await createUploadRequest(null);
            
            const response = await uploadMessageAttachment(req);
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toBe("No file provided");
        });

        it("3. Missing project_id → 400", async () => {
            const file = createMockFile("test.jpg", "image/jpeg", 1000);
            const req = await createUploadRequest(file, ""); // Empty project_id
            
            const response = await uploadMessageAttachment(req);
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toBe("project_id is required");
        });

        it("4. Invalid file type → 400", async () => {
            const file = createMockFile("test.exe", "application/x-msdownload", 1000);
            const req = await createUploadRequest(file);
            
            const response = await uploadMessageAttachment(req);
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toContain("Invalid file type");
        });

        it("5. File too large (>10MB) → 400", async () => {
            const file = createMockFile("large.jpg", "image/jpeg", 11 * 1024 * 1024); // 11MB
            const req = await createUploadRequest(file);
            
            const response = await uploadMessageAttachment(req);
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json.error).toContain("File too large");
        });

        it("6. Valid JPEG file → 200 with url and type", async () => {
            const file = createMockFile("test.jpg", "image/jpeg", 1000);
            const req = await createUploadRequest(file);
            
            const response = await uploadMessageAttachment(req);
            const json = await response.json();
            
            expect(response.status).toBe(200);
            expect(json.url).toMatch(/^https:\/\/example\.com\/message-attachments\/\d+-[a-z0-9]+\.jpg$/);
            expect(json.type).toBe("image");
            expect(json.name).toBe("test.jpg");
        });

        it("7. Valid PNG file → 200 with url and type", async () => {
            const file = createMockFile("test.png", "image/png", 1000);
            const req = await createUploadRequest(file);
            
            const response = await uploadMessageAttachment(req);
            const json = await response.json();
            
            expect(response.status).toBe(200);
            expect(json.url).toMatch(/^https:\/\/example\.com\/message-attachments\/\d+-[a-z0-9]+\.png$/);
            expect(json.type).toBe("image");
            expect(json.name).toBe("test.png");
        });

        it("8. Valid PDF file → 200 with url and type", async () => {
            const file = createMockFile("test.pdf", "application/pdf", 1000);
            const req = await createUploadRequest(file);
            
            const response = await uploadMessageAttachment(req);
            const json = await response.json();
            
            expect(response.status).toBe(200);
            expect(json.url).toMatch(/^https:\/\/example\.com\/message-attachments\/\d+-[a-z0-9]+\.pdf$/);
            expect(json.type).toBe("document");
            expect(json.name).toBe("test.pdf");
        });

        it("9. Valid TXT file → 200 with url and type", async () => {
            const file = createMockFile("test.txt", "text/plain", 1000);
            const req = await createUploadRequest(file);
            
            const response = await uploadMessageAttachment(req);
            const json = await response.json();
            
            expect(response.status).toBe(200);
            expect(json.url).toMatch(/^https:\/\/example\.com\/message-attachments\/\d+-[a-z0-9]+\.txt$/);
            expect(json.type).toBe("document");
            expect(json.name).toBe("test.txt");
        });

        it("10. Storage upload failure → 500", async () => {
            const file = createMockFile("test.jpg", "image/jpeg", 1000);
            const req = await createUploadRequest(file);
            
            // Mock storage upload failure
            mockStorageUpload.mockResolvedValue({
                data: null,
                error: { message: "Storage error" },
            });
            
            const response = await uploadMessageAttachment(req);
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json.error).toBe("Failed to upload file");
        });

        it("11. File exactly 10MB → 200 (boundary test)", async () => {
            const file = createMockFile("exact.jpg", "image/jpeg", 10 * 1024 * 1024); // Exactly 10MB
            const req = await createUploadRequest(file);
            
            const response = await uploadMessageAttachment(req);
            const json = await response.json();

            expect(response.status).toBe(200);
            expect(json.url).toMatch(/^https:\/\/example\.com\/message-attachments\/\d+-[a-z0-9]+\.jpg$/);
        });
    });
});