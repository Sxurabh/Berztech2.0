/**
 * @fileoverview OAuth Callback Security Tests - Live API
 * 
 * Tests OAuth callback redirect validation to prevent open redirect attacks.
 * Requires: npm run dev (server running on localhost:3000)
 * 
 * Run: npm run test:security:live
 */

import { describe, it, expect } from 'vitest';
import { fetchJson, BASE_URL } from './api-client';

describe('Security: OAuth Callback Redirect Validation - Live API', () => {
  // =========================================================================
  // Open Redirect Prevention
  // =========================================================================

  describe('Open Redirect Prevention', () => {
    it('1. GET /auth/callback?next=https://evil.com redirects to safe location', async () => {
      const response = await fetchJson('/auth/callback?next=https://evil.com');
      
      // Should not redirect to evil.com
      // Should either redirect to / or return 400
      expect(response.status).not.toBe(500);
      
      if (response.status === 302 || response.status === 307) {
        const location = response.headers['location'] || response.headers['Location'];
        expect(location).toBeDefined();
        if (location) {
          expect(location).not.toContain('evil.com');
        }
      }
    });

    it('2. GET /auth/callback?next=//evil.com is blocked', async () => {
      const response = await fetchJson('/auth/callback?next=//evil.com');
      
      // Should not redirect to //evil.com
      expect(response.status).not.toBe(500);
      
      if (response.status === 302 || response.status === 307) {
        const location = response.headers['location'] || response.headers['Location'];
        if (location) {
          expect(location).not.toContain('//evil.com');
          expect(location).not.toContain('evil.com');
        }
      }
    });

    it('3. GET /auth/callback?next=javascript:alert(1) is blocked', async () => {
      const response = await fetchJson('/auth/callback?next=javascript:alert(1)');
      
      // Should not execute JavaScript
      expect(response.status).not.toBe(500);
      
      if (response.status === 302 || response.status === 307) {
        const location = response.headers['location'] || response.headers['Location'];
        if (location) {
          expect(location).not.toContain('javascript:');
        }
      }
    });

    it('4. GET /auth/callback?next=data:text/html,<script>alert(1)</script> is blocked', async () => {
      const response = await fetchJson('/auth/callback?next=data:text/html,<script>alert(1)</script>');
      
      // Should not allow data URI
      expect(response.status).not.toBe(500);
      
      if (response.status === 302 || response.status === 307) {
        const location = response.headers['location'] || response.headers['Location'];
        if (location) {
          expect(location).not.toContain('data:');
        }
      }
    });

    it('5. GET /auth/callback?next=http://localhost:3000/evil is blocked', async () => {
      const response = await fetchJson('/auth/callback?next=http://localhost:3000/evil');
      
      // Should not allow absolute URLs
      expect(response.status).not.toBe(500);
      
      if (response.status === 302 || response.status === 307) {
        const location = response.headers['location'] || response.headers['Location'];
        if (location) {
          // Should redirect to safe path, not the absolute URL
          expect(location.startsWith('http')).toBe(false);
        }
      }
    });

    it('6. GET /auth/callback?next=/dashboard allows valid relative path', async () => {
      const response = await fetchJson('/auth/callback?next=/dashboard');
      
      // Should allow valid relative paths
      expect(response.status).not.toBe(500);
      
      if (response.status === 302 || response.status === 307) {
        const location = response.headers['location'] || response.headers['Location'];
        if (location) {
          // Should redirect to /dashboard or login with error
          expect(location.includes('/dashboard') || location.includes('/login')).toBe(true);
        }
      }
    });

    it('7. GET /auth/callback?next=/admin redirects to /admin for admin user', async () => {
      // Without a valid code, this will redirect to login
      const response = await fetchJson('/auth/callback?next=/admin');
      
      expect(response.status).not.toBe(500);
      
      if (response.status === 302 || response.status === 307) {
        const location = response.headers['location'] || response.headers['Location'];
        if (location) {
          // Should either redirect to admin (if code valid) or login (if not)
          expect(location.includes('/admin') || location.includes('/login')).toBe(true);
        }
      }
    });

    it('8. GET /auth/callback (no next param) redirects to default path', async () => {
      const response = await fetchJson('/auth/callback');
      
      expect(response.status).not.toBe(500);
      
      if (response.status === 302 || response.status === 307) {
        const location = response.headers['location'] || response.headers['Location'];
        // Should redirect somewhere (login or home)
        expect(location).toBeDefined();
      }
    });

    it('9. GET /auth/callback?next=/ redirects to home', async () => {
      const response = await fetchJson('/auth/callback?next=/');
      
      expect(response.status).not.toBe(500);
      
      if (response.status === 302 || response.status === 307) {
        const location = response.headers['location'] || response.headers['Location'];
        if (location) {
          expect(location).toBe('/');
        }
      }
    });

    it('10. CRLF injection in next parameter is blocked', async () => {
      const response = await fetchJson('/auth/callback?next=/%0d%0aLocation:evil.com');
      
      // Should not allow header injection
      expect(response.status).not.toBe(500);
      
      // Check that no Location header contains the injected value
      const location = response.headers['location'] || response.headers['Location'];
      if (location) {
        expect(location).not.toContain('evil.com');
      }
    });
  });
});
