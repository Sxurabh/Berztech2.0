import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**', 'src/app/api/**', 'src/config/**'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
      },
    },
    include: ['tests/**/*.test.{js,ts,jsx,tsx}'],
    exclude: ['tests/e2e/**', 'tests/load/**'],
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
