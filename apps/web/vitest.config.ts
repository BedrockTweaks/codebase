import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vitest/config';

/**
 * Kept separate from vite.config.ts so tests do not pull in the Nitro,
 * TanStack Start and Sentry build plugins.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
