import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 30000,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**', 'src/lib/data/**', 'src/app/api/**', 'src/config/**', 'src/components/ui/**', 'src/components/admin/**', 'src/components/client/**', 'src/components/features/**'],
      exclude: ['src/data/**', 'src/components/sections/**', 'src/components/layout/**', 'src/components/providers/**'],
      thresholds: {
        lines: 89,
        functions: 73,
        branches: 73,
        statements: 89,
      },
      all: true,
    },
    include: ['tests/**/*.test.{js,ts,jsx,tsx}'],
    exclude: ['tests/e2e/**', 'tests/load/**', 'tests/security/api-auth-matrix.test.ts'],
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
