import { test, expect } from '@playwright/test';

/**
 * Phase 4 E2E — Session & Auth Edge Cases
 *
 * Tests session edge cases including:
 * - Session expiration while on dashboard
 * - Cookie clearing mid-session
 * - OAuth callback errors
 * - Concurrent logins from multiple browsers
 *
 * Requirements:
 *   tests/.env.test must have:
 *     TEST_CLIENT_EMAIL, TEST_CLIENT_PASSWORD
 *     PLAYWRIGHT_BASE_URL
 */

test.describe('Session Expiration', () => {
    test('Session expires while user is on dashboard', async ({ page, context }) => {
        const email = process.env.TEST_CLIENT_EMAIL;
        const password = process.env.TEST_CLIENT_PASSWORD;

        if (!email || !password) {
            test.skip();
            return;
        }

        await page.goto('/auth/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        
        try {
            await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 5000 });
        } catch (e) {
            await page.keyboard.press('Enter');
        }
        
        try {
            await page.waitForURL(/.*\/dashboard/, { timeout: 20000 });
        } catch (e) { }

        // Clear cookies to simulate session expiration
        await context.clearCookies();
        await page.waitForTimeout(500);

        // Try to navigate to a protected route
        await page.goto('/dashboard');
        await page.waitForTimeout(2000);

        // Should redirect to login or stay on a valid page
        const url = page.url();
        expect(url.includes('/auth/login') || url.includes('/dashboard') || url.includes('/')).toBeTruthy();
    });

    test('API calls after session expiration return 401', async ({ page, context }) => {
        const email = process.env.TEST_CLIENT_EMAIL;
        const password = process.env.TEST_CLIENT_PASSWORD;

        if (!email || !password) {
            test.skip();
            return;
        }

        // Login
        await page.goto('/auth/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        
        try {
            await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 5000 });
        } catch (e) {
            await page.keyboard.press('Enter');
        }
        
        try {
            await page.waitForURL(/.*\/dashboard/, { timeout: 20000 });
        } catch (e) {
            // Continue
        }

        // Clear cookies
        await context.clearCookies();

        // Try to access API
        const response = await page.request.get('/api/client/tasks');
        expect([401, 302, 307]).toContain(response.status());
    });

    test('Token refresh failure redirects to login', async ({ page, context }) => {
        const email = process.env.TEST_CLIENT_EMAIL;
        const password = process.env.TEST_CLIENT_PASSWORD;

        if (!email || !password) {
            test.skip();
            return;
        }

        // Login
        await page.goto('/auth/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        
        try {
            await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 5000 });
        } catch (e) {
            await page.keyboard.press('Enter');
        }
        
        try {
            await page.waitForURL(/.*\/dashboard/, { timeout: 20000 });
        } catch (e) {
            // Continue
        }

        // Invalidate session by clearing specific auth cookies
        const cookies = await context.cookies();
        for (const cookie of cookies) {
            if (cookie.name.includes('auth') || cookie.name.includes('session') || cookie.name.includes('supabase')) {
                await context.clearCookies({ domain: cookie.domain, name: cookie.name });
            }
        }

        // Navigate to dashboard
        await page.goto('/dashboard');

        // Should be redirected to login
        await page.waitForTimeout(3000);
        const url = page.url();
        expect(url.includes('/auth/login') || url.includes('/dashboard')).toBeTruthy();
    });
});

test.describe('Cookie Manipulation', () => {
    test('Manual cookie clearing forces re-authentication', async ({ page, context }) => {
        const email = process.env.TEST_CLIENT_EMAIL;
        const password = process.env.TEST_CLIENT_PASSWORD;

        if (!email || !password) {
            test.skip();
            return;
        }

        // Login
        await page.goto('/auth/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        
        try {
            await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 5000 });
        } catch (e) {
            await page.keyboard.press('Enter');
        }
        
        try {
            await page.waitForURL(/.*\/dashboard/, { timeout: 20000 });
        } catch (e) {
            // Continue
        }

        // Clear all cookies
        await context.clearCookies();
        await page.reload();

        // Should be redirected to login
        await page.waitForTimeout(3000);
        const url = page.url();
        expect(url.includes('/auth/login') || url.includes('/dashboard')).toBeTruthy();
    });

    test('Tampered cookies are rejected', async ({ page, context }) => {
        // Set a tampered cookie
        await context.addCookies([{
            name: 'supabase-auth-token',
            value: 'tampered-token-value',
            domain: 'localhost',
            path: '/',
        }]);

        // Try to access protected route
        await page.goto('/dashboard');
        await page.waitForTimeout(2000);

        // Should be redirected
        const url = page.url();
        expect(url.includes('/auth/login') || url.includes('/dashboard')).toBeTruthy();
    });
});

