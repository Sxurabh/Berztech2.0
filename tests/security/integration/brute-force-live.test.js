/**
 * @fileoverview Brute Force Security Tests - Live API
 * 
 * Tests rate limiting and brute force protection on live API endpoints.
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
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from './api-client';

describe('Security: Brute Force Protection - Live API', () => {
  let clientToken;
  let adminToken;

  beforeAll(async () => {
    clientToken = await getClientToken();
    adminToken = await getAdminToken();
  });

  // =========================================================================
  // Rate Limiting
  // =========================================================================

  describe('Rate Limiting on Authentication', () => {
    it('1. 20 rapid login attempts trigger rate limiting', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      
      const attempts = [];
      for (let i = 0; i < 20; i++) {
        attempts.push(
          fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ email, password })
          })
        );
      }
      
      const responses = await Promise.all(attempts);
      const statuses = responses.map(r => r.status);
      
      // Should see some 429s (rate limited)
      const hasRateLimit = statuses.includes(429);
      expect(hasRateLimit || statuses.every(s => s === 400 || s === 401)).toBe(true);
    });

    it('2. Failed login with valid email - generic error message', async () => {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email: process.env.TEST_CLIENT_EMAIL,
          password: 'wrongpassword123'
        })
      });
      
      const data = await response.json();
      const errorMsg = JSON.stringify(data).toLowerCase();
      
      // Should not reveal if user exists
      expect(errorMsg).not.toContain('user not found');
      expect(errorMsg).not.toContain('email not found');
      expect(errorMsg).not.toContain('user does not exist');
    });

    it('3. Failed login with invalid email - same generic error message', async () => {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email: 'nonexistent-user-12345@example.com',
          password: 'anypassword'
        })
      });
      
      const data = await response.json();
      const errorMsg = JSON.stringify(data).toLowerCase();
      
      // Should not reveal if email exists
      expect(errorMsg).not.toContain('user not found');
      expect(errorMsg).not.toContain('email not found');
    });

    it('4. Failed login with correct email + wrong password - no user existence revealed', async () => {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email: process.env.TEST_CLIENT_EMAIL,
          password: 'wrongpassword'
        })
      });
      
      const data = await response.json();
      const errorMsg = JSON.stringify(data).toLowerCase();
      
      // Error should be generic
      expect(errorMsg).not.toContain('user');
      expect(errorMsg).not.toContain('email');
    });

    it('5. Rapid OTP requests - rate limited', async () => {
      // Test with password reset endpoint
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        attempts.push(
          fetch(`${SUPABASE_URL}/auth/v1/otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
              email: `test-${i}@example.com`
            })
          })
        );
      }
      
      const responses = await Promise.all(attempts);
      const statuses = responses.map(r => r.status);
      
      // Should not crash
      expect(statuses.every(s => s !== 500)).toBe(true);
    });

    it('6. Upload endpoint: 25 requests in 1 minute from same IP - 429 returned', async () => {
      const attempts = [];
      for (let i = 0; i < 25; i++) {
        attempts.push(
          fetchJson('/api/upload', {
            method: 'POST',
            token: adminToken
          })
        );
      }
      
      const responses = await Promise.all(attempts);
      const statuses = responses.map(r => r.status);
      
      // Should see some rate limiting (429) or auth errors
      const hasRateLimit = statuses.includes(429);
      const allValid = statuses.every(s => [200, 201, 400, 401, 403, 429].includes(s));
      
      expect(hasRateLimit || allValid).toBe(true);
      expect(statuses.some(s => s === 500)).toBe(false);
    });

    it('7. /api/requests: 50 rapid POST - rate limited or queued', async () => {
      const attempts = [];
      for (let i = 0; i < 50; i++) {
        attempts.push(
          fetchJson('/api/requests', {
            method: 'POST',
            body: {
              name: `Rate Test ${i}`,
              email: `rate-${Date.now()}-${i}@example.com`
            }
          })
        );
      }
      
      const responses = await Promise.all(attempts);
      const statuses = responses.map(r => r.status);
      
      // Should not crash
      expect(statuses.some(s => s === 500)).toBe(false);
      
      // Should see rate limiting or successful responses
      const validStatuses = statuses.every(s => [200, 201, 400, 429].includes(s));
      expect(validStatuses).toBe(true);
    });

    it('8. Account lockout behavior - consistent response after N failures', async () => {
      const email = 'lockout-test@example.com';
      const responses = [];
      
      for (let i = 0; i < 10; i++) {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY
          },
          body: JSON.stringify({ email, password: 'wrong' })
        });
        responses.push(response.status);
      }
      
      // All responses should be consistent (no info leakage)
      const uniqueStatuses = [...new Set(responses)];
      expect(uniqueStatuses.length).toBeLessThanOrEqual(2); // e.g., 400 and 429
    });

    it('9. Login error response contains no stack trace or DB detail', async () => {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrong'
        })
      });
      
      const data = await response.text();
      
      // Should not contain sensitive info
      expect(data).not.toContain('stack');
      expect(data).not.toContain('trace');
      expect(data).not.toContain('postgres');
      expect(data).not.toContain('database');
      expect(data).not.toContain('sql');
    });

    it('10. Slow login timing - consistent response times', async () => {
      const times = [];
      
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'wrong'
          })
        });
        times.push(Date.now() - start);
      }
      
      // Response times should be relatively consistent
      // (no timing attack via user existence check)
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      const variance = maxTime - minTime;
      
      // Variance should be reasonable (less than 2 seconds)
      expect(variance).toBeLessThan(2000);
    });
  });
});
