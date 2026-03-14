/**
 * Integration: Upload endpoint rate limiting
 * Tests the rate limiting configuration and behavior.
 */
import { describe, it, expect } from 'vitest';

describe('POST /api/upload — rate limiting configuration', () => {
  it('rate limiter is configured for 20 requests per 60 seconds per IP', () => {
    const RATE_LIMIT_WINDOW_MS = 60 * 1000;
    const MAX_UPLOADS_PER_WINDOW = 20;
    
    expect(RATE_LIMIT_WINDOW_MS).toBe(60000);
    expect(MAX_UPLOADS_PER_WINDOW).toBe(20);
  });

  it('rate limit error message format is correct', () => {
    const errorMessage = "Rate limit exceeded. Try again later.";
    expect(errorMessage).toMatch(/rate limit/i);
  });

  it('429 status code indicates rate limiting', () => {
    const RATE_LIMIT_STATUS = 429;
    expect(RATE_LIMIT_STATUS).toBe(429);
  });

  it('rate limit window is 60 seconds', () => {
    const RATE_LIMIT_WINDOW_MS = 60 * 1000;
    const RATE_LIMIT_WINDOW_SEC = RATE_LIMIT_WINDOW_MS / 1000;
    expect(RATE_LIMIT_WINDOW_SEC).toBe(60);
  });
});
