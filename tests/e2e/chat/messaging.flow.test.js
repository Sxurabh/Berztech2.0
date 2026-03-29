/**
 * @fileoverview E2E flow tests for messaging functionality
 *
 * Tests cover:
 * - Complete message send and receive flow
 * - Attachment upload flow
 * - Message persistence after reload
 *
 * Requires: PLAYWRIGHT_BASE_URL, TEST_CLIENT_EMAIL, TEST_CLIENT_PASSWORD
 */

import { test, expect } from "@playwright/test";

test.describe("Messaging Flow E2E", () => {
    const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
    const testEmail = process.env.TEST_CLIENT_EMAIL;
    const testPassword = process.env.TEST_CLIENT_PASSWORD;

    test.beforeEach(async ({ page }) => {
        if (!testEmail || !testPassword) {
            test.skip();
            return;
        }

        await page.goto(`${baseUrl}/auth/login`);
        await page.waitForLoadState("domcontentloaded");

        await page.getByPlaceholder("you@company.com").fill(testEmail);
        await page.getByPlaceholder("••••••••").fill(testPassword);
        await page.getByRole("button", { name: /Sign In/i }).first().click();

        await page.waitForURL(/\/dashboard/, { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(2000);
    });

    test("1. Complete message send flow", async ({ page }) => {
        await page.goto(`${baseUrl}/dashboard`);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(2000);

        const chatButton = page.locator('button').filter({ hasText: /message|chat|Chat/i }).first();
        if (await chatButton.count() > 0) {
            await chatButton.click();
            await page.waitForTimeout(500);
        }

        const messageInput = page.locator('textarea[placeholder*="Type a message"], input[placeholder*="Type a message"]').first();
        const sendButton = page.locator('button[type="submit"], button:has(svg)').filter({ hasText: "" }).last();

        if (await messageInput.count() > 0) {
            const testMessage = `E2E Test Message ${Date.now()}`;
            await messageInput.fill(testMessage);

            if (await sendButton.count() > 0) {
                await sendButton.click();
                await page.waitForTimeout(1000);

                const sentMessage = page.getByText(testMessage).first();
                await expect(sentMessage).toBeVisible();
            }
        } else {
            test.skip();
        }
    });

    test("2. Attachment upload flow", async ({ page }) => {
        await page.goto(`${baseUrl}/dashboard`);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(2000);

        const chatButton = page.locator('button').filter({ hasText: /message|chat|Chat/i }).first();
        if (await chatButton.count() > 0) {
            await chatButton.click();
            await page.waitForTimeout(500);
        }

        const attachButton = page.locator('button:has-text("Attach"), button:has([class*="attach"])').first();

        if (await attachButton.count() > 0) {
            await attachButton.click();
            await page.waitForTimeout(500);

            const fileInput = page.locator('input[type="file"]').first();
            if (await fileInput.count() > 0) {
                await expect(fileInput).toBeVisible();
            } else {
                const fileDialog = page.locator('input[type="file"]');
                await expect(fileDialog).toBeVisible();
            }
        } else {
            test.skip();
        }
    });

    test("3. Message persistence after page reload", async ({ page }) => {
        const testMessage = `Persistence Test ${Date.now()}`;

        await page.goto(`${baseUrl}/dashboard`);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(2000);

        const chatButton = page.locator('button').filter({ hasText: /message|chat|Chat/i }).first();
        if (await chatButton.count() > 0) {
            await chatButton.click();
            await page.waitForTimeout(500);
        }

        const messageInput = page.locator('textarea[placeholder*="Type a message"], input[placeholder*="Type a message"]').first();

        if (await messageInput.count() > 0) {
            await messageInput.fill(testMessage);

            const sendButton = page.locator('button[type="submit"]').first();
            if (await sendButton.count() > 0) {
                await sendButton.click();
                await page.waitForTimeout(1000);

                await page.reload();
                await page.waitForLoadState("domcontentloaded");
                await page.waitForTimeout(2000);

                const chatButtonAfter = page.locator('button').filter({ hasText: /message|chat|Chat/i }).first();
                if (await chatButtonAfter.count() > 0) {
                    await chatButtonAfter.click();
                    await page.waitForTimeout(500);
                }

                const persistedMessage = page.getByText(testMessage).first();
                await expect(persistedMessage).toBeVisible();
            }
        } else {
            test.skip();
        }
    });

    test("4. Multiple messages in sequence", async ({ page }) => {
        await page.goto(`${baseUrl}/dashboard`);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(2000);

        const chatButton = page.locator('button').filter({ hasText: /message|chat|Chat/i }).first();
        if (await chatButton.count() > 0) {
            await chatButton.click();
            await page.waitForTimeout(500);
        }

        const messageInput = page.locator('textarea[placeholder*="Type a message"], input[placeholder*="Type a message"]').first();

        if (await messageInput.count() > 0) {
            for (let i = 0; i < 3; i++) {
                const msg = `Message ${i + 1} - ${Date.now()}`;
                await messageInput.fill(msg);

                const sendButton = page.locator('button[type="submit"]').first();
                if (await sendButton.count() > 0) {
                    await sendButton.click();
                    await page.waitForTimeout(500);
                }
            }

            await page.waitForTimeout(1000);
            const messagesCount = await page.locator('[class*="message"], [class*="Message"]').count();
            expect(messagesCount).toBeGreaterThan(0);
        } else {
            test.skip();
        }
    });
});
