import { v4 as uuidv4 } from 'uuid';
import type { Config } from '@/config';
import type {
  Combination,
  CreatePackDto,
  Section,
} from '@bt/types';
import { fetchAppVersion } from '@/version';
import { getPacks } from './listing';

type SelectedPacks = Record<string, string[]> & { combinations: string[] };

interface ManifestOptions {
  dependencies?: ManifestDependency[];
}

export interface ManifestDependency {
  uuid: string;
  version: number[];
}

const buildSelectedPacks = (createPackDto: CreatePackDto, combinations: Combination[]): SelectedPacks => {
  const allPackPaths = createPackDto.categories.flatMap(category =>
    category.packs.map(packId => ({ id: packId, path: `${category.id}/${packId}` })),
  );

  const result: SelectedPacks = { combinations: [] };

  for (const category of createPackDto.categories) {
    result[category.id] = category.packs;
  }

  result.combinations = combinations
    .filter(combination =>
      combination.combines.every(packPath =>
        allPackPaths.some(pack => pack.path === packPath),
      ),
    )
    .map(combination => combination.id);

  return result;
};

export const generateManifest = async (
  createPackDto: CreatePackDto,
  downloadUrl: string,
  section: Section,
  config: Config,
  options?: ManifestOptions,
): Promise<string> => {
  const packs = await getPacks(section, config);
  const selectedPacks = buildSelectedPacks(createPackDto, packs.combinations);
  const authors = config.metadataAuthors.split(', ');
  const appVersion = await fetchAppVersion();

  let type: string;
  let description: string;
  const name = createPackDto.name.replace('.mcpack', '').replace('.mcaddon', '');

  switch (section) {
    case 'resource_packs':
      type = 'resources';
      description = `Bedrock Tweaks §aResource Packs§r`;

      break;
    case 'addons':
      type = 'data';
      description = `Bedrock Tweaks §dAddons§r`;

      break;
    case 'crafting_tweaks':
      type = 'data';
      description = `Bedrock Tweaks §eCrafting Tweaks§r`;

      break;
    default:
      throw new Error(`Manifest generation not supported for section: ${section}`);
  }

  const metadata: Record<string, unknown> = {
    authors,
    generated_with: {
      bedrock_tweaks: [appVersion],
    },
    url: downloadUrl,
    selected_packs: selectedPacks,
  };

  if (section === 'addons' || section === 'crafting_tweaks') {
    metadata['product_type'] = 'addon';
  }

  const manifest: Record<string, unknown> = {
    format_version: 2,
    header: {
      name,
      description,
      uuid: uuidv4(),
      version: [1, 0, 0],
      min_engine_version: packs.version,
    },
    modules: [
      {
        type,
        uuid: uuidv4(),
        version: [1, 0, 0],
      },
    ],
    metadata,
    dependencies: options?.dependencies || [],
  };

  if (section === 'resource_packs') {
    manifest['capabilities'] = ['pbr'];
  }

  return JSON.stringify(manifest, null, '\t');
};
