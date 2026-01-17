# Bedrock Tweaks - AI Agent Instructions

## Project Overview
BedrockTweaks is a Turborepo monorepo with a React web application built using TanStack Start, Chakra UI v3, and Vite. The project uses pnpm workspaces for package management.

## Architecture

### Monorepo Structure
```
apps/
  web/              # Main React application (Vite + TanStack Start)
packages/
  config/           # Shared ESLint configuration
```

### Tech Stack
- **Framework**: TanStack Start (SSR-enabled React framework with Nitro backend)
- **Build Tool**: Vite 7.x with custom plugins (tanstackStart, nitro, devtools)
- **UI Library**: Chakra UI v3 (NOT v2 - critical difference in API)
- **Routing**: TanStack Router (file-based routing from `src/routes/`)
- **State Management**: TanStack Query for server state
- **Testing**: Vitest + React Testing Library
- **Monorepo**: Turborepo + pnpm workspaces
- **TypeScript**: 5.9+

## Key Workflows

### Development Commands
```bash
# Install dependencies (always use pnpm)
pnpm install

# Run dev server (port 3000)
pnpm dev                    # All apps
pnpm dev --filter=web      # Specific app only

# Build for production
pnpm build                  # All apps
pnpm build --filter=web    # Specific app

# Linting
pnpm lint

# Testing
cd apps/web && pnpm test

# Generate Chakra UI type definitions
cd apps/web && pnpm typegen
```

### Route Generation
- Routes are **file-based** in `apps/web/src/routes/`
- `routeTree.gen.ts` is auto-generated - **never edit manually**
- Add new route: Create file in `src/routes/`, TanStack auto-generates boilerplate
- Root route: `__root.tsx` (contains layout, providers, HTML shell)

## Critical Conventions

### Chakra UI v3 Specifics
- **Location**: Theme system in `apps/web/src/theming/index.ts`
- **API Changes from v2**: Use `createSystem()` and `defineConfig()` (NOT `extendTheme`)
- **Provider**: `<ChakraProvider value={system}>` in `__root.tsx`
- **Token Structure**: Nested tokens require `{ value: "..." }` wrapper
- **Custom Tokens**:
  - Primary color: Deep red (`#630000`) with 50-900 scale
  - Gray scale: Custom dark theme palette (`gray.50` to `gray.950`)
  - Fonts: Urbanist variable font (loaded from `/public/fonts/Urbanist/`)
- **Type Generation**: Run `pnpm typegen` after modifying theme tokens
- **Token Reference Syntax**: Use `{colors.gray.900}` in composite values like borders

### Font Loading
- **Custom Font**: Urbanist (variable font)
- **Location**: `apps/web/public/fonts/Urbanist/Urbanist-VariableFont_wght.ttf`
- **@font-face**: Defined in `apps/web/src/styles/fonts.css`
- **Import**: Main CSS imports fonts via `@import './styles/fonts.css'`
- **Weight Range**: 100-900 (variable font, no static files needed)

### Path Aliases
- `@/` maps to `apps/web/src/` (configured in vite.config.ts)
- Example: `import { system } from '@/theming'`

### Styling Approach
- **Primary**: Chakra UI component props
- **Global CSS**: `apps/web/src/styles.css` for base styles
- **Component CSS**: Co-located (e.g., `Header.css` alongside `Header.tsx`)

### TanStack Router Patterns
- **Root Layout**: `__root.tsx` exports `shellComponent` (RootDocument)
- **Navigation**: Use `<Link>` from `@tanstack/react-router`
- **Route Config**: Exports `Route = createRootRoute()` or similar
- **Devtools**: Included in root (TanStackRouterDevtoolsPanel, TanStackDevtools)

## Project-Specific Rules

1. **Package Manager**: Always use `pnpm` (never npm/yarn)
2. **Workspace Protocol**: Use `workspace:*` for internal dependencies (e.g., `@bt/config`)
3. **Import Extensions**: ESM requires explicit extensions in some contexts
4. **Turbo Caching**: Dev tasks have `cache: false`, builds cache in `.next/**`
5. **Node Version**: Minimum v18 (see package.json engines)

## Common Gotchas

- **Chakra v2 vs v3**: Many online examples are v2 - verify API against official v3 docs
- **Route Tree**: Must run dev server to regenerate `routeTree.gen.ts` after adding routes
- **Font Formats**: Using variable fonts (one file) instead of static weights
- **Gray Scale**: Custom scale with `gray.850` and `gray.950` (non-standard steps)
- **Token Descriptions**: Optional but present in codebase - maintain consistency
- **CSS Imports**: CSS files imported as `?url` in root route (Vite convention)

## Testing Conventions
- **Framework**: Vitest with jsdom environment
- **Location**: Colocated with source files or `__tests__/` directories
- **Command**: `pnpm test` (from apps/web directory)
- **Tools**: `@testing-library/react` and `@testing-library/dom`

## Build Output
- **Dev Server**: Runs on port 3000
- **Build Output**: Managed by Vite and Nitro
- **Turborepo Cache**: Outputs defined in `turbo.json` (`.next/**`)

## External Dependencies
- **Icons**: `lucide-react` for icon components
- **Nitro**: Backend runtime (via `nitro-nightly` package)
- **Emotion**: Used internally by Chakra UI v3 (peer dependency)

## Error Monitoring & Instrumentation

### Sentry Integration
- **Client-side**: Initialized in `src/router.tsx` (only when `!router.isServer`)
- **Server-side**: Initialized in `instrument.server.mjs`
- **Environment Variable**: `VITE_SENTRY_DSN` (required for production)

### Instrumenting Server Functions
For server functions (e.g., `createServerFn`), wrap lengthy operations with `Sentry.startSpan`:

```tsx
import * as Sentry from '@sentry/tanstackstart-react'

const myServerFn = createServerFn().handler(async () => {
  return Sentry.startSpan({ name: 'Fetching data' }, async () => {
    const data = await fetch('https://api.example.com/data/')
    return data.json()
  })
})
```

This provides detailed performance metrics and error tracking for server operations.
