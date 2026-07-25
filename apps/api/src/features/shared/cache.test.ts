import type { Config } from '@/config';
import type { CreatePackDto, PacksJSON } from '@bt/types';
import AdmZip from 'adm-zip';
import { promises as fs } from 'node:fs';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { assembleResourcePacks } from '../resource-packs/assembly';
import {
  computeAssemblyCacheKey,
  evictAssemblyCacheIfNeeded,
  getAssembledPackPath,
  getCachedAssembly,
  initCacheDir,
  runExclusiveAssembly,
  saveAssemblyCache,
} from './cache';

const ZOMBIE_ENTITY_PATH = '/entity/zombie.entity.json';

const packsJSON: PacksJSON = {
  section: 'resource_packs',
  version: [1, 0, 0],
  categories: [],
  combinations: [],
  deepMergeFiles: [{ filename: 'zombie.entity.json', filepath: ZOMBIE_ENTITY_PATH }],
};

const PACKS_PATHS = ['files/aesthetic/alex_zombies', 'files/aesthetic/ari_zombies'];

const inTheFuture = (): Date => new Date(Date.now() + 5000);

describe('computeAssemblyCacheKey', () => {
  const key = (dto: CreatePackDto): string => computeAssemblyCacheKey('resource_packs', dto);

  it('is stable regardless of category and pack ordering', () => {
    const a = key({ name: 'x', categories: [{ id: 'gui', packs: ['b', 'a'] }, { id: 'aesthetic', packs: ['c'] }] });
    const b = key({ name: 'y', categories: [{ id: 'aesthetic', packs: ['c'] }, { id: 'gui', packs: ['a', 'b'] }] });

    expect(a).toBe(b);
  });

  it('does not collide when ids concatenate to the same string', () => {
    const a = key({ name: 'x', categories: [{ id: 'ab', packs: ['c'] }] });
    const b = key({ name: 'x', categories: [{ id: 'a', packs: ['bc'] }] });

    expect(a).not.toBe(b);
  });

  it('does not collide when a pack id spills into the next category id', () => {
    const a = key({ name: 'x', categories: [{ id: 'a', packs: ['b'] }, { id: 'c', packs: ['d'] }] });
    const b = key({ name: 'x', categories: [{ id: 'a', packs: ['bc'] }, { id: 'd', packs: [] }] });

    expect(a).not.toBe(b);
  });

  it('separates sections', () => {
    const categories = [{ id: 'gui', packs: ['dark_ui'] }];

    expect(computeAssemblyCacheKey('resource_packs', { name: 'x', categories }))
      .not.toBe(computeAssemblyCacheKey('crafting_tweaks', { name: 'x', categories }));
  });
});

