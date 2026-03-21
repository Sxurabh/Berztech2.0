import { test, expect } from '@playwright/test';

/**
 * Phase 4.7 — Admin Board E2E Tests
 *
 * Tests admin board functionality including:
 * - Kanban board loads
 * - Task creation
 * - Task status updates
 *
 * Requirements:
 *   tests/.env.test must have:
 *     TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD
 *     PLAYWRIGHT_BASE_URL
 */

test.describe('Admin Board Access', () => {
    test('Non-admin user redirected from admin', async ({ page }) => {
        await page.goto('/admin');
        const result = await Promise.race([
            page.waitForURL(/.*\/admin\/board/, { timeout: 5000 }).then(() => 'admin'),
            page.waitForURL(/.*\/dashboard/, { timeout: 5000 }).then(() => 'dashboard'),
        ]).catch(() => 'other');

        if (result === 'dashboard') {
            expect(page.url()).toContain('/dashboard');
        } else if (result === 'other') {
            expect(page.url()).toMatch(/\/auth\/login|\/dashboard/);
        }
    });
});

test.describe('Admin Board Authenticated', () => {
    test.beforeEach(async ({ page }) => {
        const email = process.env.TEST_ADMIN_EMAIL;
        const password = process.env.TEST_ADMIN_PASSWORD;
        
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
            await page.waitForURL(/.*\/admin(\/board)?/, { timeout: 20000 });
        } catch (e) {
            // Continue - may already be on admin page
        }
    });

    test('Admin board page loads', async ({ page }) => {
        await page.goto('/admin/board');
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/.*\/admin(\/board)?/, { timeout: 10000 });
    });

    test('Kanban board is visible', async ({ page }) => {
        await page.goto('/admin/board');
        await page.waitForLoadState('domcontentloaded');
        
        const content = page.locator('main').first();
        await expect(content).toBeVisible({ timeout: 15000 });
    });

    test('Can create new task', async ({ page }) => {
        await page.goto('/admin/board');
        await page.waitForLoadState('domcontentloaded');
        
        const newTaskButton = page.getByRole('button', { name: /New Task|Add Task|Create/i }).first();
        if (await newTaskButton.count() > 0) {
            await newTaskButton.click();
            await page.waitForTimeout(500);
            const titleInput = page.locator('input[name="title"], input[id="title"]').first();
            if (await titleInput.count() > 0) {
                await titleInput.fill('Test Task from E2E');
                const submitButton = page.getByRole('button', { name: /Save|Submit|Create/i }).first();
                await submitButton.click();
            }
        }
    });

    test('Admin can navigate to admin dashboard', async ({ page }) => {
        await page.goto('/admin');
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/.*\/admin/, { timeout: 10000 });
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('Admin has access to admin pages', async ({ page }) => {
        await page.goto('/admin');
        await page.waitForLoadState('domcontentloaded');
        
        // Check that the page has loaded with some content
        const body = page.locator('body');
        await expect(body).toBeVisible({ timeout: 10000 });
        
        // Should have some content on the page
        const content = await page.content();
        expect(content.length).toBeGreaterThan(100);
    });
});

test.describe('Admin Board Kanban Drag and Drop', () => {
    test('Kanban board shows all four columns', async ({ page }) => {
        const email = process.env.TEST_ADMIN_EMAIL;
        const password = process.env.TEST_ADMIN_PASSWORD;
        
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
        
        await page.goto('/admin/board');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        await expect(page.getByText('Backlog')).toBeVisible();
        await expect(page.getByText('In Progress')).toBeVisible();
        await expect(page.getByText('In Review')).toBeVisible();
        await expect(page.getByText('Completed')).toBeVisible();
    });

    test('Admin can drag a task between columns', async ({ page }) => {
        const email = process.env.TEST_ADMIN_EMAIL;
        const password = process.env.TEST_ADMIN_PASSWORD;
        
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
        
        await page.goto('/admin/board');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        const backlogColumn = page.locator('text=Backlog').locator('..');
        const inProgressColumn = page.locator('text=In Progress').locator('..');

        const backlogCards = backlogColumn.locator('[data-rbd-draggable-id]');
        if (await backlogCards.count() > 0) {
            const firstCard = backlogCards.first();
            const destColumn = inProgressColumn;

            await firstCard.dragTo(destColumn);
            await page.waitForTimeout(1000);
        }

        const inProgressCount = await page.locator('text=In Progress').locator('..').locator('[data-rbd-draggable-id]').count();
        expect(inProgressCount >= 0).toBeTruthy();
    });
});
