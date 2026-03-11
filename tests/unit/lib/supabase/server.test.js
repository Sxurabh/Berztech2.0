import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({ mock: 'server-client' })),
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
    expect(client).toEqual({ mock: 'server-client' });
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
});
