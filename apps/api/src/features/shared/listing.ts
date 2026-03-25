import { promises as fs } from 'node:fs';
import type { Config } from '@/config';
import { packsJSONSchema, type PacksJSON, type Section } from '@bt/types';

export const getPacksFilePath = (section: Section, config: Config): string => `${config.storageUrl}/${section}/packs.json`;

export const getPacks = async (section: Section, config: Config): Promise<PacksJSON> => {
  const filePath = getPacksFilePath(section, config);
  const data = await fs.readFile(filePath, 'utf-8');
  const parsed: unknown = JSON.parse(data);

  return packsJSONSchema.parse(parsed);
};
