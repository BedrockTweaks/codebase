export enum Section {
  ResourcePacks = 'resource_packs',
  Addons = 'addons',
  CraftingTweaks = 'crafting_tweaks',
}

export type Severity = 'success' | 'info' | 'warn' | 'error' | 'secondary';

export interface Message {
  text: string;
  severity: Severity;
}
