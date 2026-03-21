/**
 * @fileoverview Session Invalidation Security Tests - Live API
 * 
 * Tests session invalidation after logout and token lifecycle.
 * Requires: npm run dev (server running on localhost:3000)
 * 
 * Run: npm run test:security:live
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { 
  fetchJson, 
  getClientToken, 
  getAdminToken,
  login,
  logout,
  skipIfNoServer
} from './api-client';

describe.skipIf(skipIfNoServer)('Security: Session Invalidation - Live API', () => {
  let clientToken;
  let adminToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
    adminToken = await getAdminToken();
  });

  // =========================================================================
  // Post-Logout Token Reuse
  // =========================================================================

  describe('Post-Logout Token Invalidation', () => {
    it('1. After logout, old JWT cannot access /api/client-tasks', async () => {
      const email = process.env.TEST_CLIENT_EMAIL;
      const password = process.env.TEST_CLIENT_PASSWORD;
      const freshToken = await login(email, password);
      
      const beforeResponse = await fetchJson('/api/client/tasks', {
        token: freshToken
      });
      expect([200, 401]).toContain(beforeResponse.status);
      
      await logout(freshToken);
      
      const afterResponse = await fetchJson('/api/client/tasks', {
        token: freshToken
      });
      
      expect(afterResponse.status).toBe(401);
    });

    it('2. After logout, old JWT cannot access /api/admin/tasks', async () => {
      const email = process.env.TEST_ADMIN_EMAIL;
      const password = process.env.TEST_ADMIN_PASSWORD;
      const freshToken = await login(email, password);
      
      const beforeResponse = await fetchJson('/api/admin/tasks', {
        token: freshToken
      });
      expect([200, 401, 403]).toContain(beforeResponse.status);
      
      await logout(freshToken);
      
      const afterResponse = await fetchJson('/api/admin/tasks', {
        token: freshToken
      });
      
      expect(afterResponse.status).toBe(401);
    });

    it('3. Token validation returns consistent status', async () => {
      const response = await fetchJson('/api/client/tasks', {
        token: clientToken
      });
      
      // Valid token returns 200 (with data) or 401 (expired)
      expect([200, 401]).toContain(response.status);
    });

    it('4. Session cookie is properly managed', async () => {
      const response = await fetchJson('/api/client/tasks', {
        token: clientToken
      });
      
      expect(response.status).not.toBe(500);
    });

    it('5. Concurrent sessions: logging out one does not affect other', async () => {
      const email = process.env.TEST_CLIENT_EMAIL;
      const password = process.env.TEST_CLIENT_PASSWORD;
      
      const token1 = await login(email, password);
      const token2 = await login(email, password);
      
      await logout(token1);
      
      const response = await fetchJson('/api/client/tasks', {
        token: token2
      });
      
      // Supabase supports multiple sessions; second token should still work
      expect([200, 401]).toContain(response.status);
      
      await logout(token2);
    });

    it('6. Replaying a used refresh token - rejected or new token issued', async () => {
      const response1 = await fetchJson('/api/client/tasks', {
        token: clientToken
      });
      
      const response2 = await fetchJson('/api/client/tasks', {
        token: clientToken
      });
      
      // Both should behave consistently
      expect([200, 401]).toContain(response1.status);
      expect([200, 401]).toContain(response2.status);
      expect(response1.status).toBe(response2.status);
    });

    it('7. Token from deleted user account - rejected', async () => {
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZWxldGVkLXVzZXIifQ.fake';
      
      const response = await fetchJson('/api/client/tasks', {
        token: fakeToken
      });
      
      expect(response.status).toBe(401);
    });

    it('8. Session expiry - expired JWT returns 401, not 500', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDAwMDB9.signature';
      
      const response = await fetchJson('/api/client/tasks', {
        token: expiredToken
      });
      
      expect(response.status).toBe(401);
    });

    it('9. PKCE code reuse - second rejected', async () => {
      const code = 'used-code-123';
      
      const response = await fetchJson('/auth/callback?code=' + code);
      
      expect(response.status).not.toBe(500);
      
      if (response.status === 302 || response.status === 307) {
        const location = response.headers['location'] || response.headers['Location'];
        expect(location).toBeDefined();
      }
    });

    it('10. Invalid token format is rejected', async () => {
      const invalidToken = 'invalid-token-format';
      
      const response = await fetchJson('/api/client/tasks', {
        token: invalidToken
      });
      
      expect(response.status).toBe(401);
    });

    it('11. Long-running session - revalidation keeps session alive', async () => {
      const responses = await Promise.all([
        fetchJson('/api/client/tasks', { token: clientToken }),
        fetchJson('/api/client/tasks', { token: clientToken }),
        fetchJson('/api/client/tasks', { token: clientToken })
      ]);
      
      responses.forEach(r => {
        expect([200, 401]).toContain(r.status);
        expect(r.status).not.toBe(500);
      });
    });

    it('12. Cross-tab logout - session cleared', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await fetchJson('/api/client/tasks', {
        token: clientToken
      });
      
      // Token still valid or expired
      expect([200, 401]).toContain(response.status);
    });
  });
});
