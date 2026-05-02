import type { Config } from '@/config';
import type { CreatePackDto, Section } from '@bt/types';
import { createHash, randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';

const assemblyMetaSchema = z.object({
  createdAt: z.string(),
  lastAccessed: z.string(),
  packsPaths: z.array(z.string()),
});

type AssemblyMeta = z.infer<typeof assemblyMetaSchema>;

const getCacheDir = (config: Config): string =>
  config.cacheDir ?? join(tmpdir(), 'bedrock-tweaks-cache');

const getAssemblyCacheDir = (config: Config): string => join(getCacheDir(config), 'cache');
const getDownloadsDir = (config: Config): string => config.downloadsDir ?? join(getCacheDir(config), 'downloads');

const getCacheMaxBytes = (config: Config): number =>
  config.cacheMaxBytes ?? 4 * 1024 * 1024 * 1024; // 4GB

const getDownloadsMaxBytes = (config: Config): number =>
  config.downloadsMaxBytes ?? 2 * 1024 * 1024 * 1024; // 2GB

export const getAssembledPackPath = (assemblyKey: string, config: Config): string =>
  join(getAssemblyCacheDir(config), assemblyKey);

export const generateDownloadId = (): string => randomUUID();

export const prepareDownloadPath = async (downloadId: string, filename: string, config: Config): Promise<string> => {
  const downloadDir = join(getDownloadsDir(config), downloadId);

  await fs.mkdir(downloadDir, { recursive: true });

  return join(downloadDir, filename);
};

export const initCacheDir = async (config: Config): Promise<void> => {
  const rootDir = getCacheDir(config);
  const assemblyDir = getAssemblyCacheDir(config);
  const downloadsDir = getDownloadsDir(config);

  try {
    await Promise.all([
      fs.mkdir(rootDir, { recursive: true }),
      fs.mkdir(assemblyDir, { recursive: true }),
      fs.mkdir(downloadsDir, { recursive: true }),
    ]);

    console.info('Cache directories initialized:', { rootDir, assemblyDir, downloadsDir });
  } catch (error) {
    console.error('Failed to initialize cache directories:', error);

    throw error;
  }
};

export const computeAssemblyCacheKey = (section: Section, createPackDto: CreatePackDto): string => {
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

const isAssemblyStale = async (
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

const removeAssemblyEntry = async (assemblyKey: string, config: Config): Promise<void> => {
  const assemblyPath = getAssembledPackPath(assemblyKey, config);
  const metaPath = join(getAssemblyCacheDir(config), `${assemblyKey}.meta`);

  await fs.rm(assemblyPath, { recursive: true, force: true }).catch(() => undefined);
  await fs.unlink(metaPath).catch(() => undefined);
};

export const getCachedAssembly = async (
  assemblyKey: string,
  packsPaths: string[],
  section: Section,
  config: Config,
): Promise<{ dirPath: string } | null> => {
  const assemblyDir = getAssemblyCacheDir(config);
  const metaPath = join(assemblyDir, `${assemblyKey}.meta`);
  const dirPath = getAssembledPackPath(assemblyKey, config);

  try {
    const metaContent = await fs.readFile(metaPath, 'utf-8');
    const parsed: unknown = JSON.parse(metaContent);
    const meta: AssemblyMeta = assemblyMetaSchema.parse(parsed);

    await fs.access(dirPath);

    const stale = await isAssemblyStale(packsPaths, meta.createdAt, section, config);

    if (stale) {
      await removeAssemblyEntry(assemblyKey, config);

      return null;
    }

    const updatedMeta: AssemblyMeta = {
      ...meta,
      lastAccessed: new Date().toISOString(),
    };

    await fs.writeFile(metaPath, JSON.stringify(updatedMeta));

    return { dirPath };
  } catch {
    return null;
  }
};

export const saveAssemblyCache = async (
  assemblyKey: string,
  packsPaths: string[],
  config: Config,
): Promise<void> => {
  const assemblyDir = getAssemblyCacheDir(config);
  const metaPath = join(assemblyDir, `${assemblyKey}.meta`);
  const now = new Date().toISOString();

  const meta: AssemblyMeta = {
    createdAt: now,
    lastAccessed: now,
    packsPaths,
  };

  await fs.writeFile(metaPath, JSON.stringify(meta));
};

export const evictAssemblyCacheIfNeeded = async (config: Config): Promise<void> => {
  const assemblyDir = getAssemblyCacheDir(config);
  const maxBytes = getCacheMaxBytes(config);

  try {
    const entries = await fs.readdir(assemblyDir, { withFileTypes: true });
    const metaFiles = entries.filter(e => !e.isDirectory() && e.name.endsWith('.meta'));

    const dirInfos: Array<{ key: string; lastAccessed: number }> = [];

    for (const metaFile of metaFiles) {
      const key = metaFile.name.slice(0, -5);
      const metaPath = join(assemblyDir, metaFile.name);

      try {
        const metaContent = await fs.readFile(metaPath, 'utf-8');
        const parsed: unknown = JSON.parse(metaContent);
        const meta: AssemblyMeta = assemblyMetaSchema.parse(parsed);

        dirInfos.push({ key, lastAccessed: new Date(meta.lastAccessed).getTime() });
      } catch {
        // skip malformed entries
      }
    }

    dirInfos.sort((a, b) => a.lastAccessed - b.lastAccessed);

    for (const entry of dirInfos) {
      const currentSize = await getAssemblyCacheSize(assemblyDir);

      if (currentSize <= maxBytes) {
        break;
      }

      try {
        await removeAssemblyEntry(entry.key, config);

        console.info(`Evicted assembly cache entry: ${entry.key}`);
      } catch (error) {
        console.error(`Failed to evict assembly cache entry ${entry.key}:`, error);
      }
    }
  } catch (error) {
    console.error('Assembly cache eviction failed:', error);
  }
};

const getAssemblyCacheSize = async (assemblyDir: string): Promise<number> => {
  try {
    const entries = await fs.readdir(assemblyDir, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory());

    const sizes = await Promise.all(
      dirs.map(async (dir): Promise<number> => {
        try {
          const stat = await fs.stat(join(assemblyDir, dir.name));

          return stat.size;
        } catch {
          return 0;
        }
      }),
    );

    return sizes.reduce((acc, s) => acc + s, 0);
  } catch {
    return 0;
  }
};

const getDownloadsSize = async (config: Config): Promise<number> => {
  const downloadsDir = getDownloadsDir(config);

  try {
    const entries = await fs.readdir(downloadsDir, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory());

    const sizes = await Promise.all(
      dirs.map(async (dir): Promise<number> => {
        try {
          const files = await fs.readdir(join(downloadsDir, dir.name));
          const fileSizes = await Promise.all(
            files.map(async (file): Promise<number> => {
              try {
                const stat = await fs.stat(join(downloadsDir, dir.name, file));

                return stat.size;
              } catch {
                return 0;
              }
            }),
          );

          return fileSizes.reduce((acc, s) => acc + s, 0);
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

export const evictDownloadsIfNeeded = async (config: Config): Promise<void> => {
  const downloadsDir = getDownloadsDir(config);
  const maxBytes = getDownloadsMaxBytes(config);

  try {
    const currentSize = await getDownloadsSize(config);

    if (currentSize <= maxBytes) {
      return;
    }

    const entries = await fs.readdir(downloadsDir, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory());

    const dirInfos: Array<{ id: string; mtimeMs: number; size: number }> = [];

    for (const dir of dirs) {
      const dirPath = join(downloadsDir, dir.name);

      try {
        const files = await fs.readdir(dirPath);

        let size = 0;
        let mtimeMs = 0;

        for (const file of files) {
          const stat = await fs.stat(join(dirPath, file));

          size += stat.size;

          if (stat.mtimeMs > mtimeMs) {
            mtimeMs = stat.mtimeMs;
          }
        }

        dirInfos.push({ id: dir.name, mtimeMs, size });
      } catch {
        // skip unreadable dirs
      }
    }

    dirInfos.sort((a, b) => a.mtimeMs - b.mtimeMs);

    const target = currentSize - maxBytes;
    let freed = 0;

    for (const entry of dirInfos) {
      if (freed >= target) {
        break;
      }

      try {
        await fs.rm(join(downloadsDir, entry.id), { recursive: true, force: true });

        freed += entry.size;

        console.info(`Evicted download: ${entry.id} (freed ${entry.size} bytes)`);
      } catch (error) {
        console.error(`Failed to evict download ${entry.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Downloads eviction failed:', error);
  }
};
