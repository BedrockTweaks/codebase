import type { Config } from '@/config';
import type { CreatePackDto, PacksJSON } from '@bt/types';
import AdmZip from 'adm-zip';
import { mkdtempSync, rmSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { assembleAddons, finalizeAddons } from './assembly';

const packsJSON: PacksJSON = {
  section: 'addons',
  version: [1, 21, 0],
  categories: [],
  combinations: [],
  deepMergeFiles: [],
};

const createPackDto: CreatePackDto = {
  name: 'My Addon Pack',
  categories: [{ id: 'utility', packs: ['timer'] }],
};

const BP_UUID = '11111111-2222-3333-4444-555555555555';

describe('addons assembly', () => {
  let storageUrl: string;
  let workDir: string;
  let config: Config;
  let outputPath: string;

  const writeBuiltFile = async (packPath: string, filePath: string, contents: string): Promise<void> => {
    const fullPath = join(storageUrl, 'addons', packPath, 'build', 'bedrock-tweaks', filePath);

    await fs.mkdir(dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, contents);
  };

  beforeAll(async () => {
    storageUrl = mkdtempSync(join(tmpdir(), 'bt-addons-storage-'));
    workDir = mkdtempSync(join(tmpdir(), 'bt-addons-out-'));

    config = {
      storageUrl,
      production: false,
      nodePort: 8000,
      metadataAuthors: 'BedrockTweaks',
    };

    vi.stubGlobal('fetch', () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ tag_name: 'v1.2.3' }),
    }));

    await fs.mkdir(join(storageUrl, 'addons'), { recursive: true });
    await fs.writeFile(join(storageUrl, 'addons', 'packs.json'), JSON.stringify(packsJSON));

    await writeBuiltFile('files/utility/timer', 'timer_bp/manifest.json', JSON.stringify({
      header: { uuid: BP_UUID, version: [2, 1, 0] },
    }));
    await writeBuiltFile('files/utility/timer', 'timer_bp/scripts/main.js', 'console.log("timer");');
    await writeBuiltFile('files/utility/timer', 'timer_rp/textures/icon.png', 'icon');

    const assemblyZipPath = join(workDir, 'assembly.zip');

    outputPath = join(workDir, 'My-Addon-Pack.mcaddon');

    await assembleAddons(['files/utility/timer'], assemblyZipPath, config);
    await finalizeAddons(createPackDto, assemblyZipPath, outputPath, 'http://localhost/download/x', config);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    rmSync(storageUrl, { recursive: true, force: true });
    rmSync(workDir, { recursive: true, force: true });
  });

  it('reads back every entry, so the written zip is well formed', () => {
    const entries = new AdmZip(outputPath).getEntries().filter(entry => !entry.isDirectory);

    expect(entries.length).toBeGreaterThan(0);

    for (const entry of entries) {
      expect(() => entry.getData()).not.toThrow();
    }
  });

  it('writes every entry name exactly once', () => {
    const names = new AdmZip(outputPath).getEntries().map(entry => entry.entryName);

    expect(names).toEqual([...new Set(names)]);
  });

  it('keeps the built behaviour and resource folders', () => {
    const names = new AdmZip(outputPath).getEntries().map(entry => entry.entryName);

    expect(names).toContain('timer_bp/scripts/main.js');
    expect(names).toContain('timer_rp/textures/icon.png');
  });

  it('declares the behaviour pack as a dependency of the generated manifest', () => {
    const pack = new AdmZip(outputPath);
    const manifest = JSON.parse(pack.getEntry('My_Addon_Pack/manifest.json')!.getData().toString('utf8'));

    expect(manifest.dependencies).toEqual([{ uuid: BP_UUID, version: [2, 1, 0] }]);
    expect(pack.getEntry('My_Addon_Pack/pack_icon.png')).not.toBeNull();
    expect(pack.getEntry('credits.txt')).not.toBeNull();
  });

  it('rejects a selection whose addon outputs collide', async () => {
    await writeBuiltFile('files/utility/clone', 'timer_bp/manifest.json', JSON.stringify({
      header: { uuid: BP_UUID },
    }));

    await expect(
      assembleAddons(['files/utility/timer', 'files/utility/clone'], join(workDir, 'clash.zip'), config),
    ).rejects.toThrow(/Duplicate addon output folder/);
  });
});
