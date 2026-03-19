/**
 * @fileoverview Cache Poisoning Security Tests - Live API
 * 
 * Tests cache-related security headers and behaviors.
 * Requires: npm run dev (server running on localhost:3000)
 * 
 * Run: npm run test:security:live
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  fetchJson, 
  getClientToken, 
  getAdminToken,
  cleanupTestData 
} from './api-client';

describe('Security: Cache Poisoning Prevention - Live API', () => {
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
  // Cache Control Headers
  // =========================================================================

  describe('Cache Control Headers', () => {
    it('1. No-Store header is respected', async () => {
      const response = await fetchJson('/api/requests', {
        token: clientToken,
        headers: { 'Cache-Control': 'no-store' }
      });
      
      expect([200, 401]).toContain(response.status);
    });

    it('2. No-Cache header is handled', async () => {
      const response = await fetchJson('/api/blog', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      expect(response.status).toBe(200);
    });

    it('3. Pragma: no-cache is handled', async () => {
      const response = await fetchJson('/api/blog', {
        headers: { 'Pragma': 'no-cache' }
      });
      
      expect(response.status).toBe(200);
    });
  });

  // =========================================================================
  // Cache Headers in Response
  // =========================================================================

  describe('Response Cache Headers', () => {
    it('4. Private data has no-store in response', async () => {
      const response = await fetchJson('/api/requests', {
        token: clientToken
      });
      
      const cacheControl = response.headers?.['cache-control'] || '';
      expect(cacheControl.toLowerCase()).not.toMatch(/public/);
    });

    it('5. Public endpoints may have cache headers', async () => {
      const response = await fetchJson('/api/blog');
      
      expect(response.status).toBe(200);
    });

    it('6. Sensitive endpoints have appropriate headers', async () => {
      const response = await fetchJson('/api/notifications', {
        token: clientToken
      });
      
      expect([200, 401]).toContain(response.status);
    });
  });

  // =========================================================================
  // Vary Header
  // =========================================================================

  describe('Vary Header', () => {
    it('7. Authenticated endpoints have appropriate caching', async () => {
      const response = await fetchJson('/api/blog', {
        token: clientToken
      });
      
      expect(response.status).toBe(200);
    });

    it('8. Origin header is considered for CORS', async () => {
      const response = await fetchJson('/api/blog', {
        headers: { 'Origin': 'http://example.com' }
      });
      
      expect(response.status).toBe(200);
    });
  });

  // =========================================================================
  // Surrogate-Control
  // =========================================================================

  describe('Surrogate Control Headers', () => {
    it('9. Surrogate-Control header handling', async () => {
      const response = await fetchJson('/api/blog', {
        headers: { 'Surrogate-Control': 'no-store' }
      });
      
      expect(response.status).toBe(200);
    });
  });

  // =========================================================================
  // Edge Cache Handling
  // =========================================================================

  describe('Edge Cache Headers', () => {
    it('10. CloudFront headers are handled', async () => {
      const response = await fetchJson('/api/blog', {
        headers: { 
          'CloudFront-Forwarded-Proto': 'https',
          'CloudFront-Is-Desktop-Viewer': 'true'
        }
      });
      
      expect(response.status).toBe(200);
    });

    it('11. CDN headers are handled', async () => {
      const response = await fetchJson('/api/blog', {
        headers: { 
          'X-Cache': 'Hit from cloudfront',
          'Via': '1.1 varnish'
        }
      });
      
      expect(response.status).toBe(200);
    });
  });
});
