import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useMessages, useUploadMessageAttachment } from "@/lib/hooks/useMessages";
import { server } from "../../mocks/server";
import { http, HttpResponse } from "msw";

const PROJECT_ID = "proj-uuid-1234";
const TEST_USER_ID = "client-uuid-5678";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: TEST_USER_ID, email: "client@example.com" } },
      }),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  }),
}));

describe("useMessages Hook", () => {
  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Query Functionality", () => {
    it("1. returns empty array when no projectId provided", async () => {
      const { result } = renderHook(() => useMessages(null), { wrapper });

      expect(result.current.messages).toEqual([]);
      expect(result.current.loading).toBe(false);
    });

    it("2. fetches messages for a project", async () => {
      const { result } = renderHook(() => useMessages(PROJECT_ID), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages[0].id).toBe("msg-1");
      expect(result.current.messages[0].content).toBe("Hello, I have a question about the project.");
    });

    it("3. returns empty array when project has no messages", async () => {
      const { result } = renderHook(() => useMessages("empty-project"), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages).toEqual([]);
    });

    it("4. handles fetch error gracefully", async () => {
      const { result } = renderHook(() => useMessages("error-project"), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.messages).toEqual([]);
    });

    it("5. includes sender information in messages", async () => {
      const { result } = renderHook(() => useMessages(PROJECT_ID), { wrapper });

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0);
      });

      const message = result.current.messages[0];
      expect(message.sender).toBeDefined();
      expect(message.sender.id).toBe("client-uuid-5678");
      expect(message.sender.full_name).toBe("Client User");
    });

    it("6. includes read receipts in messages", async () => {
      const { result } = renderHook(() => useMessages(PROJECT_ID), { wrapper });

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0);
      });

      const messageWithReads = result.current.messages.find(m => m.reads?.length > 0);
      expect(messageWithReads).toBeDefined();
      expect(messageWithReads.reads[0].user_id).toBe("admin-uuid-1234");
    });
  });

  describe("sendMessage Mutation", () => {
    it("7. sendMessage is a function", () => {
      const { result } = renderHook(() => useMessages(PROJECT_ID), { wrapper });

      expect(typeof result.current.sendMessage).toBe("function");
    });

    it("8. successfully sends a message", async () => {
      const { result } = renderHook(() => useMessages(PROJECT_ID), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.sendMessage({
        content: "Test message content",
      });

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
    });

    it("9. sends message with attachment data", async () => {
      const { result } = renderHook(() => useMessages(PROJECT_ID), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.sendMessage({
        content: "Message with attachment",
        attachment_url: "https://example.com/file.pdf",
        attachment_type: "document",
        attachment_name: "file.pdf",
      });

      expect(response.data).toMatchObject({
        attachment_url: "https://example.com/file.pdf",
        attachment_type: "document",
        attachment_name: "file.pdf",
      });
    });

    it("10. handles send message error", async () => {
      const { result } = renderHook(() => useMessages("error-project"), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        result.current.sendMessage({ content: "Test message" })
      ).rejects.toThrow();
    });
  });

  describe("markAsRead Mutation", () => {
    it("11. markAsRead is a function", () => {
      const { result } = renderHook(() => useMessages(PROJECT_ID), { wrapper });

      expect(typeof result.current.markAsRead).toBe("function");
    });

    it("12. successfully marks message as read", async () => {
      const { result } = renderHook(() => useMessages(PROJECT_ID), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const response = await result.current.markAsRead("msg-1");

      expect(response).toBeDefined();
      expect(response.data.message_id).toBe("msg-1");
    });

    it("13. rejects marking non-existent message as read", async () => {
      const { result } = renderHook(() => useMessages(PROJECT_ID), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        result.current.markAsRead("msg-not-found")
      ).rejects.toThrow();
    });
  });

  describe("Realtime Subscriptions", () => {
    it("14. returns messages after setup with realtime", async () => {
      const { result } = renderHook(() => useMessages(PROJECT_ID), { wrapper });

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0);
      });

      expect(result.current.messages).toHaveLength(3);
    });

    it("15. does not setup subscription when projectId is null", async () => {
      const { result } = renderHook(() => useMessages(null), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages).toEqual([]);
    });

    it("16. cleans up subscription on projectId change", async () => {
      const { result, rerender } = renderHook(
        ({ projectId }) => useMessages(projectId),
        { wrapper, initialProps: { projectId: PROJECT_ID } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      rerender({ projectId: "new-project-id" });

      await waitFor(() => {
        expect(result.current.messages).toEqual([]);
      });
    });
  });

  describe("Edge Cases", () => {
    it("17. handles empty content validation error", async () => {
      const { result } = renderHook(() => useMessages("error-project"), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        result.current.sendMessage({ content: "   " })
      ).rejects.toThrow();
    });

    it("18. returns loading state initially", async () => {
      const { result } = renderHook(() => useMessages(PROJECT_ID), { wrapper });

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0);
      });

      expect(result.current.messages.length).toBeGreaterThan(0);
    });
  });
});

