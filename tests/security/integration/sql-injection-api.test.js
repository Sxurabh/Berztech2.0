/**
 * @fileoverview SQL Injection Security Tests - Live API
 * 
 * Tests SQL injection prevention on live API endpoints.
 * Requires: npm run dev (server running on localhost:3000)
 * 
 * Run: npm run test:security:live
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  fetchJson, 
  getClientToken, 
  getAdminToken,
  createTestRequest,
  cleanupTestData,
  SQL_PAYLOADS 
} from './api-client';

describe('Security: SQL Injection Prevention - Live API', () => {
  let clientToken;
  let adminToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
    adminToken = await getAdminToken();
  });

  afterAll(async () => {
    await cleanupTestData(adminToken);
  });

  // =========================================================================
  // POST /api/requests - SQL injection in request body
  // =========================================================================

  describe('POST /api/requests - SQL injection in body', () => {
    it('1. UNION-based injection in name field is handled safely', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { name: SQL_PAYLOADS.UNION, email: 'test@test.com' }
      });
      
      // Should either accept (store as data) or reject with validation error
      // Should NOT cause a SQL error (500)
      expect([200, 201, 400]).toContain(response.status);
      expect(response.status).not.toBe(500);
    });

    it('2. OR 1=1 in name field is handled safely', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { name: SQL_PAYLOADS.OR_TRUE, email: 'test@test.com' }
      });
      
      expect([200, 201, 400]).toContain(response.status);
    });

    it('3. DROP TABLE attempt in message field is sanitized', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Test User', 
          email: 'test@test.com',
          message: SQL_PAYLOADS.DROP_TABLE 
        }
      });
      
      expect([200, 201, 400]).toContain(response.status);
    });

    it('4. Admin bypass attempt in email field', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: SQL_PAYLOADS.ADMIN_BYPASS, 
          email: 'admin@test.com' 
        }
      });
      
      expect([200, 201, 400]).toContain(response.status);
    });

    it('5. Inline DELETE attempt in company field', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Test User', 
          email: 'test@test.com',
          company: SQL_PAYLOADS.DELETE_INLINE 
        }
      });
      
      expect([200, 201, 400]).toContain(response.status);
    });
  });

  // =========================================================================
  // GET /api/requests - SQL injection in query params
  // =========================================================================

  describe('GET /api/requests - SQL injection in query params', () => {
    it('6. UNION injection in filter param', async () => {
      const response = await fetchJson(`/api/requests?filter=${encodeURIComponent(SQL_PAYLOADS.UNION)}`, {
        token: clientToken
      });
      
      expect([200, 400, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    it('7. OR 1=1 injection in filter param', async () => {
      const response = await fetchJson(`/api/requests?filter=${encodeURIComponent(SQL_PAYLOADS.OR_TRUE)}`, {
        token: clientToken
      });
      
      expect([200, 400, 401]).toContain(response.status);
    });

    it('8. DROP TABLE in filter param', async () => {
      const response = await fetchJson(`/api/requests?filter=${encodeURIComponent(SQL_PAYLOADS.DROP_TABLE)}`, {
        token: clientToken
      });
      
      expect([200, 400, 401]).toContain(response.status);
      expect(response.status).not.toBe(500);
    });

    it('9. SLEEP() time-based injection in filter', async () => {
      const start = Date.now();
      const response = await fetchJson(`/api/requests?filter=${encodeURIComponent(SQL_PAYLOADS.SLEEP)}`, {
        token: clientToken
      });
      const elapsed = Date.now() - start;
      
      expect([200, 400, 401]).toContain(response.status);
      expect(elapsed).toBeLessThan(10000);
    });
  });

  // =========================================================================
  // GET /api/blog - SQL injection
  // =========================================================================

  describe('GET /api/blog - SQL injection in query params', () => {
    it('10. UNION injection in search param', async () => {
      const response = await fetchJson(`/api/blog?search=${encodeURIComponent(SQL_PAYLOADS.UNION)}`);
      
      expect([200, 400, 500]).toContain(response.status);
      expect(response.status).not.toBe(500);
    });

    it('11. OR 1=1 injection in category param', async () => {
      const response = await fetchJson(`/api/blog?category=${encodeURIComponent(SQL_PAYLOADS.OR_TRUE)}`);
      
      expect([200, 400]).toContain(response.status);
    });

    it('12. DROP TABLE in category param', async () => {
      const response = await fetchJson(`/api/blog?category=${encodeURIComponent(SQL_PAYLOADS.DROP_TABLE)}`);
      
      expect([200, 400]).toContain(response.status);
      expect(response.status).not.toBe(500);
    });

    it('13. OR TRUE in author param', async () => {
      const response = await fetchJson(`/api/blog?author=${encodeURIComponent(SQL_PAYLOADS.OR_TRUE)}`);
      
      expect([200, 400]).toContain(response.status);
    });
  });

  // =========================================================================
  // GET /api/projects - SQL injection
  // =========================================================================

  describe('GET /api/projects - SQL injection in query params', () => {
    it('14. UNION injection in search param', async () => {
      const response = await fetchJson(`/api/projects?search=${encodeURIComponent(SQL_PAYLOADS.UNION)}`);
      
      expect([200, 400, 404]).toContain(response.status);
    });

    it('15. OR 1=1 injection in category param', async () => {
      const response = await fetchJson(`/api/projects?category=${encodeURIComponent(SQL_PAYLOADS.OR_TRUE)}`);
      
      expect([200, 400]).toContain(response.status);
    });

    it('16. DROP TABLE in category param', async () => {
      const response = await fetchJson(`/api/projects?category=${encodeURIComponent(SQL_PAYLOADS.DROP_TABLE)}`);
      
      expect([200, 400]).toContain(response.status);
      expect(response.status).not.toBe(500);
    });

    it('17. Status bypass with OR TRUE', async () => {
      const response = await fetchJson(`/api/projects?status=${encodeURIComponent(SQL_PAYLOADS.OR_TRUE)}`);
      
      expect([200, 400]).toContain(response.status);
    });
  });

  // =========================================================================
  // Error message sanitization
  // =========================================================================

  describe('Error message sanitization', () => {
    it('18. SQL error should not leak table names', async () => {
      const response = await fetchJson(`/api/requests?filter=${encodeURIComponent("' AND 1=1--")}`, {
        token: clientToken
      });
      
      const responseText = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      expect(responseText).not.toMatch(/table.*not found|unknown column/i);
    });

    it('19. SQL error should not leak database structure', async () => {
      const response = await fetchJson(`/api/blog?search=${encodeURIComponent("' UNION SELECT *--")}`);
      
      const responseText = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      expect(responseText).not.toMatch(/syntax error at or near|pg_/i);
    });

    it('20. Generic error message on SQL attempt', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { name: SQL_PAYLOADS.COMMAND_EXEC, email: 'test@test.com' }
      });
      
      if (response.status >= 400) {
        const errorMsg = typeof response.data === 'string' 
          ? response.data 
          : JSON.stringify(response.data);
        expect(errorMsg).not.toMatch(/database|postgres|supabase/i);
      }
    });
  });
});
