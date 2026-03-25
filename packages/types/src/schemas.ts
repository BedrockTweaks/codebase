import { z } from 'zod';

export const sectionSchema = z.enum(['resource_packs', 'addons', 'crafting_tweaks']);

export const severitySchema = z.enum(['success', 'info', 'warn', 'error', 'secondary']);

export const messageSchema = z.object({
  text: z.string(),
  severity: severitySchema,
});

export const packSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  message: messageSchema.optional(),
  version: z.string().optional(),
  incompatibilities: z.array(z.string()).optional(),
  priority: z.number().optional(),
  disabled: z.boolean().optional(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  packs: z.array(packSchema),
  message: messageSchema.optional(),
});

export const combinationSchema = z.object({
  id: z.string(),
  combines: z.array(z.string()),
});

export const deepMergeFileSchema = z.object({
  filename: z.string(),
  filepath: z.string(),
});

export const packsJSONSchema = z.object({
  section: sectionSchema,
  version: z.array(z.number()),
  categories: z.array(categorySchema),
  combinations: z.array(combinationSchema),
  deepMergeFiles: z.array(deepMergeFileSchema),
});

export const categorySelectionSchema = z.object({
  id: z.string(),
  packs: z.array(z.string()),
});

export const createPackSchema = z.object({
  name: z.string().min(1),
  categories: z.array(categorySelectionSchema),
});

export const generatedPackSchema = z.object({
  buffer: z.instanceof(Buffer),
  packName: z.string(),
});

export const generatedPackResponseSchema = z.object({
  downloadUrl: z.string().url(),
  packName: z.string(),
  expiresAt: z.string().datetime(),
});
