import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProjectStats } from '@/lib/hooks/useProjectStats';

vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }),
        }),
    })),
}));

describe('useProjectStats hook', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('initializes with loading=true', async () => {
        const { result } = renderHook(() => useProjectStats());
        
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.loading).toBe(false);
    });

    it('initializes with empty stats', async () => {
        const { result } = renderHook(() => useProjectStats());

        await waitFor(() => expect(result.current.loading).toBe(false));
        
        expect(result.current.stats).toBeDefined();
        expect(result.current.stats.projects).toBeDefined();
    });

    it('returns refreshStats function', async () => {
        const { result } = renderHook(() => useProjectStats());

        await waitFor(() => expect(result.current.loading).toBe(false));
        
        expect(typeof result.current.refreshStats).toBe('function');
    });

    it('returns recentProjects array', async () => {
        const { result } = renderHook(() => useProjectStats());

        await waitFor(() => expect(result.current.loading).toBe(false));
        
        expect(Array.isArray(result.current.recentProjects)).toBe(true);
    });

    it('returns recentPosts array', async () => {
        const { result } = renderHook(() => useProjectStats());

        await waitFor(() => expect(result.current.loading).toBe(false));
        
        expect(Array.isArray(result.current.recentPosts)).toBe(true);
    });

    it('returns recentTestimonials array', async () => {
        const { result } = renderHook(() => useProjectStats());

        await waitFor(() => expect(result.current.loading).toBe(false));
        
        expect(Array.isArray(result.current.recentTestimonials)).toBe(true);
    });
});