describe('assembly cache', () => {
  let storageUrl: string;
  let cacheDir: string;
  let config: Config;

  const packsJSONPath = (): string => join(storageUrl, 'resource_packs', 'packs.json');
  const packFilePath = (packPath: string, filePath: string): string =>
    join(storageUrl, 'resource_packs', packPath, filePath);

  const writePackFile = async (packPath: string, filePath: string, contents: string): Promise<void> => {
    const fullPath = packFilePath(packPath, filePath);

    await fs.mkdir(dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, contents);
  };

  const writeAssembly = async (assemblyKey: string): Promise<string> => {
    const zipPath = getAssembledPackPath(assemblyKey, config);

    await assembleResourcePacks(PACKS_PATHS, zipPath, config);
    await saveAssemblyCache(assemblyKey, PACKS_PATHS, config);

    return zipPath;
  };

  beforeAll(async () => {
    storageUrl = mkdtempSync(join(tmpdir(), 'bt-cache-storage-'));
    cacheDir = mkdtempSync(join(tmpdir(), 'bt-cache-'));

    config = {
      storageUrl,
      cacheDir,
      cacheMaxBytes: 100 * 1024 * 1024,
      production: false,
      nodePort: 8000,
      metadataAuthors: 'BedrockTweaks',
    };

    await fs.mkdir(join(storageUrl, 'resource_packs'), { recursive: true });
    await fs.writeFile(packsJSONPath(), JSON.stringify(packsJSON));

    await writePackFile(PACKS_PATHS[0], ZOMBIE_ENTITY_PATH, JSON.stringify({ textures: { alex: 'alex' } }));
    await writePackFile(PACKS_PATHS[1], ZOMBIE_ENTITY_PATH, JSON.stringify({ textures: { ari: 'ari' } }));
    await writePackFile(PACKS_PATHS[0], '/textures/alex.png', 'alex');
    await writePackFile(PACKS_PATHS[1], '/textures/ari.png', 'ari');

    await initCacheDir(config);
  });

  afterAll(() => {
    rmSync(storageUrl, { recursive: true, force: true });
    rmSync(cacheDir, { recursive: true, force: true });
  });

  it('misses when nothing was assembled yet', async () => {
    expect(await getCachedAssembly('never-built', PACKS_PATHS, 'resource_packs', config)).toBeNull();
  });

  it('hits after an assembly is saved', async () => {
    const zipPath = await writeAssembly('hit');

    expect(await getCachedAssembly('hit', PACKS_PATHS, 'resource_packs', config)).toEqual({ zipPath });
  });

  it('invalidates when a pack file is newer than the assembly', async () => {
    await writeAssembly('stale-pack');
    await fs.utimes(packFilePath(PACKS_PATHS[0], ZOMBIE_ENTITY_PATH), inTheFuture(), inTheFuture());

    expect(await getCachedAssembly('stale-pack', PACKS_PATHS, 'resource_packs', config)).toBeNull();
  });

  it('invalidates when packs.json is newer, since priorities and combinations live there', async () => {
    await writeAssembly('stale-packs-json');
    await fs.utimes(packsJSONPath(), inTheFuture(), inTheFuture());

    expect(await getCachedAssembly('stale-packs-json', PACKS_PATHS, 'resource_packs', config)).toBeNull();
  });

  it('deletes the zip and meta of an invalidated entry', async () => {
    const zipPath = await writeAssembly('evict-on-stale');

    await fs.utimes(packsJSONPath(), inTheFuture(), inTheFuture());
    await getCachedAssembly('evict-on-stale', PACKS_PATHS, 'resource_packs', config);

    await expect(fs.access(zipPath)).rejects.toThrow();
    await expect(fs.access(join(cacheDir, 'cache', 'evict-on-stale.meta'))).rejects.toThrow();
  });
});

describe('evictAssemblyCacheIfNeeded', () => {
  let cacheDir: string;
  let config: Config;

  const assemblyDir = (): string => join(cacheDir, 'cache');

  const writeEntry = async (key: string, sizeBytes: number, lastAccessed: string): Promise<void> => {
    await fs.writeFile(join(assemblyDir(), `${key}.zip`), Buffer.alloc(sizeBytes));
    await fs.writeFile(join(assemblyDir(), `${key}.meta`), JSON.stringify({
      createdAt: lastAccessed,
      lastAccessed,
      packsPaths: PACKS_PATHS,
    }));
  };

  beforeEach(async () => {
    cacheDir = mkdtempSync(join(tmpdir(), 'bt-evict-'));
    config = {
      storageUrl: cacheDir,
      cacheDir,
      cacheMaxBytes: 1500,
      production: false,
      nodePort: 8000,
      metadataAuthors: 'BedrockTweaks',
    };

    await initCacheDir(config);
  });

  afterAll(() => {
    rmSync(cacheDir, { recursive: true, force: true });
  });

  it('keeps everything while under the limit', async () => {
    await writeEntry('small', 500, '2026-01-01T00:00:00.000Z');
    await evictAssemblyCacheIfNeeded(config);

    await expect(fs.access(join(assemblyDir(), 'small.zip'))).resolves.toBeUndefined();
  });

  it('evicts least recently accessed entries until under the limit', async () => {
    await writeEntry('oldest', 1000, '2026-01-01T00:00:00.000Z');
    await writeEntry('middle', 1000, '2026-02-01T00:00:00.000Z');
    await writeEntry('newest', 1000, '2026-03-01T00:00:00.000Z');

    await evictAssemblyCacheIfNeeded(config);

    await expect(fs.access(join(assemblyDir(), 'oldest.zip'))).rejects.toThrow();
    await expect(fs.access(join(assemblyDir(), 'middle.zip'))).rejects.toThrow();
    await expect(fs.access(join(assemblyDir(), 'newest.zip'))).resolves.toBeUndefined();
  });

  it('removes the meta alongside the evicted zip', async () => {
    await writeEntry('oldest', 2000, '2026-01-01T00:00:00.000Z');
    await writeEntry('newest', 1000, '2026-03-01T00:00:00.000Z');

    await evictAssemblyCacheIfNeeded(config);

    await expect(fs.access(join(assemblyDir(), 'oldest.meta'))).rejects.toThrow();
  });

  it('clears orphaned temp files on init', async () => {
    await fs.writeFile(join(assemblyDir(), 'crashed.zip.abc-123.tmp'), Buffer.alloc(10));

    await initCacheDir(config);

    await expect(fs.access(join(assemblyDir(), 'crashed.zip.abc-123.tmp'))).rejects.toThrow();
  });
});