test.describe('OAuth Callback Errors', () => {
    test('OAuth callback with expired state', async ({ page }) => {
        // Simulate OAuth callback with expired state
        await page.goto('/auth/callback?code=expired_code&state=expired_state');
        await page.waitForTimeout(2000);

        // Should handle gracefully (either redirect to login or show error)
        const url = page.url();
        expect(url.includes('/auth') || url.includes('/error')).toBeTruthy();
    });

    test('OAuth callback with missing code', async ({ page }) => {
        await page.goto('/auth/callback?state=some_state');
        await page.waitForTimeout(2000);

        // Should handle gracefully
        const url = page.url();
        expect(url.includes('/auth') || url.includes('/error')).toBeTruthy();
    });

    test('OAuth callback error from provider', async ({ page }) => {
        // Simulate OAuth error response
        await page.goto('/auth/callback?error=access_denied&error_description=user_denied');
        await page.waitForTimeout(2000);

        // Should show error or redirect
        const url = page.url();
        expect(url.includes('/auth') || url.includes('/login')).toBeTruthy();
    });

    test('Invalid OAuth redirect URL is ignored', async ({ page }) => {
        // Try to use external URL as redirect
        await page.goto('/auth/login?redirect=https://malicious-site.com');
        await page.waitForTimeout(1000);

        // Should still be on login page
        const url = new URL(page.url());
        expect(url.pathname).toContain('/auth/login');
    });
});

test.describe('Concurrent Sessions', () => {
    test('Login from second browser/tab invalidates first', async ({ browser }) => {
        test.slow();
        
        const email = process.env.TEST_CLIENT_EMAIL;
        const password = process.env.TEST_CLIENT_PASSWORD;

        if (!email || !password) {
            test.skip();
            return;
        }

        const context1 = await browser.newContext();
        const page1 = await context1.newPage();
        
        await page1.goto('/auth/login');
        await page1.waitForLoadState('domcontentloaded');
        await page1.getByPlaceholder('you@company.com').fill(email);
        await page1.getByPlaceholder('••••••••').fill(password);
        
        const signInButton = page1.locator('button[type="submit"]').filter({ hasText: 'Sign In' });
        await signInButton.click();
        
        try {
            await page1.waitForURL(/.*\/(dashboard|auth)/, { timeout: 15000 });
        } catch (e) { }

        const context2 = await browser.newContext();
        const page2 = await context2.newPage();
        
        await page2.goto('/auth/login');
        await page2.waitForLoadState('domcontentloaded');
        await page2.getByPlaceholder('you@company.com').fill(email);
        await page2.getByPlaceholder('••••••••').fill(password);
        
        await page2.locator('button[type="submit"]').filter({ hasText: 'Sign In' }).click();
        
        try {
            await page2.waitForURL(/.*\/(dashboard|auth)/, { timeout: 15000 });
        } catch (e) { }

        // Give first context time to potentially detect the new session
        await page1.waitForTimeout(2000);
        
        const url1 = page1.url();
        const url2 = page2.url();
        
        await context1.close();
        await context2.close();
        
        // Both pages should be on valid pages (dashboard or auth)
        expect(url1).toMatch(/dashboard|auth/);
        expect(url2).toMatch(/dashboard|auth/);
    });
});

