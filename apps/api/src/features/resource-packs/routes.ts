import { createRoute, z } from '@hono/zod-openapi';
import { createPackSchema, generatedPackResponseSchema, packsJSONSchema } from '@bt/types';

export const getResourcePacksRoute = createRoute({
  method: 'get',
  path: '/api/resource-packs',
  tags: ['Resource Packs'],
  responses: {
    200: {
      description: 'Returns the list of resource packs',
      content: {
        'application/json': {
          schema: packsJSONSchema,
        },
      },
    },
  },
});

export const createResourcePackRoute = createRoute({
  method: 'post',
  path: '/api/resource-packs',
  tags: ['Resource Packs'],
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
      description: 'Returns download URL for the generated resource pack',
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
