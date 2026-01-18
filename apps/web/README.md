# Bedrock Tweaks Web App

The main web application for Bedrock Tweaks, built with TanStack Start and Chakra UI v3.

## Getting Started

```bash
# From the monorepo root
pnpm install
pnpm dev --filter=web

# Or from this directory
pnpm dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server on port 3000 |
| `pnpm build` | Build for production |
| `pnpm start` | Run production build |
| `pnpm test` | Run tests with Vitest |
| `pnpm lint` | Run ESLint |
| `pnpm typegen` | Generate Chakra UI theme types |

## Key Technologies

- **TanStack Start** - SSR-enabled React framework with Nitro backend
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query** - Server state management
- **Chakra UI v3** - Component library

## Theming

The theme is configured in `src/theming/index.ts` using Chakra UI v3's `createSystem()` API.

After modifying theme tokens, regenerate types:

```bash
pnpm typegen
```
