/**
 * @fileoverview Unit tests for useUploadMessageAttachment hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useUploadMessageAttachment } from "@/lib/hooks/useMessages";

vi.mock("@/lib/supabase/client", () => ({
    createClient: vi.fn(),
}));

describe("useUploadMessageAttachment hook", () => {
    let mockSupabase;

    beforeEach(() => {
        vi.clearAllMocks();
        
        mockSupabase = {
            // Mock is not actually used in this hook since it uses fetch directly
        };

        // Mock fetch globally
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("useUploadMessageAttachment()", () => {
        it("should return upload function", () => {
            const { result } = renderHook(() => useUploadMessageAttachment());
            
            expect(typeof result.current.upload).toBe("function");
        });

        it("should upload file and return response", async () => {
            const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
            const mockResponse = {
                url: "https://example.com/test.jpg",
                type: "image",
                name: "test.jpg",
            };

            fetch.mockResolvedValue({
                ok: true,
                json: async () => mockResponse,
            });

            const { result } = renderHook(() => useUploadMessageAttachment());
            
            const promise = result.current.upload(mockFile, "test-project-id");
            const response = await promise;
            
            expect(response).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith("/api/messages/upload", {
                method: "POST",
                body: expect.any(FormData),
            });
        });

        it("should throw error when upload fails", async () => {
            const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
            const mockError = { error: "Upload failed" };

            fetch.mockResolvedValue({
                ok: false,
                json: async () => mockError,
            });

            const { result } = renderHook(() => useUploadMessageAttachment());
            
            await expect(
                result.current.upload(mockFile, "test-project-id")
            ).rejects.toThrow("Upload failed");
        });

        it("should include file and project_id in FormData", async () => {
            const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
            const mockResponse = { url: "test.jpg" };

            fetch.mockResolvedValue({
                ok: true,
                json: async () => mockResponse,
            });

            const { result } = renderHook(() => useUploadMessageAttachment());
            
            await result.current.upload(mockFile, "test-project-id");
            
            const formDataArg = fetch.mock.calls[0][1].body;
            expect(formDataArg instanceof FormData).toBe(true);
            expect(formDataArg.get("file")).toBe(mockFile);
            expect(formDataArg.get("project_id")).toBe("test-project-id");
        });
    });
});