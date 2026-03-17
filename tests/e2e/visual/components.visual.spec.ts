import { test, expect } from '@playwright/test';

test.describe('UI Components Visual Regression', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('Header component matches baseline', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        const header = page.locator('header').first();
        await expect(header).toHaveScreenshot('header-default.png', {
            maxDiffPixels: 20,
            threshold: 0.15,
        });
    });

    test('Footer component matches baseline', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        const footer = page.locator('footer').first();
        await expect(footer).toHaveScreenshot('footer-default.png', {
            maxDiffPixels: 20,
            threshold: 0.15,
        });
    });
});
