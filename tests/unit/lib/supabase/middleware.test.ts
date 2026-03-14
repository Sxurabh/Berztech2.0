import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';

const mockCreateServerClient = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: (...args) => mockCreateServerClient(...args),
}));

function createMockRequest(pathname, user = null) {
  return {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
    headers: new Headers(),
    cookies: {
      get: vi.fn(),
      set: vi.fn(),
    },
  };
}

describe('middleware route protection', () => {
  let mockSupabase;

  beforeEach(() => {
    vi.resetModules();
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
    };
    mockCreateServerClient.mockReturnValue(mockSupabase);

    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    vi.stubEnv('NEXT_PUBLIC_ADMIN_EMAIL', 'admin@example.com');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('admin routes', () => {
    it('redirects to /auth/login when no user accesses /admin', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware');
      const req = createMockRequest('/admin');

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await updateSession(req);

      expect([302, 307]).toContain(response.status);
      expect(response.headers.get('location')).toContain('/auth/login');
      expect(response.headers.get('location')).toContain('redirect=%2Fadmin');
    });

    it('redirects to /dashboard when non-admin user accesses /admin', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware');
      const req = createMockRequest('/admin');

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { email: 'user@example.com' } }
      });

      const response = await updateSession(req);

      expect([302, 307]).toContain(response.status);
      expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard');
    });

    it('allows admin user through to /admin', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware');
      const req = createMockRequest('/admin');

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { email: 'admin@example.com' } }
      });

      const response = await updateSession(req);

      expect(response.status).toBe(200);
      expect(response.headers.get('location')).toBeNull();
    });
  });

  describe('dashboard routes', () => {
    it('redirects to /auth/login when no user accesses /dashboard', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware');
      const req = createMockRequest('/dashboard');

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await updateSession(req);

      expect([302, 307]).toContain(response.status);
      expect(response.headers.get('location')).toContain('/auth/login');
      expect(response.headers.get('location')).toContain('redirect=%2Fdashboard');
    });

    it('redirects admin users to /admin when accessing /dashboard', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware');
      const req = createMockRequest('/dashboard');

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { email: 'admin@example.com' } }
      });

      const response = await updateSession(req);

      expect([302, 307]).toContain(response.status);
      expect(response.headers.get('location')).toBe('http://localhost:3000/admin');
    });

    it('allows regular user through to /dashboard', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware');
      const req = createMockRequest('/dashboard');

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { email: 'client@example.com' } }
      });

      const response = await updateSession(req);

      expect(response.status).toBe(200);
    });
  });

  describe('track routes', () => {
    it('redirects to /auth/login when no user accesses /track', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware');
      const req = createMockRequest('/track');

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await updateSession(req);

      expect([302, 307]).toContain(response.status);
      expect(response.headers.get('location')).toContain('/auth/login');
      expect(response.headers.get('location')).toContain('redirect=%2Ftrack');
    });

    it('allows regular user through to /track', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware');
      const req = createMockRequest('/track');

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { email: 'client@example.com' } }
      });

      const response = await updateSession(req);

      expect(response.status).toBe(200);
    });
  });

  describe('public routes', () => {
    it('allows access to root /', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware');
      const req = createMockRequest('/');

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await updateSession(req);

      expect(response.status).toBe(200);
    });

    it('allows access to /blog', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware');
      const req = createMockRequest('/blog');

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await updateSession(req);

      expect(response.status).toBe(200);
    });

    it('allows access to /work', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware');
      const req = createMockRequest('/work');

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await updateSession(req);

      expect(response.status).toBe(200);
    });

    it('allows access to /contact', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware');
      const req = createMockRequest('/contact');

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await updateSession(req);

      expect(response.status).toBe(200);
    });

    it('allows access to /about', async () => {
      const { updateSession } = await import('@/lib/supabase/middleware');
      const req = createMockRequest('/about');

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await updateSession(req);

      expect(response.status).toBe(200);
    });
  });
});

describe('middleware: JWT edge cases', () => {
  let mockSupabase;
  const mockCreateServerClient = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
    };
    mockCreateServerClient.mockReturnValue(mockSupabase);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    vi.stubEnv('NEXT_PUBLIC_ADMIN_EMAIL', 'admin@example.com');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login when getUser returns an error (expired token)', async () => {
    const { updateSession } = await import('@/lib/supabase/middleware');
    const req = createMockRequest('/admin');
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'JWT expired', status: 401 },
    });
    const response = await updateSession(req);
    expect([302, 307]).toContain(response.status);
    expect(response.headers.get('location')).toContain('auth/login');
  });

  it('does not expose the JWT error message in the redirect response body', async () => {
    const { updateSession } = await import('@/lib/supabase/middleware');
    const req = createMockRequest('/dashboard');
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'invalid JWT: signature mismatch', status: 401 },
    });
    const response = await updateSession(req);
    // Body should not contain the JWT internals
    const text = await response.text?.() ?? '';
    expect(text).not.toContain('signature mismatch');
  });

  it('handles getUser throwing synchronously without crashing middleware', async () => {
    const { updateSession } = await import('@/lib/supabase/middleware');
    const req = createMockRequest('/dashboard');
    mockSupabase.auth.getUser.mockRejectedValue(new Error('Supabase unreachable'));
    await expect(updateSession(req)).resolves.toBeDefined();
  });
});