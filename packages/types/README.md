# @bt/types

Shared TypeScript types and Zod schemas for Bedrock Tweaks API and web application.

## Usage

```typescript
import { Section, type PacksJSON, createPackSchema } from '@bt/types';

// Use Zod schemas for validation
const result = createPackSchema.parse(userInput);

// Use TypeScript types
const packs: PacksJSON = await fetchPacks();
```

## Exports

- Zod schemas: `sectionSchema`, `packSchema`, `categorySchema`, `packsJSONSchema`, `createPackSchema`
- TypeScript types: `Section`, `Pack`, `Category`, `PacksJSON`, `CreatePackDto`, `GeneratedPack`