describe('runExclusiveAssembly', () => {
  it('runs a single assembly for concurrent callers sharing a key', async () => {
    let started = 0;

    await Promise.all(Array.from({ length: 8 }, () =>
      runExclusiveAssembly('same-key', async () => {
        started += 1;

        await new Promise(resolve => setTimeout(resolve, 10));
      })));

    expect(started).toBe(1);
  });

  it('runs different keys independently', async () => {
    let started = 0;

    await Promise.all(['a', 'b', 'c'].map(key =>
      runExclusiveAssembly(key, async () => {
        started += 1;

        await new Promise(resolve => setTimeout(resolve, 10));
      })));

    expect(started).toBe(3);
  });

  it('propagates the failure to every caller and does not wedge the key', async () => {
    const failing = Array.from({ length: 3 }, () =>
      runExclusiveAssembly('failing', () => Promise.reject(new Error('boom'))));

    await expect(Promise.all(failing)).rejects.toThrow('boom');

    let retried = false;

    await runExclusiveAssembly('failing', async () => {
      retried = true;

      return Promise.resolve();
    });

    expect(retried).toBe(true);
  });
});

describe('concurrent assembly of the same output path', () => {
  let storageUrl: string;
  let cacheDir: string;
  let config: Config;

  beforeAll(async () => {
    storageUrl = mkdtempSync(join(tmpdir(), 'bt-race-storage-'));
    cacheDir = mkdtempSync(join(tmpdir(), 'bt-race-cache-'));

    config = {
      storageUrl,
      cacheDir,
      production: false,
      nodePort: 8000,
      metadataAuthors: 'BedrockTweaks',
    };

    await fs.mkdir(join(storageUrl, 'resource_packs'), { recursive: true });
    await fs.writeFile(join(storageUrl, 'resource_packs', 'packs.json'), JSON.stringify(packsJSON));

    for (const [packPath, texture] of [[PACKS_PATHS[0], 'alex'], [PACKS_PATHS[1], 'ari']] as const) {
      const entityPath = join(storageUrl, 'resource_packs', packPath, ZOMBIE_ENTITY_PATH);

      await fs.mkdir(dirname(entityPath), { recursive: true });
      await fs.writeFile(entityPath, JSON.stringify({ textures: { [texture]: texture } }));

      // Enough bulk that a shared temp file would visibly interleave.
      const bulkPath = join(storageUrl, 'resource_packs', packPath, 'textures', `${texture}.png`);

      await fs.mkdir(dirname(bulkPath), { recursive: true });
      await fs.writeFile(bulkPath, Buffer.alloc(512 * 1024, texture));
    }

    await initCacheDir(config);
  });

  afterAll(() => {
    rmSync(storageUrl, { recursive: true, force: true });
    rmSync(cacheDir, { recursive: true, force: true });
  });

  it('leaves a readable, correct zip when writers race on one path', async () => {
    const zipPath = getAssembledPackPath('race', config);

    await Promise.all(Array.from({ length: 6 }, () =>
      assembleResourcePacks(PACKS_PATHS, zipPath, config)));

    const entries = new AdmZip(zipPath).getEntries();
    const names = entries.map(entry => entry.entryName);

    expect(names).toEqual([...new Set(names)]);
    expect(names).toContain('textures/alex.png');
    expect(names).toContain('textures/ari.png');

    const merged: unknown = JSON.parse(
      new AdmZip(zipPath).getEntry('entity/zombie.entity.json')!.getData().toString('utf8'),
    );

    expect(merged).toEqual({ textures: { alex: 'alex', ari: 'ari' } });
  });

  it('leaves no temp files behind', async () => {
    const leftovers = (await fs.readdir(join(cacheDir, 'cache'))).filter(name => name.endsWith('.tmp'));

    expect(leftovers).toEqual([]);
  });
});
