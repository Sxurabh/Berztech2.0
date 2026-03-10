import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
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
    include: ['src/lib/**', 'src/app/api/**', 'src/config/**', 'tests/unit/**', 'tests/components/**', 'tests/integration/**'],
    exclude: ['tests/e2e/**', 'tests/load/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
