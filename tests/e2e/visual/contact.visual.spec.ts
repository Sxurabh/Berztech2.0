import { test, expect } from '@playwright/test';

test.describe('Contact Page Visual Regression', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/contact');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
    });

    test.describe('Desktop', () => {
        test.use({ viewport: { width: 1440, height: 900 } });

        test('full contact page matches baseline', async ({ page }) => {
            await expect(page).toHaveScreenshot('contact-full.png', {
                maxDiffPixels: 200,
                threshold: 0.5,
            });
        });

        test('contact form section matches baseline', async ({ page }) => {
            const form = page.locator('form').filter({ hasText: /Name|Email|Message/i }).first();
            await expect(form).toHaveScreenshot('contact-form.png', {
                maxDiffPixels: 100,
                threshold: 0.4,
            });
        });
    });

    test.describe('Mobile', () => {
        test.use({ viewport: { width: 375, height: 667 } });

        test('mobile contact page matches baseline', async ({ page }) => {
            await expect(page).toHaveScreenshot('contact-mobile.png', {
                maxDiffPixels: 200,
                threshold: 0.5,
            });
        });

        test('mobile contact form matches baseline', async ({ page }) => {
            const form = page.locator('form').filter({ hasText: /Name|Email|Message/i }).first();
            await expect(form).toHaveScreenshot('contact-form-mobile.png', {
                maxDiffPixels: 100,
                threshold: 0.4,
            });
        });
    });
});
