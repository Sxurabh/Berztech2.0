import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRequests } from '@/lib/hooks/useRequests';

vi.mock('react-hot-toast', () => ({
    toast: { error: vi.fn() }
}));

describe('useRequests hook', () => {
    let mockFetch;

    beforeEach(() => {
        mockFetch = vi.fn();
        global.fetch = mockFetch;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('initializes with loading=true', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: [] }),
        });

        const { result } = renderHook(() => useRequests());
        
        expect(result.current.loading).toBe(true);
    });

    it('fetches requests on mount', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: [{ id: '1', name: 'Request 1' }] }),
        });

        renderHook(() => useRequests());
        
        await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    });

    it('sets requests on successful fetch', async () => {
        const mockData = [{ id: '1', name: 'Request 1' }, { id: '2', name: 'Request 2' }];
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: mockData }),
        });

        const { result } = renderHook(() => useRequests());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.requests).toEqual(mockData);
    });

    it('sets error on failed fetch', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Access Denied' }),
        });

        const { result } = renderHook(() => useRequests());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe('Access Denied');
    });

    it('handles network error', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useRequests());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toContain('Network error');
    });

    it('returns refreshRequests function', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: [] }),
        });

        const { result } = renderHook(() => useRequests());
        
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(typeof result.current.refreshRequests).toBe('function');
    });

    it('refreshRequests triggers fetch', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: [{ id: '1' }] }),
        });

        const { result } = renderHook(() => useRequests());
        
        await waitFor(() => expect(result.current.loading).toBe(false));
        
        mockFetch.mockClear();
        await actAsync(async () => {
            await result.current.refreshRequests();
        });
        
        expect(mockFetch).toHaveBeenCalled();
    });

    it('uses custom apiEndpoint', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: [] }),
        });

        renderHook(() => useRequests('/api/custom'));

        await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/api/custom'));
    });
});

async function actAsync(callback) {
    await act(callback);
}
