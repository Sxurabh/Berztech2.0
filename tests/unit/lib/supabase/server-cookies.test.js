import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@supabase/ssr', () => ({
    createServerClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}));

describe('Cookie wrapper functions', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('wrapCookieSet calls cookieStore.set with correct params', async () => {
        const mockCookieStore = {
            set: vi.fn(),
        };
        
        const { wrapCookieSet } = await import('@/lib/supabase/server');
        const setFn = wrapCookieSet(mockCookieStore);
        
        setFn('session', 'abc123', { path: '/', httpOnly: true });
        
        expect(mockCookieStore.set).toHaveBeenCalledWith({
            name: 'session',
            value: 'abc123',
            path: '/',
            httpOnly: true,
        });
    });

    it('wrapCookieSet catches error and logs warning', async () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const mockCookieStore = {
            set: vi.fn(() => { throw new Error('Cookie set failed'); }),
        };
        
        const { wrapCookieSet } = await import('@/lib/supabase/server');
        const setFn = wrapCookieSet(mockCookieStore);
        
        expect(() => setFn('session', 'abc123')).not.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith(
            'Supabase cookie set error:',
            'Cookie set failed'
        );
        
        consoleSpy.mockRestore();
    });

    it('wrapCookieRemove calls cookieStore.set with empty value', async () => {
        const mockCookieStore = {
            set: vi.fn(),
        };
        
        const { wrapCookieRemove } = await import('@/lib/supabase/server');
        const removeFn = wrapCookieRemove(mockCookieStore);
        
        removeFn('session', { path: '/' });
        
        expect(mockCookieStore.set).toHaveBeenCalledWith({
            name: 'session',
            value: '',
            path: '/',
        });
    });

    it('wrapCookieRemove catches error and logs warning', async () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const mockCookieStore = {
            set: vi.fn(() => { throw new Error('Cookie remove failed'); }),
        };
        
        const { wrapCookieRemove } = await import('@/lib/supabase/server');
        const removeFn = wrapCookieRemove(mockCookieStore);
        
        expect(() => removeFn('session')).not.toThrow();
        expect(consoleSpy).toHaveBeenCalledWith(
            'Supabase cookie remove error:',
            'Cookie remove failed'
        );
        
        consoleSpy.mockRestore();
    });
});
