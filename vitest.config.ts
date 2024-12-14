import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    watchExclude: ['**/node_modules/**', '**/dist/**'],
    environmentMatchGlobs: [
      ['**/functions/**/*.test.{js,ts}', 'node'],
      ['**/api/**/*.test.{js,ts}', 'node'],
    ],
  },
});
