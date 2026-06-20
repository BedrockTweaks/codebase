import baseConfig from '@bt/config/eslint';

export default [
  ...baseConfig,
  {
    ignores: ['**/.output/**'],
  },
];
