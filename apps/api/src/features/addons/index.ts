import { OpenAPIHono } from '@hono/zod-openapi';
import { handleCreateAddon, handleGetAddons } from './handlers';
import { createAddonRoute, getAddonsRoute } from './routes';

export const addonsApp = new OpenAPIHono();

addonsApp.openapi(getAddonsRoute, handleGetAddons);
addonsApp.openapi(createAddonRoute, handleCreateAddon);