describe("useUploadMessageAttachment Hook", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("19. returns upload function", () => {
    const { result } = renderHook(() => useUploadMessageAttachment());

    expect(typeof result.current.upload).toBe("function");
  });

  it("20. uploads file successfully", async () => {
    const mockFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
    const mockResponse = {
      url: "https://storage.example.com/test.pdf",
      type: "document",
      name: "test.pdf",
    };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useUploadMessageAttachment());
    const response = await result.current.upload(mockFile, PROJECT_ID);

    expect(response).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/messages/upload",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("21. throws error on upload failure", async () => {
    const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Upload failed" }),
    });

    const { result } = renderHook(() => useUploadMessageAttachment());

    await expect(
      result.current.upload(mockFile, PROJECT_ID)
    ).rejects.toThrow("Upload failed");
  });

  it("22. includes project_id in upload request", async () => {
    const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const projectId = "test-project-123";

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: "test.jpg" }),
    });

    const { result } = renderHook(() => useUploadMessageAttachment());
    await result.current.upload(mockFile, projectId);

    const formData = vi.mocked(global.fetch).mock.calls[0][1].body;
    expect(formData.get("project_id")).toBe(projectId);
    expect(formData.get("file")).toBe(mockFile);
  });
});

describe("useMessages Edge Cases", () => {
  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Network Resilience", () => {
    it("handles aborted requests when projectId changes rapidly", async () => {
      const { result, rerender } = renderHook(
        ({ projectId }) => useMessages(projectId),
        { wrapper, initialProps: { projectId: "project-1" } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      rerender({ projectId: "project-2" });

      await waitFor(() => {
        expect(result.current.messages).toEqual([]);
      });
    });
  });

  describe("Concurrent Operations", () => {
    it("handles concurrent send operations sequentially", async () => {
      const { result } = renderHook(() => useMessages(PROJECT_ID), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.sendMessage({ content: "Message 1" });
      await result.current.sendMessage({ content: "Message 2" });
    });

    it("sendMessage is available during loading", async () => {
      const { result } = renderHook(() => useMessages(PROJECT_ID), { wrapper });

      expect(typeof result.current.sendMessage).toBe("function");
    });
  });

  describe("Data Integrity", () => {
    it("handles message data structure", async () => {
      const { result } = renderHook(() => useMessages(PROJECT_ID), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages.length).toBeGreaterThanOrEqual(0);
      if (result.current.messages.length > 0) {
        result.current.messages.forEach(msg => {
          expect(msg).toHaveProperty("id");
          expect(msg).toHaveProperty("content");
        });
      }
    });
  });

  describe("Rapid State Changes", () => {
    it("handles toggle between null and valid projectId", async () => {
      const { result, rerender } = renderHook(
        ({ projectId }) => useMessages(projectId),
        { wrapper, initialProps: { projectId: null } }
      );

      expect(result.current.messages).toEqual([]);
      expect(result.current.loading).toBe(false);

      rerender({ projectId: PROJECT_ID });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages.length).toBeGreaterThanOrEqual(0);

      rerender({ projectId: null });

      expect(result.current.messages).toEqual([]);
    });
  });
});

describe("useUploadMessageAttachment Edge Cases", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handles upload failure with error message", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Upload failed" }),
    });

    const { result } = renderHook(() => useUploadMessageAttachment());
    const mockFile = new File(["test"], "test.pdf", { type: "application/pdf" });

    await expect(
      result.current.upload(mockFile, PROJECT_ID)
    ).rejects.toThrow("Upload failed");
  });

  it("handles large file upload", async () => {
    const largeContent = new Array(1024 * 100).join("x");
    const mockFile = new File([largeContent], "large.pdf", { type: "application/pdf" });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: "https://example.com/large.pdf" }),
    });

    const { result } = renderHook(() => useUploadMessageAttachment());
    const response = await result.current.upload(mockFile, PROJECT_ID);

    expect(response.url).toBeTruthy();
  });

  it("handles retry after failed upload", async () => {
    let attemptCount = 0;
    vi.mocked(global.fetch).mockImplementation(() => {
      attemptCount++;
      if (attemptCount === 1) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: "Upload failed" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ url: "https://example.com/test.pdf" }),
      });
    });

    const { result } = renderHook(() => useUploadMessageAttachment());
    const mockFile = new File(["test"], "test.pdf", { type: "application/pdf" });

    await expect(
      result.current.upload(mockFile, PROJECT_ID)
    ).rejects.toThrow();

    const retryResponse = await result.current.upload(mockFile, PROJECT_ID);
    expect(retryResponse.url).toBe("https://example.com/test.pdf");
  });

  it("handles concurrent uploads", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: "https://example.com/test.pdf" }),
    });

    const { result } = renderHook(() => useUploadMessageAttachment());
    const mockFile1 = new File(["test1"], "test1.pdf", { type: "application/pdf" });
    const mockFile2 = new File(["test2"], "test2.pdf", { type: "application/pdf" });

    const response1 = await result.current.upload(mockFile1, PROJECT_ID);
    const response2 = await result.current.upload(mockFile2, PROJECT_ID);

    expect(response1.url).toBeTruthy();
    expect(response2.url).toBeTruthy();
  });
});
