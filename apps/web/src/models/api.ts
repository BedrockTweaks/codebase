import type { Category } from './category';
import { Section } from './common';

export interface SectionResponse {
  section: Section;
  version: number[];
  categories: Category[];
}

export interface DownloadRequest {
  name: string;
  categories: CategorySelection[];
}

export interface CategorySelection {
  id: string;
  packs: string[];
}
