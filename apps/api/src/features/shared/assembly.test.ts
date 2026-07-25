import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { deepMergeJson, mergeLang, toZipEntryName } from './assembly';

describe('toZipEntryName', () => {
  it('strips the leading slash used by packs.json filepaths', () => {
    expect(toZipEntryName('/entity/zombie.entity.json')).toBe('entity/zombie.entity.json');
  });

  it('converts windows separators produced by relative()', () => {
    expect(toZipEntryName('entity\\zombie.entity.json')).toBe('entity/zombie.entity.json');
  });

  it('produces the same name for both shapes of the same file', () => {
    expect(toZipEntryName('/textures/terrain_texture.json'))
      .toBe(toZipEntryName('textures\\terrain_texture.json'));
  });

  it('collapses repeated separators', () => {
    expect(toZipEntryName('//ui///hud_screen.json')).toBe('ui/hud_screen.json');
  });

  it('leaves an already normalized name untouched', () => {
    expect(toZipEntryName('sounds/sound_definitions.json')).toBe('sounds/sound_definitions.json');
  });
});

describe('merge precedence', () => {
  const section = 'resource_packs';

  let storageUrl: string;

  const writePackFile = (packPath: string, filePath: string, contents: string): void => {
    const fullPath = join(storageUrl, section, packPath, filePath);

    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, contents);
  };

  beforeAll(() => {
    storageUrl = mkdtempSync(join(tmpdir(), 'bt-assembly-'));

    // packsPaths is ordered highest precedence first.
    writePackFile('files/high', '/entity/zombie.entity.json', JSON.stringify({
      shared: 'high',
      textures: { alex: 'textures/alex' },
    }));
    writePackFile('files/low', '/entity/zombie.entity.json', JSON.stringify({
      shared: 'low',
      textures: { ari: 'textures/ari' },
    }));

    writePackFile('files/high', '/texts/en_US.lang', 'item.x=High');
    writePackFile('files/low', '/texts/en_US.lang', 'item.x=Low');
  });

  afterAll(() => {
    rmSync(storageUrl, { recursive: true, force: true });
  });

  it('unions keys from every selected pack', () => {
    const merged = deepMergeJson('/entity/zombie.entity.json', ['files/high', 'files/low'], storageUrl, section);

    expect(merged.textures).toEqual({ alex: 'textures/alex', ari: 'textures/ari' });
  });

  it('lets the highest precedence pack win on conflicting keys', () => {
    const merged = deepMergeJson('/entity/zombie.entity.json', ['files/high', 'files/low'], storageUrl, section);

    expect(merged.shared).toBe('high');
  });

  it('appends the highest precedence lang file last so its keys win', () => {
    const lang = mergeLang('/texts/en_US.lang', ['files/high', 'files/low'], storageUrl, section);

    expect(lang.trim().split('\n')).toEqual(['item.x=Low', 'item.x=High']);
  });

  it('returns an empty result when no selected pack ships the file', () => {
    expect(deepMergeJson('/entity/creeper.entity.json', ['files/high'], storageUrl, section)).toEqual({});
    expect(mergeLang('/texts/fr_FR.lang', ['files/high'], storageUrl, section)).toBe('');
  });
});
