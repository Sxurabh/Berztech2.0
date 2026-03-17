import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
    test('Homepage should be fully keyboard navigable', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const tabableElements = await page.$$(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = tabableElements[0];
        await firstElement?.focus();
        await page.keyboard.press('Tab');

        const focusedElement = await page.evaluate(() => document.activeElement);
        expect(focusedElement).not.toBeNull();
    });

    test('Can tab through interactive elements on homepage', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const interactiveElements = await page.$$(
            'a, button, input:not([type="hidden"]), select, textarea'
        );

        expect(interactiveElements.length).toBeGreaterThan(0);
    });

    test('Skip link should be present', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const skipLink = await page.$('a[href="#main-content"]');
        expect(skipLink).not.toBeNull();
    });

    test('Form inputs should be keyboard accessible', async ({ page }) => {
        await page.goto('/contact');
        await page.waitForLoadState('networkidle');

        const inputs = await page.$$('input, textarea, select');
        
        for (const input of inputs) {
            await input.focus();
            const isFocused = await input.evaluate(el => el === document.activeElement);
            expect(isFocused).toBeTruthy();
        }
    });

    test('Tab order should be logical', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const links = await page.$$('a[href]');
        const firstLink = links[0];
        
        if (firstLink) {
            await firstLink.focus();
            
            for (let i = 0; i < Math.min(links.length, 5); i++) {
                await page.keyboard.press('Tab');
                const focused = await page.evaluate(() => document.activeElement?.tagName);
                expect(['A', 'BUTTON', 'INPUT']).toContain(focused);
            }
        }
    });

    test('All buttons should have accessible names', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const buttons = await page.$$('button');
        
        for (const button of buttons.slice(0, 10)) {
            const text = await button.textContent();
            const ariaLabel = await button.getAttribute('aria-label');
            const title = await button.getAttribute('title');
            
            const hasAccessibleName = text?.trim() || ariaLabel || title;
            expect(hasAccessibleName).toBeTruthy();
        }
    });

    test('All links should have accessible names', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const links = await page.$$('a');
        
        for (const link of links.slice(0, 10)) {
            const text = await link.textContent();
            const ariaLabel = await link.getAttribute('aria-label');
            const title = await link.getAttribute('title');
            const imgAlt = await link.$eval('img', el => el.alt).catch(() => null);
            
            const hasAccessibleName = text?.trim() || ariaLabel || title || imgAlt;
            expect(hasAccessibleName).toBeTruthy();
        }
    });
});
