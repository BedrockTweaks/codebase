import { createRoute, z } from '@hono/zod-openapi';

export const getVersionRoute = createRoute({
  method: 'get',
  path: '/api/version',
  tags: ['Version'],
  responses: {
    200: {
      description: 'Returns the latest released Files version',
      content: {
        'application/json': {
          schema: z.object({
            version: z.string(),
          }),
        },
      },
    },
  },
});
