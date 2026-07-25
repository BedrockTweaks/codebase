import type { Config } from '@/config';
import type { PacksJSON } from '@bt/types';
import AdmZip from 'adm-zip';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { assembleResourcePacks } from './assembly';

const ZOMBIE_ENTITY_PATH = '/entity/zombie.entity.json';

const packsJson: PacksJSON = {
  section: 'resource_packs',
  version: [1, 0, 0],
  categories: [],
  combinations: [],
  deepMergeFiles: [
    { filename: 'zombie.entity.json', filepath: ZOMBIE_ENTITY_PATH },
    { filename: 'en_US.lang', filepath: '/texts/en_US.lang' },
  ],
};

describe('assembleResourcePacks', () => {
  let storageUrl: string;
  let assemblyZipPath: string;
  let config: Config;
  let entries: string[];

  const writePackFile = (packPath: string, filePath: string, contents: string): void => {
    const fullPath = join(storageUrl, 'resource_packs', packPath, filePath);

    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, contents);
  };

  beforeAll(async () => {
    storageUrl = mkdtempSync(join(tmpdir(), 'bt-rp-storage-'));
    assemblyZipPath = join(mkdtempSync(join(tmpdir(), 'bt-rp-cache-')), 'assembly.zip');

    mkdirSync(join(storageUrl, 'resource_packs'), { recursive: true });
    writeFileSync(join(storageUrl, 'resource_packs', 'packs.json'), JSON.stringify(packsJson));

    // Both packs ship the same deep merge file, and one plain texture each.
    writePackFile('files/aesthetic/alex_zombies', ZOMBIE_ENTITY_PATH, JSON.stringify({
      'minecraft:client_entity': { description: { textures: { alex: 'textures/alex' } } },
    }));
    writePackFile('files/aesthetic/ari_zombies', ZOMBIE_ENTITY_PATH, JSON.stringify({
      'minecraft:client_entity': { description: { textures: { ari: 'textures/ari' } } },
    }));
    writePackFile('files/aesthetic/alex_zombies', '/textures/entity/alex.png', 'alex');
    writePackFile('files/aesthetic/ari_zombies', '/textures/entity/ari.png', 'ari');
    writePackFile('files/aesthetic/alex_zombies', '/pack_icon.png', 'icon');

    config = { storageUrl, production: false, nodePort: 8000, metadataAuthors: 'BedrockTweaks' };

    await assembleResourcePacks(
      ['files/aesthetic/alex_zombies', 'files/aesthetic/ari_zombies'],
      assemblyZipPath,
      config,
    );

    entries = new AdmZip(assemblyZipPath).getEntries().map(entry => entry.entryName);
  });

  afterAll(() => {
    rmSync(storageUrl, { recursive: true, force: true });
    rmSync(dirname(assemblyZipPath), { recursive: true, force: true });
  });

  it('writes every entry name exactly once', () => {
    expect(entries).toEqual([...new Set(entries)]);
  });

  it('writes the deep merged file at a slash-free entry name', () => {
    expect(entries.filter(entry => entry.endsWith('zombie.entity.json'))).toEqual([
      'entity/zombie.entity.json',
    ]);
  });

  it('keeps the merged contents rather than one pack raw copy', () => {
    const merged: unknown = JSON.parse(
      new AdmZip(assemblyZipPath).getEntry('entity/zombie.entity.json')!.getData().toString('utf8'),
    );

    expect(merged).toEqual({
      'minecraft:client_entity': {
        description: { textures: { alex: 'textures/alex', ari: 'textures/ari' } },
      },
    });
  });

  it('still copies plain files from every selected pack', () => {
    expect(entries).toContain('textures/entity/alex.png');
    expect(entries).toContain('textures/entity/ari.png');
  });

  it('skips pack icons', () => {
    expect(entries).not.toContain('pack_icon.png');
  });
});
