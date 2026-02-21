import { test, expect } from '@playwright/test';

test('Homepage loads correctly and displays main heading', async ({ page }) => {
    await page.goto('/');

    // Check the title of the page
    await expect(page).toHaveTitle(/Berztech/);

    // Check that the main hero heading is visible
    const heading = page.locator('h1.sr-only');
    await expect(heading).toHaveText(/Engineering Digital Excellence/i);

    // Ensure there is a "Start your project" call to action
    const ctaButton = page.getByRole('link', { name: /Start your project/i });
    await expect(ctaButton).toBeVisible();
});

test('Homepage displays trust bar and works', async ({ page }) => {
    await page.goto('/');

    // Verify trust bar exists
    const trustBarText = page.getByText(/Trusted by innovative teams/i);
    await expect(trustBarText).toBeVisible();
});
