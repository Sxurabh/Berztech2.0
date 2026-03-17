import { test, expect } from '@playwright/test';

test.describe('Homepage Visual Regression', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
    });

    test.describe('Desktop', () => {
        test.use({ viewport: { width: 1440, height: 900 } });

        test('full homepage matches baseline', async ({ page }) => {
            await expect(page).toHaveScreenshot('home-full.png', {
                maxDiffPixels: 100,
                threshold: 0.5,
            });
        });

        test('hero section matches baseline', async ({ page }) => {
            const hero = page.locator('main > div').first();
            await expect(hero).toHaveScreenshot('home-hero.png', {
                maxDiffPixels: 50,
                threshold: 0.3,
            });
        });

        test('trust bar section matches baseline', async ({ page }) => {
            const trustBar = page.getByText(/Trusted by/i);
            await trustBar.scrollIntoViewIfNeeded();
            await expect(trustBar).toHaveScreenshot('home-trust-bar.png', {
                maxDiffPixels: 20,
                threshold: 0.2,
            });
        });

        test('services section matches baseline', async ({ page }) => {
            const services = page.getByText(/Our Services/i);
            await services.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            await expect(services).toHaveScreenshot('home-services.png', {
                maxDiffPixels: 50,
                threshold: 0.3,
            });
        });
    });

    test.describe('Mobile', () => {
        test.use({ viewport: { width: 375, height: 667 } });

        test('mobile homepage matches baseline', async ({ page }) => {
            await expect(page).toHaveScreenshot('home-mobile.png', {
                maxDiffPixels: 50,
                threshold: 0.4,
            });
        });

        test('mobile hero section matches baseline', async ({ page }) => {
            const hero = page.locator('main > div').first();
            await expect(hero).toHaveScreenshot('home-hero-mobile.png', {
                maxDiffPixels: 30,
                threshold: 0.3,
            });
        });
    });

    test.describe('Tablet', () => {
        test.use({ viewport: { width: 768, height: 1024 } });

        test('tablet homepage matches baseline', async ({ page }) => {
            await expect(page).toHaveScreenshot('home-tablet.png', {
                maxDiffPixels: 50,
                threshold: 0.35,
            });
        });
    });
});
