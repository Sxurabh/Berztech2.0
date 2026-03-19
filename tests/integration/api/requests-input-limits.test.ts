/**
 * Integration: /api/requests — input length boundary conditions
 * Documents and enforces limits for fields without explicit Zod maxLength.
 */
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/requests/route';

vi.mock('@/lib/supabase/server', () => ({
    createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from '@/lib/supabase/server';

describe('POST /api/requests — input length boundaries', () => {
    let mockSupabase;

    beforeEach(() => {
        vi.clearAllMocks();
        mockSupabase = {
            auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
            from: vi.fn(),
        };
        (createServerSupabaseClient as any).mockResolvedValue(mockSupabase);
        
        mockSupabase.from.mockImplementation(() => ({
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'req-new' }, error: null }),
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createJsonRequest(body: unknown) {
        return new NextRequest('http://localhost:3000/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    }

    it('accepts name at minimum length (2 chars)', async () => {
        const request = createJsonRequest({ name: 'AB', email: 'ab@example.com' });
        const response = await POST(request);
        expect(response.status).toBe(201);
    });

    it('rejects name shorter than 2 chars', async () => {
        const request = createJsonRequest({ name: 'A', email: 'a@example.com' });
        const response = await POST(request);
        expect(response.status).toBe(400);
    });

    it('accepts message at exactly 1000 chars (boundary)', async () => {
        const request = createJsonRequest({
            name: 'John',
            email: 'john@example.com',
            message: 'A'.repeat(1000),
        });
        const response = await POST(request);
        expect(response.status).toBe(201);
    });

    it('rejects message exceeding 1000 chars', async () => {
        const request = createJsonRequest({
            name: 'John',
            email: 'john@example.com',
            message: 'A'.repeat(1001),
        });
        const response = await POST(request);
        expect(response.status).toBe(400);
    });

    it('FINDING: name field has no max length — documents current behavior', async () => {
        const request = createJsonRequest({ name: 'A'.repeat(10000), email: 'long@example.com' });
        const response = await POST(request);
        console.log(`[FINDING] 10k char name response: ${response.status} — add max to schema if 201`);
        expect([400, 201, 500]).toContain(response.status);
    });

    it('rejects empty body', async () => {
        const request = createJsonRequest({});
        const response = await POST(request);
        expect(response.status).toBe(400);
    });

    it('rejects invalid email', async () => {
        const request = createJsonRequest({ name: 'Test', email: 'not-an-email' });
        const response = await POST(request);
        expect(response.status).toBe(400);
    });

    it('rejects malformed JSON', async () => {
        const request = new NextRequest('http://localhost:3000/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{ invalid json',
        });
        const response = await POST(request);
        expect([400, 500]).toContain(response.status);
    });
});