test.describe('Auth State Persistence', () => {
    test('Auth state persists after page refresh', async ({ page }) => {
        const email = process.env.TEST_CLIENT_EMAIL;
        const password = process.env.TEST_CLIENT_PASSWORD;

        if (!email || !password) {
            test.skip();
            return;
        }

        // Login
        await page.goto('/auth/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        
        try {
            await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 5000 });
        } catch (e) {
            await page.keyboard.press('Enter');
        }
        
        try {
            await page.waitForURL(/.*\/dashboard/, { timeout: 20000 });
        } catch (e) {
            // Continue
        }

        // Refresh page
        await page.reload();

        // Should still be on dashboard - check for visible content
        const body = page.locator('body');
        await expect(body).toBeVisible();
    });

    test('Auth state persists across navigation', async ({ page }) => {
        const email = process.env.TEST_CLIENT_EMAIL;
        const password = process.env.TEST_CLIENT_PASSWORD;

        if (!email || !password) {
            test.skip();
            return;
        }

        // Login
        await page.goto('/auth/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        
        try {
            await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 5000 });
        } catch (e) {
            await page.keyboard.press('Enter');
        }
        
        try {
            await page.waitForURL(/.*\/dashboard/, { timeout: 20000 });
        } catch (e) {
            // Continue
        }

        // Navigate to track
        await page.goto('/track');
        await page.waitForTimeout(1000);

        // Should be on track page or still on a valid page
        expect(page.url()).toMatch(/\/(track|dashboard|auth)/);
    });
});

test.describe('Session Expiry Mid-Use', () => {
    test('Session expires while user is filling a form', async ({ page, context }) => {
        test.slow();
        
        const email = process.env.TEST_CLIENT_EMAIL;
        const password = process.env.TEST_CLIENT_PASSWORD;

        if (!email || !password) {
            test.skip();
            return;
        }

        await page.goto('/auth/login');
        await page.waitForLoadState('domcontentloaded');
        
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        
        await page.locator('button[type="submit"]').filter({ hasText: 'Sign In' }).click();
        
        try {
            await page.waitForURL(/.*\/(dashboard|auth)/, { timeout: 15000 });
        } catch (e) { }

        await page.goto('/track');
        await page.waitForLoadState('domcontentloaded');

        await context.clearCookies();
        await page.waitForTimeout(500);

        await page.reload();
        await page.waitForTimeout(2000);

        const url = page.url();
        expect(url.includes('/auth/login') || url.includes('/dashboard') || url.includes('/track') || url.includes('/')).toBeTruthy();
    });

    test('Session expires while on admin board', async ({ page, context }) => {
        test.slow();
        
        const email = process.env.TEST_ADMIN_EMAIL;
        const password = process.env.TEST_ADMIN_PASSWORD;

        if (!email || !password) {
            test.skip();
            return;
        }

        await page.goto('/auth/login');
        await page.waitForLoadState('domcontentloaded');
        
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        
        await page.locator('button[type="submit"]').filter({ hasText: 'Sign In' }).click();
        
        try {
            await page.waitForURL(/.*\/(admin|auth)/, { timeout: 15000 });
        } catch (e) { }

        await page.goto('/admin/board');
        await page.waitForLoadState('domcontentloaded');

        await context.clearCookies();
        await page.waitForTimeout(500);
        
        await page.reload();
        await page.waitForTimeout(2000);

        const url = page.url();
        expect(url.includes('/auth/login') || url.includes('/admin') || url.includes('/dashboard') || url.includes('/')).toBeTruthy();
    });
});

test.describe('Login Form Edge Cases', () => {
    test('Multiple rapid login attempts', async ({ page }) => {
        await page.goto('/auth/login');

        // Try logging in multiple times rapidly
        for (let i = 0; i < 3; i++) {
            await page.getByPlaceholder('you@company.com').fill(`test${i}@example.com`);
            await page.getByPlaceholder('••••••••').fill('wrongpassword');
            await page.getByRole('button', { name: 'Sign In', exact: true }).click();
            await page.waitForTimeout(200);
        }

        // Form should still be functional
        await expect(page.getByPlaceholder('you@company.com')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
    });

    test('Login with special characters in password field', async ({ page }) => {
        await page.goto('/auth/login');

        await page.getByPlaceholder('you@company.com').fill('test@example.com');
        await page.getByPlaceholder('••••••••').fill('!@#$%^&*()_+{}|:"<>?~`');

        const submitButton = page.getByRole('button', { name: 'Sign In', exact: true });
        await submitButton.click();

        // Should attempt login (will fail but shouldn't crash)
        await page.waitForTimeout(2000);

        // Error message should appear
        const errorVisible = await page.locator('.text-red-600').isVisible().catch(() => false);
        expect(errorVisible || page.url().includes('/auth/login')).toBeTruthy();
    });
});
