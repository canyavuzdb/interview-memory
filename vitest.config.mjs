import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDirectory = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': rootDirectory,
      'server-only': fileURLToPath(
        new URL('./node_modules/server-only/empty.js', import.meta.url),
      ),
    },
  },
  test: {
    clearMocks: true,
    environment: 'node',
    include: ['tests/{contract,unit}/**/*.test.{js,ts}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: [
        'lib/api/**/*.js',
        'lib/env/validation.ts',
        'lib/privacy/{contracts,errors}.ts',
        'lib/server/privacy/{persistence.schemas,repository,service}.ts',
      ],
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
