import type { z } from 'zod';
import type {
  categorySchema,
  categorySelectionSchema,
  combinationSchema,
  createPackSchema,
  deepMergeFileSchema,
  generatedPackResponseSchema,
  messageSchema,
  packSchema,
  packsJSONSchema,
  sectionSchema,
  severitySchema,
} from './schemas';

export type Section = z.infer<typeof sectionSchema>;
export type Severity = z.infer<typeof severitySchema>;
export type Message = z.infer<typeof messageSchema>;
export type Pack = z.infer<typeof packSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Combination = z.infer<typeof combinationSchema>;
export type DeepMergeFile = z.infer<typeof deepMergeFileSchema>;
export type PacksJSON = z.infer<typeof packsJSONSchema>;
export type CategorySelection = z.infer<typeof categorySelectionSchema>;
export type CreatePackDto = z.infer<typeof createPackSchema>;
export type GeneratedPackResponse = z.infer<typeof generatedPackResponseSchema>;
