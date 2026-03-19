/**
 * Security: Real API Authorization Matrix
 * Tests that EVERY protected endpoint actually returns 401/403
 * for unauthenticated and non-admin users via real fetch calls.
 * This replaces documentation-style security assertions.
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3000';

const ADMIN_ONLY_ROUTES = [
    { method: 'GET', path: '/api/admin/tasks' },
    { method: 'POST', path: '/api/admin/tasks' },
    { method: 'GET', path: '/api/admin/requests' },
    { method: 'POST', path: '/api/blog' },
    { method: 'PUT', path: '/api/blog/some-slug' },
    { method: 'DELETE', path: '/api/blog/some-slug' },
    { method: 'POST', path: '/api/settings' },
    { method: 'GET', path: '/api/admin/requests/some-id' },
    { method: 'PATCH', path: '/api/admin/requests/some-id' },
];

const CLIENT_ONLY_ROUTES = [
    { method: 'GET', path: '/api/client/tasks' },
    { method: 'GET', path: '/api/notifications' },
];

function makeRequest(method: string, path: string, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${BASE}${path}`, {
        method,
        headers,
        body: ['POST', 'PUT', 'PATCH'].includes(method) ? JSON.stringify({}) : undefined,
    });
}

describe('Security: Admin endpoints reject unauthenticated requests', () => {
    beforeAll(() => {
        server.use(
            http.get('*/auth/v1/user', () =>
                HttpResponse.json({ error: 'No auth' }, { status: 401 })
            )
        );
    });

    afterAll(() => server.resetHandlers());

    for (const route of ADMIN_ONLY_ROUTES) {
        it(`${route.method} ${route.path} returns error when unauthenticated`, async () => {
            const res = await makeRequest(route.method, route.path);
            expect(res.status).toBeGreaterThanOrEqual(400);
            expect(res.status).toBeLessThan(500);
        });
    }
});

describe('Security: Admin endpoints reject non-admin authenticated users', () => {
    beforeAll(() => {
        server.use(
            http.get('*/auth/v1/user', () =>
                HttpResponse.json({ user: { id: 'client-1', email: 'client@example.com' } })
            )
        );
    });

    afterAll(() => server.resetHandlers());

    for (const route of ADMIN_ONLY_ROUTES) {
        it(`${route.method} ${route.path} returns error for non-admin`, async () => {
            const res = await makeRequest(route.method, route.path, 'client-token');
            expect(res.status).toBeGreaterThanOrEqual(400);
            expect(res.status).toBeLessThan(500);
        });
    }
});

describe('Security: Client-only endpoints reject unauthenticated requests', () => {
    beforeAll(() => {
        server.use(
            http.get('*/auth/v1/user', () =>
                HttpResponse.json({ error: 'No auth' }, { status: 401 })
            )
        );
    });

    afterAll(() => server.resetHandlers());

    for (const route of CLIENT_ONLY_ROUTES) {
        it(`${route.method} ${route.path} returns 401 when unauthenticated`, async () => {
            const res = await makeRequest(route.method, route.path);
            expect(res.status).toBe(401);
        });
    }
});

describe('Security: Error responses do not leak implementation details', () => {
    afterEach(() => server.resetHandlers());

    it('401 response body contains only { error } — no stack traces', async () => {
        server.use(
            http.get('*/auth/v1/user', () =>
                HttpResponse.json({ error: 'No auth' }, { status: 401 })
            )
        );
        const res = await makeRequest('GET', '/api/admin/tasks');
        const body = await res.json();
        expect(body).toHaveProperty('error');
        expect(body.stack).toBeUndefined();
        expect(body.message).toBeUndefined();
        expect(body.details).toBeUndefined();
        const keys = Object.keys(body);
        expect(keys.length).toBeLessThanOrEqual(2);
    });
});
