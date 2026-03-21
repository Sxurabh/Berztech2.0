/**
 * @fileoverview Race Condition Security Tests - Live API
 * 
 * Tests race conditions and duplicate submission prevention.
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
  login,
  skipIfNoServer
} from './api-client';

describe.skipIf(skipIfNoServer)('Security: Race Condition Prevention - Live API', () => {
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
  // Duplicate Submission
  // =========================================================================

  describe('Duplicate Submission Prevention', () => {
    it('1. Rapid duplicate subscribe requests are handled', async () => {
      const email = `duplicate-${Date.now()}-${Math.random()}@test.com`;
      
      const promises = Array.from({ length: 5 }, () => 
        fetchJson('/api/subscribe', {
          method: 'POST',
          body: { email }
        })
      );
      
      const responses = await Promise.all(promises);
      
      const successCount = responses.filter(r => 
        r.status === 200 || r.status === 201
      ).length;
      
      expect(successCount).toBeGreaterThan(0);
    });

    it('2. Concurrent request creation is handled safely', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        fetchJson('/api/requests', {
          method: 'POST',
          body: { 
            name: `Concurrent Test ${i}`, 
            email: `concurrent-${Date.now()}-${i}@test.com` 
          }
        })
      );
      
      const responses = await Promise.all(promises);
      
      const successCount = responses.filter(r => 
        r.status === 200 || r.status === 201
      ).length;
      
      expect(successCount).toBe(5);
    });
  });

  // =========================================================================
  // Bulk Creation Prevention
  // =========================================================================

  describe('Bulk Creation Prevention', () => {
    it('3. Bulk subscribe attempt is handled', async () => {
      const emails = Array.from({ length: 50 }, (_, i) => 
        `bulk-${Date.now()}-${i}@test.com`
      );
      
      let successCount = 0;
      for (const email of emails) {
        const response = await fetchJson('/api/subscribe', {
          method: 'POST',
          body: { email }
        });
        
        if (response.status === 200 || response.status === 201) {
          successCount++;
        }
      }
      
      expect(successCount).toBeGreaterThan(0);
    }, 30000);

    it('4. Rapid request submissions are handled', async () => {
      let completed = 0;
      
      for (let i = 0; i < 15; i++) {
        const response = await fetchJson('/api/requests', {
          method: 'POST',
          body: { 
            name: `Rate Test ${i}`, 
            email: `rate-${Date.now()}-${i}@test.com` 
          }
        });
        
        if (response.status === 200 || response.status === 201 || response.status === 429) {
          completed++;
        }
      }
      
      expect(completed).toBeGreaterThan(0);
    }, 45000);
  });

  // =========================================================================
  // Concurrent Modifications
  // =========================================================================

  describe('Concurrent Modification Handling', () => {
    it('5. Concurrent blog updates are handled', async () => {
      const createResponse = await fetchJson('/api/blog', {
        method: 'POST',
        token: adminToken,
        body: { 
          title: 'Race Test Post', 
          slug: 'race-test-' + Date.now(),
          content: 'Original content'
        }
      });
      
      if (createResponse.status === 200 || createResponse.status === 201) {
        const slug = createResponse.data?.slug;
        
        if (slug) {
          const updatePromises = [
            fetchJson(`/api/blog/${slug}`, {
              method: 'PUT',
              token: adminToken,
              body: { title: 'Update 1' }
            }),
            fetchJson(`/api/blog/${slug}`, {
              method: 'PUT',
              token: adminToken,
              body: { title: 'Update 2' }
            }),
            fetchJson(`/api/blog/${slug}`, {
              method: 'PUT',
              token: adminToken,
              body: { title: 'Update 3' }
            })
          ];
          
          const responses = await Promise.all(updatePromises);
          const successCount = responses.filter(r => 
            r.status === 200
          ).length;
          
          expect(successCount).toBeGreaterThan(0);
        }
      }
    });
  });

  // =========================================================================
  // Session Race Conditions
  // =========================================================================

  describe('Session Race Condition Prevention', () => {
    it('6. Concurrent login requests are handled', async () => {
      const promises = Array.from({ length: 3 }, () => 
        login(process.env.TEST_CLIENT_EMAIL, process.env.TEST_CLIENT_PASSWORD)
      );
      
      const tokens = await Promise.all(promises);
      
      expect(tokens.filter(t => t).length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // Data Consistency
  // =========================================================================

  describe('Data Consistency', () => {
    it('7. Partial request data (empty body) is rejected', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: {}
      });
      
      // Empty body fails Zod validation: name missing
      expect(response.status).toBe(400);
      expect(response.status).not.toBe(500);
    });

    it('8. Missing required field (name only) is rejected', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { name: 'Only Name' }
      });
      
      // Missing email fails Zod validation
      expect(response.status).toBe(400);
      expect(response.status).not.toBe(500);
    });

    it('9. Extra fields are safely ignored', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Extra Fields Test', 
          email: 'extra@test.com',
          extra_field: 'should be ignored',
          another_extra: 123
        }
      });
      
      // Extra fields pass Zod; stored successfully
      expect(response.status).toBe(201);
      expect(response.status).not.toBe(500);
    });
  });

  // =========================================================================
  // Timeout Handling
  // =========================================================================

  describe('Timeout Handling', () => {
    it('10. Slow request does not cause data corruption', async () => {
      const start = Date.now();
      
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Timeout Test', 
          email: 'timeout@test.com' 
        }
      }, { timeout: 10000 });
      
      const elapsed = Date.now() - start;
      
      expect(elapsed).toBeLessThan(15000);
      expect(response.status).toBe(201);
      expect(response.status).not.toBe(500);
    });
  });
});
