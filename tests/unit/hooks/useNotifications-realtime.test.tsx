import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({}),
    })),
    removeChannel: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock('@/lib/auth/AuthProvider', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  })),
  AuthProvider: ({ children }) => children,
}));

describe('useNotifications Hook Export', () => {
  it('should export useNotifications function', async () => {
    const module = await import('@/lib/hooks/useNotifications');
    expect(typeof module.useNotifications).toBe('function');
  });

  it('should return valid initial state structure', async () => {
    const { useNotifications } = await import('@/lib/hooks/useNotifications');
    const { result } = renderHook(() => useNotifications());
    
    expect(result.current).toHaveProperty('notifications');
    expect(result.current).toHaveProperty('unreadCount');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('markAsRead');
    expect(result.current).toHaveProperty('markAllAsRead');
    expect(result.current).toHaveProperty('refetch');
  });
});

describe('useProjectStats Hook Export', () => {
  it('should export useProjectStats function', async () => {
    const module = await import('@/lib/hooks/useProjectStats');
    expect(typeof module.useProjectStats).toBe('function');
  });

  it('should return valid initial state structure', async () => {
    const { useProjectStats } = await import('@/lib/hooks/useProjectStats');
    const { result } = renderHook(() => useProjectStats());
    
    expect(result.current).toHaveProperty('stats');
    expect(result.current).toHaveProperty('recentProjects');
    expect(result.current).toHaveProperty('recentPosts');
    expect(result.current).toHaveProperty('recentTestimonials');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('refreshStats');
  });
});
