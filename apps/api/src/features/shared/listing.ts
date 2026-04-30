import type { Config } from '@/config';
import { packsJSONSchema, type PacksJSON, type Section } from '@bt/types';
import { promises as fs } from 'node:fs';

export const getPacks = async (section: Section, config: Config): Promise<PacksJSON> => {
  const filePath = `${config.storageUrl}/${section}/packs.json`;
  const data = await fs.readFile(filePath, 'utf-8');
  const parsed: unknown = JSON.parse(data);

  return packsJSONSchema.parse(parsed);
};
