import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Try loading env synchronously
const envPath = path.resolve(process.cwd(), 'tests/.env.test');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
            value = value.replace(/\\n/gm, '\n');
        }
        value = value.replace(/(^['"]|['"]$)/g, '').trim();
        process.env[key] = value;
      }
    });
} else {
    console.warn(`[WARNING] tests/.env.test not found at ${envPath}`);
}

const authFileClient = path.resolve(process.cwd(), 'tests/e2e/.auth/client.json');
const authFileAdmin = path.resolve(process.cwd(), 'tests/e2e/.auth/admin.json');

setup('authenticate as client', async ({ page }) => {
  const email = process.env.TEST_CLIENT_EMAIL;
  const password = process.env.TEST_CLIENT_PASSWORD;
  
  if (!email || !password) {
      throw new Error("TEST_CLIENT_EMAIL or TEST_CLIENT_PASSWORD not found in .env.test");
  }

  await page.goto('/auth/login');
  await page.getByPlaceholder('you@company.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  
  // Wait for navigation or error
  await page.waitForLoadState('networkidle');
  
  // If we're still on the login page, check for errors
  if (page.url().includes('/auth/login')) {
      const errorText = await page.locator('.text-red-600, [role="alert"]').textContent().catch(() => null);
      if (errorText) throw new Error(`Login failed for client: ${errorText}`);
  }

  // Ensure we are logged in by checking for an element on the dashboard
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });

  // End of authentication steps.
  await page.context().storageState({ path: authFileClient });
});

setup('authenticate as admin', async ({ page }) => {
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;

  if (!email || !password) {
      throw new Error("TEST_ADMIN_EMAIL or TEST_ADMIN_PASSWORD not found in .env.test");
  }

  await page.goto('/auth/login');
  await page.getByPlaceholder('you@company.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  
  // Wait for navigation
  await page.waitForLoadState('networkidle');

  if (page.url().includes('/auth/login')) {
      const errorText = await page.locator('.text-red-600, [role="alert"]').textContent().catch(() => null);
      if (errorText) throw new Error(`Login failed for admin: ${errorText}`);
  }
  
  // Ensure we are logged in by checking that the Admin dashboard has loaded
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible({ timeout: 10000 });

  // End of authentication steps.
  await page.context().storageState({ path: authFileAdmin });
});
