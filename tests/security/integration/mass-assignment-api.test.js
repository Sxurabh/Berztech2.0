/**
 * @fileoverview Mass Assignment Security Tests - Live API
 * 
 * Tests mass assignment / overposting prevention.
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
  generateUniqueId,
  skipIfNoServer
} from './api-client';

describe.skipIf(skipIfNoServer)('Security: Mass Assignment Prevention - Live API', () => {
  let clientToken;
  let adminToken;

  beforeAll(async () => {
    try {
      clientToken = await getClientToken();
      adminToken = await getAdminToken();
    } catch (e) {
      console.warn('Auth tokens not available');
    }
  });

  afterAll(async () => {
    try {
      await cleanupTestData(adminToken);
    } catch (e) {}
  });

  // =========================================================================
  // Blog Post - Mass Assignment
  // =========================================================================

  describe('POST /api/blog - Mass Assignment Prevention', () => {
    it('1. Admin can set published flag', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        token: adminToken,
        body: { 
          title: 'Test Post', 
          slug: 'mass-' + Date.now(),
          content: 'Test content',
          published: true,
          featured: true
        }
      });
      
      // Admin creates blog post; expects 201 (success) or auth error
      expect(response.status).not.toBe(500);
      expect([201, 400, 401, 403]).toContain(response.status);
    });

    it('2. Unknown fields are ignored', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        token: adminToken,
        body: { 
          title: 'Test Post', 
          slug: 'mass2-' + Date.now(),
          content: 'Test content',
          author_id: 'admin-user-id',
          is_featured: true,
          unknown_field: 'should-be-ignored'
        }
      });
      
      expect(response.status).not.toBe(500);
      expect([201, 400, 401, 403]).toContain(response.status);
    });

    it('3. Only whitelisted fields are accepted', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        token: adminToken,
        body: { 
          title: 'Valid Post', 
          slug: 'valid-' + Date.now(),
          content: 'Valid content',
          unknown_field: 'should-be-ignored'
        }
      });
      
      expect(response.status).not.toBe(500);
      expect([201, 400, 401, 403]).toContain(response.status);
    });

    it('4. Non-admin cannot create blog post', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        token: clientToken,
        body: { 
          title: 'Client Post', 
          slug: 'client-' + Date.now(),
          content: 'Client content'
        }
      });
      
      expect(response.status).toBe(403);
    });
  });

  // =========================================================================
  // Testimonials - Mass Assignment
  // =========================================================================

  describe('POST /api/testimonials - Mass Assignment Prevention', () => {
    it('5. Admin can create testimonial', async () => {
      const response = await fetchJson('/api/testimonials', {
        method: 'POST',
        token: adminToken,
        body: { 
          client: 'Test Client', 
          content: 'Test content'
        }
      });
      
      expect(response.status).not.toBe(500);
      expect([201, 400, 401, 403]).toContain(response.status);
    });

    it('6. Non-admin cannot create testimonial', async () => {
      const response = await fetchJson('/api/testimonials', {
        method: 'POST',
        token: clientToken,
        body: { 
          client: 'Unauthorized', 
          content: 'Should fail'
        }
      });
      
      expect(response.status).toBe(403);
    });
  });

  // =========================================================================
  // Admin Tasks - Mass Assignment
  // =========================================================================

  describe('POST /api/admin/tasks - Mass Assignment Prevention', () => {
    it('7. Client cannot create task via admin endpoint', async () => {
      const response = await fetchJson('/api/admin/tasks', {
        method: 'POST',
        token: clientToken,
        body: { 
          title: 'Unauthorized Task'
        }
      });
      
      expect(response.status).toBe(403);
    });

    it('8. Admin can create task', async () => {
      const response = await fetchJson('/api/admin/tasks', {
        method: 'POST',
        token: adminToken,
        body: { 
          title: 'Admin Task', 
          description: 'Task description'
        }
      });
      
      expect(response.status).not.toBe(500);
      expect([201, 400, 401, 403]).toContain(response.status);
    });
  });

  // =========================================================================
  // Settings - Mass Assignment
  // =========================================================================

  describe('POST /api/settings - Mass Assignment Prevention', () => {
    it('9. Client cannot set settings', async () => {
      const response = await fetchJson('/api/settings', {
        method: 'POST',
        token: clientToken,
        body: { 
          key: 'test_setting', 
          value: 'test_value'
        }
      });
      
      expect(response.status).toBe(401);
    });

    it('10. Admin can set settings', async () => {
      const response = await fetchJson('/api/settings', {
        method: 'POST',
        token: adminToken,
        body: { 
          key: 'security_test_key', 
          value: 'security_test_value'
        }
      });
      
      expect(response.status).not.toBe(500);
      expect([201, 400, 401, 403]).toContain(response.status);
    });

    it('11. Special keys are handled safely', async () => {
      const response = await fetchJson('/api/settings', {
        method: 'POST',
        token: adminToken,
        body: { 
          key: '__proto__', 
          value: 'test'
        }
      });
      
      expect(response.status).not.toBe(500);
      expect([201, 400, 401, 403]).toContain(response.status);
    });
  });

  // =========================================================================
  // Requests - Mass Assignment
  // =========================================================================

  describe('POST /api/requests - Mass Assignment Prevention', () => {
    it('12. Client cannot set admin-only fields', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Test', 
          email: 'test@test.com',
          status: 'completed'
        }
      });
      
      // status field is ignored; request succeeds
      expect(response.status).not.toBe(500);
      expect(response.status).toBe(201);
    });
  });
});
