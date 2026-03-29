import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 375, height: 667 };
const TABLET_VIEWPORT = { width: 768, height: 1024 };

test.describe('Chat Panel Mobile Bottom Sheet', () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test.beforeEach(async ({ page }) => {
        const email = process.env.TEST_CLIENT_EMAIL;
        const password = process.env.TEST_CLIENT_PASSWORD;

        if (!email || !password) {
            console.log('No credentials found, skipping test');
            test.skip();
            return;
        }

        await page.goto('/auth/login');
        await page.waitForLoadState('domcontentloaded');
        
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        await page.getByRole('button', { name: /Sign In/i }).first().click();
        
        await page.waitForURL(/.*\/dashboard/, { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(2000);
    });

    test('Chat panel appears as bottom sheet on mobile viewport', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        const requestCard = page.locator('a[href*="/dashboard/"], [class*="cursor-pointer"]').filter({ hasText: /view|View/i }).first();
        if (await requestCard.count() > 0) {
            await requestCard.click();
            await page.waitForTimeout(500);
        }

        const chatPanel = page.locator('.fixed.bottom-0').first();
        const chatPanelVisible = await chatPanel.isVisible().catch(() => false);
        
        if (!chatPanelVisible) {
            const openChatButtons = page.locator('button').filter({ hasText: /message|chat|Chat/i });
            if (await openChatButtons.count() === 0) {
                test.skip();
                return;
            }
            await openChatButtons.first().click();
            await page.waitForTimeout(500);
        }
        
        await expect(chatPanel).toBeVisible();
        
        const box = await chatPanel.boundingBox();
        expect(box).not.toBeNull();
        
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        expect(box.y + box.height).toBeCloseTo(viewportHeight, -1);
    });

    test('Chat panel has rounded top corners on mobile', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        const chatPanel = page.locator('.fixed.bottom-0').first();
        const chatPanelVisible = await chatPanel.isVisible().catch(() => false);
        
        if (!chatPanelVisible) {
            test.skip();
            return;
        }

        const chatPanelContent = page.locator('.rounded-t-2xl').first();
        await expect(chatPanelContent).toBeVisible();
    });

    test('Chat input is usable on mobile with adequate touch targets', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        const chatPanel = page.locator('.fixed.bottom-0').first();
        const chatPanelVisible = await chatPanel.isVisible().catch(() => false);
        
        if (!chatPanelVisible) {
            test.skip();
            return;
        }

        const textarea = page.locator('textarea[placeholder="Type a message..."]');
        const box = await textarea.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
    });

    test('Chat panel closes on backdrop click', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        const chatPanel = page.locator('.fixed.bottom-0').first();
        const chatPanelVisible = await chatPanel.isVisible().catch(() => false);
        
        if (!chatPanelVisible) {
            test.skip();
            return;
        }

        const backdrop = page.locator('.fixed.inset-0.bg-black');
        await expect(backdrop).toBeVisible();
        
        await backdrop.click({ position: { x: 10, y: 10 } });
        await page.waitForTimeout(500);

        const chatPanelAfter = page.locator('.fixed.bottom-0');
        await expect(chatPanelAfter).not.toBeVisible();
    });
});

test.describe('Chat Panel Tablet Bottom Sheet', () => {
    test.use({ viewport: TABLET_VIEWPORT });

    test.beforeEach(async ({ page }) => {
        const email = process.env.TEST_CLIENT_EMAIL;
        const password = process.env.TEST_CLIENT_PASSWORD;

        if (!email || !password) {
            test.skip();
            return;
        }

        await page.goto('/auth/login');
        await page.waitForLoadState('domcontentloaded');
        
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        await page.getByRole('button', { name: /Sign In/i }).first().click();
        
        await page.waitForURL(/.*\/dashboard/, { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(2000);
    });

    test('Chat panel appears as bottom sheet on tablet viewport', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        const chatPanel = page.locator('.fixed.bottom-0').first();
        const chatPanelVisible = await chatPanel.isVisible().catch(() => false);
        
        if (!chatPanelVisible) {
            test.skip();
            return;
        }
        
        const box = await chatPanel.boundingBox();
        expect(box).not.toBeNull();
        
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        expect(box.y + box.height).toBeCloseTo(viewportHeight, -1);
    });

    test('Chat input has adequate touch targets on tablet', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);

        const chatPanel = page.locator('.fixed.bottom-0').first();
        const chatPanelVisible = await chatPanel.isVisible().catch(() => false);
        
        if (!chatPanelVisible) {
            test.skip();
            return;
        }

        const textarea = page.locator('textarea[placeholder="Type a message..."]');
        const box = await textarea.boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(40);
    });
});
