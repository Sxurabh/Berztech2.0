import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
    test('Should navigate to the Work page', async ({ page }) => {
        await page.goto('/');

        // Assuming the header navigation contains "Work"
        const workLink = page.locator('header').getByRole('link', { name: 'Work', exact: true });
        await workLink.click();

        // Verify URL and Page Heading
        await expect(page).toHaveURL(/.*\/work/);
        const heading = page.getByRole('heading', { level: 1, name: /Selected Work/i });
        await expect(heading).toBeVisible();
    });

    test('Should navigate to the About page', async ({ page }) => {
        await page.goto('/');

        const aboutLink = page.locator('header').getByRole('link', { name: 'About', exact: true });
        await aboutLink.click();

        await expect(page).toHaveURL(/.*\/about/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('Should navigate to the Blog page', async ({ page }) => {
        await page.goto('/');

        const blogLink = page.locator('header').getByRole('link', { name: 'Blog', exact: true });
        await blogLink.click();

        await expect(page).toHaveURL(/.*\/blog/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
});
