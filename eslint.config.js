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
