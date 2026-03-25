import { createRoute, z } from '@hono/zod-openapi';
import { createPackSchema, generatedPackResponseSchema } from '@bt/types';

export const getCraftingTweaksRoute = createRoute({
  method: 'get',
  path: '/api/crafting-tweaks',
  tags: ['Crafting Tweaks'],
  responses: {
    200: {
      description: 'Returns the list of crafting tweaks',
      content: {
        'application/json': {
          schema: z.object({
            section: z.string(),
            version: z.array(z.number()),
            categories: z.array(z.any()),
          }),
        },
      },
    },
  },
});

export const createCraftingTweakRoute = createRoute({
  method: 'post',
  path: '/api/crafting-tweaks',
  tags: ['Crafting Tweaks'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createPackSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Returns download URL for the generated crafting tweaks pack',
      content: {
        'application/json': {
          schema: generatedPackResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            statusCode: z.number(),
          }),
        },
      },
    },
  },
});
