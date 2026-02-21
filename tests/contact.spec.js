import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
    test('Shows validation errors on empty submission', async ({ page }) => {
        await page.goto('/contact');

        // Click submit button without filling out the form
        const submitButton = page.getByRole('button', { name: /Send Message/i });
        await submitButton.click();

        // The validation error from browser or local state should appear
        // Normally we track "required" HTML5 errors by looking at the pseudo-classes, or we can check custom errors.
        // Assuming custom React validation, we expect "Required" or similar text. If HTML5, the form won't submit.
        const nameInput = page.getByPlaceholder(/John Doe/i);

        // Check if the input is flagged as invalid (HTML5)
        const isInvalid = await nameInput.evaluate((el) => el.validity.valueMissing);
        expect(isInvalid).toBeTruthy();
    });

    test('Allows filling out the form', async ({ page }) => {
        await page.goto('/contact');

        await page.getByPlaceholder(/John Doe/i).fill('Test User');
        await page.getByPlaceholder(/john@company.com/i).fill('test@company.com');
        await page.locator('textarea').fill('This is a test message from Playwright automation.');

        // We do not actually submit to prevent spamming the database or email service in the test,
        // but we can verify the fields accept input correctly.
        await expect(page.getByPlaceholder(/John Doe/i)).toHaveValue('Test User');
        await expect(page.getByPlaceholder(/john@company.com/i)).toHaveValue('test@company.com');
    });
});
