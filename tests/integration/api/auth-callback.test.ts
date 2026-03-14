/**
 * Integration: OAuth Callback Handler
 * Tests the /auth/callback route that handles OAuth code exchange
 * and redirects users to /dashboard (client) or /admin (admin).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/auth/callback/route';

vi.mock('@/lib/supabase/server', () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock('@/config/admin', () => ({
    isAdminEmail: vi.fn(),
}));

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/config/admin';

describe('GET /auth/callback — OAuth code exchange', () => {
    let mockSupabase;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
        vi.stubEnv('ADMIN_EMAIL', 'admin@example.com');

        mockSupabase = {
            auth: {
                exchangeCodeForSession: vi.fn(),
            },
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('redirects to /dashboard when valid code and non-admin email', async () => {
        mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
            data: { user: { id: 'user-1', email: 'client@example.com' } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(false);

        const request = new NextRequest('http://localhost:3000/auth/callback?code=valid-auth-code');
        const response = await GET(request);

        expect([302, 307]).toContain(response.status);
        expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard');
    });

    it('redirects to /admin when valid code and admin email', async () => {
        mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
            data: { user: { id: 'admin-1', email: 'admin@example.com' } },
            error: null,
        });
        (isAdminEmail as any).mockReturnValue(true);

        const request = new NextRequest('http://localhost:3000/auth/callback?code=valid-admin-code');
        const response = await GET(request);

        expect([302, 307]).toContain(response.status);
        expect(response.headers.get('location')).toBe('http://localhost:3000/admin');
    });

    it('redirects to /auth/login with error when code is missing', async () => {
        const request = new NextRequest('http://localhost:3000/auth/callback');
        const response = await GET(request);

        expect([302, 307]).toContain(response.status);
        expect(response.headers.get('location')).toContain('/auth/login');
        expect(response.headers.get('location')).toContain('error=auth_failed');
    });

    it('redirects to /auth/login with error when code exchange fails', async () => {
        mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
            data: null,
            error: { message: 'Invalid authorization code' },
        });

        const request = new NextRequest('http://localhost:3000/auth/callback?code=invalid-code');
        const response = await GET(request);

        expect([302, 307]).toContain(response.status);
        expect(response.headers.get('location')).toContain('/auth/login');
        expect(response.headers.get('location')).toContain('error=auth_failed');
    });

    it('redirects to /auth/login with error when Supabase returns null client', async () => {
        (createServerSupabaseClient as any).mockResolvedValue(null);

        const request = new NextRequest('http://localhost:3000/auth/callback?code=valid-code');
        const response = await GET(request);

        expect([302, 307]).toContain(response.status);
        expect(response.headers.get('location')).toContain('/auth/login');
        expect(response.headers.get('location')).toContain('error=auth_failed');
    });
});
