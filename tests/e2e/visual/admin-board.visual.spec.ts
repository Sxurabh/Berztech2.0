import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const authFileAdmin = path.resolve(process.cwd(), 'tests/e2e/.auth/admin.json');
const hasValidAuth = fs.existsSync(authFileAdmin) && 
    JSON.parse(fs.readFileSync(authFileAdmin, 'utf8')).cookies?.length > 0;

test.describe('Admin Board Visual Regression', () => {
    test.beforeEach(async ({ page }) => {
        if (!hasValidAuth) {
            test.skip();
            return;
        }
        await page.goto('/admin/board');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('[data-testid="kanban-board"]', { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(2000);
    });

    test.describe('Desktop', () => {
        test.use({ viewport: { width: 1440, height: 900 } });

        test('full admin board matches baseline', async ({ page }) => {
            await expect(page).toHaveScreenshot('admin-board-full.png', {
                maxDiffPixels: 100,
                threshold: 0.5,
            });
        });

        test('kanban columns match baseline', async ({ page }) => {
            const kanbanBoard = page.locator('[data-testid="kanban-board"]');
            await expect(kanbanBoard).toHaveScreenshot('admin-board-kanban.png', {
                maxDiffPixels: 50,
                threshold: 0.3,
            });
        });

        test('single kanban column matches baseline', async ({ page }) => {
            const column = page.locator('[data-testid="kanban-column"]').first();
            await expect(column).toHaveScreenshot('admin-board-column.png', {
                maxDiffPixels: 30,
                threshold: 0.2,
            });
        });
    });

    test.describe('Mobile', () => {
        test.use({ viewport: { width: 375, height: 667 } });

        test('mobile admin board matches baseline', async ({ page }) => {
            await expect(page).toHaveScreenshot('admin-board-mobile.png', {
                maxDiffPixels: 50,
                threshold: 0.5,
            });
        });
    });
});
