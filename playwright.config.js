import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, 'tests', '.env.test') });

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
    },
    expect: {
        toHaveScreenshot: {
            maxDiffPixels: 50,
            threshold: 0.3,
            animations: 'disabled',
        },
    },
    projects: [
        {
            name: 'client setup',
            testMatch: /.*\.setup\.ts/,
        },
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            dependencies: ['client setup'],
        },
        {
            name: 'chromium-mobile',
            use: {
                ...devices['iPhone 12'],
                baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
            },
            dependencies: ['client setup'],
        },
        {
            name: 'chromium-tablet',
            use: {
                viewport: { width: 768, height: 1024 },
                baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
            },
            dependencies: ['client setup'],
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },
});
