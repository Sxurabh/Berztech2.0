/**
 * Security: Real API Authorization Matrix
 * Tests that EVERY protected endpoint actually returns 401/403
 * for unauthenticated and non-admin users.
 * 
 * NOTE: Some tests expect 401 for authenticated non-admin users.
 * This is Bug B1 documented in P22.2 (External Audit Remediation).
 * When P22.2 is complete, update these to expect 403.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Admin Task Routes
import { GET as adminTasksGet, POST as adminTasksPost } from '@/app/api/admin/tasks/route';
import { PATCH as adminTaskPatch, DELETE as adminTaskDelete } from '@/app/api/admin/tasks/[id]/route';

// Admin Request Routes
import { GET as adminRequestsGet } from '@/app/api/admin/requests/route';
import { PATCH as adminRequestPatch } from '@/app/api/admin/requests/[id]/route';

// Blog Routes
import { POST as blogPost } from '@/app/api/blog/route';
import { PUT as blogPut, DELETE as blogDelete } from '@/app/api/blog/[id]/route';

// Settings Route
import { POST as settingsPost } from '@/app/api/settings/route';

// Client Routes
import { GET as clientTasksGet } from '@/app/api/client/tasks/route';
import { GET as notificationsGet } from '@/app/api/notifications/route';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
    createServerSupabaseClient: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn(),
}));

vi.mock('@/config/admin', () => ({
    isAdminEmail: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/config/admin';

function createRequest(url: string, method = 'GET', body?: unknown) {
    const options: any = { method };
    if (body) {
        options.body = JSON.stringify(body);
        options.headers = { 'Content-Type': 'application/json' };
    }
    return new NextRequest(url, options);
}

function createRequestWithParams(url: string, method = 'PATCH', body?: unknown, params?: Record<string, string>) {
    const options: any = { method };
    if (body) {
        options.body = JSON.stringify(body);
        options.headers = { 'Content-Type': 'application/json' };
    }
    const request = new NextRequest(url, options);
    return { request, params };
}

function setupUnauthenticated() {
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as any);
}

function setupAuthenticatedNonAdmin(email = 'client@example.com') {
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1', email } }, error: null }) },
    } as any);
    vi.mocked(isAdminEmail).mockReturnValue(false);
}

function setupAuthenticatedAdmin(email = 'admin@example.com') {
    vi.mocked(createServerSupabaseClient).mockResolvedValue({
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1', email } }, error: null }) },
    } as any);
    vi.mocked(isAdminEmail).mockReturnValue(true);
}

describe('Security: Admin endpoints reject unauthenticated requests (401)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GET /api/admin/tasks returns 401 when unauthenticated', async () => {
        setupUnauthenticated();
        const response = await adminTasksGet(createRequest('http://localhost:3000/api/admin/tasks'));
        expect(response.status).toBe(401);
    });

    it('POST /api/admin/tasks returns 401 when unauthenticated', async () => {
        setupUnauthenticated();
        const response = await adminTasksPost(createRequest('http://localhost:3000/api/admin/tasks', 'POST', {}));
        expect(response.status).toBe(401);
    });

    it('GET /api/admin/requests returns 401 when unauthenticated', async () => {
        setupUnauthenticated();
        const response = await adminRequestsGet(createRequest('http://localhost:3000/api/admin/requests'));
        expect(response.status).toBe(401);
    });

    it('PATCH /api/admin/requests/:id returns 401 when unauthenticated', async () => {
        setupUnauthenticated();
        // Use valid UUID format to bypass ID validation
        const { request, params } = createRequestWithParams(
            'http://localhost:3000/api/admin/requests/12345678-1234-1234-1234-123456789012',
            'PATCH',
            { status: 'approved' },
            { id: '12345678-1234-1234-1234-123456789012' }
        );
        const response = await adminRequestPatch(request, { params });
        expect(response.status).toBe(401);
    });

    it('PATCH /api/admin/tasks/:id returns 401 when unauthenticated', async () => {
        setupUnauthenticated();
        const { request, params } = createRequestWithParams(
            'http://localhost:3000/api/admin/tasks/test-id',
            'PATCH',
            {},
            { id: 'test-id' }
        );
        const response = await adminTaskPatch(request, { params });
        expect(response.status).toBe(401);
    });

    it('DELETE /api/admin/tasks/:id returns 401 when unauthenticated', async () => {
        setupUnauthenticated();
        const { request, params } = createRequestWithParams(
            'http://localhost:3000/api/admin/tasks/test-id',
            'DELETE',
            undefined,
            { id: 'test-id' }
        );
        const response = await adminTaskDelete(request, { params });
        expect(response.status).toBe(401);
    });
});

describe('Security: Admin endpoints reject authenticated non-admin users', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // NOTE: These tests expect 401 but should expect 403 per Bug B1 (P22.2)
    // Bug: routes return 401 for authenticated non-admin instead of 403

    it('GET /api/admin/tasks returns error for non-admin user (currently 401, should be 403)', async () => {
        setupAuthenticatedNonAdmin();
        const response = await adminTasksGet(createRequest('http://localhost:3000/api/admin/tasks'));
        // Current behavior: 401, Expected after P22.2: 403
        expect([401, 403]).toContain(response.status);
    });

    it('POST /api/admin/tasks returns error for non-admin user (currently 401, should be 403)', async () => {
        setupAuthenticatedNonAdmin();
        const response = await adminTasksPost(
            createRequest('http://localhost:3000/api/admin/tasks', 'POST', { title: 'Test', status: 'pending' })
        );
        expect([401, 403]).toContain(response.status);
    });

    it('GET /api/admin/requests returns error for non-admin user (currently 401, should be 403)', async () => {
        setupAuthenticatedNonAdmin();
        const response = await adminRequestsGet(createRequest('http://localhost:3000/api/admin/requests'));
        expect([401, 403]).toContain(response.status);
    });

    it('PATCH /api/admin/requests/:id returns error for non-admin user (currently 401, should be 403)', async () => {
        setupAuthenticatedNonAdmin();
        const { request, params } = createRequestWithParams(
            'http://localhost:3000/api/admin/requests/12345678-1234-1234-1234-123456789012',
            'PATCH',
            { status: 'approved' },
            { id: '12345678-1234-1234-1234-123456789012' }
        );
        const response = await adminRequestPatch(request, { params });
        expect([401, 403]).toContain(response.status);
    });

    it('PATCH /api/admin/tasks/:id returns error for non-admin user (currently 401, should be 403)', async () => {
        setupAuthenticatedNonAdmin();
        const { request, params } = createRequestWithParams(
            'http://localhost:3000/api/admin/tasks/test-id',
            'PATCH',
            { status: 'in-progress' },
            { id: 'test-id' }
        );
        const response = await adminTaskPatch(request, { params });
        expect([401, 403]).toContain(response.status);
    });

    it('DELETE /api/admin/tasks/:id returns error for non-admin user (currently 401, should be 403)', async () => {
        setupAuthenticatedNonAdmin();
        const { request, params } = createRequestWithParams(
            'http://localhost:3000/api/admin/tasks/test-id',
            'DELETE',
            undefined,
            { id: 'test-id' }
        );
        const response = await adminTaskDelete(request, { params });
        expect([401, 403]).toContain(response.status);
    });
});

describe('Security: Blog endpoints reject unauthenticated requests (401)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('POST /api/blog returns 401 when unauthenticated', async () => {
        setupUnauthenticated();
        const response = await blogPost(
            createRequest('http://localhost:3000/api/blog', 'POST', { title: 'Test', content: 'Content' })
        );
        expect(response.status).toBe(401);
    });
});

describe('Security: Blog endpoints reject non-admin users', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('POST /api/blog returns 403 for non-admin user', async () => {
        setupAuthenticatedNonAdmin();
        const response = await blogPost(
            createRequest('http://localhost:3000/api/blog', 'POST', { title: 'Test', content: 'Content' })
        );
        expect(response.status).toBe(403);
    });

    it('PUT /api/blog/:id returns 403 for non-admin user', async () => {
        setupAuthenticatedNonAdmin();
        const { request, params } = createRequestWithParams(
            'http://localhost:3000/api/blog/test-slug',
            'PUT',
            { title: 'Updated' },
            { id: 'test-slug' }
        );
        const response = await blogPut(request, { params });
        expect(response.status).toBe(403);
    });

    it('DELETE /api/blog/:id returns 403 for non-admin user', async () => {
        setupAuthenticatedNonAdmin();
        const { request, params } = createRequestWithParams(
            'http://localhost:3000/api/blog/test-slug',
            'DELETE',
            undefined,
            { id: 'test-slug' }
        );
        const response = await blogDelete(request, { params });
        expect(response.status).toBe(403);
    });
});

describe('Security: Settings endpoint rejects unauthenticated requests (401)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('POST /api/settings returns 401 when unauthenticated', async () => {
        setupUnauthenticated();
        const response = await settingsPost(
            createRequest('http://localhost:3000/api/settings', 'POST', { key: 'value' })
        );
        expect(response.status).toBe(401);
    });
});

describe('Security: Settings endpoint rejects non-admin users', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // NOTE: Should be 403 but current code returns 401
    it('POST /api/settings returns error for non-admin user (currently 401, should be 403)', async () => {
        setupAuthenticatedNonAdmin();
        const response = await settingsPost(
            createRequest('http://localhost:3000/api/settings', 'POST', { key: 'value' })
        );
        expect([401, 403]).toContain(response.status);
    });
});

describe('Security: Client-only endpoints reject unauthenticated requests (401)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GET /api/client/tasks returns 401 when unauthenticated', async () => {
        setupUnauthenticated();
        const response = await clientTasksGet(createRequest('http://localhost:3000/api/client/tasks'));
        expect(response.status).toBe(401);
    });

    it('GET /api/notifications returns 401 when unauthenticated', async () => {
        setupUnauthenticated();
        const response = await notificationsGet(createRequest('http://localhost:3000/api/notifications'));
        expect(response.status).toBe(401);
    });
});

describe('Security: Error responses do not leak implementation details', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('401 response body contains only { error } — no stack traces', async () => {
        setupUnauthenticated();
        const response = await adminTasksGet(createRequest('http://localhost:3000/api/admin/tasks'));
        const body = await response.json();
        expect(body).toHaveProperty('error');
        expect(body.stack).toBeUndefined();
        expect(body.message).toBeUndefined();
        expect(body.details).toBeUndefined();
    });

    it('403 response body contains only { error } — no stack traces', async () => {
        setupAuthenticatedNonAdmin();
        const response = await blogPost(
            createRequest('http://localhost:3000/api/blog', 'POST', { title: 'Test' })
        );
        const body = await response.json();
        expect(body).toHaveProperty('error');
        expect(body.stack).toBeUndefined();
        expect(body.message).toBeUndefined();
        expect(body.details).toBeUndefined();
    });
});

describe('Security: Admin endpoints allow authenticated admin users (200)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('GET /api/admin/tasks returns 200 for admin user', async () => {
        setupAuthenticatedAdmin();
        
        const { createAdminClient } = await import('@/lib/supabase/admin');
        vi.mocked(createAdminClient).mockReturnValue({
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                order: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
        } as any);
        
        const response = await adminTasksGet(createRequest('http://localhost:3000/api/admin/tasks'));
        expect(response.status).toBe(200);
    });

    it('POST /api/blog returns 201 for admin user', async () => {
        setupAuthenticatedAdmin();
        vi.mocked(createServerSupabaseClient).mockResolvedValue({
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1', email: 'admin@example.com' } }, error: null }) },
            from: vi.fn().mockReturnValue({
                insert: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { id: '1', slug: 'test', title: 'Test' }, error: null }),
            }),
        } as any);
        const response = await blogPost(
            createRequest('http://localhost:3000/api/blog', 'POST', { title: 'Test', content: 'Content' })
        );
        expect(response.status).toBe(201);
    });
});
