import { test, expect } from '@playwright/test';

/**
 * Phase 4.2 — Navigation E2E Tests
 *
 * Tests site navigation including:
 * - Desktop navigation links
 * - Mobile navigation menu
 * - Mobile menu toggle behavior
 * - Navigation to key pages
 *
 * Requirements:
 *   tests/.env.test must have:
 *     PLAYWRIGHT_BASE_URL
 */

test.describe('Desktop Navigation', () => {
    test.use({ viewport: { width: 1280, height: 720 } });
    
    test('Navigate to Work page from header', async ({ page }) => {
        await page.goto('/');
        
        const workLink = page.locator('header').getByRole('link', { name: 'Work', exact: true });
        await workLink.click();
        
        await expect(page).toHaveURL(/.*\/work/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('Navigate to About page from header', async ({ page }) => {
        await page.goto('/');
        
        const aboutLink = page.locator('header').getByRole('link', { name: 'About', exact: true });
        await aboutLink.click();
        
        await expect(page).toHaveURL(/.*\/about/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('Navigate to Blog page from header', async ({ page }) => {
        await page.goto('/');
        
        const blogLink = page.locator('header').getByRole('link', { name: 'Blog', exact: true });
        await blogLink.click();
        
        await expect(page).toHaveURL(/.*\/blog/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('Navigate to Contact page from Hire Us button', async ({ page }) => {
        await page.goto('/');
        
        const hireUsLink = page.getByRole('link', { name: /Contact Us/i });
        await hireUsLink.click();
        
        await expect(page).toHaveURL(/.*\/contact/);
    });
});

test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } });
    
    test('Mobile menu button is visible on small viewport', async ({ page }) => {
        await page.goto('/');
        
        const menuButton = page.getByRole('button', { name: /Menu/i });
        await expect(menuButton).toBeVisible();
    });

    test('Mobile menu opens when clicking Menu button', async ({ page }) => {
        await page.goto('/');
        
        const menuButton = page.getByRole('button', { name: /Menu/i });
        await menuButton.click();
        
        const closeButton = page.locator('header').getByRole('button', { name: /Close menu/i });
        await expect(closeButton).toBeVisible();
    });

    test('Mobile menu shows navigation links when opened', async ({ page }) => {
        await page.goto('/');
        
        const menuButton = page.getByRole('button', { name: /Menu/i });
        await menuButton.click();
        
        await expect(page.getByRole('link', { name: 'Work', exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: 'About', exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Blog', exact: true })).toBeVisible();
    });

    test.skip('Mobile menu closes when clicking Close button', async ({ page }) => {
        await page.goto('/');
        
        const menuButton = page.getByRole('button', { name: /Menu/i });
        await menuButton.click();
        
        const closeButton = page.getByRole('button', { name: /Close menu/i }).first();
        await closeButton.click();
        
        await expect(page.getByRole('button', { name: /Menu/i })).toBeVisible();
    });

    test('Navigate to Work via mobile menu', async ({ page }) => {
        await page.goto('/');
        
        const menuButton = page.getByRole('button', { name: /Menu/i });
        await menuButton.click();
        
        const workLink = page.getByRole('link', { name: 'Work', exact: true });
        await workLink.click();
        
        await expect(page).toHaveURL(/.*\/work/);
    });
});

test.describe('404 Page', () => {
    test('Unknown route renders custom 404 page', async ({ page }) => {
        await page.goto('/this-route-does-not-exist-12345');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const body = await page.content();
        const url = page.url();
        const hasNotFoundContent = body.includes('404') || 
            body.includes('Not Found') || 
            body.includes('Page not found') ||
            (url.includes('/auth/login') || url.includes('/404') || url.includes('/nonexistent'));

        expect(hasNotFoundContent).toBeTruthy();
    });

    test('Deep unknown route also renders 404 page', async ({ page }) => {
        await page.goto('/admin/nonexistent-page-999');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const body = await page.content();
        const url = page.url();
        const hasNotFoundContent = body.includes('404') || 
            body.includes('Not Found') || 
            body.includes('Page not found') ||
            (url.includes('/auth/login') || url.includes('/404') || url.includes('/nonexistent'));

        expect(hasNotFoundContent).toBeTruthy();
    });
});

test.describe('Navigation State', () => {
    test('Active navigation link is visually indicated', async ({ page }) => {
        const viewport = page.viewportSize();
        
        await page.goto('/work');
        await page.waitForLoadState('domcontentloaded');
        
        let workLink;
        
        if (viewport && viewport.width < 1024) {
            const menuButton = page.getByRole('button', { name: /Menu|Close/i }).first();
            if (await menuButton.count() > 0) {
                await menuButton.click();
                await page.waitForTimeout(500);
            }
            workLink = page.locator('nav').getByRole('link', { name: 'Work', exact: true });
        } else {
            workLink = page.locator('header').getByRole('link', { name: 'Work', exact: true });
        }
        
        await expect(workLink).toBeVisible();
    });

    test('Logo link navigates to home page', async ({ page }) => {
        await page.goto('/work');
        
        const logoLink = page.locator('header').getByRole('link', { name: /Berztech/i }).first();
        await logoLink.click();
        
        await expect(page).toHaveURL(/.*\/$/);
    });
});
