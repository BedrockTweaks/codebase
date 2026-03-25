import { OpenAPIHono } from '@hono/zod-openapi';
import { handleCreateCraftingTweak, handleGetCraftingTweaks } from './handlers';
import { createCraftingTweakRoute, getCraftingTweaksRoute } from './routes';

export const craftingTweaksApp = new OpenAPIHono();

craftingTweaksApp.openapi(getCraftingTweaksRoute, handleGetCraftingTweaks);
craftingTweaksApp.openapi(createCraftingTweakRoute, handleCreateCraftingTweak);
