import { test, expect } from '@playwright/test';

/**
 * Phase 4.3 — Home Page E2E Tests
 *
 * Tests homepage functionality including:
 * - Page load and title
 * - Hero section
 * - Call to action buttons
 * - Trust/social proof section
 * - Mobile hero responsiveness
 *
 * Requirements:
 *   tests/.env.test must have:
 *     PLAYWRIGHT_BASE_URL
 */

test.describe('Homepage Desktop', () => {
    test.use({ viewport: { width: 1280, height: 720 } });
    
    test('Homepage loads and displays correct title', async ({ page }) => {
        await page.goto('/');
        
        await expect(page).toHaveTitle(/Berztech/i);
    });

    test('Hero heading is visible', async ({ page }) => {
        await page.goto('/');
        
        const heroHeading = page.locator('h1');
        await expect(heroHeading).toBeVisible();
    });

    test('CTA button "Start your project" is visible', async ({ page }) => {
        await page.goto('/');
        
        const ctaButton = page.getByRole('link', { name: /Start your project/i });
        await expect(ctaButton).toBeVisible();
    });

    test('CTA button navigates to contact page', async ({ page }) => {
        await page.goto('/');
        
        const ctaButton = page.getByRole('link', { name: /Start your project/i });
        await ctaButton.click();
        
        await expect(page).toHaveURL(/.*\/contact/);
    });

    test('Trust bar is visible', async ({ page }) => {
        await page.goto('/');
        
        const trustBar = page.getByText(/Trusted by/i);
        await expect(trustBar).toBeVisible();
    });

    test('Hire Us button in header navigates to contact', async ({ page }) => {
        await page.goto('/');
        
        const hireUsButton = page.getByRole('link', { name: /Contact Us/i });
        await hireUsButton.click();
        
        await expect(page).toHaveURL(/.*\/contact/);
    });
});

test.describe('Homepage Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });
    
    test('Hero heading is visible on mobile', async ({ page }) => {
        await page.goto('/');
        
        const heroHeading = page.locator('h1');
        await expect(heroHeading).toBeVisible();
    });

    test('CTA button is visible on mobile', async ({ page }) => {
        await page.goto('/');
        
        const ctaButton = page.getByRole('link', { name: /Start your project/i });
        await expect(ctaButton).toBeVisible();
    });

    test('CTA button is tappable on mobile', async ({ page }) => {
        await page.goto('/');
        
        const ctaButton = page.getByRole('link', { name: /Start your project/i });
        await ctaButton.click();
        
        await expect(page).toHaveURL(/.*\/contact/);
    });

    test('Trust bar scrolls into view on mobile', async ({ page }) => {
        await page.goto('/');
        
        const trustBar = page.getByText(/Trusted by/i);
        await trustBar.scrollIntoViewIfNeeded();
        await expect(trustBar).toBeVisible();
    });
});

test.describe('Homepage Elements', () => {
    test('Footer is visible', async ({ page }) => {
        await page.goto('/');
        
        const footer = page.locator('footer');
        await expect(footer).toBeVisible();
    });

    test('No critical console errors on homepage', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        const criticalErrors = errors.filter(e => 
            !e.includes('favicon') && 
            !e.includes('404')
        );
        expect(criticalErrors).toHaveLength(0);
    });
});
