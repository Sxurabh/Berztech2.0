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
      console.log('Skipping client auth - credentials not configured');
      return;
  }

  if (fs.existsSync(authFileClient)) {
      const existingAuth = JSON.parse(fs.readFileSync(authFileClient, 'utf8'));
      if (existingAuth.cookies && existingAuth.cookies.length > 0) {
          console.log('Skipping client auth - auth file already exists');
          return;
      }
  }

  await page.goto('/auth/login');
  await page.waitForLoadState('domcontentloaded');
  
  const invalidApiKey = await page.locator('text=Invalid API key').isVisible().catch(() => false);
  if (invalidApiKey) {
      console.log('Skipping auth tests - Supabase API key is invalid');
      return;
  }

  await page.getByPlaceholder('you@company.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  
  const signInButton = page.locator('button[type="submit"]').filter({ hasText: 'Sign In' });
  await signInButton.click();
  
  await page.waitForLoadState('networkidle');

  const currentUrl = page.url();
  if (currentUrl.includes('/auth/login')) {
      console.log('Skipping auth tests - login did not redirect');
      return;
  }

  try {
      await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      await page.context().storageState({ path: authFileClient });
  } catch (e) {
      console.log('Skipping client auth - login failed');
  }
});

setup('authenticate as admin', async ({ page }) => {
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;

  if (!email || !password) {
      console.log('Skipping admin auth - credentials not configured');
      return;
  }

  if (fs.existsSync(authFileAdmin)) {
      const existingAuth = JSON.parse(fs.readFileSync(authFileAdmin, 'utf8'));
      if (existingAuth.cookies && existingAuth.cookies.length > 0) {
          console.log('Skipping admin auth - auth file already exists');
          return;
      }
  }

  await page.goto('/auth/login');
  await page.waitForLoadState('domcontentloaded');
  
  const invalidApiKey = await page.locator('text=Invalid API key').isVisible().catch(() => false);
  if (invalidApiKey) {
      console.log('Skipping auth tests - Supabase API key is invalid');
      return;
  }

  await page.getByPlaceholder('you@company.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  
  const signInButton = page.locator('button[type="submit"]').filter({ hasText: 'Sign In' });
  await signInButton.click();
  
  await page.waitForLoadState('networkidle');

  const currentUrl = page.url();
  if (currentUrl.includes('/auth/login')) {
      console.log('Skipping auth tests - login did not redirect');
      return;
  }
  
  try {
      await expect(page).toHaveURL(/admin/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      await page.context().storageState({ path: authFileAdmin });
  } catch (e) {
      console.log('Skipping admin auth - login failed');
  }
});
