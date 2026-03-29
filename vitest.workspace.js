import { defineConfig } from 'vitest/config';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, 'tests/.env.test') });
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 60000,
    setupFiles: ['./tests/setup-node.ts'],
    env: {
      ADMIN_EMAIL: 'saurabhkirve@gmail.com',
      NEXT_PUBLIC_ADMIN_EMAIL: 'saurabhkirve@gmail.com',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
