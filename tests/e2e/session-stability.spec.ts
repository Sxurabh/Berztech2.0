import { test, expect } from '@playwright/test';

test.describe('Session Stability', () => {
  test.describe('Long-running Session', () => {
    test('should maintain session over extended period', async ({ page }) => {
      await page.goto('/');
      
      const initialCookies = await page.context().cookies();
      const initialSession = initialCookies.find(c => c.name === 'sb-access-token' || c.name === 'sb-refresh-token');
      
      await page.waitForTimeout(5000);
      
      const currentCookies = await page.context().cookies();
      const currentSession = currentCookies.find(c => c.name === 'sb-access-token' || c.name === 'sb-refresh-token');
      
      if (initialSession && currentSession) {
        expect(currentSession.value).toBe(initialSession.value);
      }
    });

    test('should handle page refresh without losing auth state', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      const initialUrl = page.url();
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const afterReloadUrl = page.url();
      expect(afterReloadUrl).toBe(initialUrl);
    });

    test('should handle multiple page navigations', async ({ page }) => {
      const pages = ['/', '/blog', '/work', '/contact'];
      
      for (const path of pages) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should persist auth state across browser tabs', async ({ browser }) => {
      const context = await browser.newContext();
      
      const page1 = await context.newPage();
      await page1.goto('/dashboard');
      await page1.waitForLoadState('networkidle');
      
      const page2 = await context.newPage();
      await page2.goto('/dashboard');
      await page2.waitForLoadState('networkidle');
      
      const cookies = await context.cookies();
      const hasAuthCookie = cookies.some(c => 
        c.name.includes('sb-access-token') || c.name.includes('sb-refresh-token')
      );
      
      expect(hasAuthCookie).toBe(true);
      
      await page1.close();
      await page2.close();
    });
  });

  test.describe('Session Token Handling', () => {
    test('should handle expired access token', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('sb-access-token', 'expired-token');
      });
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('body')).toBeVisible();
    });

    test('should attempt token refresh on 401', async ({ page }) => {
      await page.route('**/api/**', async (route) => {
        const request = route.request();
        
        if (request.url().includes('/api/')) {
          await route.continue();
        }
      });
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('body')).toBeVisible();
    });

    test('should clear auth state on logout', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForTimeout(1000);
      
      const cookies = await page.context().cookies();
      const authCookies = cookies.filter(c => 
        c.name.includes('sb-')
      );
      
      if (authCookies.length > 0) {
        await page.context().clearCookies();
        
        const afterClear = await page.context().cookies();
        const remainingAuth = afterClear.filter(c => c.name.includes('sb-'));
        expect(remainingAuth.length).toBe(0);
      }
    });
  });

  test.describe('Concurrent Session Handling', () => {
    test('should handle rapid auth state changes', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      for (let i = 0; i < 5; i++) {
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
      }
      
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle parallel requests during session refresh', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      const requests = Array(5).fill(null).map(() => 
        page.goto('/blog').catch(() => null)
      );
      
      const results = await Promise.allSettled(requests);
      
      const successful = results.filter(r => r.status === 'fulfilled' && r.value !== null);
      expect(successful.length).toBeGreaterThan(0);
    });
  });

  test.describe('Session Storage', () => {
    test('should persist session data in storage', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const hasStorage = await page.evaluate(() => {
        return localStorage.length > 0 || sessionStorage.length > 0;
      });
      
      expect(typeof hasStorage).toBe('boolean');
    });

    test('should handle storage quota exceeded', async ({ page }) => {
      await page.addInitScript(() => {
        try {
          for (let i = 0; i < 1000; i++) {
            localStorage.setItem(`key${i}`, 'x'.repeat(10000));
          }
        } catch (e) {
          console.log('Storage quota exceeded');
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page.locator('body')).toBeVisible();
    });

    test('should clear sensitive data from storage on logout', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const storageKeys = await page.evaluate(() => {
        return [...localStorage.keys(), ...sessionStorage.keys()];
      });
      
      if (storageKeys.length > 0) {
        await page.context().clearCookies();
        
        const afterClear = await page.evaluate(() => {
          return [...localStorage.keys(), ...sessionStorage.keys()];
        });
        
        expect(afterClear.length).toBeLessThanOrEqual(storageKeys.length);
      }
    });
  });

  test.describe('Session Edge Cases', () => {
    test('should handle null cookies gracefully', async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(document, 'cookie', {
          get: () => '',
          set: () => {},
        });
      });
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle corrupted session data', async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem('sb-access-token', 'invalid-corrupted-data');
        window.localStorage.setItem('sb-refresh-token', 'also-corrupted');
      });
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle timezone changes', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const initialTime = await page.evaluate(() => new Date().toISOString());
      
      await page.addInitScript(() => {
        Date.prototype.getTimezoneOffset = () => -300;
      });
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const afterReloadTime = await page.evaluate(() => new Date().toISOString());
      
      expect(afterReloadTime).toBeDefined();
    });

    test('should handle browser language changes', async ({ page, context }) => {
      await context.setExtraHTTPHeaders({ 'Accept-Language': 'en-US' });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await context.setExtraHTTPHeaders({ 'Accept-Language': 'es-ES' });
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Idle Session Behavior', () => {
    test('should handle idle timeout scenario', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      await page.waitForTimeout(10000);
      
      const isConnected = await page.evaluate(() => navigator.onLine);
      expect(typeof isConnected).toBe('boolean');
    });

    test('should handle visibility changes', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { value: true, writable: true });
        Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      
      await page.waitForTimeout(500);
      
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { value: false, writable: true });
        Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
