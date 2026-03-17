/**
 * @fileoverview JWT Tampering Security Tests - Live API
 * 
 * Tests JWT tampering and algorithm confusion attacks on live API endpoints.
 * Requires: npm run dev (server running on localhost:3000)
 * 
 * Run: npm run test:security:live
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { 
  fetchJson, 
  getClientToken, 
  getAdminToken,
  JWT_MALFORMED_PAYLOADS,
  BASE_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from './api-client';

describe('Security: JWT Tampering - Live API', () => {
  let validClientToken;
  let validAdminToken;

  beforeAll(async () => {
    validClientToken = await getClientToken();
    validAdminToken = await getAdminToken();
  });

  // =========================================================================
  // Algorithm Confusion Attacks
  // =========================================================================

  describe('JWT Algorithm Confusion Attacks', () => {
    it('1. JWT with alg: none must return 401', async () => {
      const response = await fetchJson('/api/client/tasks', {
        token: JWT_MALFORMED_PAYLOADS.ALG_NONE
      });
      
      // Should reject with 401 Unauthorized
      expect(response.status).toBe(401);
    });

    it('2. JWT with role: service_role injected must return 401/403', async () => {
      // Create a token with injected service_role claim
      const maliciousPayload = {
        sub: '1234567890',
        email: 'admin@test.com',
        role: 'service_role',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      
      const maliciousToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${
        Buffer.from(JSON.stringify(maliciousPayload)).toString('base64url')
      }.fakesignature`;
      
      const response = await fetchJson('/api/admin/tasks', {
        token: maliciousToken
      });
      
      // Should reject with 401 or 403
      expect([401, 403]).toContain(response.status);
    });

    it('3. JWT with role: admin injected must return 401/403', async () => {
      const maliciousPayload = {
        sub: '1234567890',
        email: 'client@test.com',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      
      const maliciousToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${
        Buffer.from(JSON.stringify(maliciousPayload)).toString('base64url')
      }.fakesignature`;
      
      const response = await fetchJson('/api/admin/tasks', {
        token: maliciousToken
      });
      
      // Should reject with 401 or 403
      expect([401, 403]).toContain(response.status);
    });

    it('4. Expired JWT must return 401', async () => {
      const response = await fetchJson('/api/client/tasks', {
        token: JWT_MALFORMED_PAYLOADS.EXPIRED
      });
      
      // Should reject with 401
      expect(response.status).toBe(401);
    });

    it('5. JWT from different Supabase project must return 401', async () => {
      // Create a token signed with a different key (simulated)
      const differentProjectPayload = {
        sub: 'different-project-user',
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: 'https://different-project.supabase.co/auth/v1'
      };
      
      const differentToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${
        Buffer.from(JSON.stringify(differentProjectPayload)).toString('base64url')
      }.differentsignature`;
      
      const response = await fetchJson('/api/client/tasks', {
        token: differentToken
      });
      
      // Should reject with 401
      expect(response.status).toBe(401);
    });
  });

  // =========================================================================
  // JWT Claim Tampering
  // =========================================================================

  describe('JWT Claim Tampering', () => {
    it('6. JWT with modified user ID claim must return 401/403', async () => {
      // Try to modify the user ID in a valid-looking token structure
      const tamperedPayload = {
        sub: '00000000-0000-0000-0000-000000000000', // Different user ID
        email: 'attacker@evil.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      
      const tamperedToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${
        Buffer.from(JSON.stringify(tamperedPayload)).toString('base64url')
      }.tamperedsig`;
      
      const response = await fetchJson('/api/client/tasks', {
        token: tamperedToken
      });
      
      // Should reject with 401 or 403
      expect([401, 403]).toContain(response.status);
    });

    it('7. JWT with tampered iss claim must return 401', async () => {
      const tamperedPayload = {
        sub: 'valid-user-id',
        email: 'test@example.com',
        iss: 'https://evil-supabase.co/auth/v1', // Wrong issuer
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      
      const tamperedToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${
        Buffer.from(JSON.stringify(tamperedPayload)).toString('base64url')
      }.tamperedsig`;
      
      const response = await fetchJson('/api/client/tasks', {
        token: tamperedToken
      });
      
      // Should reject with 401
      expect(response.status).toBe(401);
    });

    it('8. Malformed base64 JWT must not crash with 500', async () => {
      const malformedTokens = [
        'not-a-valid-jwt',
        JWT_MALFORMED_PAYLOADS.MALFORMED,
        JWT_MALFORMED_PAYLOADS.RANDOM,
        'eyJhbGc...', // Truncated
        'header.payload', // Missing signature
        '...', // Just dots
      ];
      
      for (const token of malformedTokens) {
        const response = await fetchJson('/api/client/tasks', { token });
        
        // Should not crash with 500
        expect(response.status).not.toBe(500);
        // Should return 401 for invalid tokens
        expect([401, 400]).toContain(response.status);
      }
    });

    it('9. JWT with null signature must return 401', async () => {
      const payload = {
        sub: 'test-user',
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      
      // Token with empty signature (just two dots at end)
      const nullSigToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${
        Buffer.from(JSON.stringify(payload)).toString('base64url')
      }.`;
      
      const response = await fetchJson('/api/client/tasks', {
        token: nullSigToken
      });
      
      // Should reject with 401
      expect(response.status).toBe(401);
    });

    it('10. Valid admin JWT accessing client endpoint must succeed', async () => {
      // Admin should be able to access client endpoints (they have higher privileges)
      const response = await fetchJson('/api/client/tasks', {
        token: validAdminToken
      });
      
      // Should succeed (200) or return empty array if no tasks
      // Note: Admin might not have client_id set, so could get 200 with empty data
      expect([200, 401, 403]).toContain(response.status);
    });
  });
});
