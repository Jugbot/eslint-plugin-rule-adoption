import ruleAdoptionPlugin from 'eslint-plugin-rule-adoption';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        node: true,
        es6: true,
      },
    },
    processor: ruleAdoptionPlugin.processors.processor,
    plugins: {
      'rule-adoption': ruleAdoptionPlugin,
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'error',
    },
  },
];
