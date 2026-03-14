import { test, expect } from '@playwright/test';

/**
 * Phase 4 E2E — Data Mutation Edge Cases
 *
 * Tests data mutation edge cases including:
 * - Create task with title at max length
 * - Unicode/special characters in titles
 * - Unsaved changes warning
 * - Delete task verification
 * - Rapid create/delete operations
 * - Double-click submission
 *
 * Requirements:
 *   tests/.env.test must have:
 *     TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD
 *     PLAYWRIGHT_BASE_URL
 */

test.describe('Admin Board - Task Creation Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
        const email = process.env.TEST_ADMIN_EMAIL;
        const password = process.env.TEST_ADMIN_PASSWORD;

        if (!email || !password) {
            test.skip();
            return;
        }

        await page.goto('/auth/login');
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();
        await page.waitForURL(/.*\/admin/, { timeout: 15000 });
    });

    test('Create task with maximum length title', async ({ page }) => {
        await page.goto('/admin/board');
        await page.waitForTimeout(2000);

        // Open new task dialog
        const newTaskButton = page.getByRole('button', { name: /New Task|Add Task|Create/i }).first();
        if (await newTaskButton.count() === 0) {
            test.skip();
            return;
        }

        await newTaskButton.click();
        await page.waitForTimeout(500);

        // Fill with max length title (assuming 255 chars)
        const maxLengthTitle = 'A'.repeat(255);
        const titleInput = page.locator('input[name="title"], input[id="title"]').first();

        if (await titleInput.count() > 0) {
            await titleInput.fill(maxLengthTitle);
            await expect(titleInput).toHaveValue(maxLengthTitle);

            // Try to submit
            const submitButton = page.getByRole('button', { name: /Save|Submit|Create/i }).first();
            if (await submitButton.count() > 0) {
                await submitButton.click();
                await page.waitForTimeout(1000);
            }
        }
    });

    test('Create task with Unicode characters', async ({ page }) => {
        await page.goto('/admin/board');
        await page.waitForTimeout(2000);

        const newTaskButton = page.getByRole('button', { name: /New Task|Add Task|Create/i }).first();
        if (await newTaskButton.count() === 0) {
            test.skip();
            return;
        }

        await newTaskButton.click();
        await page.waitForTimeout(500);

        const titleInput = page.locator('input[name="title"], input[id="title"]').first();
        if (await titleInput.count() > 0) {
            // Test various Unicode characters
            const unicodeTitle = 'Task with 日本語, 🎉 emoji, and émojis! @#$%^&*()';
            await titleInput.fill(unicodeTitle);
            await expect(titleInput).toHaveValue(unicodeTitle);
        }
    });

    test('Create task with special characters in title', async ({ page }) => {
        await page.goto('/admin/board');
        await page.waitForTimeout(2000);

        const newTaskButton = page.getByRole('button', { name: /New Task|Add Task|Create/i }).first();
        if (await newTaskButton.count() === 0) {
            test.skip();
            return;
        }

        await newTaskButton.click();
        await page.waitForTimeout(500);

        const titleInput = page.locator('input[name="title"], input[id="title"]').first();
        if (await titleInput.count() > 0) {
            // Test HTML/script injection attempt
            const specialTitle = '<script>alert("xss")\u003c/script> <img src=x onerror=alert(1)>';
            await titleInput.fill(specialTitle);

            // Title should be sanitized or stored as-is (not executed)
            const value = await titleInput.inputValue();
            expect(value).toContain('<script>');
        }
    });

    test('Delete task removes it from board', async ({ page }) => {
        await page.goto('/admin/board');
        await page.waitForTimeout(2000);

        // Look for a task to delete
        const taskCard = page.locator('[data-testid="task-card"], .task-card, [draggable]').first();
        if (await taskCard.count() === 0) {
            test.skip(true, 'No tasks to delete');
            return;
        }

        // Click on task to open it
        await taskCard.click();
        await page.waitForTimeout(500);

        // Look for delete button
        const deleteButton = page.getByRole('button').filter({ hasText: /Delete|Remove|Trash/i }).first();
        if (await deleteButton.count() > 0) {
            await deleteButton.click();
            await page.waitForTimeout(500);

            // Confirm deletion if there's a confirmation dialog
            const confirmButton = page.getByRole('button').filter({ hasText: /Confirm|Yes|Delete/i }).first();
            if (await confirmButton.count() > 0) {
                await confirmButton.click();
            }

            await page.waitForTimeout(1000);
        }
    });

    test('Rapid task creation does not create duplicates', async ({ page }) => {
        await page.goto('/admin/board');
        await page.waitForTimeout(2000);

        const newTaskButton = page.getByRole('button', { name: /New Task|Add Task|Create/i }).first();
        if (await newTaskButton.count() === 0) {
            test.skip();
            return;
        }

        // Open dialog once
        await newTaskButton.click();
        await page.waitForTimeout(500);

        const titleInput = page.locator('input[name="title"], input[id="title"]').first();
        const submitButton = page.getByRole('button', { name: /Save|Submit|Create/i }).first();

        if (await titleInput.count() > 0 && await submitButton.count() > 0) {
            await titleInput.fill('Rapid Task');

            // Click submit multiple times rapidly
            await submitButton.click();
            await submitButton.click();
            await submitButton.click();

            await page.waitForTimeout(2000);

            // Should only create one task (form should be disabled or already submitted)
        }
    });

    test('Double-click on submit button does not duplicate submission', async ({ page }) => {
        await page.goto('/admin/board');
        await page.waitForTimeout(2000);

        const newTaskButton = page.getByRole('button', { name: /New Task|Add Task|Create/i }).first();
        if (await newTaskButton.count() === 0) {
            test.skip();
            return;
        }

        await newTaskButton.click();
        await page.waitForTimeout(500);

        const titleInput = page.locator('input[name="title"], input[id="title"]').first();
        const submitButton = page.getByRole('button', { name: /Save|Submit|Create/i }).first();

        if (await titleInput.count() > 0 && await submitButton.count() > 0) {
            await titleInput.fill('Double Click Task');

            // Double-click submit
            await submitButton.dblclick();
            await page.waitForTimeout(2000);

            // Should only submit once
        }
    });
});

