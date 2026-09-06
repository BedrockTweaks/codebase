import { OpenAPIHono } from '@hono/zod-openapi';
import { handleGetVersion } from './handlers';
import { getVersionRoute } from './routes';

export const versionApp = new OpenAPIHono();

versionApp.openapi(getVersionRoute, handleGetVersion);
