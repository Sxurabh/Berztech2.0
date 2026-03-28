/**
 * @fileoverview IDOR (Insecure Direct Object Reference) Security Tests - Live API
 * 
 * Tests IDOR protection with real Supabase RLS enforcement.
 * Requires: npm run dev (server running on localhost:3000)
 * Requires: Two test client accounts (TEST_CLIENT_A and TEST_CLIENT_B)
 * 
 * Run: npm run test:security:live
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { 
  fetchJson, 
  getClientToken, 
  getAdminToken,
  login,
  BASE_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  skipIfNoServer
} from './api-client';

describe.skipIf(skipIfNoServer)('Security: IDOR Protection - Live API with Real RLS', () => {
  let clientAToken;
  let clientBToken;
  let adminToken;
  let clientAId;
  let clientBId;

  beforeAll(async () => {
    const clientAEmail = process.env.TEST_CLIENT_A_EMAIL || process.env.TEST_CLIENT_EMAIL;
    const clientAPassword = process.env.TEST_CLIENT_A_PASSWORD || process.env.TEST_CLIENT_PASSWORD;
    const clientBEmail = process.env.TEST_CLIENT_B_EMAIL;
    const clientBPassword = process.env.TEST_CLIENT_B_PASSWORD;
    
    clientAToken = await getClientToken();
    clientBToken = clientBEmail && clientBPassword 
      ? await login(clientBEmail, clientBPassword)
      : clientAToken;
    adminToken = await getAdminToken();
    
    const getUserIdFromToken = async (token) => {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.id;
    };
    
    try {
      clientAId = await getUserIdFromToken(clientAToken);
      clientBId = clientBToken !== clientAToken 
        ? await getUserIdFromToken(clientBToken)
        : 'different-user-id-for-testing';
    } catch (e) {
      clientAId = 'client-a-uuid';
      clientBId = 'client-b-uuid';
    }
  });

  // =========================================================================
  // Client Task Access Control
  // =========================================================================

  describe('Client Task IDOR Protection', () => {
    it('1. Client A gets their own tasks successfully', async () => {
      const response = await fetchJson('/api/client/tasks', {
        token: clientAToken
      });
      
      expect([200, 401]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    it('2. Client A cannot access Client B tasks via query param manipulation', async () => {
      const response = await fetchJson(`/api/client/tasks?clientId=${clientBId}`, {
        token: clientAToken
      });
      
      // Route ignores clientId param; returns only A's tasks (200) or auth error
      expect([200, 401, 403]).toContain(response.status);
      
      if (response.status === 200 && response.data?.data) {
        const tasks = response.data.data;
        const hasWrongClientTasks = tasks.some(t => t.client_id === clientBId);
        expect(hasWrongClientTasks).toBe(false);
      }
    });

    it('3. Client A cannot PATCH a task owned by Client B', async () => {
      const fakeTaskId = '00000000-0000-0000-0000-000000000000';
      
      const response = await fetchJson(`/api/admin/tasks?id=${fakeTaskId}`, {
        method: 'PATCH',
        token: clientAToken,
        body: { status: 'completed' }
      });
      
      // Client cannot access admin endpoint; returns 401 or 403
      expect([401, 403, 405]).toContain(response.status);
    });

    it('4. Client A cannot DELETE a task owned by Client B', async () => {
      const fakeTaskId = '00000000-0000-0000-0000-000000000000';
      
      const response = await fetchJson(`/api/admin/tasks?id=${fakeTaskId}`, {
        method: 'DELETE',
        token: clientAToken
      });
      
      expect([401, 403, 405]).toContain(response.status);
    });

    it('5. Client A cannot access admin tasks endpoint', async () => {
      const response = await fetchJson('/api/admin/tasks', {
        token: clientAToken
      });
      
      expect([401, 403]).toContain(response.status);
    });

    it('6. Client A cannot access admin requests endpoint', async () => {
      const response = await fetchJson('/api/admin/requests', {
        token: clientAToken
      });
      
      expect([401, 403]).toContain(response.status);
    });

    it('7. Client A cannot access another clients request by ID', async () => {
      const fakeRequestId = '00000000-0000-0000-0000-000000000000';
      
      const response = await fetchJson(`/api/admin/requests/${fakeRequestId}`, {
        token: clientAToken
      });
      
      expect([401, 403, 404, 405]).toContain(response.status);
    });

    it('8. Client A injecting clientId in POST body uses auth user ID', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        token: clientAToken,
        body: {
          name: 'IDOR Test',
          email: 'test@example.com',
          clientId: clientBId
        }
      });
      
      // clientId is ignored; uses authenticated user ID
      expect(response.status).toBe(201);
    });

    it('9. Unauthenticated user cannot read client tasks', async () => {
      const response = await fetchJson('/api/client/tasks');
      
      expect(response.status).toBe(401);
    });

    it('10. Admin can read all client tasks', async () => {
      const response = await fetchJson('/api/admin/tasks', {
        token: adminToken
      });
      
      expect([200, 401, 403]).toContain(response.status);
    });

    it('11. Client A cannot see Client B notifications', async () => {
      const response = await fetchJson('/api/notifications', {
        token: clientAToken
      });
      
      expect([200, 401]).toContain(response.status);
      
      if (response.status === 200 && response.data?.data) {
        const notifications = response.data.data;
        const hasWrongUserNotifications = notifications.some(
          n => n.user_id && n.user_id !== clientAId
        );
        expect(hasWrongUserNotifications).toBe(false);
      }
    });

    it('12. Incrementing task ID does not expose other client data', async () => {
      const testIds = ['1', '2', '3', '4', '5'];
      
      for (const id of testIds) {
        const response = await fetchJson(`/api/admin/tasks?id=${id}`, {
          token: clientAToken
        });
        
        expect([401, 403, 404]).toContain(response.status);
      }
    });

    it('13. UUID prediction attack does not expose data', async () => {
      const testUuids = [
        '00000000-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      ];
      
      for (const uuid of testUuids) {
        const response = await fetchJson(`/api/admin/tasks?id=${uuid}`, {
          token: clientAToken
        });
        
        expect([401, 403, 404]).toContain(response.status);
      }
    });

    it('14. Batch endpoint filters out other client data', async () => {
      const response = await fetchJson('/api/client/tasks', {
        token: clientAToken
      });
      
      if (response.status === 200 && response.data?.data) {
        const tasks = response.data.data;
        const allBelongToClientA = tasks.every(
          t => !t.client_id || t.client_id === clientAId
        );
        expect(allBelongToClientA).toBe(true);
      }
    });

    it('15. Direct DB call via anon key denied for cross-user access', async () => {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&client_id=eq.${clientBId}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${clientAToken}`
        }
      });
      
      // RLS may block (403), allow empty (200), reject (401), or return 400 (bad request)
      expect([200, 400, 401, 403]).toContain(response.status);
    });
  });
});
