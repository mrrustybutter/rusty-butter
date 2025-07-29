import tseslint from 'typescript-eslint';
import eslintConfig from '@rusty-butter/eslint-config';

export default tseslint.config([
  // Use the shared config as base
  ...eslintConfig,
  // Additional root-level ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.d.ts',
      'packages/*/packages/*/dist/**',
      'pnpm-lock.yaml',
      '.pnpm-debug.log',
      '**/src/index.js',
      '**/src/index.d.ts',
      '**/test-*.js',
      '**/bin/**',
    ],
  },
]);
