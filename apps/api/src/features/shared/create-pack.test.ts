import type { CreatePackDto, GeneratedPackResponse, PacksJSON } from '@bt/types';
import { generatedPackResponseSchema } from '@bt/types';
import AdmZip from 'adm-zip';
import type { Context } from 'hono';
import { mkdtempSync, rmSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { assembleResourcePacks, finalizeResourcePacks } from '../resource-packs/assembly';
import { initCacheDir } from './cache';
import { handleCreatePack } from './create-pack';

const ZOMBIE_ENTITY_PATH = '/entity/zombie.entity.json';

const packsJSON: PacksJSON = {
  section: 'resource_packs',
  version: [1, 21, 0],
  categories: [
    {
      id: 'aesthetic',
      name: 'Aesthetic',
      packs: [
        { id: 'alex_zombies', name: 'Alex Zombies' },
        { id: 'ari_zombies', name: 'Ari Zombies' },
        { id: 'broken_zombies', name: 'Broken Zombies', disabled: true },
      ],
    },
  ],
  combinations: [],
  deepMergeFiles: [
    { filename: 'zombie.entity.json', filepath: ZOMBIE_ENTITY_PATH },
    { filename: 'en_US.lang', filepath: '/texts/en_US.lang' },
  ],
};

const createPackDto: CreatePackDto = {
  name: 'My Zombie Pack',
  categories: [{ id: 'aesthetic', packs: ['alex_zombies', 'ari_zombies'] }],
};

const errorMessageSchema = z.object({ message: z.string(), statusCode: z.number() });

// The handler only reads req.json, req.header and req.url, and replies via c.json.
const createContext = (dto: CreatePackDto): Context => {
  const context = {
    req: {
      json: (): Promise<CreatePackDto> => Promise.resolve(dto),
      header: (): undefined => undefined,
      url: 'http://localhost:8000/api/v1/resource_packs/create',
    },
    json: (body: unknown, status: number): Response => Response.json(body, { status }),
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return context as unknown as Context;
};

describe('handleCreatePack', () => {
  let storageUrl: string;
  let cacheDir: string;
  let downloadsDir: string;

  const writePackFile = async (packPath: string, filePath: string, contents: string): Promise<void> => {
    const fullPath = join(storageUrl, 'resource_packs', packPath, filePath);

    await fs.mkdir(dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, contents);
  };

  const request = async (dto: CreatePackDto): Promise<Response> => {
    const result = await handleCreatePack(
      createContext(dto),
      'resource_packs',
      'mcpack',
      assembleResourcePacks,
      finalizeResourcePacks,
    );

    // handleCreatePack is typed against Hono's phantom TypedResponse, but the
    // value it returns is whatever c.json produced: a real Response.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return result as unknown as Response;
  };

  const rejection = async (dto: CreatePackDto): Promise<{ status: number; message: string }> => {
    const response = await request(dto);
    const body: unknown = await response.json();

    return { status: response.status, message: errorMessageSchema.parse(body).message };
  };

  const generate = async (dto = createPackDto): Promise<GeneratedPackResponse> => {
    const response = await request(dto);

    expect(response.status).toBe(200);

    // Parsing with the published schema also asserts the response shape.
    return generatedPackResponseSchema.parse(await response.json());
  };

  const downloadedPack = async (): Promise<AdmZip> => {
    const [downloadId] = await fs.readdir(downloadsDir);
    const files = await fs.readdir(join(downloadsDir, downloadId));

    expect(files).toEqual(['My-Zombie-Pack.mcpack']);

    return new AdmZip(join(downloadsDir, downloadId, files[0]));
  };

  beforeAll(async () => {
    storageUrl = mkdtempSync(join(tmpdir(), 'bt-e2e-storage-'));
    cacheDir = mkdtempSync(join(tmpdir(), 'bt-e2e-cache-'));
    downloadsDir = join(cacheDir, 'downloads');

    process.env['STORAGE_URL'] = storageUrl;
    process.env['METADATA_AUTHORS'] = 'BedrockTweaks';
    process.env['CACHE_DIR'] = cacheDir;

    // fetchAppVersion() would otherwise call the GitHub releases API.
    vi.stubGlobal('fetch', () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ tag_name: 'v1.2.3' }),
    }));

    await fs.mkdir(join(storageUrl, 'resource_packs'), { recursive: true });
    await fs.writeFile(join(storageUrl, 'resource_packs', 'packs.json'), JSON.stringify(packsJSON));

    await writePackFile('files/aesthetic/alex_zombies', ZOMBIE_ENTITY_PATH, JSON.stringify({
      'minecraft:client_entity': { description: { textures: { alex: 'textures/alex' } } },
    }));
    await writePackFile('files/aesthetic/ari_zombies', ZOMBIE_ENTITY_PATH, JSON.stringify({
      'minecraft:client_entity': { description: { textures: { ari: 'textures/ari' } } },
    }));
    await writePackFile('files/aesthetic/alex_zombies', '/texts/en_US.lang', 'pack.alex=Alex');
    await writePackFile('files/aesthetic/ari_zombies', '/texts/en_US.lang', 'pack.ari=Ari');
    await writePackFile('files/aesthetic/alex_zombies', '/textures/entity/alex.png', 'alex');
    await writePackFile('files/aesthetic/ari_zombies', '/textures/entity/ari.png', 'ari');
    await writePackFile('files/aesthetic/alex_zombies', '/pack_icon.png', 'should be replaced');

    await initCacheDir({
      storageUrl,
      cacheDir,
      production: false,
      nodePort: 8000,
      metadataAuthors: 'BedrockTweaks',
    });

    await generate();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    rmSync(storageUrl, { recursive: true, force: true });
    rmSync(cacheDir, { recursive: true, force: true });
  });

  it('returns a download url for the generated pack', async () => {
    const [downloadId] = await fs.readdir(downloadsDir);

    expect(await generate()).toEqual({
      downloadUrl: expect.stringMatching(/^http:\/\/localhost:8000\/download\/[0-9a-f-]{36}\/My-Zombie-Pack\.mcpack$/),
      packName: 'My Zombie Pack',
    });
    expect(downloadId).toBeDefined();
  });

  it('writes every entry of the downloadable pack exactly once', async () => {
    const names = (await downloadedPack()).getEntries().map(entry => entry.entryName);

    expect(names).toEqual([...new Set(names)]);
  });

  it('deep merges the entity file across both selected packs', async () => {
    const merged: unknown = JSON.parse(
      (await downloadedPack()).getEntry('entity/zombie.entity.json')!.getData().toString('utf8'),
    );

    expect(merged).toEqual({
      'minecraft:client_entity': {
        description: { textures: { alex: 'textures/alex', ari: 'textures/ari' } },
      },
    });
  });

  it('merges the lang file across both selected packs', async () => {
    const lang = (await downloadedPack()).getEntry('texts/en_US.lang')!.getData().toString('utf8');

    expect(lang).toContain('pack.alex=Alex');
    expect(lang).toContain('pack.ari=Ari');
  });

  it('ships the generated manifest, icon and credits', async () => {
    const pack = await downloadedPack();
    const manifest = JSON.parse(pack.getEntry('manifest.json')!.getData().toString('utf8'));

    expect(manifest.header.name).toBe('My Zombie Pack');
    expect(manifest.header.min_engine_version).toEqual([1, 21, 0]);
    expect(manifest.metadata.generated_with.bedrock_tweaks).toEqual(['1.2.3']);
    expect(manifest.metadata.selected_packs.aesthetic).toEqual(['alex_zombies', 'ari_zombies']);
    expect(pack.getEntry('pack_icon.png')).not.toBeNull();
    expect(pack.getEntry('credits.txt')).not.toBeNull();
  });

  it('copies the plain textures from both packs', async () => {
    const names = (await downloadedPack()).getEntries().map(entry => entry.entryName);

    expect(names).toContain('textures/entity/alex.png');
    expect(names).toContain('textures/entity/ari.png');
  });

  it('reuses the cached assembly instead of rebuilding it', async () => {
    const assemblyDir = join(cacheDir, 'cache');
    const before = await fs.readdir(assemblyDir);
    const zip = before.find(name => name.endsWith('.zip'))!;
    const { mtimeMs } = await fs.stat(join(assemblyDir, zip));

    await generate();

    expect(await fs.stat(join(assemblyDir, zip))).toHaveProperty('mtimeMs', mtimeMs);
    expect((await fs.readdir(assemblyDir)).filter(name => name.endsWith('.zip'))).toHaveLength(1);
  });

  it('gives each request its own download so concurrent users cannot collide', async () => {
    const before = (await fs.readdir(downloadsDir)).length;

    await Promise.all([generate(), generate(), generate()]);

    expect((await fs.readdir(downloadsDir)).length).toBe(before + 3);
  });

  it('rejects an unknown pack id instead of shipping a pack without it', async () => {
    expect(await rejection({
      name: 'My Zombie Pack',
      categories: [{ id: 'aesthetic', packs: ['alex_zombies', 'nope_zombies'] }],
    })).toEqual({
      status: 400,
      message: expect.stringContaining('unknown packs: aesthetic/nope_zombies'),
    });
  });

  it('rejects an unknown category id with 400 rather than 500', async () => {
    expect(await rejection({
      name: 'My Zombie Pack',
      categories: [{ id: 'nope', packs: ['alex_zombies'] }],
    })).toEqual({
      status: 400,
      message: expect.stringContaining('unknown categories: nope'),
    });
  });

  it('rejects a pack packs.json marks as disabled', async () => {
    expect(await rejection({
      name: 'My Zombie Pack',
      categories: [{ id: 'aesthetic', packs: ['alex_zombies', 'broken_zombies'] }],
    })).toEqual({
      status: 400,
      message: expect.stringContaining('disabled packs: aesthetic/broken_zombies'),
    });
  });

  it('rejects an empty selection', async () => {
    expect(await rejection({ name: 'Empty', categories: [] })).toEqual({
      status: 400,
      message: 'Select at least one pack.',
    });

    expect(await rejection({ name: 'Empty', categories: [{ id: 'aesthetic', packs: [] }] })).toEqual({
      status: 400,
      message: 'Select at least one pack.',
    });
  });

  it('reports every problem at once so one refresh fixes them all', async () => {
    const { message } = await rejection({
      name: 'My Zombie Pack',
      categories: [
        { id: 'gone', packs: ['whatever'] },
        { id: 'aesthetic', packs: ['nope_zombies', 'broken_zombies'] },
      ],
    });

    expect(message).toContain('unknown categories: gone');
    expect(message).toContain('unknown packs: aesthetic/nope_zombies');
    expect(message).toContain('disabled packs: aesthetic/broken_zombies');
  });

  it('neither caches nor writes a download for a rejected selection', async () => {
    const assemblies = (await fs.readdir(join(cacheDir, 'cache'))).length;
    const downloads = (await fs.readdir(downloadsDir)).length;

    await rejection({ name: 'Bad', categories: [{ id: 'aesthetic', packs: ['nope_zombies'] }] });

    expect((await fs.readdir(join(cacheDir, 'cache'))).length).toBe(assemblies);
    expect((await fs.readdir(downloadsDir)).length).toBe(downloads);
  });

  it('rebuilds after packs.json changes, so priority edits take effect', async () => {
    const assemblyDir = join(cacheDir, 'cache');
    const zip = (await fs.readdir(assemblyDir)).find(name => name.endsWith('.zip'))!;
    const before = await fs.stat(join(assemblyDir, zip));
    const future = new Date(Date.now() + 5000);

    await fs.utimes(join(storageUrl, 'resource_packs', 'packs.json'), future, future);
    await generate();

    expect((await fs.stat(join(assemblyDir, zip))).mtimeMs).toBeGreaterThan(before.mtimeMs);
  });
});
