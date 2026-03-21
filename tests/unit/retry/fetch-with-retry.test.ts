import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithRetry } from '@/lib/api/client';

describe('Chaos Load Scenarios — fetchWithRetry', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    describe('Successful responses (no retries needed)', () => {
        it('returns parsed JSON on 200 response', async () => {
            const mockResponse = { id: 1, title: 'Test Project' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse),
                text: () => Promise.resolve(JSON.stringify(mockResponse)),
            });

            const result = await fetchWithRetry('/projects/1');
            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('returns null for empty 200 response', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                text: () => Promise.resolve(''),
            });

            const result = await fetchWithRetry('/projects/1');
            expect(result).toBeNull();
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('returns parsed JSON on 201 response', async () => {
            const mockResponse = { id: 2, name: 'New Project' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 201,
                json: () => Promise.resolve(mockResponse),
                text: () => Promise.resolve(JSON.stringify(mockResponse)),
            });

            const result = await fetchWithRetry('/projects', {
                method: 'POST',
                body: JSON.stringify({ name: 'New Project' }),
            });
            expect(result).toEqual(mockResponse);
        });
    });

    describe('Retryable status codes (500, 502, 503, 504)', () => {
        it('retries on 503 and succeeds on third attempt', async () => {
            vi.useFakeTimers();
            const mockResponse = { success: true };
            let callCount = 0;

            global.fetch = vi.fn().mockImplementation(() => {
                callCount++;
                if (callCount < 3) {
                    return Promise.resolve({
                        ok: false,
                        status: 503,
                        json: () => Promise.resolve({}),
                        text: () => Promise.resolve('{}'),
                    });
                }
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockResponse),
                    text: () => Promise.resolve(JSON.stringify(mockResponse)),
                });
            });

            const resultPromise = fetchWithRetry('/api/test', {}, { maxRetries: 3, initialDelay: 10 });
            await vi.runAllTimersAsync();
            const result = await resultPromise;

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledTimes(3);
            vi.useRealTimers();
        });

        it('retries on 502 and succeeds on second attempt', async () => {
            vi.useFakeTimers();
            const mockResponse = { data: 'ok' };
            let callCount = 0;

            global.fetch = vi.fn().mockImplementation(() => {
                callCount++;
                if (callCount < 2) {
                    return Promise.resolve({
                        ok: false,
                        status: 502,
                        json: () => Promise.resolve({}),
                        text: () => Promise.resolve('{}'),
                    });
                }
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockResponse),
                    text: () => Promise.resolve(JSON.stringify(mockResponse)),
                });
            });

            const resultPromise = fetchWithRetry('/api/test', {}, { maxRetries: 3, initialDelay: 10 });
            await vi.runAllTimersAsync();
            const result = await resultPromise;

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledTimes(2);
            vi.useRealTimers();
        });

        it('respects maxRetries limit and throws after exhausting retries', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Internal Server Error' }),
                text: () => Promise.resolve('{"error":"Internal Server Error"}'),
            });

            await expect(fetchWithRetry('/api/test', {}, { maxRetries: 2, initialDelay: 10 })).rejects.toThrow();
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('Non-retryable status codes (no retries)', () => {
        it('throws immediately on 400 Bad Request', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ error: 'Bad Request' }),
                text: () => Promise.resolve('{"error":"Bad Request"}'),
            });

            await expect(fetchWithRetry('/api/test')).rejects.toThrow();
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('throws immediately on 401 Unauthorized', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ error: 'Unauthorized' }),
                text: () => Promise.resolve('{"error":"Unauthorized"}'),
            });

            await expect(fetchWithRetry('/api/test')).rejects.toThrow();
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('throws immediately on 403 Forbidden', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 403,
                json: () => Promise.resolve({ error: 'Forbidden' }),
                text: () => Promise.resolve('{"error":"Forbidden"}'),
            });

            await expect(fetchWithRetry('/api/test')).rejects.toThrow();
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('throws immediately on 404 Not Found', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                json: () => Promise.resolve({ error: 'Not Found' }),
                text: () => Promise.resolve('{"error":"Not Found"}'),
            });

            await expect(fetchWithRetry('/api/test')).rejects.toThrow();
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('throws immediately on 422 Unprocessable Entity', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 422,
                json: () => Promise.resolve({ error: 'Validation Error' }),
                text: () => Promise.resolve('{"error":"Validation Error"}'),
            });

            await expect(fetchWithRetry('/api/test')).rejects.toThrow();
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('429 Rate Limiting (retryable)', () => {
        it('retries on 429 and succeeds on second attempt', async () => {
            vi.useFakeTimers();
            const mockResponse = { data: 'rate limited handled' };
            let callCount = 0;

            global.fetch = vi.fn().mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    return Promise.resolve({
                        ok: false,
                        status: 429,
                        json: () => Promise.resolve({}),
                        text: () => Promise.resolve('{}'),
                    });
                }
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve(mockResponse),
                    text: () => Promise.resolve(JSON.stringify(mockResponse)),
                });
            });

            const resultPromise = fetchWithRetry('/api/test', {}, { maxRetries: 3, initialDelay: 10 });
            await vi.runAllTimersAsync();
            const result = await resultPromise;

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledTimes(2);
            vi.useRealTimers();
        });

        it('throws after exhausting retries on 429', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 429,
                json: () => Promise.resolve({ error: 'Rate limited' }),
                text: () => Promise.resolve('{"error":"Rate limited"}'),
            });

            await expect(fetchWithRetry('/api/test', {}, { maxRetries: 2, initialDelay: 10 })).rejects.toThrow();
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('Network errors', () => {
        it('throws on network error without retry', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

            await expect(fetchWithRetry('/api/test')).rejects.toThrow('Network failure');
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('Custom retry configuration', () => {
        it('respects custom retryableStatuses list', async () => {
            vi.useFakeTimers();
            let callCount = 0;

            global.fetch = vi.fn().mockImplementation(() => {
                callCount++;
                if (callCount < 3) {
                    return Promise.resolve({
                        ok: false,
                        status: 418,
                        json: () => Promise.resolve({}),
                        text: () => Promise.resolve('{}'),
                    });
                }
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ success: true }),
                    text: () => Promise.resolve('{"success":true}'),
                });
            });

            const resultPromise = fetchWithRetry(
                '/api/test',
                {},
                { maxRetries: 3, initialDelay: 10, retryableStatuses: [418, 500] }
            );
            await vi.runAllTimersAsync();
            const result = await resultPromise;

            expect(result).toEqual({ success: true });
            expect(global.fetch).toHaveBeenCalledTimes(3);
            vi.useRealTimers();
        });

        it('respects maxRetries: 1 (single attempt)', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Server Error' }),
                text: () => Promise.resolve('{"error":"Server Error"}'),
            });

            await expect(fetchWithRetry('/api/test', {}, { maxRetries: 1 })).rejects.toThrow();
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('Request headers and body forwarding', () => {
        it('sends correct endpoint path to fetch', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                text: () => Promise.resolve('{"id":1}'),
            });

            await fetchWithRetry('/projects', { method: 'POST', body: JSON.stringify({ name: 'Test' }) });

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/projects',
                expect.objectContaining({
                    method: 'POST',
                    body: '{"name":"Test"}',
                })
            );
        });

        it('sets Content-Type header for JSON requests', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                text: () => Promise.resolve(''),
            });

            await fetchWithRetry('/projects', { method: 'POST', body: JSON.stringify({ name: 'Test' }) });

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/projects',
                expect.objectContaining({
                    headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
                })
            );
        });

        it('removes Content-Type for FormData requests', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                text: () => Promise.resolve(''),
            });

            const formData = new FormData();
            formData.append('file', 'test');

            await fetchWithRetry('/upload', { method: 'POST', body: formData });

            const call = global.fetch.mock.calls[0];
            const headers = call[1].headers;
            expect(headers['Content-Type']).toBeUndefined();
        });
    });

    describe('Exponential backoff timing', () => {
        it('calls fetch the correct number of times for maxRetries', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 503,
                json: () => Promise.resolve({}),
                text: () => Promise.resolve('{}'),
            });

            await expect(fetchWithRetry('/api/test', {}, { maxRetries: 5, initialDelay: 10 })).rejects.toThrow();
            expect(global.fetch).toHaveBeenCalledTimes(5);
        });
    });
});
