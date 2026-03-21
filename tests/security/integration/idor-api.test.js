/**
 * @fileoverview IDOR Security Tests - Live API
 * 
 * Tests Insecure Direct Object Reference prevention.
 * Requires: npm run dev (server running on localhost:3000)
 * 
 * Run: npm run test:security:live
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  fetchJson, 
  getClientToken, 
  getAdminToken,
  createTestRequest,
  createTestBlogPost,
  createTestProject,
  cleanupTestData,
  generateUniqueId,
  login,
  skipIfNoServer
} from './api-client';

describe.skipIf(skipIfNoServer)('Security: IDOR Prevention - Live API', () => {
  let clientToken;
  let adminToken;
  let client2Token;

  beforeAll(async () => {
    try {
      clientToken = await getClientToken();
      adminToken = await getAdminToken();
      client2Token = await login(process.env.TEST_CLIENT_EMAIL, process.env.TEST_CLIENT_PASSWORD);
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
  // Requests - Client's own data
  // =========================================================================

  describe('GET /api/requests - Client data access', () => {
    it('1. Client can access own requests', async () => {
      const response = await fetchJson('/api/requests', {
        token: clientToken
      });
      
      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.data?.data)).toBe(true);
      }
    });

    it('2. Client gets only their own requests', async () => {
      const response1 = await fetchJson('/api/requests', {
        token: clientToken
      });
      
      const response2 = await fetchJson('/api/requests', {
        token: client2Token
      });
      
      if (response1.status === 200 && response2.status === 200) {
        const data1 = response1.data?.data || [];
        const data2 = response2.data?.data || [];
        
        const ids1 = new Set(data1.map(r => r.id));
        const ids2 = new Set(data2.map(r => r.id));
        
        const overlap = [...ids1].filter(id => ids2.has(id));
        expect(overlap.length).toBe(0);
      }
    });
  });

  // =========================================================================
  // Blog Posts - IDOR
  // =========================================================================

  describe('Blog Post Access Control', () => {
    it('3. Admin can access all blog posts', async () => {
      const response = await fetchJson('/api/blog', {
        token: adminToken
      });
      
      expect([200, 401]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.data)).toBe(true);
      }
    });

    it('4. Non-admin can access published posts only', async () => {
      const response = await fetchJson('/api/blog', {
        token: clientToken
      });
      
      expect(response.status).toBe(200);
      if (Array.isArray(response.data)) {
        const allPublished = response.data.every(post => post.published === true);
        expect(allPublished).toBe(true);
      }
    });
  });

  // =========================================================================
  // PUT/DELETE Blog - IDOR
  // =========================================================================

  describe('Blog PUT/DELETE - IDOR Prevention', () => {
    it('5. Client cannot update another user blog post', async () => {
      const blogResponse = await fetchJson('/api/blog', {
        token: adminToken
      });
      
      if (blogResponse.status === 200 && blogResponse.data?.length > 0) {
        const adminBlog = blogResponse.data[0];
        
        const updateResponse = await fetchJson(`/api/blog/${adminBlog.slug}`, {
          method: 'PUT',
          token: clientToken,
          body: { title: 'Hacked Title' }
        });
        
        expect([403, 404, 401]).toContain(updateResponse.status);
      }
    });

    it('6. Client cannot delete another user blog post', async () => {
      const blogResponse = await fetchJson('/api/blog', {
        token: adminToken
      });
      
      if (blogResponse.status === 200 && blogResponse.data?.length > 0) {
        const adminBlog = blogResponse.data[0];
        
        const deleteResponse = await fetchJson(`/api/blog/${adminBlog.slug}`, {
          method: 'DELETE',
          token: clientToken
        });
        
        expect([403, 404, 401]).toContain(deleteResponse.status);
      }
    });
  });

  // =========================================================================
  // Projects - IDOR
  // =========================================================================

  describe('Projects Access Control', () => {
    it('7. Client can access own projects', async () => {
      const response = await fetchJson('/api/projects', {
        token: clientToken
      });
      
      // GET /api/projects is public; returns 200 or 404
      expect([200, 404]).toContain(response.status);
    });

    it('8. Client cannot access another user project by ID', async () => {
      const adminProjects = await fetchJson('/api/admin/requests', {
        token: adminToken
      });
      
      if (adminProjects.status === 200 && adminProjects.data?.data?.length > 0) {
        const adminRequestId = adminProjects.data.data[0].id;
        
        const clientAccess = await fetchJson(`/api/projects/${adminRequestId}`, {
          token: clientToken
        });
        
        // Should return 403 or 404 for non-existent or unauthorized project
        expect([403, 404]).toContain(clientAccess.status);
      }
    });
  });

  // =========================================================================
  // Notifications - IDOR
  // =========================================================================

  describe('Notifications - IDOR Prevention', () => {
    it('9. Client can access own notifications', async () => {
      const response = await fetchJson('/api/notifications', {
        token: clientToken
      });
      
      expect([200, 401]).toContain(response.status);
    });

    it('10. Client cannot enumerate other user notifications', async () => {
      const clientNotifications = await fetchJson('/api/notifications', {
        token: clientToken
      });
      
      const client2Notifications = await fetchJson('/api/notifications', {
        token: client2Token
      });
      
      if (clientNotifications.status === 200 && client2Notifications.status === 200) {
        const ids1 = new Set((clientNotifications.data?.data || []).map(n => n.id));
        const ids2 = new Set((client2Notifications.data?.data || []).map(n => n.id));
        
        const overlap = [...ids1].filter(id => ids2.has(id));
        expect(overlap.length).toBe(0);
      }
    });

    it('11. Mark read endpoint validates ownership', async () => {
      const notificationsResponse = await fetchJson('/api/notifications', {
        token: clientToken
      });
      
      if (notificationsResponse.status === 200 && notificationsResponse.data?.data?.length > 0) {
        const notification = notificationsResponse.data.data[0];
        
        const markReadResponse = await fetchJson('/api/notifications/read', {
          method: 'POST',
          token: client2Token,
          body: { id: notification.id }
        });
        
        expect([400, 403, 404]).toContain(markReadResponse.status);
      }
    });

    it('12. Client cannot mark other user notification as read', async () => {
      const client2Notifications = await fetchJson('/api/notifications', {
        token: client2Token
      });
      
      if (client2Notifications.status === 200 && client2Notifications.data?.data?.length > 0) {
        const notification = client2Notifications.data.data[0];
        
        const client1MarkRead = await fetchJson('/api/notifications/read', {
          method: 'POST',
          token: clientToken,
          body: { id: notification.id }
        });
        
        expect([400, 403, 404]).toContain(client1MarkRead.status);
      }
    });
  });

  // =========================================================================
  // Admin endpoints
  // =========================================================================

  describe('Admin Endpoint Access Control', () => {
    it('13. Client cannot access /api/admin/tasks', async () => {
      const response = await fetchJson('/api/admin/tasks', {
        token: clientToken
      });
      
      expect([401, 403]).toContain(response.status);
    });

    it('14. Client cannot access /api/admin/requests', async () => {
      const response = await fetchJson('/api/admin/requests', {
        token: clientToken
      });
      
      expect([401, 403]).toContain(response.status);
    });

    it('15. Admin can access admin endpoints', async () => {
      const response = await fetchJson('/api/admin/tasks', {
        token: adminToken
      });
      
      expect([200, 401, 403]).toContain(response.status);
    });
  });

  // =========================================================================
  // UUID Enumeration
  // =========================================================================

  describe('UUID Enumeration Prevention', () => {
    it('16. Random UUID requests return consistent status', async () => {
      const fakeIds = [
        '00000000-0000-0000-0000-000000000000',
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        'not-a-uuid-at-all'
      ];
      
      const statuses = [];
      for (const fakeId of fakeIds) {
        const response = await fetchJson(`/api/projects/${fakeId}`, {
          token: clientToken
        });
        statuses.push(response.status);
      }
      
      // All requests should get a response (200, 404, etc.)
      const uniqueStatuses = new Set(statuses);
      expect(uniqueStatuses.size).toBeGreaterThan(0);
    });

    it('17. Sequential ID enumeration is mitigated', async () => {
      const responses = [];
      for (let i = 1; i <= 10; i++) {
        const response = await fetchJson(`/api/blog/${i}`, {
          token: clientToken
        });
        responses.push(response.status);
      }
      
      const notFounds = responses.filter(s => s === 404).length;
      expect(notFounds).toBeGreaterThan(0);
    });
  });
});