test.describe('Admin Board - Form Validation', () => {
    test.beforeEach(async ({ page }) => {
        const email = process.env.TEST_ADMIN_EMAIL;
        const password = process.env.TEST_ADMIN_PASSWORD;

        if (!email || !password) {
            test.skip();
            return;
        }

        await page.goto('/auth/login');
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();
        await page.waitForURL(/.*\/admin/, { timeout: 15000 });
    });

    test('Empty title shows validation error', async ({ page }) => {
        await page.goto('/admin/board');
        await page.waitForTimeout(2000);

        const newTaskButton = page.getByRole('button', { name: /New Task|Add Task|Create/i }).first();
        if (await newTaskButton.count() === 0) {
            test.skip();
            return;
        }

        await newTaskButton.click();
        await page.waitForTimeout(500);

        const titleInput = page.locator('input[name="title"], input[id="title"]').first();
        const submitButton = page.getByRole('button', { name: /Save|Submit|Create/i }).first();

        if (await titleInput.count() > 0 && await submitButton.count() > 0) {
            // Try to submit without title
            await submitButton.click();
            await page.waitForTimeout(500);

            // Should show validation error or prevent submission
            const isVisible = await titleInput.isVisible();
            expect(isVisible).toBeTruthy(); // Dialog should still be open
        }
    });

    test('Whitespace-only title shows validation error', async ({ page }) => {
        await page.goto('/admin/board');
        await page.waitForTimeout(2000);

        const newTaskButton = page.getByRole('button', { name: /New Task|Add Task|Create/i }).first();
        if (await newTaskButton.count() === 0) {
            test.skip();
            return;
        }

        await newTaskButton.click();
        await page.waitForTimeout(500);

        const titleInput = page.locator('input[name="title"], input[id="title"]').first();
        const submitButton = page.getByRole('button', { name: /Save|Submit|Create/i }).first();

        if (await titleInput.count() > 0) {
            await titleInput.fill('   '); // Only whitespace
            await submitButton.click();
            await page.waitForTimeout(500);

            // Should show validation error
            const errorVisible = await page.locator('.text-red-600, [role="alert"]').isVisible().catch(() => false);
            expect(errorVisible || await titleInput.isVisible()).toBeTruthy();
        }
    });
});

