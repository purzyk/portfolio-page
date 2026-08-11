const { FlatCompat } = require('@eslint/eslintrc')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
const prettier = require('eslint-config-prettier')

/**
 * Mirrors the Studio config so both projects lint the same way.
 *
 * One structural difference: Studio is on eslint-config-next 16, which ships a flat
 * config that can be spread directly. This project is on Next 15, whose config is still
 * legacy .eslintrc-shaped, so FlatCompat translates it. Swap the compat block for a
 * plain `...nextConfig` spread if this ever moves to Next 16.
 *
 * Cypress is absent here — Studio lints its e2e suite, this project has no tests yet.
 */

const compat = new FlatCompat({ baseDirectory: __dirname })

module.exports = [
  // Next.js rules (react, react-hooks, @next/next) plus its TypeScript layer.
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // TypeScript recommended rules
  ...tsPlugin.configs['flat/recommended'],

  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // Must stay last: turns off every rule that would fight Prettier's formatting.
  prettier,

  {
    ignores: ['.next/**', 'next-env.d.ts', 'eslint.config.js'],
  },
]
