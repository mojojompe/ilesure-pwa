import { defineConfig } from 'vitest/config';

// Kept apart from vite.config.ts so tests do not load the PWA/service-worker plugin.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
