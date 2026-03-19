import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ 
        data: [], 
        count: 0, 
        error: null 
      }),
    }),
  })),
}));

describe('useProjectStats Hook Export', () => {
  it('should export useProjectStats function', async () => {
    const module = await import('@/lib/hooks/useProjectStats');
    expect(typeof module.useProjectStats).toBe('function');
  });

  it('should return valid initial state structure', async () => {
    const { useProjectStats } = await import('@/lib/hooks/useProjectStats');
    const { result } = await import('@testing-library/react').then(({ renderHook }) => 
      renderHook(() => useProjectStats())
    );
    
    expect(result.current).toHaveProperty('stats');
    expect(result.current).toHaveProperty('recentProjects');
    expect(result.current).toHaveProperty('recentPosts');
    expect(result.current).toHaveProperty('recentTestimonials');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('refreshStats');
  });
});
