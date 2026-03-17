import { test, expect } from '@playwright/test';
import Axe from '@axe-core/playwright';

test.describe('Public Pages Accessibility', () => {
    const pages = [
        { url: '/', name: 'Homepage' },
        { url: '/blog', name: 'Blog' },
        { url: '/work', name: 'Work' },
        { url: '/contact', name: 'Contact' },
        { url: '/about', name: 'About' },
        { url: '/process', name: 'Process' },
    ];

    pages.forEach(({ url, name }) => {
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

            const html = await page.content();
            
            expect(html).toContain('lang="en"');
            
            const main = await page.$('main, [role="main"]');
            expect(main).not.toBeNull();

            const heading = await page.$('h1');
            expect(heading).not.toBeNull();
        });

        test(`${name} should have skip link`, async ({ page }) => {
            await page.goto(url);
            await page.waitForLoadState('networkidle');

            const skipLink = await page.$('a[href="#main-content"], a[href*="#main"]');
            expect(skipLink).not.toBeNull();
        });
    });
});

test('Homepage should have proper landmark regions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const banner = await page.$('[role="banner"], header');
    const navigation = await page.$('[role="navigation"], nav');
    const main = await page.$('[role="main"], main');
    const contentinfo = await page.$('[role="contentinfo"], footer');

    expect(banner).not.toBeNull();
    expect(navigation).not.toBeNull();
    expect(main).not.toBeNull();
    expect(contentinfo).not.toBeNull();
});

test('Contact page form should have proper labels', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    const form = await page.$('form');
    expect(form).not.toBeNull();

    const inputs = await page.$$('input, textarea, select');
    for (const input of inputs) {
        const label = await page.evaluate((el) => {
            if (el.id) {
                return document.querySelector(`label[for="${el.id}"]`);
            }
            const parent = el.closest('label');
            return parent;
        }, input);
        
        expect(label).not.toBeNull();
    }
});
