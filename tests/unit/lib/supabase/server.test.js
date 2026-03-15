import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((url, key, options) => ({
    url,
    key,
    options,
  })),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
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

    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const client = await createServerSupabaseClient();

    expect(client).not.toBeNull();
    expect(client.url).toBe('https://test.supabase.co');
    expect(client.key).toBe('test-anon-key');
    expect(client.options.cookies.get).toBeDefined();
    expect(client.options.cookies.set).toBeDefined();
    expect(client.options.cookies.remove).toBeDefined();
  });

  it('returns null when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const client = await createServerSupabaseClient();

    expect(client).toBeNull();
  });

  it('returns null when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const client = await createServerSupabaseClient();

    expect(client).toBeNull();
  });

  it('returns null when URL does not start with http', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'not-a-url');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const client = await createServerSupabaseClient();

    expect(client).toBeNull();
  });

  it('provides cookie interface with get, set, and remove functions', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const client = await createServerSupabaseClient();

    expect(client).not.toBeNull();
    expect(typeof client.options.cookies.get).toBe('function');
    expect(typeof client.options.cookies.set).toBe('function');
    expect(typeof client.options.cookies.remove).toBe('function');
  });

  it('get returns cookie value when cookie exists', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    vi.mock('next/headers', () => ({
      cookies: vi.fn(() => ({
        get: vi.fn(() => ({ value: 'session-token' })),
        set: vi.fn(),
      })),
    }));

    vi.resetModules();

    const { createServerSupabaseClient } = await import('@/lib/supabase/server');
    const client = await createServerSupabaseClient();

    expect(client).not.toBeNull();
    expect(client.options.cookies.get('session')).toBe('session-token');
  });
});
