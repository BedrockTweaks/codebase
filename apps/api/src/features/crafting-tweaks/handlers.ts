import { promises as fs } from 'node:fs';
import type { Context } from 'hono';
import { getConfig } from '@/config';
import type { CreatePackDto } from '@bt/types';
import { createPack } from '../shared/generation';
import { getPacksFilePath } from '../shared/listing';
import { saveTempFile } from '../shared/temp-storage';

export const handleGetCraftingTweaks = async (c: Context): Promise<Response> => {
  const config = getConfig();
  const filePath = getPacksFilePath('crafting_tweaks', config);

  const fileContent = await fs.readFile(filePath);

  return c.body(fileContent, 200, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  });
};

export const handleCreateCraftingTweak = async (c: Context): Promise<Response> => {
  const config = getConfig();
  const createPackDto: CreatePackDto = await c.req.json();

  try {
    const generatedPack = await createPack(createPackDto, 'crafting_tweaks', config);
    const isProd = config.production;
    const extension = isProd ? 'mcpack' : 'zip';
    const filename = `${createPackDto.name}.${extension}`;

    // Get base URL from request
    const url = new URL(c.req.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Save to temp storage and get download URL
    const { downloadUrl, expiresAt } = await saveTempFile(
      generatedPack.buffer,
      filename,
      baseUrl,
    );

    return c.json(
      {
        downloadUrl,
        packName: generatedPack.packName,
        expiresAt: expiresAt.toISOString(),
      },
      200,
    );
  } catch (error) {
    console.error('Error creating crafting tweak:', error);

    return c.json(
      {
        message: 'Failed to generate pack. Please contact us on Discord',
        statusCode: 500,
      },
      500,
    );
  }
};
