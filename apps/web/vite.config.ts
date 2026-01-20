import { sentryVitePlugin } from '@sentry/vite-plugin';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { fileURLToPath, URL } from 'url';
import { defineConfig, LibraryFormats } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const config = defineConfig(() => {
  const env = process.env;

  return {
    build: {
      lib: {
        entry: 'instrument.server.mjs',
        formats: ['es'] as LibraryFormats[],
        fileName: 'instrument.server',
      },
      sourcemap: true,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      devtools(),
      nitro(),
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tanstackStart({
        server: {
          entry: 'server.ts',
        },
      }),
      viteReact({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
      sentryVitePlugin({
        org: env.VITE_SENTRY_ORG,
        project: env.VITE_SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          filesToDeleteAfterUpload: [
            '.output/**/*.map',
          ],
        },
      }),
    ],
  };
});

export default config;
