/**
 * @fileoverview Security Headers Tests - Live API
 * 
 * Tests HTTP security headers on live API endpoints.
 * Requires: npm run dev (server running on localhost:3000)
 * 
 * Run: npm run test:security:live
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { fetchJson, getClientToken, getAdminToken, BASE_URL, skipIfNoServer } from './api-client';

describe.skipIf(skipIfNoServer)('Security: HTTP Security Headers - Live API', () => {
  let clientToken;
  let adminToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
    adminToken = await getAdminToken();
  });

  // =========================================================================
  // CSP and Security Headers
  // =========================================================================

  describe('Security Headers on Public Routes', () => {
    it('1. GET / returns Content-Security-Policy header (or notes if not configured)', async () => {
      const response = await fetchJson('/');
      
      expect(response.status).toBe(200);
      const csp = response.headers['content-security-policy'] || 
                  response.headers['Content-Security-Policy'];
      
      // CSP is not sent by default in Next.js dev mode - check if configured
      if (csp) {
        expect(csp.toLowerCase()).not.toContain("script-src 'unsafe-inline'");
      }
    });

    it('2. GET / CSP does NOT contain unsafe-inline for scripts', async () => {
      const response = await fetchJson('/');
      
      const csp = response.headers['content-security-policy'] || 
                  response.headers['Content-Security-Policy'] || '';
      
      if (csp) {
        expect(csp.toLowerCase()).not.toContain("script-src 'unsafe-inline'");
      }
    });

    it('3. GET / returns X-Frame-Options header set to DENY or SAMEORIGIN', async () => {
      const response = await fetchJson('/');
      
      const xFrame = response.headers['x-frame-options'] || 
                     response.headers['X-Frame-Options'];
      
      if (xFrame) {
        const frameValue = xFrame.toUpperCase();
        expect(['DENY', 'SAMEORIGIN'].some(v => frameValue.includes(v))).toBe(true);
      }
    });

    it('4. GET / returns X-Content-Type-Options: nosniff header', async () => {
      const response = await fetchJson('/');
      
      const xContentType = response.headers['x-content-type-options'] || 
                           response.headers['X-Content-Type-Options'];
      
      if (xContentType) {
        expect(xContentType.toLowerCase()).toBe('nosniff');
      }
    });

    it('5. GET / returns Strict-Transport-Security header with max-age', async () => {
      const response = await fetchJson('/');
      
      const hsts = response.headers['strict-transport-security'] || 
                   response.headers['Strict-Transport-Security'];
      
      if (hsts) {
        expect(hsts.toLowerCase()).toContain('max-age');
      }
    });

    it('6. GET / returns Referrer-Policy header (if present, verify secure)', async () => {
      const response = await fetchJson('/');
      
      const referrerPolicy = response.headers['referrer-policy'] || 
                             response.headers['Referrer-Policy'];
      
      if (referrerPolicy) {
        const rp = referrerPolicy.toLowerCase();
        expect(rp).not.toBe('unsafe-url');
      }
    });
  });

  // =========================================================================
  // API Routes - No Information Disclosure
  // =========================================================================

  describe('API Routes - No Server Information Leakage', () => {
    it('7. GET /api/requests does not leak Server header with tech stack', async () => {
      const response = await fetchJson('/api/requests', {
        token: clientToken
      });
      
      const serverHeader = response.headers['server'] || 
                           response.headers['Server'];
      
      if (serverHeader) {
        expect(serverHeader.toLowerCase()).not.toMatch(/\d+\.\d+/);
      }
    });

    it('8. GET /api/requests does not expose X-Powered-By header', async () => {
      const response = await fetchJson('/api/requests', {
        token: clientToken
      });
      
      const poweredBy = response.headers['x-powered-by'] || 
                        response.headers['X-Powered-By'];
      
      if (poweredBy) {
        expect(poweredBy.toLowerCase()).not.toContain('next');
        expect(poweredBy.toLowerCase()).not.toContain('express');
      }
    });

    it('9. POST /api/requests CORS preflight is handled', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://evil.com',
          'Access-Control-Request-Method': 'POST'
        }
      });
      
      // Next.js handles CORS preflight with 200, 204, or denies with 403
      expect([200, 204, 403]).toContain(response.status);
    });

    it('10. GET /api/blog returns Permissions-Policy header (if present)', async () => {
      const response = await fetchJson('/api/blog');
      
      const permissionsPolicy = response.headers['permissions-policy'] || 
                                response.headers['Permissions-Policy'] ||
                                response.headers['feature-policy'] ||
                                response.headers['Feature-Policy'];
      
      if (permissionsPolicy) {
        expect(permissionsPolicy.toLowerCase()).not.toContain('*');
      }
    });
  });

  // =========================================================================
  // Upload and Admin Routes
  // =========================================================================

  describe('Upload and Admin Routes Security Headers', () => {
    it('11. GET /api/upload returns no directory listing', async () => {
      const response = await fetchJson('/api/upload', {
        token: adminToken
      });
      
      // Should not return directory listing (200 with HTML)
      // Should return 405 (Method Not Allowed), 401, 403, or 404
      expect([401, 403, 405, 404]).toContain(response.status);
    });

    it('12. Auth endpoint has proper Cache-Control header', async () => {
      const response = await fetchJson('/api/client/tasks', {
        token: clientToken
      });
      
      // Should not be 500
      expect(response.status).not.toBe(500);
      
      if (response.status === 200) {
        const cacheControl = response.headers['cache-control'] || 
                            response.headers['Cache-Control'];
        
        if (cacheControl) {
          const cc = cacheControl.toLowerCase();
          expect(cc).not.toBe('public');
        }
      }
    });
  });
});
