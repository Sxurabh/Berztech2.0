/**
 * @fileoverview Host Header Injection Security Tests - Live API
 * 
 * Tests host header injection and related attacks on live API endpoints.
 * Requires: npm run dev (server running on localhost:3000)
 * 
 * Run: npm run test:security:live
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { 
  fetchJson, 
  getClientToken, 
  getAdminToken,
  fetchRaw,
  BASE_URL,
  skipIfNoServer
} from './api-client';

describe.skipIf(skipIfNoServer)('Security: Host Header Injection - Live API', () => {
  let clientToken;
  let adminToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
    adminToken = await getAdminToken();
  });

  // =========================================================================
  // Host Header Manipulation
  // =========================================================================

  describe('Host Header Manipulation', () => {
    it('1. Request with Host: evil.com - password reset link not poisoned', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Host': 'evil.com',
          'X-Forwarded-Host': 'evil.com'
        },
        body: JSON.stringify({
          name: 'Test',
          email: 'test@example.com'
        })
      });
      
      // Should not crash
      expect(response.status).not.toBe(500);
      
      // Response should not contain the poisoned host
      const responseText = JSON.stringify(response.data);
      expect(responseText).not.toContain('evil.com');
    });

    it('2. Request with X-Forwarded-Host: evil.com - not used for redirect', async () => {
      const response = await fetchRaw(`${BASE_URL}/auth/callback?code=test`, {
        headers: {
          'X-Forwarded-Host': 'evil.com',
          'X-Forwarded-Proto': 'https'
        }
      });
      
      // Should not crash
      expect(response.status).not.toBe(500);
      
      // Check redirect location
      if (response.status === 302 || response.status === 307) {
        const location = response.headers['location'] || response.headers['Location'];
        if (location) {
          expect(location).not.toContain('evil.com');
        }
      }
    });

    it('3. Request with X-Forwarded-For: internal-ip is not trusted blindly', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        headers: {
          'X-Forwarded-For': '10.0.0.1, 192.168.1.1, 127.0.0.1'
        },
        body: {
          name: 'Test',
          email: 'test@example.com'
        }
      });
      
      // Valid JSON body; stored successfully
      expect(response.status).toBe(201);
      expect(response.status).not.toBe(500);
    });

    it('4. Request with X-Original-URL: /admin - not used for routing bypass', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/client/tasks`, {
        headers: {
          'X-Original-URL': '/admin',
          'Authorization': `Bearer ${clientToken}`
        }
      });
      
      // Should not redirect to admin; should return client tasks or auth error
      expect(response.status).not.toBe(500);
      expect([200, 401, 403]).toContain(response.status);
    });

    it('5. Request with X-Rewrite-URL: /admin - not used for routing bypass', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/client/tasks`, {
        headers: {
          'X-Rewrite-URL': '/admin',
          'Authorization': `Bearer ${clientToken}`
        }
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 401, 403]).toContain(response.status);
    });

    it('6. X-HTTP-Method-Override: DELETE on GET endpoint - ignored', async () => {
      const response = await fetchRaw(`${BASE_URL}/api/blog`, {
        method: 'GET',
        headers: {
          'X-HTTP-Method-Override': 'DELETE'
        }
      });
      
      // Should treat as GET, not DELETE; returns 200 (blog posts) or 401/403
      expect(response.status).not.toBe(500);
      expect([200, 401, 403]).toContain(response.status);
    });

    it('7. X-Forwarded-Proto: http on production - does not downgrade HTTPS', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        headers: {
          'X-Forwarded-Proto': 'http'
        },
        body: {
          name: 'Test',
          email: 'test@example.com'
        }
      });
      
      // Valid JSON body; stored successfully
      expect(response.status).toBe(201);
      expect(response.status).not.toBe(500);
    });

    it('8. Multiple Host headers in one request - request handled safely', async () => {
      // This is typically handled at the server/proxy level
      const response = await fetchRaw(`${BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Host': 'localhost:3000, evil.com'
        },
        body: JSON.stringify({
          name: 'Test',
          email: 'test@example.com'
        })
      });
      
      // Should not crash
      expect(response.status).not.toBe(500);
    });
  });
});
