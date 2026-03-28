import { test, expect, devices } from '@playwright/test';

const isMobileWidth = ({ page }) => page.viewportSize()?.width < 500;
const isTabletWidth = ({ page }) => page.viewportSize()?.width >= 500 && page.viewportSize()?.width < 800;
const isDesktopWidth = ({ page }) => page.viewportSize()?.width >= 1200;

test.describe('Homepage Visual Regression', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
    });

    test.describe('Desktop', () => {
        test.use({ viewport: { width: 1440, height: 900 } });

        test('full homepage matches baseline', async ({ page }) => {
            if (isMobileWidth({ page }) || isTabletWidth({ page })) {
                test.skip();
            }
            await page.waitForTimeout(2000);
            await expect(page).toHaveScreenshot('home-full.png', {
                maxDiffPixels: 500,
                threshold: 0.8,
            });
        });

        test('hero section matches baseline', async ({ page }) => {
            if (isMobileWidth({ page }) || isTabletWidth({ page })) {
                test.skip();
            }
            await page.waitForTimeout(2000);
            const hero = page.locator('main > div').first();
            await expect(hero).toHaveScreenshot('home-hero.png', {
                maxDiffPixels: 200,
                threshold: 0.6,
            });
        });

        test('trust bar section matches baseline', async ({ page }) => {
            if (isMobileWidth({ page }) || isTabletWidth({ page })) {
                test.skip();
            }
            const trustBar = page.getByText(/Trusted by/i);
            await trustBar.scrollIntoViewIfNeeded();
            await page.waitForTimeout(2000);
            await expect(trustBar).toHaveScreenshot('home-trust-bar.png', {
                maxDiffPixels: 100,
                threshold: 0.5,
            });
        });

        test('services section matches baseline', async ({ page }) => {
            if (isMobileWidth({ page }) || isTabletWidth({ page })) {
                test.skip();
            }
            const services = page.getByText(/Our Services/i);
            await services.scrollIntoViewIfNeeded();
            await page.waitForTimeout(2000);
            await expect(services).toHaveScreenshot('home-services.png', {
                maxDiffPixels: 200,
                threshold: 0.6,
            });
        });
    });

    test.describe('Mobile', () => {
        test.use({ viewport: { width: 375, height: 667 } });

        test('mobile homepage matches baseline', async ({ page }) => {
            if (isDesktopWidth({ page }) || isTabletWidth({ page })) {
                test.skip();
            }
            await page.waitForTimeout(2000);
            await expect(page).toHaveScreenshot('home-mobile.png', {
                maxDiffPixels: 500,
                threshold: 0.8,
            });
        });

        test('mobile hero section matches baseline', async ({ page }) => {
            if (isDesktopWidth({ page }) || isTabletWidth({ page })) {
                test.skip();
            }
            await page.waitForTimeout(2000);
            const hero = page.locator('main > div').first();
            await expect(hero).toHaveScreenshot('home-hero-mobile.png', {
                maxDiffPixels: 200,
                threshold: 0.6,
            });
        });
    });

    test.describe('Tablet', () => {
        test.use({ viewport: { width: 768, height: 1024 } });

        test('tablet homepage matches baseline', async ({ page }) => {
            if (isDesktopWidth({ page }) || isMobileWidth({ page })) {
                test.skip();
            }
            await page.waitForTimeout(2000);
            await expect(page).toHaveScreenshot('home-tablet.png', {
                maxDiffPixels: 500,
                threshold: 0.8,
            });
        });
    });
});
