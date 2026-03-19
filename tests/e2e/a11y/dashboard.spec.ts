import { test, expect } from '@playwright/test';
import Axe from '@axe-core/playwright';

test.describe('Dashboard Accessibility', () => {
    test.use({
        storageState: 'tests/e2e/.auth/client.json',
    });

    test('Client dashboard should have no critical accessibility violations', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const accessibilityScanner = new Axe({ page });
        const results = await accessibilityScanner.analyze();

        const criticalViolations = results.violations.filter(
            v => v.impact === 'critical'
        );

        if (criticalViolations.length > 0) {
            console.log('Dashboard violations:', criticalViolations);
        }

        expect(criticalViolations).toHaveLength(0);
    });

    test('Dashboard should have proper page structure', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const main = await page.$('main, [role="main"]');
        expect(main).not.toBeNull();

        const heading = await page.$('h1');
        expect(heading).not.toBeNull();
    });

    test('Dashboard should have accessible navigation', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const nav = await page.$('nav, [role="navigation"]');
        expect(nav).not.toBeNull();

        const navLinks = await page.$$('nav a, nav button');
        expect(navLinks.length).toBeGreaterThan(0);
    });

    test('Dashboard should have accessible data display', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const tablesOrLists = await page.$$('table, ul, ol, [role="list"]');
        expect(tablesOrLists.length).toBeGreaterThan(0);
    });

    test('Dashboard user menu should be accessible', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const userMenuButton = await page.$('[aria-haspopup], button:has-text("Profile"), button:has-text("Account")');
        
        if (userMenuButton) {
            const hasAccessibleName = await userMenuButton.getAttribute('aria-label') || 
                                       await userMenuButton.textContent();
            expect(hasAccessibleName).toBeTruthy();
        }
    });
});

test.describe('Track Page Accessibility', () => {
    test.use({
        storageState: 'tests/e2e/.auth/client.json',
    });

    test('Track page should have no critical accessibility violations', async ({ page }) => {
        await page.goto('/track');
        await page.waitForLoadState('networkidle');

        const accessibilityScanner = new Axe({ page });
        const results = await accessibilityScanner.analyze();

        const criticalViolations = results.violations.filter(
            v => v.impact === 'critical'
        );

        expect(criticalViolations).toHaveLength(0);
    });

    test('Track page should have proper structure', async ({ page }) => {
        await page.goto('/track');
        await page.waitForLoadState('networkidle');

        const main = await page.$('main, [role="main"]');
        expect(main).not.toBeNull();
    });
});
