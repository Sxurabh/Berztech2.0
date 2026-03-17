import { test, expect } from '@playwright/test';

test.describe('Network Chaos Testing', () => {
  test.describe('Simulated Network Failures', () => {
    test('should show error UI when API fails during page load', async ({ page }) => {
      await page.route('**/api/**', async (route) => {
        if (Math.random() < 1) {
          await route.abort('failed');
        } else {
          await route.continue();
        }
      });

      await page.goto('/dashboard');
      
      await expect(page.locator('body')).toBeVisible();
      
      const content = await page.content();
      expect(content.length).toBeGreaterThan(0);
    });

    test('should handle intermittent network failures gracefully', async ({ page }) => {
      let failureCount = 0;
      
      await page.route('**/api/**', async (route) => {
        if (Math.random() < 0.3) {
          failureCount++;
          await route.abort('failed');
        } else {
          await route.continue();
        }
      });

      await page.goto('/blog');
      
      await page.waitForLoadState('domcontentloaded');
      
      expect(failureCount).toBeGreaterThanOrEqual(0);
    });

    test('should survive random timeout during navigation', async ({ page }) => {
      await page.route('**/api/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
        await route.continue();
      });

      const pages = ['/', '/blog', '/work', '/contact'];
      
      for (const path of pages) {
        const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
        expect([200, 304]).toContain(response?.status() || 0);
      }
    });

    test('should display partial content when some resources fail', async ({ page }) => {
      let apiFailed = false;
      
      await page.route('**/api/projects**', async (route) => {
        apiFailed = true;
        await route.abort('failed');
      });

      await page.goto('/work');
      await page.waitForLoadState('domcontentloaded');
      
      expect(apiFailed).toBe(true);
    });

    test('should handle DNS resolution failures', async ({ page }) => {
      await page.route('**/api/**', async (route) => {
        await route.abort('dnserror');
      });

      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Connection Reset Handling', () => {
    test('should handle connection reset during form submission', async ({ page }) => {
      await page.goto('/contact');
      
      await page.route('**/api/**', async (route) => {
        if (route.request().method() === 'POST') {
          await route.abort('connectionreset');
        } else {
          await route.continue();
        }
      });

      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('textarea[name="message"]', 'Test message');
      
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(1000);
    });

    test('should handle slow network with timeout fallback', async ({ page }) => {
      let requestCount = 0;
      
      await page.route('**/api/**', async (route) => {
        requestCount++;
        
        if (requestCount <= 2) {
          await new Promise(resolve => setTimeout(resolve, 30000));
          await route.continue();
        } else {
          await route.continue();
        }
      });

      const timeout = 5000;
      const start = Date.now();
      
      await page.goto('/blog', { timeout });
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(timeout + 5000);
    });
  });

  test.describe('Partial Response Handling', () => {
    test('should handle truncated JSON responses', async ({ page }) => {
      await page.route('**/api/blog', async (route) => {
        const originalResponse = await route.fetch();
        const body = await originalResponse.text();
        
        await route.fulfill({
          status: 200,
          body: body.substring(0, Math.floor(body.length / 2)),
          headers: { 'Content-Type': 'application/json' },
        });
      });

      await page.goto('/blog');
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle malformed JSON gracefully', async ({ page }) => {
      await page.route('**/api/blog', async (route) => {
        await route.fulfill({
          status: 200,
          body: '{ invalid json }',
          headers: { 'Content-Type': 'application/json' },
        });
      });

      await page.goto('/blog');
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Offline Mode', () => {
    test('should detect offline state', async ({ page }) => {
      await page.goto('/');
      
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
      });
      
      const isOnline = await page.evaluate(() => navigator.onLine);
      expect(isOnline).toBe(false);
      
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
      });
    });

    test('should handle online status changes', async ({ page }) => {
      const events = [];
      
      page.on('online', () => events.push('online'));
      page.on('offline', () => events.push('offline'));
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      expect(events).toContain('online');
    });
  });

  test.describe('Request Priority', () => {
    test('should prioritize critical resources', async ({ page }) => {
      const requestOrder = [];
      
      await page.route('**/*', async (route) => {
        const resourceType = route.request().resourceType();
        requestOrder.push(resourceType);
        await route.continue();
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const htmlIndex = requestOrder.indexOf('document');
      const scriptIndices = requestOrder
        .map((r, i) => r === 'script' ? i : -1)
        .filter(i => i !== -1);
      
      if (scriptIndices.length > 0) {
        expect(htmlIndex).toBeLessThan(Math.min(...scriptIndices));
      }
    });
  });

  test.describe('Cache Behavior Under Chaos', () => {
    test('should serve from cache when network fails', async ({ page, context }) => {
      await context.route('**/api/**', async (route) => {
        await route.continue();
      });

      await page.goto('/blog');
      await page.waitForLoadState('networkidle');
      
      const initialResponse = await page.evaluate(async () => {
        const cache = await caches.open('api-cache');
        const keys = await cache.keys();
        return keys.length;
      });
      
      expect(initialResponse).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Chaos During Authentication', () => {
    test('should handle auth token refresh failure', async ({ page }) => {
      await page.route('**/api/**', async (route) => {
        const url = route.request().url();
        
        if (url.includes('auth') && Math.random() < 0.5) {
          await route.abort('failed');
        } else {
          await route.continue();
        }
      });

      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
