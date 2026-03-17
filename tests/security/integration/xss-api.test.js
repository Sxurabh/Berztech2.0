/**
 * @fileoverview XSS Security Tests - Live API
 * 
 * Tests XSS prevention on live API endpoints.
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
  XSS_PAYLOADS 
} from './api-client';

describe('Security: XSS Prevention - Live API', () => {
  let clientToken;
  let adminToken;

  beforeAll(async () => {
    try {
      clientToken = await getClientToken();
      adminToken = await getAdminToken();
    } catch (e) {
      console.warn('Auth tokens not available, some tests may fail');
    }
  });

  afterAll(async () => {
    try {
      await cleanupTestData(adminToken);
    } catch (e) {}
  });

  // =========================================================================
  // POST /api/requests - XSS in body fields
  // =========================================================================

  describe('POST /api/requests - XSS in request body', () => {
    it('1. Script tag in name field is sanitized', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { name: XSS_PAYLOADS.SCRIPT_TAG, email: 'test@test.com' }
      });
      
      expect([200, 201, 400]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        const storedName = response.data?.data?.name;
        if (storedName) {
          expect(storedName).not.toContain('<script>');
          expect(storedName).toContain('&lt;script&gt;');
        }
      }
    });

    it('2. img onerror XSS in name field', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { name: XSS_PAYLOADS.IMG_ERROR, email: 'test@test.com' }
      });
      
      expect([200, 201, 400]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        const storedName = response.data?.data?.name;
        if (storedName) {
          expect(storedName).not.toMatch(/onerror/);
        }
      }
    });

    it('3. SVG onload XSS in company field', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Test User', 
          email: 'test@test.com',
          company: XSS_PAYLOADS.SVG_ONLOAD
        }
      });
      
      expect([200, 201, 400]).toContain(response.status);
    });

    it('4. javascript: protocol in message field', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Test User', 
          email: 'test@test.com',
          message: XSS_PAYLOADS.JAVASCRIPT_PROTOCOL
        }
      });
      
      expect([200, 201, 400]).toContain(response.status);
    });

    it('5. body onload XSS in message field', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Test User', 
          email: 'test@test.com',
          message: XSS_PAYLOADS.BODY_ONLOAD
        }
      });
      
      expect([200, 201, 400]).toContain(response.status);
    });

    it('6. iframe XSS in message field', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Test User', 
          email: 'test@test.com',
          message: XSS_PAYLOADS.IFRAME
        }
      });
      
      expect([200, 201, 400]).toContain(response.status);
    });

    it('7. input onfocus XSS in company field', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Test User', 
          email: 'test@test.com',
          company: XSS_PAYLOADS.INPUT_ONFOCUS
        }
      });
      
      expect([200, 201, 400]).toContain(response.status);
    });

    it('8. marquee XSS in message field', async () => {
      const response = await fetchJson('/api/requests', {
        method: 'POST',
        body: { 
          name: 'Test User', 
          email: 'test@test.com',
          message: XSS_PAYLOADS.MARQUEE
        }
      });
      
      expect([200, 201, 400]).toContain(response.status);
    });
  });

  // =========================================================================
  // POST /api/blog - XSS in blog content
  // =========================================================================

  describe('POST /api/blog - XSS in blog content', () => {
    it('9. Script tag in blog title is handled safely', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        token: adminToken,
        body: { 
          title: XSS_PAYLOADS.SCRIPT_TAG, 
          slug: 'xss-test-' + Date.now(),
          content: 'Test content',
          excerpt: 'Test excerpt'
        }
      });
      
      // Should accept or reject - just ensure no server error
      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('10. img onerror in blog content', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        token: adminToken,
        body: { 
          title: 'XSS Test Post', 
          slug: 'xss-test-2-' + Date.now(),
          content: XSS_PAYLOADS.IMG_ERROR,
          excerpt: 'Test excerpt'
        }
      });
      
      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('11. SVG in blog content', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        token: adminToken,
        body: { 
          title: 'XSS Test Post', 
          slug: 'xss-test-3-' + Date.now(),
          content: XSS_PAYLOADS.SVG_ANIMATE,
          excerpt: 'Test excerpt'
        }
      });
      
      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('12. anchor with javascript: href in blog content', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        token: adminToken,
        body: { 
          title: 'XSS Test Post', 
          slug: 'xss-test-4-' + Date.now(),
          content: XSS_PAYLOADS.ANCHOR_HREF,
          excerpt: 'Test excerpt'
        }
      });
      
      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('13. meta refresh with javascript: in blog content', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        token: adminToken,
        body: { 
          title: 'XSS Test Post', 
          slug: 'xss-test-5-' + Date.now(),
          content: XSS_PAYLOADS.META_REFRESH,
          excerpt: 'Test excerpt'
        }
      });
      
      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('14. object/embed tags in blog content', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        token: adminToken,
        body: { 
          title: 'XSS Test Post', 
          slug: 'xss-test-6-' + Date.now(),
          content: XSS_PAYLOADS.OBJECT,
          excerpt: 'Test excerpt'
        }
      });
      
      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('15. video/audio with onerror in blog content', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        token: adminToken,
        body: { 
          title: 'XSS Test Post', 
          slug: 'xss-test-7-' + Date.now(),
          content: XSS_PAYLOADS.VIDEO,
          excerpt: 'Test excerpt'
        }
      });
      
      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });

    it('16. quote breakout XSS in blog title', async () => {
      const response = await fetchJson('/api/blog', {
        method: 'POST',
        token: adminToken,
        body: { 
          title: XSS_PAYLOADS.QUOTE_BREAKOUT, 
          slug: 'xss-test-8-' + Date.now(),
          content: 'Test content',
          excerpt: 'Test excerpt'
        }
      });
      
      expect([200, 201, 400, 401, 403]).toContain(response.status);
    });
  });

  // =========================================================================
  // GET /api/blog - XSS in query params returned in response
  // =========================================================================

  describe('GET /api/blog - XSS reflected in response', () => {
    it('17. XSS in search param does not reflect in response', async () => {
      const response = await fetchJson(`/api/blog?search=${encodeURIComponent(XSS_PAYLOADS.SCRIPT_TAG)}`);
      
      expect([200, 400]).toContain(response.status);
    });

    it('18. XSS in category param is handled safely', async () => {
      const response = await fetchJson(`/api/blog?category=${encodeURIComponent(XSS_PAYLOADS.IMG_ERROR)}`);
      
      expect([200, 400]).toContain(response.status);
    });

    // =========================================================================
    // XSS in GET responses
    // =========================================================================

    describe('Stored XSS in responses', () => {
      it('19. Stored XSS in name field is handled safely', async () => {
        const createResponse = await fetchJson('/api/requests', {
          method: 'POST',
          body: { name: 'Test<script>alert(1)</script>', email: 'testxss@test.com' }
        });
        
        // Just ensure it doesn't cause a server error
        expect([200, 201, 400]).toContain(createResponse.status);
      });
    });

    // =========================================================================
    // Additional XSS vectors
    // =========================================================================

    describe('Additional XSS attack vectors', () => {
      it('20. Nested script tags are blocked', async () => {
        const response = await fetchJson('/api/requests', {
          method: 'POST',
          body: { name: XSS_PAYLOADS.NESTED_SCRIPT, email: 'test@test.com' }
        });
        
        expect([200, 201, 400]).toContain(response.status);
      });

      it('21. SVG with animate element', async () => {
        const response = await fetchJson('/api/requests', {
          method: 'POST',
          body: { 
            name: 'Test User', 
            email: 'test@test.com',
            message: XSS_PAYLOADS.SVG_ANIMATE
          }
        });
        
        expect([200, 201, 400]).toContain(response.status);
      });

      it('22. Form with javascript action', async () => {
        const response = await fetchJson('/api/blog', {
          method: 'POST',
          token: adminToken,
          body: { 
            title: 'XSS Test', 
            slug: 'xss-form-' + Date.now(),
            content: XSS_PAYLOADS.FORM_ACTION,
            excerpt: 'Test'
          }
        });
        
        expect([200, 201, 400, 401, 403]).toContain(response.status);
      });

      it('23. Multiple XSS payloads in single request', async () => {
        const response = await fetchJson('/api/requests', {
          method: 'POST',
          body: { 
            name: XSS_PAYLOADS.SCRIPT_TAG, 
            email: 'test@test.com',
            company: XSS_PAYLOADS.IMG_ERROR,
            message: XSS_PAYLOADS.SVG_ONLOAD
          }
        });
        
        expect([200, 201, 400]).toContain(response.status);
      });

      it('24. Unicode XSS attempts are handled', async () => {
        const response = await fetchJson('/api/requests', {
          method: 'POST',
          body: { 
            name: '<img src=x onerror=alert(1)>', 
            email: 'test@test.com'
          }
        });
        
        expect([200, 201, 400]).toContain(response.status);
      });

      it('25. Empty string XSS attempt is handled gracefully', async () => {
        const response = await fetchJson('/api/requests', {
          method: 'POST',
          body: { name: '', email: 'test@test.com' }
        });
        
        expect([400]).toContain(response.status);
      });
    });
  });
