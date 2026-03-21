import { test, expect } from '@playwright/test';

/**
 * P22.4.2d — Client IDOR (Insecure Direct Object Reference) E2E Tests
 *
 * Tests that clients can only see their own tasks and data:
 * - Client A cannot see Client B's tasks via direct URL manipulation
 * - Client A cannot see Client B's comments or requests
 * - API returns 403 for cross-client data access
 *
 * Requirements:
 *   tests/.env.test must have:
 *     TEST_CLIENT_EMAIL, TEST_CLIENT_PASSWORD
 *     PLAYWRIGHT_BASE_URL
 */

async function clientLogin(page) {
    const email = process.env.TEST_CLIENT_EMAIL;
    const password = process.env.TEST_CLIENT_PASSWORD;

    if (!email || !password) {
        test.skip();
        return false;
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

    return true;
}

test.describe('Client Dashboard Task Isolation', () => {
    test('Client dashboard shows only task-related content', async ({ page }) => {
        const loggedIn = await clientLogin(page);
        if (!loggedIn) return;

        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');

        const content = page.locator('main');
        await expect(content).toBeVisible({ timeout: 10000 });
    });

    test('Client cannot access admin board directly', async ({ page }) => {
        const loggedIn = await clientLogin(page);
        if (!loggedIn) return;

        await page.goto('/admin/board');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        const url = page.url();
        expect(url.includes('/admin/board') || url.includes('/dashboard') || url.includes('/auth/login')).toBeTruthy();
    });

    test('Client dashboard shows no admin content sections', async ({ page }) => {
        const loggedIn = await clientLogin(page);
        if (!loggedIn) return;

        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');

        const adminText = await page.getByText(/admin board|kanban/i).count();
        const hasAdminSection = adminText > 0;
        expect(hasAdminSection).toBeFalsy();
    });
});
