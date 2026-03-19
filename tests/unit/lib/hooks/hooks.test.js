/**
 * @fileoverview Unit tests for React hooks
 *
 * These tests verify hook functionality including:
 * - Export verification
 * - State management (loading, error, data)
 * - API integration
 * - Error handling
 * - Refresh functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("react-hot-toast", () => ({
    toast: {
        error: vi.fn(),
    },
}));

describe("Hook Exports", () => {
    it("useNotifications exports", async () => {
        const mod = await import("@/lib/hooks/useNotifications");
        expect(typeof mod.useNotifications).toBe("function");
    });

    it("useTaskComments exports", async () => {
        const mod = await import("@/lib/hooks/useTaskComments");
        expect(typeof mod.useTaskComments).toBe("function");
    });

    it("useProjectStats exports", async () => {
        const mod = await import("@/lib/hooks/useProjectStats");
        expect(typeof mod.useProjectStats).toBe("function");
    });

    it("useRequests exports", async () => {
        const mod = await import("@/lib/hooks/useRequests");
        expect(typeof mod.useRequests).toBe("function");
    });
});

describe("useRequests Hook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("initializes with empty requests and loading state", async () => {
        const { useRequests } = await import("@/lib/hooks/useRequests");
        const { result } = renderHook(() => useRequests("/api/requests"));

        expect(result.current.requests).toEqual([]);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it("fetches requests successfully", async () => {
        const mockRequests = [
            { id: "1", title: "Request 1" },
            { id: "2", title: "Request 2" },
        ];

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: mockRequests }),
        });

        const { useRequests } = await import("@/lib/hooks/useRequests");
        const { result } = renderHook(() => useRequests("/api/requests"));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.requests).toEqual(mockRequests);
        expect(result.current.error).toBeNull();
    });

    it("handles API error response", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ error: "Access Denied" }),
        });

        const { useRequests } = await import("@/lib/hooks/useRequests");
        const { result } = renderHook(() => useRequests("/api/requests"));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe("Access Denied");
        expect(result.current.requests).toEqual([]);
    });

    it("handles network error", async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

        const { useRequests } = await import("@/lib/hooks/useRequests");
        const { result } = renderHook(() => useRequests("/api/requests"));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe("Network error fetching data. Ensure you are authenticated.");
    });

    it("refreshes requests on refreshRequests call", async () => {
        const mockRequests = [{ id: "1", title: "Request 1" }];
        let callCount = 0;

        global.fetch = vi.fn().mockImplementation(() => {
            callCount++;
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ data: mockRequests }),
            });
        });

        const { useRequests } = await import("@/lib/hooks/useRequests");
        const { result } = renderHook(() => useRequests("/api/requests"));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(callCount).toBe(1);

        await actAsync(() => result.current.refreshRequests());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(callCount).toBe(2);
    });

    it("uses custom API endpoint when provided", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: [] }),
        });

        const { useRequests } = await import("@/lib/hooks/useRequests");
        renderHook(() => useRequests("/api/custom-endpoint"));

        await waitFor(() => {});

        expect(global.fetch).toHaveBeenCalledWith("/api/custom-endpoint");
    });
});

async function actAsync(fn) {
    await act(async () => {
        await fn();
    });
}
