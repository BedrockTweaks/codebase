import fsExtra from 'fs-extra';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  outDir: '.output',
  bundle: true,
  noExternal: [/.*/],
  clean: true,
  sourcemap: false,
  splitting: false,
  banner: {
    js: 'import { createRequire } from \'module\'; const require = createRequire(import.meta.url);',
  },
  onSuccess: async (): Promise<void> => {
    fsExtra.copySync('assets', '.output/assets');
  },
});
