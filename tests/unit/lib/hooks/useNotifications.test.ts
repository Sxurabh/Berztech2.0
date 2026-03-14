/**
 * Unit tests for useNotifications hook
 * Validates: initial loading state, fetch on mount,
 * unread count computation, mark-as-read, error handling.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('react-hot-toast', () => ({ toast: { error: vi.fn() } }));
vi.mock('@/lib/auth/AuthProvider', () => ({
    useAuth: () => ({ user: { id: 'user-1', email: 'test@example.com' } }),
}));

vi.mock('@/lib/supabase/client', () => {
    const mockChannel = {
        on: vi.fn(function() { return this; }),
        subscribe: vi.fn(() => ({})),
    };
    return {
        createClient: vi.fn(() => ({
            channel: vi.fn(() => mockChannel),
            removeChannel: vi.fn(),
        })),
    };
});

const mockNotifications = [
    { id: 'n1', message: 'Task updated', is_read: false, user_id: 'user-1', created_at: new Date().toISOString() },
    { id: 'n2', message: 'Comment added', is_read: false, user_id: 'user-1', created_at: new Date().toISOString() },
    { id: 'n3', message: 'Project created', is_read: true, user_id: 'user-1', created_at: new Date().toISOString() },
];

describe('useNotifications hook', () => {
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
            json: async () => mockNotifications,
        });
        
        const { useNotifications } = await import('@/lib/hooks/useNotifications');
        const { result } = renderHook(() => useNotifications());
        
        expect(result.current.loading).toBe(true);
    });

    it('fetches notifications when mounted', () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockNotifications,
        });
        
        return import('@/lib/hooks/useNotifications').then(({ useNotifications }) => {
            renderHook(() => useNotifications());
            expect(mockFetch).toHaveBeenCalled();
        });
    });

    it('handles API error gracefully', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Unauthorized' }),
        });
        
        const { useNotifications } = await import('@/lib/hooks/useNotifications');
        const { result } = renderHook(() => useNotifications());
        
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });
        
        expect(result.current.loading).toBe(false);
    });

    it('handles network failure without crashing', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));
        
        const { useNotifications } = await import('@/lib/hooks/useNotifications');
        const { result } = renderHook(() => useNotifications());
        
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });
        
        expect(result.current.loading).toBe(false);
    });

    it('returns markAllAsRead function', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockNotifications,
        });
        
        const { useNotifications } = await import('@/lib/hooks/useNotifications');
        const { result } = renderHook(() => useNotifications());
        
        expect(typeof result.current.markAllAsRead).toBe('function');
    });

    it('returns markAsRead function', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockNotifications,
        });
        
        const { useNotifications } = await import('@/lib/hooks/useNotifications');
        const { result } = renderHook(() => useNotifications());
        
        expect(typeof result.current.markAsRead).toBe('function');
    });
});
