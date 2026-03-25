import { createRoute, z } from '@hono/zod-openapi';
import { createPackSchema, generatedPackResponseSchema } from '@bt/types';

export const getAddonsRoute = createRoute({
  method: 'get',
  path: '/api/addons',
  tags: ['Addons'],
  responses: {
    200: {
      description: 'Returns the list of addons',
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

export const createAddonRoute = createRoute({
  method: 'post',
  path: '/api/addons',
  tags: ['Addons'],
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
      description: 'Returns download URL for the generated addon pack',
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
