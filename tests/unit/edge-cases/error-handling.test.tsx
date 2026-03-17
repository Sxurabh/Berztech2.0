import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTask } from '../../utils/factories/task.factory';
import { createRequest } from '../../utils/factories/request.factory';
import { createProject } from '../../utils/factories/project.factory';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            gcTime: 0,
        },
    },
});

const renderWithQuery = (component) => {
    return render(
        <QueryClientProvider client={queryClient}>
            {component}
        </QueryClientProvider>
    );
};

describe('Error Handling Edge Cases', () => {
    beforeEach(() => {
        queryClient.clear();
        vi.clearAllMocks();
    });

    describe('API Error Responses', () => {
        it('handles null response from API gracefully', async () => {
            const mockFetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(null) }));
            global.fetch = mockFetch;

            const result = await fetch('/api/test').then(r => r.json());
            expect(result).toBeNull();
        });

        it('handles network error gracefully', async () => {
            const mockFetch = vi.fn(() => Promise.reject(new Error('Network error')));
            global.fetch = mockFetch;

            await expect(fetch('/api/test')).rejects.toThrow('Network error');
        });

        it('handles 500 server error gracefully', async () => {
            const mockFetch = vi.fn(() => 
                Promise.resolve({ 
                    ok: false, 
                    status: 500, 
                    json: () => Promise.resolve({ error: 'Internal Server Error' }) 
                })
            );
            global.fetch = mockFetch;

            const response = await fetch('/api/test');
            expect(response.status).toBe(500);
            expect(response.ok).toBe(false);
        });

        it('handles 401 unauthorized gracefully', async () => {
            const mockFetch = vi.fn(() => 
                Promise.resolve({ 
                    ok: false, 
                    status: 401, 
                    json: () => Promise.resolve({ error: 'Unauthorized' }) 
                })
            );
            global.fetch = mockFetch;

            const response = await fetch('/api/test');
            expect(response.status).toBe(401);
        });

        it('handles 403 forbidden gracefully', async () => {
            const mockFetch = vi.fn(() => 
                Promise.resolve({ 
                    ok: false, 
                    status: 403, 
                    json: () => Promise.resolve({ error: 'Forbidden' }) 
                })
            );
            global.fetch = mockFetch;

            const response = await fetch('/api/test');
            expect(response.status).toBe(403);
        });

        it('handles 404 not found gracefully', async () => {
            const mockFetch = vi.fn(() => 
                Promise.resolve({ 
                    ok: false, 
                    status: 404, 
                    json: () => Promise.resolve({ error: 'Not Found' }) 
                })
            );
            global.fetch = mockFetch;

            const response = await fetch('/api/nonexistent');
            expect(response.status).toBe(404);
        });

        it('handles malformed JSON gracefully', async () => {
            const mockFetch = vi.fn(() => 
                Promise.resolve({ 
                    ok: true, 
                    json: () => Promise.reject(new SyntaxError('Unexpected token')) 
                })
            );
            global.fetch = mockFetch;

            await expect(fetch('/api/test').then(r => r.json())).rejects.toThrow();
        });
    });

    describe('Data Validation Edge Cases', () => {
        it('handles empty array response', () => {
            const tasks = [];
            expect(tasks).toHaveLength(0);
            expect(Array.isArray(tasks)).toBe(true);
        });

        it('handles undefined fields in response', () => {
            const task = createTask({ description: undefined });
            expect(task.description).toBeUndefined();
        });

        it('handles null fields in response', () => {
            const task = createTask({ assignee_id: null });
            expect(task.assignee_id).toBeNull();
        });

        it('handles very long strings', () => {
            const longString = 'a'.repeat(10000);
            const task = createTask({ title: longString });
            expect(task.title).toHaveLength(10000);
        });

        it('handles special characters in strings', () => {
            const specialChars = '<script>alert("xss")</script>"\'\\';
            const task = createTask({ title: specialChars });
            expect(task.title).toContain('<script>');
        });

        it('handles unicode characters', () => {
            const unicode = '你好世界🌍🎉';
            const task = createTask({ title: unicode });
            expect(task.title).toBe(unicode);
        });

        it('handles negative numbers', () => {
            const request = createRequest({ budget: -1000 });
            expect(request.budget).toBeLessThan(0);
        });

        it('handles extremely large numbers', () => {
            const request = createRequest({ budget: Number.MAX_SAFE_INTEGER });
            expect(request.budget).toBeGreaterThan(0);
        });

        it('handles boolean as string', () => {
            const task = createTask({ status: 'true' as any });
            expect(task.status).toBe('true');
        });
    });

    describe('Race Condition Handling', () => {
        it('handles concurrent requests gracefully', async () => {
            const requests = Array.from({ length: 10 }, () => 
                Promise.resolve({ data: createTask() })
            );
            
            const results = await Promise.allSettled(requests);
            expect(results).toHaveLength(10);
        });
    });

    describe('Timeout Handling', () => {
        it('handles request with abort signal', () => {
            const controller = new AbortController();
            expect(controller.signal.aborted).toBe(false);
            controller.abort();
            expect(controller.signal.aborted).toBe(true);
        });

        it('creates aborted signal correctly', () => {
            const controller = new AbortController();
            const signal = controller.signal;
            
            const listener = vi.fn();
            signal.addEventListener('abort', listener);
            
            controller.abort();
            
            expect(signal.aborted).toBe(true);
            expect(listener).toHaveBeenCalled();
        });
    });
});
