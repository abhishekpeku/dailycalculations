module.exports = {
  ignores: ['node_modules/', '.next/'],
  files: ['**/*.{js,jsx,ts,tsx}'],
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      project: './tsconfig.json',
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      }
    }
  },
  plugins: {
    '@typescript-eslint': require('@typescript-eslint/eslint-plugin')
  },
  rules: {}
};
