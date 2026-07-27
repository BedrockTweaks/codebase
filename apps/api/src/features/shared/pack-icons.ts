import type { Config } from '@/config';
import type { IconExtension, PacksJSON, Section } from '@bt/types';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { getPacks, packsFilePath } from './listing';

/**
 * Probe order. Most packs ship a `pack_icon.png`; animated ones ship a `.gif`
 * instead. The client used to request `.png` unconditionally and swap to `.gif`
 * from the `onError` handler, which cost every animated pack a guaranteed 404 on
 * every page load.
 */
const ICON_EXTENSIONS: readonly IconExtension[] = ['png', 'gif'];

interface ResolvedIcons {
  /** mtime of the packs.json this map was built from; a newer file invalidates it. */
  mtimeMs: number;
  /** `${categoryId}/${packId}` -> extension. Missing key means the pack has no icon. */
  extensions: Map<string, IconExtension>;
}

const cache = new Map<Section, ResolvedIcons>();

const iconPath = (config: Config, section: Section, categoryId: string, packId: string, extension: IconExtension): string =>
  join(config.storageUrl, section, 'files', categoryId, packId, `pack_icon.${extension}`);

const resolveExtension = async (
  config: Config,
  section: Section,
  categoryId: string,
  packId: string,
): Promise<IconExtension | undefined> => {
  for (const extension of ICON_EXTENSIONS) {
    try {
      await fs.access(iconPath(config, section, categoryId, packId, extension));

      return extension;
    } catch {
      // Not this extension; fall through to the next candidate.
    }
  }

  return undefined;
};

const buildExtensionMap = async (packs: PacksJSON, section: Section, config: Config): Promise<Map<string, IconExtension>> => {
  const entries = packs.categories.flatMap(category =>
    category.packs.map(async (pack): Promise<[string, IconExtension | undefined]> => [
      `${category.id}/${pack.id}`,
      await resolveExtension(config, section, category.id, pack.id),
    ]),
  );

  const resolved = await Promise.all(entries);

  return new Map(
    resolved.filter((entry): entry is [string, IconExtension] => entry[1] !== undefined),
  );
};

/**
 * The listing plus a resolved `iconExtension` on every pack.
 *
 * Resolving means one `access()` per pack (~520 for resource packs), so the result
 * is memoised against the mtime of packs.json — icons and packs.json are deployed
 * together from the Files repo, so a listing that has not changed cannot have
 * gained or lost an icon.
 */
export const getPacksWithIcons = async (section: Section, config: Config): Promise<PacksJSON> => {
  const packs = await getPacks(section, config);
  const { mtimeMs } = await fs.stat(packsFilePath(section, config));

  const cached = cache.get(section);
  const extensions = cached?.mtimeMs === mtimeMs
    ? cached.extensions
    : await buildExtensionMap(packs, section, config);

  cache.set(section, { mtimeMs, extensions });

  return {
    ...packs,
    categories: packs.categories.map(category => ({
      ...category,
      packs: category.packs.map(pack => ({
        ...pack,
        iconExtension: extensions.get(`${category.id}/${pack.id}`),
      })),
    })),
  };
};
