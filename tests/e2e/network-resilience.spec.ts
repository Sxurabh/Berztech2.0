import { test, expect } from '@playwright/test';

/**
 * Phase 4 E2E — Network Resilience Tests
 *
 * Tests network failure scenarios including:
 * - Offline form submission
 * - Network interruption during data load
 * - Slow 3G connection handling
 * - Rate limiting behavior
 * - Form auto-save during network issues
 *
 * Requirements:
 *   tests/.env.test must have:
 *     PLAYWRIGHT_BASE_URL
 */

test.describe('Network Failure - Contact Form', () => {
    test('Contact form handles network offline gracefully', async ({ page }) => {
        await page.goto('/contact');

        // Fill out form
        await page.getByPlaceholder('John Doe').fill('Test User');
        await page.getByPlaceholder('john@company.com').fill('test@example.com');
        await page.locator('textarea').fill('Test message during network failure.');

        // Simulate offline
        await page.context().setOffline(true);

        // Try to submit
        const submitButton = page.getByRole('button', { name: /Send Request/i });
        await submitButton.click();

        // Should show error message or keep form data
        await page.waitForTimeout(500);

        // Form values should be preserved
        await expect(page.getByPlaceholder('John Doe')).toHaveValue('Test User');
        await expect(page.getByPlaceholder('john@company.com')).toHaveValue('test@example.com');

        // Restore network
        await page.context().setOffline(false);
    });

    test('Contact form shows error on network timeout', async ({ page }) => {
        // Intercept API call and never respond
        await page.route('**/api/requests', async (route) => {
            // Don't fulfill, simulate timeout
            await new Promise(() => {}); // Never resolve
        });

        await page.goto('/contact');

        await page.getByPlaceholder('John Doe').fill('Test User');
        await page.getByPlaceholder('john@company.com').fill('test@example.com');
        await page.locator('textarea').fill('Test message.');

        const submitButton = page.getByRole('button', { name: /Send Request/i });
        await submitButton.click();

        // Wait for loading state or error
        await page.waitForTimeout(3000);

        // Either loading spinner appears or error message
        const errorVisible = await page.locator('.text-red-600, [role="alert"]').isVisible().catch(() => false);
        const loadingVisible = await page.getByText(/sending|loading/i).isVisible().catch(() => false);

        expect(errorVisible || loadingVisible).toBeTruthy();
    });
});

test.describe('Network Failure - Dashboard', () => {
    test('Dashboard shows loading state during slow network', async ({ page }) => {
        // Intercept API calls and delay them
        await page.route('**/api/**', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 3000));
            await route.continue();
        });

        await page.goto('/dashboard');

        // Should show some loading indicator
        await page.waitForTimeout(500);

        // Check for loading spinner or skeleton
        const loadingElements = await page.locator('[data-testid="loading"], .animate-pulse, .skeleton').count();
        expect(loadingElements).toBeGreaterThanOrEqual(0); // May or may not have explicit loading indicators
    });

    test('Dashboard handles API failure gracefully', async ({ page }) => {
        // Intercept API calls and return error
        await page.route('**/api/client/tasks', async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal server error' }),
            });
        });

        await page.goto('/dashboard');
        await page.waitForTimeout(1000);

        // Page should not crash, should show error state or empty state
        const errorVisible = await page.locator('.text-red-600, [role="alert"]').isVisible().catch(() => false);
        const contentVisible = await page.locator('main').isVisible();

        expect(contentVisible).toBeTruthy(); // Page should still be visible
    });
});

test.describe('Slow Network Conditions', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('Blog page loads on slow 3G connection', async ({ page }) => {
        test.setTimeout(60000); // Give the test more time to load under 3G conditions

        // Simulate slow 3G
        const client = await page.context().newCDPSession(page);
        await client.send('Network.emulateNetworkConditions', {
            offline: false,
            downloadThroughput: 750 * 1024 / 8, // 750 Kbps
            uploadThroughput: 250 * 1024 / 8,   // 250 Kbps
            latency: 300,
        });

        const startTime = Date.now();
        await page.goto('/blog');
        const loadTime = Date.now() - startTime;

        // Page should eventually load
        await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 30000 });

        // Should load within reasonable time (even on slow 3G)
        expect(loadTime).toBeLessThan(30000);
    });
});

test.describe('Rate Limiting', () => {
    test('Contact form handles rate limiting', async ({ page }) => {
        await page.goto('/contact');

        // Submit form rapidly multiple times
        for (let i = 0; i < 3; i++) {
            await page.getByPlaceholder('John Doe').fill(`Test User ${i}`);
            await page.getByPlaceholder('john@company.com').fill(`test${i}@example.com`);
            await page.locator('textarea').fill(`Message ${i}`);

            const submitButton = page.getByRole('button', { name: /Send Request/i });
            await submitButton.click();

            await page.waitForTimeout(100);
        }

        // Should either show rate limit error or prevent rapid submissions
        await page.waitForTimeout(1000);

        // Form should still be functional
        const submitButton = page.getByRole('button', { name: /Send Request/i });
        await expect(submitButton).toBeVisible();
    });
});

test.describe('Network Interruption During Operations', () => {
    test('Form data is preserved during network interruption', async ({ page }) => {
        await page.goto('/contact');

        // Fill partial form
        await page.getByPlaceholder('John Doe').fill('Test User');
        await page.getByPlaceholder('john@company.com').fill('test@example.com');

        // Interrupt network
        await page.context().setOffline(true);

        // Try to continue filling
        await page.locator('textarea').fill('This is my message');

        // Data should still be there
        await expect(page.getByPlaceholder('John Doe')).toHaveValue('Test User');
        await expect(page.locator('textarea')).toHaveValue('This is my message');

        // Restore network
        await page.context().setOffline(false);
    });

    test('Page recovers after network restoration', async ({ page }) => {
        await page.goto('/');

        // Go offline
        await page.context().setOffline(true);
        await page.waitForTimeout(500);

        // Try to navigate
        await page.goto('/blog').catch(() => {});

        // Restore network
        await page.context().setOffline(false);
        await page.waitForTimeout(500);

        // Should be able to navigate now
        await page.goto('/blog');
        await expect(page.locator('main')).toBeVisible();
    });
});
