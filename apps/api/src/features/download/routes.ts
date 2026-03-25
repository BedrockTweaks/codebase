import { createRoute, z } from '@hono/zod-openapi';

export const downloadFileRoute = createRoute({
  method: 'get',
  path: '/api/download/{fileId}',
  tags: ['Download'],
  request: {
    params: z.object({
      fileId: z.string().length(16).describe('Unique file identifier (16-character hex)'),
    }),
  },
  responses: {
    200: {
      description: 'Downloads the requested file',
      content: {
        'application/octet-stream': {
          schema: z.instanceof(Buffer),
        },
      },
    },
    404: {
      description: 'File not found or expired',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            statusCode: z.number(),
          }),
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
