import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30000,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/lib/**',
        'src/lib/data/**',
        'src/app/api/**',
        'src/config/**',
        'src/components/ui/**',
        'src/components/admin/**',
        'src/components/client/**',
        'src/components/features/**',
      ],
      exclude: [
        'src/data/**',
        'src/components/sections/**',
        'src/components/layout/**',
        'src/components/providers/**',
      ],
      thresholds: {
        lines: 89,
        functions: 73,
        branches: 73,
        statements: 89,
      },
      all: true,
    },
    exclude: ['tests/e2e/**', 'tests/load/**', 'node_modules/**'],
    projects: [
      {
        extends: true,
        name: 'jsdom',
        test: {
          environment: 'jsdom',
          include: [
            'tests/unit/**/*.test.{js,ts,jsx,tsx}',
            'tests/components/**/*.test.{js,ts,jsx,tsx}',
            'tests/integration/**/*.test.{js,ts,jsx,tsx}',
            'tests/property/**/*.test.{js,ts,jsx,tsx}',
            'tests/contract/**/*.test.{js,ts,jsx,tsx}',
            'tests/security/**/*.test.{js,ts,jsx,tsx}',
          ],
          exclude: ['tests/security/integration/**'],
          setupFiles: ['./tests/setup.ts'],
        },
      },
      {
        extends: true,
        name: 'node',
        test: {
          environment: 'node',
          include: ['tests/security/integration/**/*.test.js'],
          setupFiles: ['./tests/setup-integration.ts'],
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
});
