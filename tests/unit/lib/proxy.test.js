import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase/middleware', () => ({
    updateSession: vi.fn(() => Promise.resolve({ status: 200 })),
}));

describe('proxy', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('proxy module exports proxy function', async () => {
        const { proxy } = await import('@/proxy');
        expect(typeof proxy).toBe('function');
    });

    it('proxy module exports config', async () => {
        const { config } = await import('@/proxy');
        expect(config).toHaveProperty('matcher');
        expect(Array.isArray(config.matcher)).toBe(true);
    });

    it('config matcher contains expected patterns', async () => {
        const { config } = await import('@/proxy');
        
        expect(config.matcher[0]).toContain('_next/static');
        expect(config.matcher[0]).toContain('_next/image');
        expect(config.matcher[0]).toContain('favicon.ico');
    });

    it('proxy function returns a promise', async () => {
        const { proxy } = await import('@/proxy');
        const mockRequest = {
            headers: {
                get: vi.fn(),
            },
        };
        
        const result = proxy(mockRequest);
        expect(result).toBeInstanceOf(Promise);
        await result;
    });
});
