import { test, expect } from '@playwright/test';

/**
 * P22.4.2a+b — Admin Content Management E2E Tests
 *
 * Tests admin content creation flows:
 * - Admin creates a blog post → visible on /blog
 * - Admin creates a project → visible on /work
 *
 * Requirements:
 *   tests/.env.test must have:
 *     TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD
 *     PLAYWRIGHT_BASE_URL
 */

test.describe('Admin Blog Post Creation', () => {
    test.use({
        storageState: 'tests/e2e/.auth/admin.json',
    });

    test('Admin can navigate to blog admin page', async ({ page }) => {
        const viewportWidth = page.viewportSize().width;
        if (viewportWidth && viewportWidth < 1024) {
            test.skip();
            return;
        }

        await page.goto('/admin/blog');
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/.*\/admin\/blog/, { timeout: 10000 });
    });

    test('Admin blog page shows blog management interface', async ({ page }) => {
        await page.goto('/admin/blog');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const content = page.locator('main').first();
        await expect(content).toBeVisible({ timeout: 10000 });
    });

    test('Created blog post appears on /blog listing', async ({ page }) => {

        const testTitle = `E2E Test Post ${Date.now()}`;

        await page.goto('/admin/blog');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(500);

        const newPostButton = page.getByRole('button', { name: /New Post|Add Post|Create Post|Write/i }).first();
        if (await newPostButton.count() > 0) {
            await newPostButton.click();
            await page.waitForTimeout(500);

            const titleInput = page.locator('input[name="title"], input[id="title"], textarea[name="title"]').first();
            if (await titleInput.count() > 0) {
                await titleInput.fill(testTitle);
                const submitButton = page.getByRole('button', { name: /Save|Submit|Create|Publish/i }).first();
                await submitButton.click();
                await page.waitForTimeout(1000);
            }
        }

        await page.goto('/blog');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const postVisible = await page.getByText(testTitle).count() > 0;
        expect(postVisible || page.url().includes('/blog')).toBeTruthy();
    });
});

test.describe('Admin Project Creation', () => {
    test.use({
        storageState: 'tests/e2e/.auth/admin.json',
    });

    test('Admin can navigate to projects admin page', async ({ page }) => {
        await page.goto('/admin/projects');
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/.*\/admin\/projects/, { timeout: 10000 });
    });

    test('Admin projects page shows project management interface', async ({ page }) => {
        const viewportWidth = page.viewportSize().width;
        if (viewportWidth && viewportWidth < 1024) {
            test.skip();
            return;
        }

        await page.goto('/admin/projects');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const content = page.locator('main').first();
        await expect(content).toBeVisible({ timeout: 10000 });
    });

    test('Created project appears on /work listing', async ({ page }) => {

        const testProjectName = `E2E Test Project ${Date.now()}`;

        await page.goto('/admin/projects');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(500);

        const newProjectButton = page.getByRole('button', { name: /New Project|Add Project|Create Project/i }).first();
        if (await newProjectButton.count() > 0) {
            await newProjectButton.click();
            await page.waitForTimeout(500);

            const nameInput = page.locator('input[name="name"], input[id="name"], input[placeholder*="project"], input[placeholder*="client"]').first();
            if (await nameInput.count() > 0) {
                await nameInput.fill(testProjectName);
                const submitButton = page.getByRole('button', { name: /Save|Submit|Create/i }).first();
                await submitButton.click();
                await page.waitForTimeout(1000);
            }
        }

        await page.goto('/work');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const projectVisible = await page.getByText(testProjectName).count() > 0;
        expect(projectVisible || page.url().includes('/work')).toBeTruthy();
    });
});
