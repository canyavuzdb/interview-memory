import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDirectory = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': rootDirectory,
    },
  },
  test: {
    clearMocks: true,
    environment: 'node',
    include: ['tests/{contract,unit}/**/*.test.js'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['lib/api/**/*.js', 'lib/env/validation.ts'],
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        perFile: true,
        statements: 100,
      },
    },
  },
})
