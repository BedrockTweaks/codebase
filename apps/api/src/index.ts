import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { getConfig } from './config';
import { addonsApp } from './features/addons';
import { craftingTweaksApp } from './features/crafting-tweaks';
import { resourcePacksApp } from './features/resource-packs';
import { initCacheDir } from './features/shared/cache';

const app = new OpenAPIHono();

// Get configuration
const config = getConfig();

// CORS middleware
app.use('*', cors());

// Mount feature routes
app.route('/', resourcePacksApp);
app.route('/', addonsApp);
app.route('/', craftingTweaksApp);

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

// Error handling
app.onError((err, c) => {
  console.error('Error:', err);

  const statusCode = 'status' in err && typeof err.status === 'number' ? err.status : 500;
  const message = err.message || 'Internal Server Error';

  return c.json(
    {
      message,
      statusCode,
    },
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
});

export default app;
