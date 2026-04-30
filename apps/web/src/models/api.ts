import type { CreatePackDto } from '@bt/types';
import type { Category } from './category';
import { Section } from './common';

export interface SectionResponse {
  section: Section;
  version: number[];
  categories: Category[];
}

export type DownloadRequest = CreatePackDto;
export type CategorySelection = CreatePackDto['categories'][number];
