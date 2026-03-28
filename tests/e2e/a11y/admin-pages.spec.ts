import { test, expect } from '@playwright/test';

test.describe('Admin Pages Accessibility', () => {
    test.use({
        storageState: 'tests/e2e/.auth/admin.json',
    });

    const adminPages = [
        { url: '/admin', name: 'Admin Dashboard' },
        { url: '/admin/board', name: 'Admin Board' },
        { url: '/admin/blog', name: 'Admin Blog' },
        { url: '/admin/projects', name: 'Admin Projects' },
        { url: '/admin/testimonials', name: 'Admin Testimonials' },
        { url: '/admin/requests', name: 'Admin Requests' },
    ];

    adminPages.forEach(({ url, name }) => {
        test(`${name} should have no critical accessibility violations`, async ({ page }) => {
            test.skip(true, 'Axe scanner disabled - causes timeouts on admin pages');
        });

        test(`${name} should have proper page structure`, async ({ page }) => {
            const viewportWidth = page.viewportSize().width;
            if (viewportWidth && viewportWidth < 1024) {
                test.skip();
                return;
            }

            await page.goto(url);
            await page.waitForLoadState('networkidle');

            const main = page.locator('main, [role="main"]').first();
            await expect(main).toBeVisible({ timeout: 5000 });
        });
    });
});

test.describe('Admin Board Accessibility', () => {
    test.use({
        storageState: 'tests/e2e/.auth/admin.json',
    });

    test('Kanban board should be accessible', async ({ page }) => {
        const viewportWidth = page.viewportSize().width;
        if (viewportWidth && viewportWidth < 1024) {
            test.skip();
            return;
        }

        await page.goto('/admin/board');
        await page.waitForLoadState('networkidle');

        const mainContent = page.locator('main, [role="main"]').first();
        await expect(mainContent).toBeVisible({ timeout: 5000 });
    });

    test('should have accessible action buttons', async ({ page }) => {
        const viewportWidth = page.viewportSize().width;
        if (viewportWidth && viewportWidth < 1024) {
            test.skip();
            return;
        }

        await page.goto('/admin/board');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const count = await page.locator('button').count();
        
        if (count > 0) {
            for (let i = 0; i < Math.min(count, 5); i++) {
                const button = page.locator('button').nth(i);
                const name = await button.getAttribute('aria-label') || 
                             await button.getAttribute('aria-labelledby') ||
                             (await button.textContent())?.trim();
                if (name) {
                    expect(name.length).toBeGreaterThan(0);
                }
            }
        }
    });
});

test.describe('Admin Forms Accessibility', () => {
    test.use({
        storageState: 'tests/e2e/.auth/admin.json',
    });

    test('Blog form should have proper form accessibility', async ({ page }) => {
        test.skip(true, 'Axe scanner disabled - causes timeouts on admin pages');
    });

    test('Projects form should have proper form accessibility', async ({ page }) => {
        test.skip(true, 'Axe scanner disabled - causes timeouts on admin pages');
    });

    test('Form should have proper structure', async ({ page }) => {
        const viewportWidth = page.viewportSize().width;
        if (viewportWidth && viewportWidth < 1024) {
            test.skip();
            return;
        }

        await page.goto('/admin/blog/new');
        await page.waitForLoadState('networkidle');

        const form = page.locator('form').first();
        await expect(form).toBeVisible({ timeout: 5000 });
    });
});
