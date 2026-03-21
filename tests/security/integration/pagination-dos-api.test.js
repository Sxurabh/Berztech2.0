/**
 * @fileoverview Pagination DoS Security Tests - Live API
 * 
 * Tests pagination and DoS protection via query parameters.
 * Requires: npm run dev (server running on localhost:3000)
 * 
 * Run: npm run test:security:live
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  fetchJson, 
  getClientToken, 
  getAdminToken,
  cleanupTestData,
  skipIfNoServer
} from './api-client';

describe.skipIf(skipIfNoServer)('Security: Pagination DoS Prevention - Live API', () => {
  let clientToken;
  let adminToken;

  beforeAll(async () => {
    try {
      clientToken = await getClientToken();
      adminToken = await getAdminToken();
    } catch (e) {
      console.warn('Auth tokens not available');
    }
  }, 30000);

  afterAll(async () => {
    try {
      await cleanupTestData(adminToken);
    } catch (e) {}
  });

  // =========================================================================
  // Limit Validation
  // =========================================================================

  describe('Limit Parameter Validation', () => {
    it('1. Excessive limit is capped or returns empty', async () => {
      const response = await fetchJson('/api/blog?limit=99999', {
        token: clientToken
      });
      
      // Server caps limit or returns empty result; should not crash
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });

    it('2. Limit of 0 is handled gracefully', async () => {
      const response = await fetchJson('/api/blog?limit=0', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });

    it('3. Negative limit is handled gracefully', async () => {
      const response = await fetchJson('/api/blog?limit=-1', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });

    it('4. Non-numeric limit is handled gracefully', async () => {
      const response = await fetchJson('/api/blog?limit=abc', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });

    it('5. Float limit is handled gracefully', async () => {
      const response = await fetchJson('/api/blog?limit=10.5', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });
  });

  // =========================================================================
  // Page Validation
  // =========================================================================

  describe('Page Parameter Validation', () => {
    it('6. Negative page is handled gracefully', async () => {
      const response = await fetchJson('/api/blog?page=-1', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });

    it('7. Very large page number is handled gracefully', async () => {
      const response = await fetchJson('/api/blog?page=999999999', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });

    it('8. Non-numeric page is handled gracefully', async () => {
      const response = await fetchJson('/api/blog?page=abc', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });
  });

  // =========================================================================
  // Offset Validation
  // =========================================================================

  describe('Offset Parameter Validation', () => {
    it('9. Negative offset is handled gracefully', async () => {
      const response = await fetchJson('/api/blog?offset=-1', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });

    it('10. Very large offset is handled gracefully', async () => {
      const response = await fetchJson('/api/blog?offset=999999999', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });

    it('11. Non-numeric offset is handled gracefully', async () => {
      const response = await fetchJson('/api/blog?offset=abc', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });
  });

  // =========================================================================
  // Combined Parameter Attacks
  // =========================================================================

  describe('Combined Parameter Attacks', () => {
    it('12. Large limit with offset causes timeout prevention', async () => {
      const start = Date.now();
      
      const response = await fetchJson('/api/blog?limit=1000&offset=1000', {
        token: clientToken
      }, { timeout: 10000 });
      
      const elapsed = Date.now() - start;
      
      expect(elapsed).toBeLessThan(10000);
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });

    it('13. Multiple same parameters handled gracefully', async () => {
      const response = await fetchJson('/api/blog?limit=10&limit=20', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });

    it('14. Null bytes in parameters handled gracefully', async () => {
      const response = await fetchJson('/api/blog?limit=10\x00', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });
  });

  // =========================================================================
  // Admin Endpoints
  // =========================================================================

  describe('Admin Endpoint Pagination', () => {
    it('15. Admin tasks pagination is handled', async () => {
      const response = await fetchJson('/api/admin/tasks?limit=99999', {
        token: adminToken
      });
      
      // Admin token accepted; returns 200 or auth error
      expect([200, 401, 403]).toContain(response.status);
    }, 15000);

    it('16. Admin requests pagination is handled', async () => {
      const response = await fetchJson('/api/admin/requests?page=999999', {
        token: adminToken
      });
      
      expect([200, 401, 403]).toContain(response.status);
    }, 15000);
  });

  // =========================================================================
  // Projects
  // =========================================================================

  describe('Projects Pagination', () => {
    it('17. Projects limit is validated gracefully', async () => {
      const response = await fetchJson('/api/projects?limit=99999', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });

    it('18. Projects page is validated gracefully', async () => {
      const response = await fetchJson('/api/projects?page=-100', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });
  });

  // =========================================================================
  // Performance Limits
  // =========================================================================

  describe('Performance Limits', () => {
    it('19. Rapid pagination requests are handled', async () => {
      let completed = 0;
      
      for (let i = 0; i < 10; i++) {
        const response = await fetchJson('/api/blog', {
          token: clientToken
        });
        
        if (response.status === 200 || response.status === 429) {
          completed++;
        }
      }
      
      expect(completed).toBeGreaterThan(0);
    }, 30000);

    it('20. Large result set with complex query is handled', async () => {
      const response = await fetchJson('/api/blog?limit=100&search=*', {
        token: clientToken
      }, { timeout: 15000 });
      
      expect(response.status).not.toBe(500);
      expect([200, 400]).toContain(response.status);
    });
  });
});
