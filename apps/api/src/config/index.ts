import 'dotenv/config';
import { z } from 'zod';

const configSchema = z.object({
  nodePort: z.coerce.number().default(8000),
  production: z.string().transform(val => val === 'true').default('false'),
  storageUrl: z.string().min(1),
  metadataAuthors: z.string().min(1),
});

export type Config = z.infer<typeof configSchema>;

let cachedConfig: Config | null = null;

export const getConfig = (): Config => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const result = configSchema.safeParse({
    nodePort: process.env['NODE_PORT'],
    production: process.env['PRODUCTION'],
    storageUrl: process.env['STORAGE_URL'],
    metadataAuthors: process.env['METADATA_AUTHORS'],
  });

  if (!result.success) {
    console.error('Configuration validation failed:', result.error.format());

    throw new Error('Invalid environment variables. Check .env file.');
  }

  cachedConfig = result.data;

  return cachedConfig;
};
