import { OpenAPIHono } from '@hono/zod-openapi';
import { handleCreateResourcePack, handleGetResourcePacks } from './handlers';
import { createResourcePackRoute, getResourcePacksRoute } from './routes';

export const resourcePacksApp = new OpenAPIHono();

resourcePacksApp.openapi(getResourcePacksRoute, handleGetResourcePacks);
resourcePacksApp.openapi(createResourcePackRoute, handleCreateResourcePack);