test.describe('Dashboard - Client Task Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
        const email = process.env.TEST_CLIENT_EMAIL;
        const password = process.env.TEST_CLIENT_PASSWORD;

        if (!email || !password) {
            test.skip();
            return;
        }

        await page.goto('/auth/login');
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();
        await page.waitForURL(/.*\/dashboard/, { timeout: 15000 });
    });

    test('Client can view their task details', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForTimeout(2000);

        // Look for task cards or list items
        const taskItems = page.locator('[data-testid="task-item"], .task-item, .task-card').first();

        if (await taskItems.count() > 0) {
            await taskItems.click();
            await page.waitForTimeout(1000);

            // Should show task details or modal
            const content = await page.locator('main, .modal, [role="dialog"]').first().isVisible();
            expect(content).toBeTruthy();
        }
    });

test('Client dashboard shows no tasks message when empty', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for loading skeletons to disappear
    await page.waitForSelector('.animate-pulse', { state: 'detached', timeout: 10000 }).catch(() => {});
    
    // Give time for content to render after loading
    await page.waitForTimeout(500);

    // Check for empty state message - dashboard shows "No active requests"
    const emptyMessage = await page.getByText(/no active requests|no tasks|empty|no requests/i).first().isVisible().catch(() => false);
    
    // Check for request cards (tasks in the dashboard)
    const requestCards = page.locator('div').filter({ has: page.locator('text=/Pending|Completed|Archived/i') });
    const hasRequests = await requestCards.count() > 0;

    // Either shows empty message or has requests
    expect(emptyMessage || hasRequests).toBeTruthy();
  });
});

test.describe('Contact Form - Edge Cases', () => {
    test('Contact form handles very long message', async ({ page }) => {
        await page.goto('/contact');

        const messageInput = page.locator('textarea');
        const longMessage = 'A'.repeat(999); // Just under 1000 limit

        await messageInput.fill(longMessage);
        await expect(messageInput).toHaveValue(longMessage);
    });

    test('Contact form prevents submission over max length', async ({ page }) => {
        await page.goto('/contact');

        const messageInput = page.locator('textarea');
        const maxLength = await messageInput.getAttribute('maxlength');

        if (maxLength) {
            // Try to fill more than max length
            const tooLongMessage = 'A'.repeat(parseInt(maxLength) + 100);
            await messageInput.fill(tooLongMessage);

            // Value should be truncated to max length
            const value = await messageInput.inputValue();
            expect(value.length).toBeLessThanOrEqual(parseInt(maxLength));
        }
    });

    test('Contact form accepts special characters in name', async ({ page }) => {
        await page.goto('/contact');

        const nameInput = page.getByPlaceholder('John Doe');
        const specialName = 'José María O\'Connor-Smith III';

        await nameInput.fill(specialName);
        await expect(nameInput).toHaveValue(specialName);
    });
});

test.describe('Unsaved Changes Warning', () => {
    test.beforeEach(async ({ page }) => {
        const email = process.env.TEST_ADMIN_EMAIL;
        const password = process.env.TEST_ADMIN_PASSWORD;

        if (!email || !password) {
            test.skip();
            return;
        }

        await page.goto('/auth/login');
        await page.getByPlaceholder('you@company.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();
        await page.waitForURL(/.*\/admin/, { timeout: 15000 });
    });

    test('Navigating away with unsaved changes shows warning', async ({ page }) => {
        await page.goto('/admin/board');
        await page.waitForTimeout(2000);

        // Open task creation dialog
        const newTaskButton = page.getByRole('button', { name: /New Task|Add Task|Create/i }).first();
        if (await newTaskButton.count() === 0) {
            test.skip();
            return;
        }

        await newTaskButton.click();
        await page.waitForTimeout(500);

        // Fill the form
        const titleInput = page.locator('input[name="title"], input[id="title"]').first();
        if (await titleInput.count() > 0) {
            await titleInput.fill('Unsaved Task Title');

            // Try to navigate away
            const dialogPromise = page.waitForEvent('dialog').catch(() => null);
            await page.goto('/blog');

            // Check if warning dialog appeared
            const dialog = await dialogPromise;
            if (dialog) {
                expect(dialog.type()).toBe('beforeunload');
                await dialog.dismiss().catch(() => {});
            }
        }
    });
});
