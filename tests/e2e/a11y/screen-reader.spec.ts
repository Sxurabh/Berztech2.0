import { test, expect } from '@playwright/test';

test.describe('Screen Reader Compatibility', () => {
    test('Pages should have proper heading hierarchy', async ({ page }) => {
        const viewport = page.viewportSize();
        if (viewport && viewport.width < 1024) {
            test.skip();
            return;
        }
        
        const pages = ['/', '/blog', '/work', '/contact', '/about'];
        
        for (const url of pages) {
            await page.goto(url);
            await page.waitForLoadState('networkidle');
            
            const h1 = await page.$('h1');
            expect(h1).not.toBeNull();
        }
    });

    test('Pages should have proper landmark roles', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const landmarks = {
            banner: await page.$('header, [role="banner"]'),
            navigation: await page.$('nav, [role="navigation"]'),
            main: await page.$('main, [role="main"]'),
        };

        expect(landmarks.banner).not.toBeNull();
        expect(landmarks.navigation).not.toBeNull();
        expect(landmarks.main).not.toBeNull();
    });

    test('Images should have alt text', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const images = await page.$$('img');
        
        for (const img of images.slice(0, 10)) {
            const alt = await img.getAttribute('alt');
            const role = await img.getAttribute('role');
            
            const hasAccessibleName = alt !== null || role === 'presentation' || role === 'none';
            expect(hasAccessibleName).toBeTruthy();
        }
    });

    test('Form inputs should have visible labels', async ({ page }) => {
        await page.goto('/contact');
        await page.waitForLoadState('networkidle');

        const inputs = await page.$$('input:not([type="hidden"]), textarea, select');
        
        for (const input of inputs) {
            const id = await input.getAttribute('id');
            const ariaLabel = await input.getAttribute('aria-label');
            const label = id ? await page.$(`label[for="${id}"]`) : null;
            
            const hasLabel = ariaLabel !== null || label !== null;
            expect(hasLabel).toBeTruthy();
        }
    });

    test('Page should have language attribute', async ({ page }) => {
        const pages = ['/', '/blog', '/work', '/contact'];
        
        for (const url of pages) {
            await page.goto(url);
            await page.waitForLoadState('networkidle');
            
            const html = await page.$('html');
            const lang = await html?.getAttribute('lang');
            
            expect(lang).toBeTruthy();
        }
    });

    test('Buttons should have accessible names', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const buttons = await page.$$('button');
        
        for (const button of buttons.slice(0, 10)) {
            const text = await button.textContent();
            const ariaLabel = await button.getAttribute('aria-label');
            
            const hasAccessibleName = (text?.trim().length ?? 0) > 0 || ariaLabel !== null;
            expect(hasAccessibleName).toBeTruthy();
        }
    });
});
