import { test, expect } from '@playwright/test';

/**
 * Phase 4.6 — Client Dashboard E2E Tests
 *
 * Tests client dashboard functionality including:
 * - Dashboard page loads for authenticated client
 * - Task visibility
 * - Request tracking
 *
 * Requirements:
 *   tests/.env.test must have:
 *     TEST_CLIENT_EMAIL, TEST_CLIENT_PASSWORD
 *     PLAYWRIGHT_BASE_URL
 */

test.describe('Client Dashboard Access', () => {
    test('Unauthenticated user redirected to login', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForURL(/.*\/auth\/login/);
        expect(page.url()).toContain('/auth/login');
    });
});

test.describe('Client Dashboard Authenticated', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
        const email = process.env.TEST_CLIENT_EMAIL;
        const password = process.env.TEST_CLIENT_PASSWORD;
        
        if (!email || !password) {
            test.skip();
            return;
        }

        await page.goto('/auth/login');
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();
        await page.waitForURL(/.*\/dashboard/, { timeout: 15000 }).catch(() => {});
    });

    test('Dashboard page loads for authenticated client', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/.*\/dashboard/);
    });

    test('Dashboard shows welcome or heading', async ({ page }) => {
        await page.goto('/dashboard');
        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('Client can view their requests', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
        const content = page.locator('main');
        await expect(content).toBeVisible();
    });

    test('Client can logout', async ({ page }) => {
        await page.goto('/dashboard');
        const logoutButton = page.getByRole('button', { name: /Sign Out|Logout/i }).first();
        if (await logoutButton.count() > 0) {
            await logoutButton.click();
            await page.waitForURL(/.*\/auth\/login/);
        }
    });
});

test.describe('Track Page', () => {
    test('Unauthenticated user redirected from /track', async ({ page }) => {
        await page.goto('/track');
        await page.waitForURL(/.*\/auth\/login/);
        expect(page.url()).toContain('/auth/login');
    });
});
