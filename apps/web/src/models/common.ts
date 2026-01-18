export enum Section {
  ResourcePacks = 'resource_packs',
  Addons = 'addons',
  CraftingTweaks = 'crafting_tweaks',
}

export const SECTION_NAME_MAP: Record<Section, string> = {
  [Section.ResourcePacks]: 'Resource Pack',
  [Section.Addons]: 'Addons',
  [Section.CraftingTweaks]: 'Crafting Tweaks',
};

export type Severity = 'success' | 'info' | 'warn' | 'error' | 'secondary';

export const SEVERITY_COLOR_MAP: Record<Severity, string> = {
  success: 'green.500',
  info: 'green.500',
  warn: 'orange.500',
  error: 'red.500',
  secondary: 'gray.500',
};

export interface Message {
  text: string;
  severity: Severity;
}
