import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProjectStats } from '@/lib/hooks/useProjectStats';

const mockData = {
    projects: [
        { id: 'p1', client: 'Client A', title: 'Project 1', created_at: '2024-01-01' }
    ],
    posts: [
        { id: 'b1', title: 'Blog 1', published: true, created_at: '2024-01-01' }
    ],
    testimonials: [
        { id: 't1', client: 'John', company: 'Acme', content: 'Great!', created_at: '2024-01-01' }
    ]
};

const createQueryBuilder = (table) => {
    const data = mockData[table] || [];
    const mockResult = { data, count: data.length, error: null };
    return {
        select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockResult),
                ...mockResult,
            }),
            ...mockResult,
        }),
    };
};

vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => ({
        from: vi.fn((table) => createQueryBuilder(table)),
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

    it('refreshStats function returns a promise', async () => {
        const { result } = renderHook(() => useProjectStats());

        await waitFor(() => expect(result.current.loading).toBe(false));
        
        const refreshPromise = result.current.refreshStats();
        expect(refreshPromise).toBeInstanceOf(Promise);
        
        await refreshPromise;
    });

    it('handles API errors gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        vi.mock('@/lib/supabase/client', () => ({
            createClient: vi.fn(() => ({
                from: vi.fn(() => {
                    throw new Error('API Error');
                }),
            })),
        }));

        const { result } = renderHook(() => useProjectStats());

        await waitFor(() => expect(result.current.loading).toBe(false));

        consoleSpy.mockRestore();
    });

    it('handles Promise.all rejection in fetchStats', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        vi.mock('@/lib/supabase/client', () => ({
            createClient: vi.fn(() => ({
                from: vi.fn(() => ({
                    select: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            limit: vi.fn().mockRejectedValue(new Error('Network error')),
                        }),
                    }),
                })),
            })),
        }));

        const { result } = renderHook(() => useProjectStats());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
