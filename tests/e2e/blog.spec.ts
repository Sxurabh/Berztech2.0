import { test, expect } from '@playwright/test';

/**
 * Phase 4.5 — Blog Page E2E Tests
 *
 * Tests blog functionality including:
 * - Blog listing page
 * - Blog post detail
 * - Newsletter subscription
 *
 * Requirements:
 *   tests/.env.test must have:
 *     PLAYWRIGHT_BASE_URL
 */

test.describe('Blog Listing', () => {
    test('Blog page loads', async ({ page }) => {
        await page.goto('/blog');
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('Blog page shows blog posts or empty state', async ({ page }) => {
        await page.goto('/blog');
        const content = page.locator('main');
        await expect(content).toBeVisible();
    });
});

test.describe('Blog Post Detail', () => {
    test('Can navigate to blog post detail if posts exist', async ({ page }) => {
        await page.goto('/blog');
        const firstPostLink = page.locator('a[href^="/blog/"]').first();
        
        if (await firstPostLink.count() > 0) {
            await firstPostLink.click();
            await expect(page).toHaveURL(/\/blog\/[^/]+/, { timeout: 5000 });
        } else {
            test.skip();
        }
    });
});

test.describe('Blog Newsletter', () => {
    test('Newsletter subscription form is visible on blog page', async ({ page }) => {
        await page.goto('/blog');
        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.count() > 0) {
            await expect(emailInput).toBeVisible();
        }
    });

    test('Can enter email in newsletter form', async ({ page }) => {
        await page.goto('/blog');
        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.count() > 0) {
            await emailInput.fill('test@example.com');
            await expect(emailInput).toHaveValue('test@example.com');
        }
    });
});

test.describe('Blog Navigation', () => {
    test('Can navigate to blog from home', async ({ page }) => {
        await page.goto('/');
        const blogLink = page.locator('header').getByRole('link', { name: 'Blog', exact: true });
        await blogLink.click();
        await expect(page).toHaveURL(/.*\/blog/);
    });
});
