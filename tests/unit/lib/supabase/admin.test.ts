import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ mock: 'admin-client' })),
}));

describe('createAdminClient', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('returns admin client when SUPABASE_SERVICE_ROLE_KEY is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminClient = createAdminClient();

    expect(adminClient).not.toBeNull();
    expect(adminClient).toEqual({ mock: 'admin-client' });
  });

  it('returns null when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminClient = createAdminClient();

    expect(adminClient).toBeNull();
  });

  it('returns null when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminClient = createAdminClient();

    expect(adminClient).toBeNull();
  });

  it('returns null when URL does not start with http', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'invalid-url');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminClient = createAdminClient();

    expect(adminClient).toBeNull();
  });
});
