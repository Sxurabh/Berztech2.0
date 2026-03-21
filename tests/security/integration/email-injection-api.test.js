/**
 * @fileoverview Email Injection Security Tests - Live API
 * 
 * Tests email injection prevention on subscribe endpoint.
 * Requires: npm run dev (server running on localhost:3000)
 * 
 * Run: npm run test:security:live
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  fetchJson, 
  cleanupTestData,
  EMAIL_INJECTION_PAYLOADS,
  skipIfNoServer
} from './api-client';

describe.skipIf(skipIfNoServer)('Security: Email Injection Prevention - Live API', () => {
  beforeAll(async () => {
  }, 10000);

  afterAll(async () => {
  }, 10000);

  // =========================================================================
  // Newline Injection
  // =========================================================================

  describe('Email Newline Injection Prevention', () => {
    it('1. Email with newline CC header injection is handled', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: EMAIL_INJECTION_PAYLOADS.NEWLINE_CCF }
      });
      
      // Invalid email format rejected; returns 400
      expect(response.status).not.toBe(500);
      expect(response.status).toBe(400);
    });

    it('2. Email with CRLF BCC header injection is handled', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: EMAIL_INJECTION_PAYLOADS.NEWLINE_BCC }
      });
      
      expect(response.status).not.toBe(500);
      expect(response.status).toBe(400);
    });

    it('3. Email with URL encoded newlines is handled', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: EMAIL_INJECTION_PAYLOADS.URL_ENCODED }
      });
      
      expect(response.status).not.toBe(500);
      expect(response.status).toBe(400);
    });
  });

  // =========================================================================
  // SQL Injection via Email
  // =========================================================================

  describe('SQL Injection via Email Field', () => {
    it('4. Email with SQL injection is sanitized', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: EMAIL_INJECTION_PAYLOADS.SQL_INJECTION }
      });
      
      // Invalid email format rejected
      expect(response.status).not.toBe(500);
      expect(response.status).toBe(400);
      if (response.status === 201) {
        const email = response.data?.email || '';
        expect(email).not.toMatch(/DROP|DELETE|INSERT/i);
      }
    });

    it('5. Email with UNION SELECT attempt is handled', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: "test' UNION SELECT * FROM users--@test.com" }
      });
      
      expect(response.status).not.toBe(500);
      expect(response.status).toBe(400);
    });

    it('6. Email with OR 1=1 attempt is handled', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: "' OR '1'='1'@test.com" }
      });
      
      expect(response.status).not.toBe(500);
      expect(response.status).toBe(400);
    });
  });

  // =========================================================================
  // Format Validation
  // =========================================================================

  describe('Email Format Validation', () => {
    it('7. Email with multiple @ symbols is handled', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: EMAIL_INJECTION_PAYLOADS.MULTIPLE_AT }
      });
      
      expect(response.status).not.toBe(500);
      expect(response.status).toBe(400);
    });

    it('8. Empty local part is rejected', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: EMAIL_INJECTION_PAYLOADS.EMPTY_LOCAL }
      });
      
      expect(response.status).toBe(400);
    });

    it('9. Email without TLD is rejected', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: EMAIL_INJECTION_PAYLOADS.NO_TLD }
      });
      
      expect(response.status).toBe(400);
    });

    it('10. Email with double dots is handled', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: EMAIL_INJECTION_PAYLOADS.DOUBLE_DOT }
      });
      
      // Depends on Zod behavior: double dots may pass or fail
      expect(response.status).not.toBe(500);
      expect([200, 201, 400]).toContain(response.status);
    });
  });

  // =========================================================================
  // Additional Attack Vectors
  // =========================================================================

  describe('Additional Email Attack Vectors', () => {
    it('11. Very long email is handled', async () => {
      const longEmail = 'a'.repeat(500) + '@test.com';
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: longEmail }
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 201, 400]).toContain(response.status);
    });

    it('12. Email with special characters is validated', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: 'test+filter@example.com' }
      });
      
      // Valid email with +filter; should succeed
      expect([200, 201]).toContain(response.status);
    });

    it('13. Email with quotes is handled', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: '"test"@example.com' }
      });
      
      // Quoted emails may pass Zod or fail depending on implementation
      expect(response.status).not.toBe(500);
      expect([200, 201, 400]).toContain(response.status);
    });

    it('14. Email with IP address domain is handled', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: 'test@[192.168.1.1]' }
      });
      
      expect(response.status).not.toBe(500);
      expect([200, 201, 400]).toContain(response.status);
    });

    it('15. Email with null byte is handled', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: 'test@x' + String.fromCharCode(0) + 'example.com' }
      });
      
      // Null byte in email should be rejected
      expect(response.status).not.toBe(500);
      expect([400, 500]).toContain(response.status);
    });
  });

  // =========================================================================
  // Response Leakage
  // =========================================================================

  describe('Email in Response', () => {
    it('16. Email validation error does not leak format', async () => {
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: 'invalid-email' }
      });
      
      expect(response.status).toBe(400);
      const errorMsg = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      expect(errorMsg).not.toMatch(/@/);
    });

    it('17. Successful subscription does not expose email', async () => {
      const uniqueEmail = `unique-${Date.now()}-${Math.random()}@test.com`;
      const response = await fetchJson('/api/subscribe', {
        method: 'POST',
        body: { email: uniqueEmail }
      });
      
      const responseText = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      expect(responseText).not.toContain(uniqueEmail);
    });
  });
});
