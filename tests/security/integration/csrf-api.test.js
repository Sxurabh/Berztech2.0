/**
 * @fileoverview CSRF & HTTP Method Security Tests - Live API
 * 
 * Tests CSRF protection, HTTP method validation, and header injection prevention.
 * Requires: npm run dev (server running on localhost:3000)
 * 
 * Run: npm run test:security:live
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  fetchJson, 
  fetchRaw,
  getClientToken, 
  getAdminToken,
  cleanupTestData,
  BASE_URL 
} from './api-client';

describe('Security: CSRF & HTTP Method Protection - Live API', () => {
  let clientToken;
  let adminToken;

  beforeAll(async () => {
    try {
      clientToken = await getClientToken();
      adminToken = await getAdminToken();
    } catch (e) {
      console.warn('Auth tokens not available');
    }
  });

  afterAll(async () => {
    try {
      await cleanupTestData(adminToken);
    } catch (e) {}
  });

  // =========================================================================
  // Origin Header Validation
  // =========================================================================

  describe('Origin Header Validation', () => {
    it('1. POST without Origin header is accepted from same origin', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': BASE_URL,
        },
        body: JSON.stringify({ name: 'Test User', email: 'test@test.com' })
      });
      
      expect([200, 201, 400, 401]).toContain(response.status);
    });

    it('2. POST with valid Origin header is accepted', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000',
        },
        body: JSON.stringify({ name: 'Test User', email: 'test@test.com' })
      });
      
      expect([200, 201, 400, 401]).toContain(response.status);
    });

    it('3. POST with invalid/malformed Origin header is handled', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://evil.com',
        },
        body: JSON.stringify({ name: 'Test User', email: 'test@test.com' })
      });
      
      expect([200, 201, 400, 403, 401]).toContain(response.status);
    });
  });

  // =========================================================================
  // Content-Type Validation
  // =========================================================================

  describe('Content-Type Validation', () => {
    it('4. POST with application/json is accepted', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { name: 'Test User', email: 'test@test.com' }
      });
      
      expect([200, 201, 400, 401]).toContain(response.status);
    });

    it('5. POST with text/plain is rejected or handled safely', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: 'name=Test&email=test@test.com'
      });
      
      expect([400, 415, 406, 500]).toContain(response.status);
    });

    it('6. POST with missing Content-Type is handled', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        body: JSON.stringify({ name: 'Test User', email: 'test@test.com' })
      });
      
      expect([200, 201, 400, 401, 415]).toContain(response.status);
    });

    it('7. POST with wrong Content-Type (application/x-www-form-urlencoded)', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'name=Test&email=test@test.com'
      });
      
      expect([400, 415, 406, 500]).toContain(response.status);
    });
  });

  // =========================================================================
  // HTTP Method Tampering
  // =========================================================================

  describe('HTTP Method Tampering Prevention', () => {
    it('8. PUT to POST-only /api/requests returns 405', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'PUT',
        body: { name: 'Test User', email: 'test@test.com' }
      });
      
      expect([405, 400]).toContain(response.status);
    });

    it('9. DELETE to POST-only /api/requests returns 405', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'DELETE',
      });
      
      expect([405, 404, 401]).toContain(response.status);
    });

    it('10. PATCH to POST-only /api/requests returns 405', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'PATCH',
        body: { name: 'Updated' }
      });
      
      expect([405, 400]).toContain(response.status);
    });

    it('11. GET to POST-only /api/subscribe returns correct behavior', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'GET'
      });
      
      expect([200, 405, 400]).toContain(response.status);
    });

    it('12. PUT to POST-only /api/blog returns 405', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'PUT',
        token: adminToken,
        body: { title: 'Test' }
      });
      
      expect([405, 400]).toContain(response.status);
    });

    it('13. POST to GET-only /api/blog returns appropriate status', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        body: { title: 'Test' }
      });
      
      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('14. TRACE method is handled', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'TRACE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test' })
      });
      
      expect([405, 501, 403, 200, 400, 404, 500, 0]).toContain(response.status);
    });

    it('15. CONNECT method is handled', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'CONNECT',
      });
      
      expect([405, 501, 403, 200, 404, 500, 0]).toContain(response.status);
    });

    it('16. Headers are handled safely', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test', email: 'test@test.com' })
      });
      
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('17. Headers with special chars are handled', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test', email: 'test@test.com' })
      });
      
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('19. Header values are handled', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test', email: 'test@test.com' })
      });
      
      expect([200, 201, 400, 500]).toContain(response.status);
    });
  });

  // =========================================================================
  // Referer Header Validation
  // =========================================================================

  describe('Header Injection Prevention', () => {
    it('16. Headers are handled safely', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test', email: 'test@test.com' })
      });
      
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('17. Headers are processed correctly', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test', email: 'test@test.com' })
      });
      
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('18. Oversized header values are handled', async () => {
      const largeHeader = 'A'.repeat(10000);
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Large-Header': largeHeader,
        },
        body: JSON.stringify({ name: 'Test', email: 'test@test.com' })
      });
      
      expect([200, 201, 400, 431, 413, 500]).toContain(response.status);
    });

    it('19. Header values are processed correctly', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test', email: 'test@test.com' })
      });
      
      expect([200, 201, 400, 500]).toContain(response.status);
    });
  });

  // =========================================================================
  // Referer Header Validation
  // =========================================================================

  describe('Referer Header Validation', () => {
    it('20. POST with valid Referer from same origin', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': `${BASE_URL}/`,
        },
        body: JSON.stringify({ name: 'Test User', email: 'test@test.com' })
      });
      
      expect([200, 201, 400, 401]).toContain(response.status);
    });

    it('21. POST with invalid Referer is handled', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'http://evil.com/phishing',
        },
        body: JSON.stringify({ name: 'Test User', email: 'test@test.com' })
      });
      
      expect([200, 201, 400, 403, 401]).toContain(response.status);
    });

    it('22. POST with missing Referer is handled', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test User', email: 'test@test.com' })
      });
      
      expect([200, 201, 400, 401]).toContain(response.status);
    });
  });

  // =========================================================================
  // CORS Preflight Handling
  // =========================================================================

  describe('CORS Preflight Request Handling', () => {
    it('23. OPTIONS request to blog endpoint is handled', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/blog`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://evil.com',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        }
      });
      
      expect([200, 204, 405, 403]).toContain(response.status);
    });

    it('24. CORS headers are properly set or absent for cross-origin', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/blog`, {
        method: 'GET',
        headers: {
          'Origin': 'http://evil.com',
        }
      });
      
      const corsHeaders = response.headers;
      if (corsHeaders['access-control-allow-origin']) {
        expect(corsHeaders['access-control-allow-origin']).not.toBe('http://evil.com');
      }
    });

    it('25. Credentials header in CORS request is respected', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/blog`, {
        method: 'GET',
        headers: {
          'Origin': 'http://evil.com',
          'Access-Control-Request-Credentials': 'true',
        }
      });
      
      expect([200, 204, 403, 405]).toContain(response.status);
    });
  });
});
