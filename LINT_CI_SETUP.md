# Lint & CI Setup Guide

## ESLint

```bash
npm install --save-dev eslint @eslint/js eslint-plugin-react eslint-plugin-react-hooks globals
```

Create `eslint.config.js`:

```js
import js from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  pluginReact.configs.flat?.recommended ?? pluginReact.configs.recommended,
  {
    plugins: { 'react-hooks': pluginReactHooks },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      ...pluginReactHooks.configs.recommended.rules,
    },
    settings: {
      react: { version: 'detect' },
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2021 },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
```

Add to `package.json` scripts:

```json
"lint": "eslint ."
```

## Prettier

```bash
npm install --save-dev prettier
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

Add to `package.json` scripts:

```json
"format": "prettier --write \"src/**/*.{js,jsx,css}\" \"index.html\"",
"format:check": "prettier --check \"src/**/*.{js,jsx,css}\" \"index.html\""
```

## Doctor script

Create `scripts/doctor.mjs` — validates Node version, files exist, env var, format, lint, and build. See the full file in the repo.

Add to `package.json` scripts:

```json
"doctor": "node scripts/doctor.mjs"
```

## CI pipeline

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Doctor
        run: npm run doctor
        env:
          VITE_GROQ_API_KEY: ${{ secrets.VITE_GROQ_API_KEY }}
```

**Before CI works**, add `VITE_GROQ_API_KEY` as a repository secret in GitHub → Settings → Secrets and variables → Actions.
