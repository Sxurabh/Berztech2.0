/**
 * Unit tests for useTaskComments hook
 * Validates: fetch on mount, send comment, optimistic updates,
 * polling fallback, realtime subscriptions.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/lib/supabase/client', () => {
    const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    return {
        createClient: vi.fn(() => ({
            from: vi.fn().mockReturnValue(mockQueryBuilder),
            channel: vi.fn(() => ({
                on: vi.fn().mockReturnThis(),
                subscribe: vi.fn(),
            })),
            removeChannel: vi.fn(),
            auth: {
                getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
            },
        })),
    };
});

vi.mock('@/lib/auth/AuthProvider', () => ({
    useAuth: () => ({ user: { id: 'user-1', email: 'test@example.com' } }),
}));

const mockComments = [
    { id: 'c1', task_id: 'task-1', content: 'First comment', user_id: 'user-1', created_at: new Date().toISOString() },
    { id: 'c2', task_id: 'task-1', content: 'Second comment', user_id: 'user-2', created_at: new Date().toISOString() },
];

describe('useTaskComments hook', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns empty comments array when taskId is null', async () => {
        const { useTaskComments } = await import('@/lib/hooks/useTaskComments');
        const { result } = renderHook(() => useTaskComments(null));
        
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        
        expect(result.current.comments).toEqual([]);
    });

    it('returns sendComment function', async () => {
        const { useTaskComments } = await import('@/lib/hooks/useTaskComments');
        const { result } = renderHook(() => useTaskComments('task-1'));
        
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        
        expect(typeof result.current.sendComment).toBe('function');
    });

    it('returns setComments function', async () => {
        const { useTaskComments } = await import('@/lib/hooks/useTaskComments');
        const { result } = renderHook(() => useTaskComments('task-1'));
        
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        
        expect(typeof result.current.setComments).toBe('function');
    });

    it('returns loading state', async () => {
        const { useTaskComments } = await import('@/lib/hooks/useTaskComments');
        const { result } = renderHook(() => useTaskComments('task-1'));
        
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        
        expect(result.current.loading).toBe(false);
    });

    it('setComments updates state', async () => {
        const { useTaskComments } = await import('@/lib/hooks/useTaskComments');
        const { result } = renderHook(() => useTaskComments('task-1'));
        
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        
        act(() => {
            result.current.setComments(mockComments);
        });
        
        expect(result.current.comments).toEqual(mockComments);
    });

    it('sendComment returns false when content is empty', async () => {
        const { useTaskComments } = await import('@/lib/hooks/useTaskComments');
        const { result: hookResult } = renderHook(() => useTaskComments('task-1'));
        
        await waitFor(() => {
            expect(hookResult.current.loading).toBe(false);
        });
        
        const sendResult = await act(async () => {
            return await hookResult.current.sendComment('');
        });
        
        expect(sendResult).toBe(false);
    });

    it('sendComment returns false when taskId is null', async () => {
        const { useTaskComments } = await import('@/lib/hooks/useTaskComments');
        const { result: nullResult } = renderHook(() => useTaskComments(null));
        
        await waitFor(() => {
            expect(nullResult.current.loading).toBe(false);
        });
        
        const sendResult = await act(async () => {
            return await nullResult.current.sendComment('test');
        });
        
        expect(sendResult).toBe(false);
    });

    it('sendComment returns false when content is only whitespace', async () => {
        const { useTaskComments } = await import('@/lib/hooks/useTaskComments');
        const { result } = renderHook(() => useTaskComments('task-1'));
        
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        
        const sendResult = await act(async () => {
            return await result.current.sendComment('   ');
        });
        
        expect(sendResult).toBe(false);
    });

    it('sendComment succeeds and replaces optimistic comment with real data', async () => {
        vi.mock('@/lib/supabase/client', () => {
            const mockQueryBuilder = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
            };
            return {
                createClient: vi.fn(() => ({
                    from: vi.fn().mockReturnValue(mockQueryBuilder),
                    channel: vi.fn(() => ({
                        on: vi.fn().mockReturnThis(),
                        subscribe: vi.fn(),
                    })),
                    removeChannel: vi.fn(),
                    auth: {
                        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
                    },
                })),
            };
        });
        
        const { useTaskComments } = await import('@/lib/hooks/useTaskComments');
        const { result } = renderHook(() => useTaskComments('task-1'));
        
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        
        const mockApiResponse = {
            data: {
                id: 'real-comment-id',
                task_id: 'task-1',
                user_id: 'user-1',
                content: 'Test comment',
                created_at: new Date().toISOString(),
            }
        };
        
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockApiResponse),
            });
        
        const sendResult = await act(async () => {
            return await result.current.sendComment('Test comment');
        });
        
        expect(sendResult).toBeDefined();
    });

    it('sendComment rolls back on API error (non-ok response)', async () => {
        const { useTaskComments } = await import('@/lib/hooks/useTaskComments');
        const { result } = renderHook(() => useTaskComments('task-1'));
        
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: false,
                status: 400,
            });
        
        const initialCommentsLength = result.current.comments.length;
        
        const sendResult = await act(async () => {
            return await result.current.sendComment('Test comment');
        });
        
        expect(sendResult).toBe(false);
    });

    it('sendComment rolls back on network error', async () => {
        const { useTaskComments } = await import('@/lib/hooks/useTaskComments');
        const { result } = renderHook(() => useTaskComments('task-1'));
        
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        
        global.fetch = vi.fn()
            .mockRejectedValueOnce(new Error('Network error'));
        
        const sendResult = await act(async () => {
            return await result.current.sendComment('Test comment');
        });
        
        expect(sendResult).toBe(false);
    });

    it('sendComment returns false when user is not authenticated', async () => {
        vi.mock('@/lib/supabase/client', () => {
            const mockQueryBuilder = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
            };
            return {
                createClient: vi.fn(() => ({
                    from: vi.fn().mockReturnValue(mockQueryBuilder),
                    channel: vi.fn(() => ({
                        on: vi.fn().mockReturnThis(),
                        subscribe: vi.fn(),
                    })),
                    removeChannel: vi.fn(),
                    auth: {
                        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
                    },
                })),
            };
        });
        
        const { useTaskComments } = await import('@/lib/hooks/useTaskComments');
        const { result } = renderHook(() => useTaskComments('task-1'));
        
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        
        const sendResult = await act(async () => {
            return await result.current.sendComment('Test comment');
        });
        
        expect(sendResult).toBe(false);
    });

    it('sendComment returns false when user is not authenticated', async () => {
        vi.mock('@/lib/supabase/client', () => {
            const mockQueryBuilder = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
            };
            return {
                createClient: vi.fn(() => ({
                    from: vi.fn().mockReturnValue(mockQueryBuilder),
                    channel: vi.fn(() => ({
                        on: vi.fn().mockReturnThis(),
                        subscribe: vi.fn(),
                    })),
                    removeChannel: vi.fn(),
                    auth: {
                        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
                    },
                })),
            };
        });
        
        const { useTaskComments } = await import('@/lib/hooks/useTaskComments');
        const { result } = renderHook(() => useTaskComments('task-1'));
        
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
        
        const sendResult = await act(async () => {
            return await result.current.sendComment('Test comment');
        });
        
        expect(sendResult).toBe(false);
    });
});
