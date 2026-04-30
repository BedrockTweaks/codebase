import { getConfig } from '@/config';
import type { CreatePackDto } from '@bt/types';
import type { Context } from 'hono';
import { computeCacheKey, getCachedPack, getPackOutputPath, saveCachedPack } from '../shared/cache';
import { buildStaticDownloadUrl } from '../shared/download-url';
import { createPack, getPacksPaths } from '../shared/generation';
import { getPacks } from '../shared/listing';

export const handleGetResourcePacks = async (c: Context) => {
  const config = getConfig();
  const packs = await getPacks('resource_packs', config);

  return c.json(packs, 200, {
    'Cache-Control': 'no-store',
  });
};

export const handleCreateResourcePack = async (c: Context) => {
  const config = getConfig();
  const createPackDto: CreatePackDto = await c.req.json();

  try {
    const filename = `${createPackDto.name}.mcpack`;

    const cacheKey = computeCacheKey('resource_packs', createPackDto);
    const packsPaths = await getPacksPaths(createPackDto, 'resource_packs', config);
    const cached = await getCachedPack(cacheKey, packsPaths, 'resource_packs', config);

    if (cached) {
      const downloadUrl = buildStaticDownloadUrl(c.req.url, 'resource_packs', cacheKey, createPackDto.name);

      return c.json(
        {
          downloadUrl,
          packName: createPackDto.name,
        },
        200,
      );
    }

    const outputPath = getPackOutputPath(cacheKey, config);
    const { packName } = await createPack(createPackDto, 'resource_packs', outputPath, config);

    await saveCachedPack(cacheKey, filename, packsPaths, config);

    const downloadUrl = buildStaticDownloadUrl(c.req.url, 'resource_packs', cacheKey, packName);

    return c.json(
      {
        downloadUrl,
        packName,
      },
      200,
    );
  } catch (error) {
    console.error('Error creating resource pack:', error);

    return c.json(
      {
        message: 'Failed to generate pack. Please contact us on Discord',
        statusCode: 500,
      },
      500,
    );
  }
};
