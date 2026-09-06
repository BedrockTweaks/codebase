import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { getConfig } from './config';
import { addonsApp } from './features/addons';
import { craftingTweaksApp } from './features/crafting-tweaks';
import { resourcePacksApp } from './features/resource-packs';
import { initCacheDir } from './features/shared/cache';
import { versionApp } from './features/version';

const app = new OpenAPIHono();

// Get configuration
const config = getConfig();

// CORS middleware
app.use('*', cors());

// Mount feature routes
app.route('/', resourcePacksApp);
app.route('/', addonsApp);
app.route('/', craftingTweaksApp);
app.route('/', versionApp);

// OpenAPI documentation
app.doc('/api/openapi.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Bedrock Tweaks API',
    description: 'API for assembling Minecraft Bedrock resource packs, addons, and crafting tweaks',
  },
});

// Swagger UI
app.get('/api/docs', swaggerUI({ url: '/api/openapi.json' }));

// Statuses outside this range carry no body, so they cannot answer with the
// error payload and fall back to 500.
const isContentfulStatusCode = (err: Error): err is Error & { status: ContentfulStatusCode } =>
  'status' in err && typeof err.status === 'number' && err.status >= 200 && err.status <= 599 && err.status !== 204 && err.status !== 304;

// Error handling
app.onError((err, c) => {
  console.error('Error:', err);

  const statusCode = isContentfulStatusCode(err) ? err.status : 500;
  const message = err.message || 'Internal Server Error';

  return c.json(
    {
      message,
      statusCode,
    },
    statusCode,
  );
});

// 404 handler
app.notFound(c => c.json({ error: 'Not Found', statusCode: 404 }, 404));

// Initialize cache
const initializeServer = async (): Promise<void> => {
  await initCacheDir(config);

  console.info('Pack cache initialized');
};

initializeServer().then(() => {
  console.info(`Server is running on port ${config.nodePort}`);

  serve({
    fetch: app.fetch,
    port: config.nodePort,
  });
}).catch((error: unknown) => {
  console.error('Server failed to start:', error);

  process.exit(1);
});

export default app;
