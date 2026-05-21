import type { Section } from '@bt/types';

const DOWNLOAD_EXTENSION_BY_SECTION: Record<Section, string> = {
  addons: 'mcaddon',
  crafting_tweaks: 'mcpack',
  resource_packs: 'mcpack',
};

export const sanitizeFileNameSegment = (value: string): string => {
  const normalized = value.trim();

  if (!normalized) {
    return 'bedrock-tweaks-pack';
  }

  return normalized
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'bedrock-tweaks-pack';
};

export const buildStaticDownloadUrl = (
  requestUrl: string,
  section: Section,
  cacheKey: string,
  packName: string,
  forwardedProto?: string,
): string => {
  const url = new URL(requestUrl);
  const extension = DOWNLOAD_EXTENSION_BY_SECTION[section];
  const safeName = sanitizeFileNameSegment(packName);
  const protocol = forwardedProto ? `${forwardedProto}:` : url.protocol;

  return `${protocol}//${url.host}/download/${cacheKey}/${encodeURIComponent(safeName)}.${extension}`;
};
