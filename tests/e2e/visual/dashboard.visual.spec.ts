import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const authFileClient = path.resolve(process.cwd(), 'tests/e2e/.auth/client.json');
const hasValidAuth = fs.existsSync(authFileClient) && 
    JSON.parse(fs.readFileSync(authFileClient, 'utf8')).cookies?.length > 0;

test.describe('Client Dashboard Visual Regression', () => {
    test.beforeEach(async ({ page }) => {
        if (!hasValidAuth) {
            test.skip();
            return;
        }
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
    });

    test.describe('Desktop', () => {
        test.use({ viewport: { width: 1440, height: 900 } });

        test('full dashboard page matches baseline', async ({ page }) => {
            await expect(page).toHaveScreenshot('dashboard-client-full.png', {
                maxDiffPixels: 100,
                threshold: 0.4,
            });
        });

        test('dashboard stats section matches baseline', async ({ page }) => {
            const statsSection = page.locator('main').first();
            await expect(statsSection).toHaveScreenshot('dashboard-client-stats.png', {
                maxDiffPixels: 50,
                threshold: 0.3,
            });
        });
    });

    test.describe('Mobile', () => {
        test.use({ viewport: { width: 375, height: 667 } });

        test('mobile dashboard matches baseline', async ({ page }) => {
            await expect(page).toHaveScreenshot('dashboard-client-mobile.png', {
                maxDiffPixels: 50,
                threshold: 0.4,
            });
        });
    });
});
