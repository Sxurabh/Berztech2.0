import { test, expect } from '@playwright/test';
import Axe from '@axe-core/playwright';

test.describe('Admin Pages Accessibility', () => {
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
            await page.goto(url);
            await page.waitForLoadState('networkidle');

            const accessibilityScanner = new Axe({ page });
            const results = await accessibilityScanner.analyze();

            const criticalViolations = results.violations.filter(
                v => v.impact === 'critical'
            );

            if (criticalViolations.length > 0) {
                console.log(`${name} violations:`, criticalViolations);
            }

            expect(criticalViolations).toHaveLength(0);
        });

        test(`${name} should have proper page structure`, async ({ page }) => {
            await page.goto(url);
            await page.waitForLoadState('networkidle');

            const main = await page.$('main, [role="main"]');
            expect(main).not.toBeNull();
        });
    });
});

test.describe('Admin Board Accessibility', () => {
    test('Kanban board should be accessible', async ({ page }) => {
        await page.goto('/admin/board');
        await page.waitForLoadState('networkidle');

        const mainContent = await page.$('main, [role="main"]');
        expect(mainContent).not.toBeNull();
    });

    test('should have accessible action buttons', async ({ page }) => {
        await page.goto('/admin/board');
        await page.waitForLoadState('networkidle');

        const buttons = await page.$$('button');
        
        for (const button of buttons.slice(0, 5)) {
            const name = await button.getAttribute('aria-label') || await button.textContent();
            expect(name).toBeTruthy();
        }
    });
});

test.describe('Admin Forms Accessibility', () => {
    test('Blog form should have proper form accessibility', async ({ page }) => {
        await page.goto('/admin/blog/new');
        await page.waitForLoadState('networkidle');

        const accessibilityScanner = new Axe({ page });
        const results = await accessibilityScanner.analyze();

        const criticalViolations = results.violations.filter(
            v => v.impact === 'critical'
        );

        expect(criticalViolations).toHaveLength(0);
    });

    test('Projects form should have proper form accessibility', async ({ page }) => {
        await page.goto('/admin/projects/new');
        await page.waitForLoadState('networkidle');

        const accessibilityScanner = new Axe({ page });
        const results = await accessibilityScanner.analyze();

        const criticalViolations = results.violations.filter(
            v => v.impact === 'critical'
        );

        expect(criticalViolations).toHaveLength(0);
    });

    test('Form should have proper structure', async ({ page }) => {
        await page.goto('/admin/blog/new');
        await page.waitForLoadState('networkidle');

        const form = await page.$('form');
        expect(form).not.toBeNull();
    });
});
