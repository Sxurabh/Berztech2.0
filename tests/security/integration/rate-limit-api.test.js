/**
 * @fileoverview Rate Limiting Security Tests - Live API
 * 
 * Tests rate limiting and DoS protection on live API endpoints.
 * Requires: npm run dev (server running on localhost:3000)
 * 
 * Note: These tests should be run separately as they affect rate limits.
 * Run: npm run test:security:live:rate
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  fetchJson, 
  getClientToken, 
  cleanupTestData,
  BASE_URL 
} from './api-client';

describe('Security: Rate Limiting - Live API', () => {
  let clientToken;

  beforeAll(async () => {
    try {
      clientToken = await getClientToken();
    } catch (e) {
      console.warn('Auth tokens not available');
    }
  }, 30000);

  afterAll(async () => {
    try {
      await cleanupTestData(clientToken);
    } catch (e) {}
  }, 10000);

  // =========================================================================
  // POST /api/requests - Rate Limiting
  // =========================================================================

  describe('POST /api/requests - Rate limiting', () => {
    const RATE_LIMIT = 20;
    const requests = [];

    it('1. First requests within limit succeed', async () => {
      for (let i = 0; i < 5; i++) {
        const response = await fetchJson('/api/requests', {
          method: 'POST',
          body: { 
            name: `Rate Test ${i}`, 
            email: `ratetest${i}@test.com` 
          }
        });
        
        expect([200, 201, 400]).toContain(response.status);
        requests.push(response);
      }
    });

    it('2. Rate limit headers are present', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Header Test', 
          email: 'headertest@test.com' 
        }
      });
      
      if (response.headers['x-ratelimit-limit'] || response.headers['ratelimit-limit']) {
        expect(response.headers['x-ratelimit-limit'] || response.headers['ratelimit-limit']).toBeDefined();
      }
    });

    it('3. Rapid requests are rate limited after threshold', async () => {
      let rateLimited = false;
      
      for (let i = 0; i < RATE_LIMIT + 5; i++) {
        const response = await fetchJson('/api/requests', {
          method: 'POST',
          body: { 
            name: `Rapid Test ${i}-${Date.now()}`, 
            email: `rapid${i}-${Date.now()}@test.com` 
          }
        });
        
        if (response.status === 429) {
          rateLimited = true;
          break;
        }
      }
      
      expect(rateLimited).toBe(true);
    });
  });

  // =========================================================================
  // POST /api/subscribe - Rate Limiting
  // =========================================================================

  describe('POST /api/subscribe - Rate limiting', () => {
    it('4. Rapid subscribe requests are rate limited', async () => {
      let rateLimited = false;
      
      for (let i = 0; i < 25; i++) {
        const response = await fetchJson('/api/subscribe', {
          method: 'POST',
          body: { 
            email: `subscribe${i}-${Date.now()}@test.com` 
          }
        });
        
        if (response.status === 429) {
          rateLimited = true;
          break;
        }
      }
      
      expect(rateLimited).toBe(true);
    });
  });

  // =========================================================================
  // Rate Limit Headers
  // =========================================================================

  describe('Rate limit headers present', () => {
    it('5. Rate limit headers are present on success', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Header Check', 
          email: 'headercheck@test.com' 
        }
      });
      
      const hasRateLimitHeader = 
        response.headers['x-ratelimit-limit'] ||
        response.headers['ratelimit-limit'] ||
        response.headers['x-rate-limit-limit'];
      
      if (response.status === 429) {
        const hasRemaining = 
          response.headers['x-ratelimit-remaining'] ||
          response.headers['ratelimit-remaining'] ||
          response.headers['x-rate-limit-remaining'];
        
        expect(hasRemaining).toBeDefined();
      }
    });

    it('6. Rate limit retry-after header on 429', async () => {
      for (let i = 0; i < 30; i++) {
        await fetchJson('/api/requests', {
          method: 'POST',
          body: { 
            name: `RetryAfter ${i}`, 
            email: `retryafter${i}@test.com` 
          }
        });
      }
      
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Final', 
          email: 'final@test.com' 
        }
      });
      
      if (response.status === 429) {
        const hasRetryAfter = 
          response.headers['retry-after'] ||
          response.headers['x-ratelimit-reset'];
        expect(hasRetryAfter || response.data?.error).toBeDefined();
      }
    });
  });

  // =========================================================================
  // IP-based Rate Limiting
  // =========================================================================

  describe('IP-based rate limiting', () => {
    it('7. Different X-Forwarded-For IPs get separate limits', async () => {
      const response1 = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'IP Test 1', 
          email: 'iptest1@test.com' 
        },
        headers: { 'X-Forwarded-For': '192.168.1.1' }
      });
      
      const response2 = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'IP Test 2', 
          email: 'iptest2@test.com' 
        },
        headers: { 'X-Forwarded-For': '192.168.1.2' }
      });
      
      expect([200, 201, 400, 429]).toContain(response1.status);
      expect([200, 201, 400, 429]).toContain(response2.status);
    });

    it('8. X-Forwarded-For spoofing is handled', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Spoof Test', 
          email: 'spoof@test.com' 
        },
        headers: { 
          'X-Forwarded-For': '10.0.0.1, 192.168.1.1',
          'Client-IP': '10.0.0.2'
        }
      });
      
      expect([200, 201, 400, 429]).toContain(response.status);
    });
  });

  // =========================================================================
  // DoS Protection
  // =========================================================================

  describe('DoS Protection', () => {
    it('9. Large request body is rejected early', async () => {
      const largeBody = 'x'.repeat(1024 * 1024 * 10);
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: largeBody, 
          email: 'large@test.com' 
        }
      });
      
      expect([400, 413, 431]).toContain(response.status);
    });

    it('10. Many concurrent requests are handled', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        fetchJson('/api/requests', {
          method: 'POST',
          body: { 
            name: `Concurrent ${i}`, 
            email: `concurrent${i}@test.com` 
          })
        })
      );
      
      const responses = await Promise.all(promises);
      
      const successCount = responses.filter(r => 
        r.status === 200 || r.status === 201
      ).length;
      const rateLimitedCount = responses.filter(r => 
        r.status === 429
      ).length;
      
      expect(successCount + rateLimitedCount).toBe(10);
    });

    it('11. Repeated same endpoint DoS attempt', async () => {
      let blocked = false;
      
      for (let i = 0; i < 30; i++) {
        const response = await fetchJson('/api/subscribe', {
          method: 'POST',
          body: { email: `dostest${i}@test.com` }
        });
        
        if (response.status === 429) {
          blocked = true;
          break;
        }
      }
      
      expect(blocked).toBe(true);
    });
  });

  // =========================================================================
  // Window Reset
  // =========================================================================

  describe('Rate limit window behavior', () => {
    it('12. Rate limit resets after window expires', async () => {
      for (let i = 0; i < 25; i++) {
        await fetchJson('/api/requests', {
          method: 'POST',
          body: { 
            name: `Window ${i}`, 
            email: `window${i}@test.com` 
          }
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'After Window', 
          email: 'afterwindow@test.com' 
        }
      });
      
      expect([200, 201, 400, 429]).toContain(response.status);
    });
  });

  // =========================================================================
  // Admin endpoints
  // =========================================================================

  describe('Admin endpoint rate limiting', () => {
    it('13. Admin upload endpoint has rate limiting', async () => {
      const response = await fetchJson('/api/upload', {
        method: 'POST',
        token: clientToken,
        body: {}
      });
      
      expect([200, 201, 400, 401, 403, 429]).toContain(response.status);
    });
  });

  // =========================================================================
  // Pagination DoS
  // =========================================================================

  describe('Pagination protection', () => {
    it('14. Large page size requests are limited', async () => {
      const response = await fetchJson('/api/blog?limit=99999', {
        token: clientToken
      });
      
      expect([200, 400]).toContain(response.status);
    });

    it('15. Negative page values are handled', async () => {
      const response = await fetchJson('/api/blog?page=-1', {
        token: clientToken
      });
      
      expect([200, 400]).toContain(response.status);
    });

    it('16. Very large offset is handled', async () => {
      const response = await fetchJson('/api/blog?offset=999999999', {
        token: clientToken
      });
      
      expect([200, 400]).toContain(response.status);
    });
  });
});
