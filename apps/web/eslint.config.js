import config from '@bt/config/eslint';
import pluginQuery from '@tanstack/eslint-plugin-query';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  ...config,
  ...pluginQuery.configs['flat/recommended'],
  reactHooks.configs.flat.recommended,
];
