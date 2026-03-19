/**
 * @fileoverview Information Disclosure Security Tests - Live API
 * 
 * Tests information disclosure prevention.
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
  SQL_PAYLOADS 
} from './api-client';

describe('Security: Information Disclosure Prevention - Live API', () => {
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
  // SQL Error Leakage
  // =========================================================================

  describe('SQL Error Message Sanitization', () => {
    it('1. SQL error does not leak table names', async () => {
      const response = await fetchJson(`/api/requests?filter=${encodeURIComponent("' AND 1=1--")}`, {
        token: clientToken
      });
      
      const responseText = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      expect(responseText).not.toMatch(/table.*not found|unknown column/i);
      expect(responseText).not.toMatch(/relation.*does not exist/i);
    });

    it('2. SQL error does not leak database structure', async () => {
      const response = await fetchJson(`/api/blog?search=${encodeURIComponent("' UNION SELECT *--")}`);
      
      const responseText = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      expect(responseText).not.toMatch(/syntax error at or near/i);
      expect(responseText).not.toMatch(/pg_/i);
      expect(responseText).not.toMatch(/postgres/i);
    });

    it('3. SQL error does not leak column names', async () => {
      const response = await fetchJson(`/api/projects?search=${encodeURIComponent("' ORDER BY 999--")}`);
      
      const responseText = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      expect(responseText).not.toMatch(/column.*does not exist/i);
    });
  });

  // =========================================================================
  // Stack Trace Exposure
  // =========================================================================

  describe('Stack Trace Prevention', () => {
    it('4. Invalid JSON does not leak stack trace', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: '{ invalid json }'
      });
      
      const responseText = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      expect(responseText).not.toMatch(/at\s+/i);
      expect(responseText).not.toMatch(/Traceback/i);
      expect(responseText).not.toMatch(/Error:\s/);
    });

    it('5. Malformed request does not expose internal paths', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: null
      });
      
      const responseText = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      expect(responseText).not.toMatch(/\/app\/api\//i);
      expect(responseText).not.toMatch(/C:\\|D:\\/i);
      expect(responseText).not.toMatch(/src\//i);
    });
  });

  // =========================================================================
  // Version Disclosure
  // =========================================================================

  describe('Version Disclosure Prevention', () => {
    it('6. Server header does not expose detailed version', async () => {
      const response = await fetchJson('/api/blog');
      
      const serverHeader = response.headers?.server || '';
      expect(serverHeader).not.toMatch(/nextjs\s+\d+/i);
    });

    it('7. X-Powered-By header is not present', async () => {
      const response = await fetchJson('/api/blog');
      
      expect(response.headers?.['x-powered-by']).toBeUndefined();
      expect(response.headers?.['x-nextjs-cache']).toBeUndefined();
    });
  });

  // =========================================================================
  // Internal IP Disclosure
  // =========================================================================

  describe('Internal IP Disclosure Prevention', () => {
    it('8. Response does not contain internal IPs', async () => {
      const response = await fetchJson('/api/blog');
      
      const responseText = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      expect(responseText).not.toMatch(/\b192\.168\.\d{1,3}\.\d{1,3}\b/);
      expect(responseText).not.toMatch(/\b10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
      expect(responseText).not.toMatch(/\b172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}\b/);
    });
  });

  // =========================================================================
  // Generic Error Messages
  // =========================================================================

  describe('Generic Error Messages', () => {
    it('9. Invalid input returns generic error', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { name: 'A', email: 'invalid' }
      });
      
      if (response.status >= 400) {
        const errorMsg = typeof response.data === 'string' 
          ? response.data 
          : JSON.stringify(response.data);
        
        expect(errorMsg).not.toMatch(/database|supabase|query/i);
      }
    });

    it('10. Authentication failure returns generic message', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        token: 'invalid-token',
        body: { title: 'Test' }
      });
      
      expect(response.status).toBe(401);
      expect(response.data?.error).toBeDefined();
      expect(response.data?.error.toLowerCase()).not.toMatch(/token|jwt|signature/i);
    });
  });

  // =========================================================================
  // Debug Mode
  // =========================================================================

  describe('Debug Mode Prevention', () => {
    it('11. API does not expose debug information', async () => {
      const response = await fetchJson('/api/blog?debug=true');
      
      const responseText = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      expect(responseText).not.toMatch(/debug/i);
    });

    it('12. Environment variables are not leaked', async () => {
      const response = await fetchJson('/api/blog');
      
      const responseText = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      expect(responseText).not.toMatch(/process\.env/i);
      expect(responseText).not.toMatch(/\.env/i);
      expect(responseText).not.toMatch(/api_key|apikey|secret/i);
    });
  });
});
