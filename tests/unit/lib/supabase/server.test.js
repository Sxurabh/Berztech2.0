import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockCreateServerClient = vi.fn(() => ({ 
  mock: 'server-client',
  options: {
    cookies: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: (...args) => mockCreateServerClient(...args),
}));

describe('createServerSupabaseClient', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('returns server client when env vars are set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    vi.mock('next/headers', () => ({
      cookies: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
      })),
    }));

    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const client = await createServerSupabaseClient();

    expect(client).not.toBeNull();
    expect(client).toEqual({ 
      mock: 'server-client',
      options: {
        cookies: {
          get: expect.any(Function),
          set: expect.any(Function),
          remove: expect.any(Function),
        },
      },
    });
  });

  it('returns null when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    vi.mock('next/headers', () => ({
      cookies: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
      })),
    }));

    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const client = await createServerSupabaseClient();

    expect(client).toBeNull();
  });

  it('returns null when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    vi.mock('next/headers', () => ({
      cookies: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
      })),
    }));

    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const client = await createServerSupabaseClient();

    expect(client).toBeNull();
  });

  it('returns null when URL does not start with http', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'not-a-url');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    vi.mock('next/headers', () => ({
      cookies: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
      })),
    }));

    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const client = await createServerSupabaseClient();

    expect(client).toBeNull();
  });

  it('provides cookie interface with get, set, and remove functions', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    vi.mock('next/headers', () => ({
      cookies: vi.fn(() => ({
        get: vi.fn(() => ({ value: 'session' })),
        set: vi.fn(),
      })),
    }));

    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const client = await createServerSupabaseClient();

    expect(client).not.toBeNull();
    expect(client.options.cookies.get).toBeDefined();
    expect(client.options.cookies.set).toBeDefined();
    expect(client.options.cookies.remove).toBeDefined();
  });

  it('handles cookie set error gracefully', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    vi.mock('next/headers', () => ({
      cookies: vi.fn(() => ({
        get: vi.fn(() => ({ value: 'test' })),
        set: vi.fn(() => { throw new Error('Cookie set error'); }),
      })),
    }));

    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const client = await createServerSupabaseClient();

    expect(client).not.toBeNull();
    expect(() => client.options.cookies.set('test', 'value')).not.toThrow();
  });

  it('handles cookie remove error gracefully', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    vi.mock('next/headers', () => ({
      cookies: vi.fn(() => ({
        get: vi.fn(() => ({ value: 'test' })),
        set: vi.fn(() => { throw new Error('Cookie remove error'); }),
      })),
    }));

    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const client = await createServerSupabaseClient();

    expect(client).not.toBeNull();
    expect(() => client.options.cookies.remove('test')).not.toThrow();
  });
});
