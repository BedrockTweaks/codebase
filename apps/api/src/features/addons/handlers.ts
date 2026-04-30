import type { Context } from 'hono';
import { getConfig } from '@/config';
import type { CreatePackDto } from '@bt/types';
import { computeCacheKey, getCachedPack, getPackOutputPath, saveCachedPack } from '../shared/cache';
import { buildStaticDownloadUrl } from '../shared/download-url';
import { createPack, getPacksPaths } from '../shared/generation';
import { getPacks } from '../shared/listing';

export const handleGetAddons = async (c: Context) => {
  const config = getConfig();
  const packs = await getPacks('addons', config);

  return c.json(packs, 200, {
    'Cache-Control': 'no-store',
  });
};

export const handleCreateAddon = async (c: Context) => {
  const config = getConfig();
  const createPackDto: CreatePackDto = await c.req.json();

  try {
    const filename = `${createPackDto.name}.mcaddon`;

    const cacheKey = computeCacheKey('addons', createPackDto);
    const packsPaths = await getPacksPaths(createPackDto, 'addons', config);
    const cached = await getCachedPack(cacheKey, packsPaths, 'addons', config);

    if (cached) {
      const downloadUrl = buildStaticDownloadUrl(c.req.url, 'addons', cacheKey, createPackDto.name);

      return c.json(
        {
          downloadUrl,
          packName: createPackDto.name,
        },
        200,
      );
    }

    const outputPath = getPackOutputPath(cacheKey, config);
    const { packName } = await createPack(createPackDto, 'addons', outputPath, config);

    await saveCachedPack(cacheKey, filename, packsPaths, config);

    const downloadUrl = buildStaticDownloadUrl(c.req.url, 'addons', cacheKey, packName);

    return c.json(
      {
        downloadUrl,
        packName,
      },
      200,
    );
  } catch (error) {
    console.error('Error creating addon:', error);

    return c.json(
      {
        message: 'Failed to generate pack. Please contact us on Discord',
        statusCode: 500,
      },
      500,
    );
  }
};
