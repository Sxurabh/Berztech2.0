import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ mock: 'supabase-client' })),
}));

describe('createClient', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('returns a valid Supabase client when env vars are set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    const { createClient } = await import('@/lib/supabase/client');
    const client = createClient();

    expect(client).not.toBeNull();
    expect(client).toEqual({ mock: 'supabase-client' });
  });

  it('returns null when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    const { createClient } = await import('@/lib/supabase/client');
    const client = createClient();

    expect(client).toBeNull();
  });

  it('returns null when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    const { createClient } = await import('@/lib/supabase/client');
    const client = createClient();

    expect(client).toBeNull();
  });

  it('is a singleton - calling twice returns the same instance', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    const { createClient } = await import('@/lib/supabase/client');
    const client1 = createClient();
    const client2 = createClient();

    expect(client1).toBe(client2);
  });

  it('returns null when URL does not start with http', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'not-a-url');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    const { createClient } = await import('@/lib/supabase/client');
    const client = createClient();

    expect(client).toBeNull();
  });
});
