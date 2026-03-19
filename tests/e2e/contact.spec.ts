import { test, expect } from '@playwright/test';

/**
 * Phase 4.4 — Contact Page E2E Tests
 *
 * Tests contact page functionality including:
 * - Form validation
 * - Form submission
 * - Success/error states
 * - Required field validation
 *
 * Requirements:
 *   tests/.env.test must have:
 *     PLAYWRIGHT_BASE_URL
 */

test.describe('Contact Page', () => {
    test('Contact page loads', async ({ page }) => {
        await page.goto('/contact');
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('Contact form has all required fields', async ({ page }) => {
        await page.goto('/contact');
        
        await expect(page.getByPlaceholder('John Doe')).toBeVisible();
        await expect(page.getByPlaceholder('john@company.com')).toBeVisible();
        await expect(page.locator('textarea')).toBeVisible();
        await expect(page.getByRole('button', { name: /Send Request/i })).toBeVisible();
    });
});

test.describe('Contact Form Validation', () => {
    test('Empty form submission triggers validation', async ({ page }) => {
        await page.goto('/contact');
        
        const submitButton = page.getByRole('button', { name: /Send Request/i });
        await submitButton.click();
        
        const nameInput = page.getByPlaceholder('John Doe');
        const isInvalid = await nameInput.evaluate((el) => el.validity.valueMissing);
        expect(isInvalid).toBeTruthy();
    });

    test('Email validation rejects invalid format', async ({ page }) => {
        await page.goto('/contact');
        
        await page.getByPlaceholder('John Doe').fill('Test User');
        await page.getByPlaceholder('john@company.com').fill('invalid-email');
        
        const submitButton = page.getByRole('button', { name: /Send Request/i });
        await submitButton.click();
        
        const emailInput = page.getByPlaceholder('john@company.com');
        const isInvalid = await emailInput.evaluate((el) => el.validity.typeMismatch);
        expect(isInvalid).toBeTruthy();
    });

    test('Message field has max length validation', async ({ page }) => {
        await page.goto('/contact');
        
        const messageInput = page.locator('textarea');
        const maxLength = await messageInput.getAttribute('maxlength');
        expect(maxLength).toBe('1000');
    });

    test('Name field is required', async ({ page }) => {
        await page.goto('/contact');
        
        const nameInput = page.getByPlaceholder('John Doe');
        await expect(nameInput).toHaveAttribute('required', '');
    });

    test('Email field is required', async ({ page }) => {
        await page.goto('/contact');
        
        const emailInput = page.getByPlaceholder('john@company.com');
        await expect(emailInput).toHaveAttribute('required', '');
    });
});

test.describe('Contact Form Input', () => {
    test('Can fill out all form fields', async ({ page }) => {
        await page.goto('/contact');
        
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(500);
        
        const nameInput = page.getByPlaceholder('John Doe');
        const emailInput = page.getByPlaceholder('john@company.com');
        const messageInput = page.locator('textarea');
        
        await nameInput.fill('Test User');
        await emailInput.fill('test@company.com');
        await messageInput.fill('This is a test message.');
        
        await expect(nameInput).toHaveValue('Test User');
        await expect(emailInput).toHaveValue('test@company.com');
        await expect(messageInput).toHaveValue('This is a test message.');
    });

    test('Form accepts valid email format', async ({ page }) => {
        await page.goto('/contact');
        await page.waitForLoadState('domcontentloaded');
        
        const viewport = page.viewportSize();
        if (viewport && viewport.width < 1024) {
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.waitForTimeout(500);
        }
        
        const emailInput = page.locator('#email');
        await emailInput.scrollIntoViewIfNeeded();
        await emailInput.fill('valid@email.com');
        
        await page.waitForTimeout(300);
        
        const isValid = await emailInput.evaluate((el) => el.validity.valid);
        expect(isValid).toBeTruthy();
    });
});

test.describe('Contact Page Navigation', () => {
    test.use({ viewport: { width: 1280, height: 720 } });
    
    test('Can navigate to contact from home via Hire Us', async ({ page }) => {
        await page.goto('/');
        
        const hireUsLink = page.getByRole('link', { name: /Contact Us/i });
        await hireUsLink.click();
        
        await expect(page).toHaveURL(/.*\/contact/);
    });

    test('Contact page shows main heading', async ({ page }) => {
        await page.goto('/contact');
        
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
});
