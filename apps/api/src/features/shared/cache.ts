import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { z } from 'zod';

import type { Config } from '@/config';
import type { CreatePackDto, Section } from '@bt/types';

const cacheMetaSchema = z.object({
  fileName: z.string(),
  createdAt: z.string(),
  lastAccessed: z.string(),
  packsPaths: z.array(z.string()),
});

type CacheMeta = z.infer<typeof cacheMetaSchema>;

const getCacheDir = (config: Config): string =>
  config.cacheDir ?? join(tmpdir(), 'bedrock-tweaks-cache');

const getCacheMaxBytes = (config: Config): number =>
  config.cacheMaxBytes ?? 4 * 1024 * 1024 * 1024; // 4GB

export const getPackOutputPath = (cacheKey: string, config: Config): string =>
  join(getCacheDir(config), cacheKey);

export const initCacheDir = async (config: Config): Promise<void> => {
  const dir = getCacheDir(config);

  try {
    await fs.mkdir(dir, { recursive: true });

    console.info('Cache directory initialized:', dir);
  } catch (error) {
    console.error('Failed to initialize cache directory:', error);

    throw error;
  }
};

export const computeCacheKey = (section: Section, createPackDto: CreatePackDto): string => {
  const hash = createHash('sha256');

  hash.update(section);

  const sortedCategories = [...createPackDto.categories].sort((a, b) =>
    a.id.localeCompare(b.id),
  );

  for (const category of sortedCategories) {
    hash.update(category.id);

    for (const packId of [...category.packs].sort()) {
      hash.update(packId);
    }
  }

  return hash.digest('hex');
};

const getMaxMtimeMs = async (dirPath: string): Promise<number> => {
  let maxMtime = 0;

  let entries;

  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return maxMtime;
  }

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const childMax = await getMaxMtimeMs(fullPath);

      if (childMax > maxMtime) {
        maxMtime = childMax;
      }
    } else {
      try {
        const stat = await fs.stat(fullPath);

        if (stat.mtimeMs > maxMtime) {
          maxMtime = stat.mtimeMs;
        }
      } catch {
        // skip unreadable files
      }
    }
  }

  return maxMtime;
};

const isStale = async (
  packsPaths: string[],
  createdAt: string,
  section: Section,
  config: Config,
): Promise<boolean> => {
  const createdAtMs = new Date(createdAt).getTime();

  for (const packPath of packsPaths) {
    const fullPath = join(config.storageUrl, section, packPath);
    const maxMtime = await getMaxMtimeMs(fullPath);

    if (maxMtime > createdAtMs) {
      return true;
    }
  }

  return false;
};

export const getCachedPack = async (
  cacheKey: string,
  packsPaths: string[],
  section: Section,
  config: Config,
): Promise<{ filePath: string; fileName: string } | null> => {
  const cacheDir = getCacheDir(config);
  const metaPath = join(cacheDir, `${cacheKey}.meta`);
  const filePath = join(cacheDir, cacheKey);

  try {
    const metaContent = await fs.readFile(metaPath, 'utf-8');
    const parsed: unknown = JSON.parse(metaContent);
    const meta: CacheMeta = cacheMetaSchema.parse(parsed);

    await fs.access(filePath);

    const stale = await isStale(packsPaths, meta.createdAt, section, config);

    if (stale) {
      await fs.unlink(filePath).catch(() => undefined);
      await fs.unlink(metaPath).catch(() => undefined);

      return null;
    }

    const updatedMeta: CacheMeta = {
      ...meta,
      lastAccessed: new Date().toISOString(),
    };

    await fs.writeFile(metaPath, JSON.stringify(updatedMeta));

    return { filePath, fileName: meta.fileName };
  } catch {
    return null;
  }
};

export const lookupCachedFile = async (
  cacheKey: string,
  config: Config,
): Promise<{ filePath: string; fileName: string } | null> => {
  const cacheDir = getCacheDir(config);
  const metaPath = join(cacheDir, `${cacheKey}.meta`);
  const filePath = join(cacheDir, cacheKey);

  try {
    const metaContent = await fs.readFile(metaPath, 'utf-8');
    const parsed: unknown = JSON.parse(metaContent);
    const meta: CacheMeta = cacheMetaSchema.parse(parsed);

    await fs.access(filePath);

    const updatedMeta: CacheMeta = {
      ...meta,
      lastAccessed: new Date().toISOString(),
    };

    await fs.writeFile(metaPath, JSON.stringify(updatedMeta));

    return { filePath, fileName: meta.fileName };
  } catch {
    return null;
  }
};

export const saveCachedPack = async (
  cacheKey: string,
  fileName: string,
  packsPaths: string[],
  config: Config,
): Promise<void> => {
  const cacheDir = getCacheDir(config);
  const metaPath = join(cacheDir, `${cacheKey}.meta`);
  const now = new Date().toISOString();

  const meta: CacheMeta = {
    fileName,
    createdAt: now,
    lastAccessed: now,
    packsPaths,
  };

  await fs.writeFile(metaPath, JSON.stringify(meta));

  void evictLRU(config);
};

const getCacheSize = async (config: Config): Promise<number> => {
  const cacheDir = getCacheDir(config);

  try {
    const allFiles = await fs.readdir(cacheDir);
    const dataFiles = allFiles.filter(f => !f.endsWith('.meta'));

    const sizes = await Promise.all(
      dataFiles.map(async (file): Promise<number> => {
        try {
          const stat = await fs.stat(join(cacheDir, file));

          return stat.size;
        } catch {
          return 0;
        }
      }),
    );

    return sizes.reduce((acc, size) => acc + size, 0);
  } catch {
    return 0;
  }
};

const evictLRU = async (config: Config): Promise<void> => {
  const cacheDir = getCacheDir(config);
  const maxBytes = getCacheMaxBytes(config);

  try {
    const currentSize = await getCacheSize(config);

    if (currentSize <= maxBytes) {
      return;
    }

    const allFiles = await fs.readdir(cacheDir);
    const metaFiles = allFiles.filter(f => f.endsWith('.meta'));
    const entries: Array<{ cacheKey: string; lastAccessed: number; size: number }> = [];

    for (const metaFile of metaFiles) {
      const cacheKey = metaFile.slice(0, -5);
      const metaPath = join(cacheDir, metaFile);

      try {
        const metaContent = await fs.readFile(metaPath, 'utf-8');
        const parsed: unknown = JSON.parse(metaContent);
        const meta: CacheMeta = cacheMetaSchema.parse(parsed);
        const dataPath = join(cacheDir, cacheKey);
        const stat = await fs.stat(dataPath);

        entries.push({
          cacheKey,
          lastAccessed: new Date(meta.lastAccessed).getTime(),
          size: stat.size,
        });
      } catch {
        // skip unreadable or incomplete entries
      }
    }

    entries.sort((a, b) => a.lastAccessed - b.lastAccessed);

    const target = currentSize - maxBytes;
    let freed = 0;

    for (const entry of entries) {
      if (freed >= target) {
        break;
      }

      try {
        await fs.unlink(join(cacheDir, entry.cacheKey));
        await fs.unlink(join(cacheDir, `${entry.cacheKey}.meta`));

        freed += entry.size;

        console.info(`Evicted cache entry: ${entry.cacheKey} (freed ${entry.size} bytes)`);
      } catch (error) {
        console.error(`Failed to evict cache entry ${entry.cacheKey}:`, error);
      }
    }
  } catch (error) {
    console.error('Cache eviction failed:', error);
  }
};
