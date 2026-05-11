import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/routeTree.gen.ts', '**/*.d.ts'],
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/routeTree.gen.ts',
        'src/**/*.d.ts',
        'src/db/schema.ts',
        'src/router.tsx',
        'src/routes/**',
        'src/lib/GoogleTranslation.ts',
        'src/lib/MicrosoftTranslation.ts',
        'src/lib/db.ts',
        'src/lib/translationDb.ts',
        'src/lib/translate.ts',
        'src/lib/translate.types.ts',
        'src/lib/rateLimit.ts',
        'src/components/icons/**',
        'src/components/ui/**',
        'src/components/layout/**',
        'src/components/shell/**',
        'src/features/word-cloud/components/option-fields/**',
        'src/features/word-cloud/components/cloud-render/**',
        'src/features/word-cloud/components/SourceTextPanel.tsx',
        'src/features/word-cloud/components/WordCloudCanvas.tsx',
        'src/features/word-cloud/components/WordCloudOptions.tsx',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
})
